"use client"
import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable/index";
import DonutChart from "../Charts/DonutChart";
import Papa from "papaparse";

interface DonutChartWithTableProps {
  color: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  projectId: string;
  chartType: string;
  donutSize: number;
  startAngle: number;
  endAngle: number;
  isDonut: boolean;
  sliceColors: string[];
  showPercentages: boolean;
  explodedSlice: number;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
  categoryColumn: string;
  valueColumn: string;
  updateAvailableColumns: (headers: string[], data: any[][], defaultCategory: string, defaultValue: string) => void;
  onAxisChange: (category: string, value: string) => void;
}

const DonutChartWithTable: React.FC<DonutChartWithTableProps> = ({
  color,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  projectId,
  chartType,
  donutSize,
  startAngle,
  endAngle,
  isDonut,
  sliceColors,
  showPercentages,
  explodedSlice,
  logoPosition,
  logoUrl,
  categoryColumn,
  valueColumn,
  updateAvailableColumns,
  onAxisChange
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  const initialData = [
    ["Category", "Value"],
    ["Slice 1", 30],
    ["Slice 2", 25],
    ["Slice 3", 20],
    ["Slice 4", 15],
    ["Slice 5", 10]
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

    // Automatically select default category and value columns
    const defaultCategory = selectDefaultCategoryColumn(parsedHeaders, parsedData);
    const defaultValue = selectDefaultValueColumn(parsedHeaders, parsedData);

    updateAvailableColumns(parsedHeaders, parsedData, defaultCategory, defaultValue);
    onAxisChange(defaultCategory, defaultValue);

  }, [projectId, chartType]);

  useEffect(() => {
    aggregateData();
  }, [tableData, aggregationMethod, categoryColumn, valueColumn]);

  const selectDefaultCategoryColumn = (headers: string[], data: any[][]): string => {
    return headers.find((_, index) => data.every(row => typeof row[index] === 'string')) || headers[0];
  };

  const selectDefaultValueColumn = (headers: string[], data: any[][]): string => {
    return headers.find((_, index) => data.every(row => !isNaN(Number(row[index])))) || headers[1];
  };

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

    // Automatically select default category and value columns for new data
    const defaultCategory = selectDefaultCategoryColumn(newHeaders, newData);
    const defaultValue = selectDefaultValueColumn(newHeaders, newData);

    updateAvailableColumns(newHeaders, newData, defaultCategory, defaultValue);
    onAxisChange(defaultCategory, defaultValue);

    try {
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
    if (aggregationMethod === 'none' || !categoryColumn || !valueColumn) {
      setAggregatedData(tableData);
      return;
    }

    const categoryIndex = headers.indexOf(categoryColumn);
    const valueIndex = headers.indexOf(valueColumn);

    const aggregated = tableData.reduce((acc, curr) => {
      const category = curr[categoryIndex];
      const value = parseFloat(curr[valueIndex]);

      if (!acc[category]) {
        acc[category] = { sum: 0, count: 0 };
      }

      if (aggregationMethod === 'sum') {
        acc[category].sum += value;
      } else if (aggregationMethod === 'count') {
        acc[category].count += 1;
      }

      return acc;
    }, {});

    const result = Object.entries(aggregated).map(([category, data]) => [
      category,
      aggregationMethod === 'sum' ? data.sum : data.count
    ]);

    setAggregatedData(result);
  };

  const chartData = {
    headers: [categoryColumn, valueColumn],
    tableData: aggregatedData.length > 0 ? aggregatedData : tableData.map(row => [
      row[headers.indexOf(categoryColumn)],
      parseFloat(row[headers.indexOf(valueColumn)])
    ])
  };

  return (
    <div>
      <div id="chart">
        <DonutChart
          headers={chartData.headers}
          tableData={chartData.tableData}
          color={color}
          titleAlignment={titleAlignment}
          chartTitle={chartTitle}
          isLabelStyle={isLabelStyle}
          sourceName={sourceName}
          sourceURL={sourceURL}
          donutSize={donutSize}
          startAngle={startAngle}
          endAngle={endAngle}
          isDonut={isDonut}
          sliceColors={sliceColors}
          showPercentages={showPercentages}
          explodedSlice={explodedSlice}
          logoPosition={logoPosition} 
          logoUrl={logoUrl}
          showLogo={true}
          categoryColumn={categoryColumn}
          valueColumn={valueColumn}
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
        initialData={tableData.length === 0 ? initialData : undefined}
      />
    </div>
  );
};

export default DonutChartWithTable;