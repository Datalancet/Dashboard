import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable/index";
import HeatMapMulti from "../Charts/HeatMapMulti";
import Papa from "papaparse";

interface HeatMapMultiWithTableProps {
  heatmapColors: string[];
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  projectId: string;
  chartType: string;
  xAxisTitle: string;
  yAxisTitle: string;
  showLegend: boolean;
  reversedYAxis: boolean;
  cellRadius: number;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
  xAxisColumn: string;
  yAxisColumns: string[];
  updateAvailableColumns: (headers: string[], data: any[][], defaultX: string, defaultY: string[]) => void;
  onAxisChange: (xAxis: string, yAxes: string[]) => void;
}

const HeatMapMultiWithTable: React.FC<HeatMapMultiWithTableProps> = ({
  heatmapColors,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  projectId,
  chartType,
  xAxisTitle,
  yAxisTitle,
  showLegend,
  reversedYAxis,
  cellRadius,
  logoPosition,
  logoUrl,
  xAxisColumn,
  yAxisColumns,
  updateAvailableColumns,
  onAxisChange
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'average' | 'max'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  const initialData = [
    ["X", "Y", "Series1", "Series2", "Series3"],
    ["A", "1", 10, 20, 30],
    ["A", "2", 20, 30, 40],
    ["B", "1", 30, 40, 50],
    ["B", "2", 40, 50, 60],
    ["C", "1", 50, 60, 70],
    ["C", "2", 60, 70, 80],
  ];

  useEffect(() => {
    const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
    const storedData = localStorage.getItem(`${projectId}_${chartType}_tableData`);

    let parsedHeaders: string[];
    let parsedData: any[][];

    if (storedHeaders && storedData) {
      parsedHeaders = JSON.parse(storedHeaders);
      parsedData = JSON.parse(storedData);
    } else {
      parsedHeaders = initialData[0];
      parsedData = initialData.slice(1);
    }

    setHeaders(parsedHeaders);
    setTableData(parsedData);

    // Automatically select default X and Y axes
    const defaultX = selectDefaultXAxis(parsedHeaders, parsedData);
    const defaultY = selectDefaultYAxes(parsedHeaders, parsedData);

    updateAvailableColumns(parsedHeaders, parsedData, defaultX, defaultY);
    onAxisChange(defaultX, defaultY);

  }, [projectId, chartType]);

  useEffect(() => {
    aggregateData();
  }, [tableData, aggregationMethod, xAxisColumn, yAxisColumns]);

  const selectDefaultXAxis = (headers: string[], data: any[][]): string => {
    // Select the first column that contains string values
    return headers.find((_, index) => data.every(row => typeof row[index] === 'string')) || headers[0];
  };

  const selectDefaultYAxes = (headers: string[], data: any[][]): string[] => {
    // Select up to 3 columns that contain numeric values
    return headers.filter((_, index) => 
      data.every(row => !isNaN(Number(row[index])))
    ).slice(0, 3);
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

    // Automatically select default X and Y axes for new data
    const defaultX = selectDefaultXAxis(newHeaders, newData);
    const defaultY = selectDefaultYAxes(newHeaders, newData);

    updateAvailableColumns(newHeaders, newData, defaultX, defaultY);
    onAxisChange(defaultX, defaultY);

    try {
      const csvContent = Papa.unparse([newHeaders, ...newData]);
      const result = await updateDataFileOnServer(csvContent);
      console.log('Data saved successfully to API:', result);
    } catch (error) {
      console.error('Error saving data to API:', error);
    }
  };

  const handleAggregationMethodChange = (method: 'none' | 'average' | 'max') => {
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
      const key = `${curr[xIndex]}`;
      if (!acc[key]) {
        acc[key] = { sum: new Array(yIndices.length).fill(0), count: 0, max: new Array(yIndices.length).fill(-Infinity), values: [] };
      }
      yIndices.forEach((yIndex, i) => {
        const value = parseFloat(curr[yIndex]);
        acc[key].sum[i] += value;
        acc[key].max[i] = Math.max(acc[key].max[i], value);
      });
      acc[key].count += 1;
      acc[key].values.push(yIndices.map(yIndex => curr[yIndex]));
      return acc;
    }, {} as Record<string, { sum: number[], count: number, max: number[], values: number[][] }>);

    const result = Object.entries(aggregated).map(([key, data]) => {
      let values: number[];
      if (aggregationMethod === 'average') {
        values = data.sum.map(sum => sum / data.count);
      } else if (aggregationMethod === 'max') {
        values = data.max;
      } else {
        values = data.values[0];
      }
      return [key, ...values.map(v => v.toFixed(2))];
    });

    setAggregatedData(result);
  };

  const chartData = {
    headers: [xAxisColumn, ...yAxisColumns],
    tableData: aggregatedData.length > 0 ? aggregatedData : tableData.map(row => [
      row[headers.indexOf(xAxisColumn)],
      ...yAxisColumns.map(col => row[headers.indexOf(col)])
    ])
  };

  return (
    <div>
      <div id="chart">
        <HeatMapMulti
          headers={chartData.headers}
          tableData={chartData.tableData}
          heatmapColors={heatmapColors}
          titleAlignment={titleAlignment}
          sourceName={sourceName}
          sourceURL={sourceURL}
          chartTitle={chartTitle}
          xAxisTitle={xAxisTitle}
          yAxisTitle={yAxisTitle}
          showLegend={showLegend}
          reversedYAxis={reversedYAxis}
          cellRadius={cellRadius}
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
          onChange={(e) => handleAggregationMethodChange(e.target.value as 'none' | 'average' | 'max')}
          className="p-2 border rounded"
        >
          <option value="none">None</option>
          <option value="average">Average</option>
          <option value="max">Max</option>
        </select>
      </div>
      <DataTable
        onDataChange={handleDataChange}
        projectId={projectId}
        chartType={chartType}
        initialData={tableData.length === 0 ? initialData : undefined}
      />
    </div>
  );
};

export default HeatMapMultiWithTable;