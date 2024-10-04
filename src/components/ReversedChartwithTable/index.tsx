"use client";

import React, { useState, useEffect, useMemo } from "react";
import DataTable from "@/components/DataTable/index";
import ReversedBar from "../Charts/ReversedBar";
import Papa from "papaparse";

interface ReversedChartWithTableProps {
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
  projectId: string;
  chartType: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
  xAxisColumn: string;
  yAxisColumns: string[];
  updateAvailableColumns: (headers: string[], data: any[][], defaultX: string, defaultY: string[]) => void;
  onAxisChange: (xAxis: string, yAxes: string[]) => void;
}

const ReversedChartWithTable: React.FC<ReversedChartWithTableProps> = ({
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
  seriesNames,
  xAxisTitle,
  yAxisTitle,
  projectId,
  chartType,
  logoPosition,
  logoUrl,
  xAxisColumn,
  yAxisColumns,
  updateAvailableColumns,
  onAxisChange
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

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

    // Find the first numeric column for Y-axis
    for (let i = 0; i < newHeaders.length; i++) {
      if (newData.every(row => !isNaN(Number(row[i])))) {
        defaultY.push(newHeaders[i]);
        break;
      }
    }

    updateAvailableColumns(newHeaders, newData, defaultX, defaultY);

    // Only call onAxisChange if xAxisColumn or yAxisColumns are not set
    if (!xAxisColumn || yAxisColumns.length === 0) {
      onAxisChange(defaultX, defaultY);
    }

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

  const chartData = useMemo(() => {
    return tableData.map(row => {
      const dataPoint: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        dataPoint[header] = row[index];
      });
      return dataPoint;
    });
  }, [tableData, headers]);

  return (
    <div>
      <div id="chart">
        {chartData.length > 0 ? (
          <ReversedBar
            data={chartData}
            xAxisColumn={xAxisColumn}
            yAxisColumns={yAxisColumns}
            color={color}
            chartTitle={chartTitle}
            xAxisTitle={xAxisTitle}
            yAxisTitle={yAxisTitle}
            sourceName={sourceName}
            sourceURL={sourceURL}
            logoPosition={logoPosition} 
            logoUrl={logoUrl}
            showLogo={true} 
          />
        ) : (
          <div>No data available for chart</div>
        )}
      </div>
      
      <DataTable 
        headers={headers} 
        data={tableData} 
        projectId={projectId}
        chartType={chartType}
        onDataChange={handleDataChange} 
      />
    </div>
  );
};

export default ReversedChartWithTable;