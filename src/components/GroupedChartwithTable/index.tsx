import React, { useState, useEffect, useCallback } from "react";
import DataTable from "@/components/DataTable/index";
import GroupedBar from "../Charts/GroupedBar";
import Papa from "papaparse";

interface GroupedChartWithTableProps {
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
  xAxisColumn: string;
  yAxisColumns: string[];
  updateAvailableColumns: (headers: string[], data: any[][], defaultX: string, defaultY: string[]) => void;
  onAxisChange: (xAxis: string, yAxes: string[]) => void;
  projectId: string;
  chartType: string;
}

const GroupedChartWithTable: React.FC<GroupedChartWithTableProps> = ({
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
  logoUrl,
  xAxisColumn,
  yAxisColumns,
  updateAvailableColumns,
  onAxisChange,
  projectId,
  chartType
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');

  const updateDataFileOnServer = async (csvContent) => {
    try {
      if (!projectId) {
        throw new Error('No project ID available');
      }
  
      // Fetch current project details
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
      formData.append('project_status', project_status); // Preserve the current project status
  
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

    // Find default X and Y axes
    let defaultX = '';
    let defaultY: string[] = [];

    // Find the first non-numeric column for X-axis
    for (let i = 0; i < newHeaders.length; i++) {
      if (newData.every(row => isNaN(Number(row[i])))) {
        defaultX = newHeaders[i];
        break;
      }
    }

    // Find the first two numeric columns for Y-axis
    for (let i = 0; i < newHeaders.length; i++) {
      if (newData.every(row => !isNaN(Number(row[i])))) {
        defaultY.push(newHeaders[i]);
        if (defaultY.length === 2) break;
      }
    }

    updateAvailableColumns(newHeaders, newData, defaultX, defaultY);

    // Only call onAxisChange if xAxisColumn or yAxisColumns are not set
    if (!xAxisColumn || yAxisColumns.length === 0) {
      onAxisChange(defaultX, defaultY);
    }

    try {
      const csvContent = Papa.unparse([newHeaders, ...newData]);
      await updateDataFileOnServer(csvContent);
    } catch (error) {
      console.error('Error saving data to API:', error);
    }
  }, [updateAvailableColumns, updateDataFileOnServer, onAxisChange, xAxisColumn, yAxisColumns]);

  const aggregateData = useCallback(() => {
    if (aggregationMethod === 'none' || !xAxisColumn || yAxisColumns.length === 0) {
      return tableData;
    }

    const xIndex = headers.indexOf(xAxisColumn);
    const yIndices = yAxisColumns.map(col => headers.indexOf(col));

    return tableData.reduce((acc, curr) => {
      const key = curr[xIndex];
      const existingIndex = acc.findIndex(item => item[xIndex] === key);
      
      if (existingIndex > -1) {
        yIndices.forEach((yIndex) => {
          if (aggregationMethod === 'sum') {
            acc[existingIndex][yIndex] = (parseFloat(acc[existingIndex][yIndex]) + parseFloat(curr[yIndex])).toString();
          } else if (aggregationMethod === 'count') {
            acc[existingIndex][yIndex] = (parseFloat(acc[existingIndex][yIndex]) + 1).toString();
          }
        });
      } else {
        if (aggregationMethod === 'count') {
          const newRow = [...curr];
          yIndices.forEach((yIndex) => {
            newRow[yIndex] = '1';
          });
          acc.push(newRow);
        } else {
          acc.push(curr);
        }
      }
      return acc;
    }, []);
  }, [aggregationMethod, tableData, headers, xAxisColumn, yAxisColumns]);

  const chartData = aggregateData();

  return (
    <div>
      <div id="chart">
        <GroupedBar
          headers={headers}
          tableData={chartData}
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
          seriesNames={seriesNames}
          xAxisTitle={xAxisTitle}
          yAxisTitle={yAxisTitle}
          logoPosition={logoPosition} 
          logoUrl={logoUrl}
          showLogo={true}
          xAxisColumn={xAxisColumn}
          yAxisColumns={yAxisColumns}
        />
      </div>
      <div className="mt-4 mb-4">
        <label htmlFor="aggregation-method" className="mr-2">Aggregation Method:</label>
        <select
          id="aggregation-method"
          value={aggregationMethod}
          onChange={(e) => setAggregationMethod(e.target.value as 'none' | 'sum' | 'count')}
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

export default GroupedChartWithTable;