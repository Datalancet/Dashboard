"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import DataTable from "@/components/DataTable/index";
import ColumnChart from "../Charts/ColumnChart";
import { useSearchParams } from 'next/navigation';
import Papa from "papaparse";

interface ColumnChartWithTableProps {
  design: string;
  color: string;
  gridVariation: string;
  xAxisPosition: string;
  yAxisPosition: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  valuesPosition: string;
  chartTitle: string;
  isLabelStyle: boolean;
  labelPosition: "above" | "axis";
  seriesNames: string[];
  xAxisTitle: string;
  yAxisTitle: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
  showPercentages: boolean;
  xAxisColumn: string;
  yAxisColumns: string[];
  updateAvailableColumns: (headers: string[], data: any[][], defaultX: string, defaultY: string[]) => void;
  onAxisChange: (xAxis: string, yAxes: string[]) => void;
}

const ColumnChartWithTable: React.FC<ColumnChartWithTableProps> = ({
  design,
  color,
  gridVariation,
  xAxisPosition,
  yAxisPosition,
  titleAlignment,
  sourceName,
  sourceURL,
  valuesPosition,
  chartTitle,
  isLabelStyle,
  labelPosition,
  xAxisTitle,
  yAxisTitle,
  seriesNames,
  logoPosition,
  showPercentages,
  logoUrl,
  xAxisColumn,
  yAxisColumns,
  updateAvailableColumns,
  onAxisChange
}) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'Column';

  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>(() => {
    const savedMethod = localStorage.getItem(`${projectId}_${chartType}_aggregationMethod`);
    return (savedMethod as 'none' | 'sum' | 'count') || 'none';
  });

  const updateDataFileOnServer = async (csvContent: string) => {
    try {
      if (!projectId) {
        throw new Error('No project ID available');
      }
  
      const projectResponse = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project details: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();
  
      const { name, description, project_status } = projectData.project_data;
      const htmlContent = projectData.html_file;
  
      const formData = new FormData();
      formData.append('id', projectId);
      formData.append('name', name);
      formData.append('description', description);
      
      const htmlBlob = new Blob([atob(htmlContent)], { type: 'text/html' });
      formData.append('html_file', htmlBlob, '/demo.html');
      
      formData.append('data_file', new Blob([csvContent], { type: 'text/csv' }), 'data.csv');
      formData.append('project_status', project_status);
  
      const response = await fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/create-or-upload/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errorData)}`);
      }
  
      const result = await response.json();
      console.log('Update result:', result);
      return result;
    } catch (error) {
      console.error('Error updating data file on server:', error);
      throw error;
    }
  };

  const handleDataChange = useCallback(async (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);

    let defaultX = '';
    let defaultY: string[] = [];

    for (let i = 0; i < newHeaders.length; i++) {
      if (newData.every(row => isNaN(Number(row[i])))) {
        defaultX = newHeaders[i];
        break;
      }
    }

    for (let i = 0; i < newHeaders.length; i++) {
      if (newData.every(row => !isNaN(Number(row[i])))) {
        defaultY.push(newHeaders[i]);
        if (defaultY.length === 2) break;
      }
    }

    updateAvailableColumns(newHeaders, newData, defaultX, defaultY);

    if (!xAxisColumn || yAxisColumns.length === 0) {
      onAxisChange(defaultX, defaultY);
    }

    try {
      const csvContent = Papa.unparse([newHeaders, ...newData]);
      const result = await updateDataFileOnServer(csvContent);
      console.log('Data saved successfully to API:', result);
    } catch (error) {
      console.error('Error saving data to API:', error);
    }
  }, [projectId, updateAvailableColumns, onAxisChange, xAxisColumn, yAxisColumns]);

  const handleAggregationMethodChange = (method: 'none' | 'sum' | 'count') => {
    setAggregationMethod(method);
    localStorage.setItem(`${projectId}_${chartType}_aggregationMethod`, method);
  };

  const aggregateData = useCallback(() => {
    if (aggregationMethod === 'none' || !xAxisColumn || yAxisColumns.length === 0) {
      return tableData.map(row => {
        const newRow = [row[headers.indexOf(xAxisColumn)]];
        yAxisColumns.forEach(col => newRow.push(row[headers.indexOf(col)]));
        return newRow;
      });
    }

    const xIndex = headers.indexOf(xAxisColumn);
    const yIndices = yAxisColumns.map(col => headers.indexOf(col));

    return tableData.reduce((acc, curr) => {
      const key = curr[xIndex];
      const existingIndex = acc.findIndex(item => item[0] === key);
      
      if (existingIndex > -1) {
        yIndices.forEach((yIndex, i) => {
          if (aggregationMethod === 'sum') {
            acc[existingIndex][i + 1] = (parseFloat(acc[existingIndex][i + 1]) + parseFloat(curr[yIndex])).toString();
          } else if (aggregationMethod === 'count') {
            acc[existingIndex][i + 1] = (parseFloat(acc[existingIndex][i + 1]) + 1).toString();
          }
        });
      } else {
        if (aggregationMethod === 'count') {
          acc.push([key, ...yIndices.map(() => '1')]);
        } else {
          acc.push([key, ...yIndices.map(yIndex => curr[yIndex])]);
        }
      }
      return acc;
    }, []);
  }, [aggregationMethod, tableData, headers, xAxisColumn, yAxisColumns]);

  const aggregatedData = useMemo(() => aggregateData(), [aggregateData]);

  const chartData = useMemo(() => {
    return {
      headers: [xAxisColumn, ...yAxisColumns],
      tableData: aggregatedData
    };
  }, [xAxisColumn, yAxisColumns, aggregatedData]);

  return (
    <div>
      <div id="chart">
        <ColumnChart
          headers={chartData.headers}
          tableData={chartData.tableData}
          design={design}
          color={color}
          gridVariation={gridVariation}
          xAxisPosition={xAxisPosition}
          yAxisPosition={yAxisPosition}
          titleAlignment={titleAlignment}
          valuesPosition={valuesPosition}
          chartTitle={chartTitle}
          isLabelStyle={isLabelStyle}
          labelPosition={labelPosition}
          sourceName={sourceName}
          sourceURL={sourceURL}
          seriesNames={seriesNames.length >= yAxisColumns.length ? seriesNames : yAxisColumns}
          xAxisTitle={xAxisTitle}
          yAxisTitle={yAxisTitle}
          logoPosition={logoPosition} 
          logoUrl={logoUrl}
          showLogo={true}
          showPercentages={showPercentages}
        />
      </div>
      <div className="mt-4 mb-4">
        <label htmlFor="aggregation-method" className="mr-2">Aggregation Method:</label>
        <select
          id="aggregation-method"
          value={aggregationMethod}
          onChange={(e) => handleAggregationMethodChange(e.target.value as 'none' | 'sum' | 'count')}
          className="p-2 border rounded"
        >
          <option value="none">None</option>
          <option value="sum">Sum</option>
          <option value="count">Count</option>
        </select>
      </div>
      <DataTable onDataChange={handleDataChange} projectId={projectId} chartType={chartType} />
    </div>
  );
};

export default ColumnChartWithTable;