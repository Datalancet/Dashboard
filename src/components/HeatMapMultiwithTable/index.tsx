"use client";

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
  logoUrl
}) => {
 const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'average' | 'max'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);


  // Example data for initial heatmap rendering with multiple series
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

    if (storedHeaders && storedData) {
      setHeaders(JSON.parse(storedHeaders));
      setTableData(JSON.parse(storedData));
    } else if (tableData.length === 0) {
      setHeaders(initialData[0]);
      setTableData(initialData.slice(1));
    }
  }, [projectId, chartType]);

  useEffect(() => {
    aggregateData();
  }, [tableData, aggregationMethod]);

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

  const handleDataChange = async (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);
  
    // Save data to API
    try {
      if (!projectId) {
        throw new Error('No project ID available');
      }
  
      // Prepare CSV content
      const csvContent = Papa.unparse([newHeaders, ...newData]);
  
      const result = await updateDataFileOnServer(csvContent);
      console.log('Data saved successfully to API:', result);
    } catch (error) {
      console.error('Error saving data to API:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleAggregationMethodChange = (method: 'none' | 'average' | 'max') => {
    setAggregationMethod(method);
  };

  const aggregateData = () => {
    if (aggregationMethod === 'none') {
      setAggregatedData(tableData);
      return;
    }

    const aggregated = tableData.reduce((acc, curr) => {
      const key = `${curr[0]}-${curr[1]}`;
      if (!acc[key]) {
        acc[key] = { sum: new Array(curr.length - 2).fill(0), count: 0, max: new Array(curr.length - 2).fill(-Infinity), values: [] };
      }
      for (let i = 2; i < curr.length; i++) {
        const value = parseFloat(curr[i]);
        acc[key].sum[i - 2] += value;
        acc[key].max[i - 2] = Math.max(acc[key].max[i - 2], value);
      }
      acc[key].count += 1;
      acc[key].values.push(curr.slice(2));
      return acc;
    }, {} as Record<string, { sum: number[], count: number, max: number[], values: number[][] }>);

    const result = Object.entries(aggregated).map(([key, data]) => {
      const [x, y] = key.split('-');
      let values: number[];
      if (aggregationMethod === 'average') {
        values = data.sum.map(sum => sum / data.count);
      } else if (aggregationMethod === 'max') {
        values = data.max;
      } else {
        values = data.values[0]; // Fallback to first value
      }
      return [x, y, ...values.map(v => v.toFixed(2))];
    });

    setAggregatedData(result);
  };

  return (
    <div>
      <div id="chart">
        <HeatMapMulti
          headers={headers}
          tableData={aggregatedData.length > 0 ? aggregatedData : tableData}
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