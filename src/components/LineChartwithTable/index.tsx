"use client";

import React, { useState, useEffect, useMemo } from "react";
import DataTable from "@/components/DataTable/index";
import ChartFour from "@/components/Charts/ChartFour"
import Papa from "papaparse";

interface LineChartWithTableProps {
  lineColors: string[];
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  projectId: string;
  chartType: string;
  showMarkers: boolean;
  curveType: "straight" | "smooth" | "stepline";
  xAxisTitle: string;
  yAxisTitle: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
  xAxisColumn: string;
  yAxisColumns: string[];
  updateAvailableColumns: (headers: string[], data: any[][], defaultX: string, defaultY: string[]) => void;
  onAxisChange: (xAxis: string, yAxes: string[]) => void;
}

const LineChartWithTable: React.FC<LineChartWithTableProps> = ({
  lineColors,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  projectId,
  chartType,
  showMarkers,
  curveType,
  xAxisTitle,
  yAxisTitle,
  logoPosition,
  logoUrl,
  xAxisColumn,
  yAxisColumns,
  updateAvailableColumns,
  onAxisChange
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  useEffect(() => {
    const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
    const storedData = localStorage.getItem(`${projectId}_${chartType}_tableData`);

    if (storedHeaders && storedData) {
      const parsedHeaders = JSON.parse(storedHeaders);
      const parsedData = JSON.parse(storedData);
      setHeaders(parsedHeaders);
      setTableData(parsedData);
      
      // Auto-select default X and Y axes
      selectDefaultAxes(parsedHeaders, parsedData);
    }
  }, [projectId, chartType]);

  useEffect(() => {
    aggregateData();
  }, [tableData, aggregationMethod, xAxisColumn, yAxisColumns]);

  const selectDefaultAxes = (headers: string[], data: any[][]) => {
    let defaultX = '';
    let defaultY: string[] = [];

    // Find the first non-numeric column for X-axis
    for (let i = 0; i < headers.length; i++) {
      if (data.every(row => isNaN(Number(row[i])))) {
        defaultX = headers[i];
        break;
      }
    }

    // Find the first numeric column for Y-axis
    for (let i = 0; i < headers.length; i++) {
      if (data.every(row => !isNaN(Number(row[i])))) {
        defaultY.push(headers[i]);
        break;
      }
    }

    // Update the axes only if they haven't been set before
    if (!xAxisColumn && defaultX) {
      onAxisChange(defaultX, defaultY);
    }

    updateAvailableColumns(headers, data, defaultX, defaultY);
  };

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

  const handleDataChange = async (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);
  
    // Auto-select default X and Y axes when data changes
    selectDefaultAxes(newHeaders, newData);
  
    try {
      if (!projectId) {
        throw new Error('No project ID available');
      }
  
      const csvContent = Papa.unparse([newHeaders, ...newData]);
      const result = await updateDataFileOnServer(csvContent);
      console.log('Data saved successfully to API:', result);
    } catch (error) {
      console.error('Error saving data to API:', error);
    }
  };

  const handleAggregationMethodChange = (method: 'none' | 'sum' | 'count') => {
    setAggregationMethod(method);
  };

  const aggregateData = () => {
    if (aggregationMethod === 'none' || !xAxisColumn || yAxisColumns.length === 0) {
      setAggregatedData(tableData);
      return;
    }

    const xIndex = headers.indexOf(xAxisColumn);
    const yIndices = yAxisColumns.map(col => headers.indexOf(col));

    const aggregated = tableData.reduce((acc, curr) => {
      const key = curr[xIndex];
      const existingIndex = acc.findIndex(item => item[xIndex] === key);
      
      if (existingIndex > -1) {
        yIndices.forEach((yIndex, i) => {
          if (aggregationMethod === 'sum') {
            acc[existingIndex][yIndex] = (parseFloat(acc[existingIndex][yIndex]) + parseFloat(curr[yIndex])).toString();
          } else if (aggregationMethod === 'count') {
            acc[existingIndex][yIndex] = (parseFloat(acc[existingIndex][yIndex]) + 1).toString();
          }
        });
      } else {
        if (aggregationMethod === 'count') {
          acc.push(headers.map((_, index) => 
            yIndices.includes(index) ? '1' : curr[index]
          ));
        } else {
          acc.push(curr);
        }
      }
      return acc;
    }, []);

    setAggregatedData(aggregated);
  };

  const chartData = useMemo(() => {
    return {
      headers: [xAxisColumn, ...yAxisColumns],
      tableData: aggregatedData.map(row => [
        row[headers.indexOf(xAxisColumn)],
        ...yAxisColumns.map(col => row[headers.indexOf(col)])
      ])
    };
  }, [headers, aggregatedData, xAxisColumn, yAxisColumns]);


  return (
    <div>
      <div id="chart">
        <ChartFour
          headers={chartData.headers}
          tableData={chartData.tableData}
          lineColors={lineColors}
          titleAlignment={titleAlignment}
          sourceName={sourceName}
          sourceURL={sourceURL}
          chartTitle={chartTitle}
          isLabelStyle={isLabelStyle}
          showMarkers={showMarkers}
          curveType={curveType}
          xAxisTitle={xAxisTitle}
          yAxisTitle={yAxisTitle}
          logoPosition={logoPosition} 
          logoUrl={logoUrl}
          showLogo={true}
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
      <DataTable
        onDataChange={handleDataChange}
        projectId={projectId}
        chartType={chartType}
      />
    </div>
  );
};

export default LineChartWithTable;