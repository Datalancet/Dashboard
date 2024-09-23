"use client";

import React, { useState, useEffect } from "react";
import TableDataTable from "../TableDataTable";
import TableChartDisplay from "../Tables/Table";
import Papa from "papaparse";

interface TableChartwithTableProps {
  tableColor: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  projectId: string;
  chartType: string;
  showBorders: boolean;
  alternateRowColor: boolean;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
  showMiniCharts: boolean;
  showSearch: boolean;
  onDataChange: (headers: string[], data: any[]) => void;
  initialHeaders?: string[];
  initialData?: any[];
  deletedRows: number[];
  deletedColumns: number[];
}

const TableChartwithTable: React.FC<TableChartwithTableProps> = ({
  tableColor,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  projectId,
  chartType,
  showBorders,
  alternateRowColor,
  logoPosition,
  logoUrl,
  showMiniCharts,
  showSearch,
  onDataChange,
  initialHeaders,
  initialData,
  deletedRows,
  deletedColumns
}) => {
  const [tableData, setTableData] = useState<any[]>(initialData || []);
  const [headers, setHeaders] = useState<string[]>(initialHeaders || []);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  const defaultCSV = `Country,Fossil fuels sources,Low-carbon sources,Region
China,36222.58785,7195.872996,East Asia Pacific
Indonesia,2068.531663,182.877434,East Asia Pacific
Russia,7556.898861,1133.111644,Europe and Central Asia
Turkey,1581.966414,279.5225517,Europe and Central Asia
Brazil,1840.248858,1529.716619,Latin America and Caribbean
Mexico,1657.604034,216.0925264,Latin America and Caribbean
Iran,3333.616802,52.55197211,Middle East and North Africa
Egypt,988.2385589,65.66415167,Middle East and North Africa
Canada,2483.220204,1366.680287,North America
United States,21016.76361,4654.851322,North America
India,8814.637053,948.8110477,South Asia
Pakistan,917.6985869,152.0718743,South Asia
South Africa,1308.656389,72.36667817,Sub-Saharan Africa`;

  useEffect(() => {
    let data = initialData || [];
    let headersList = initialHeaders || [];

    if (data.length === 0 || headersList.length === 0) {
      const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
      const storedData = localStorage.getItem(`${projectId}_${chartType}_tableData`);

      if (storedHeaders && storedData) {
        headersList = JSON.parse(storedHeaders);
        data = JSON.parse(storedData);
      } else {
        const parsedData = Papa.parse(defaultCSV, { header: false }).data;
        headersList = parsedData[0] as string[];
        data = parsedData.slice(1) as any[];
      }
    }

    // Apply deletions
    headersList = headersList.filter((_, index) => !deletedColumns.includes(index));
    data = data
      .filter((_, rowIndex) => !deletedRows.includes(rowIndex))
      .map(row => row.filter((_: any, colIndex: number) => !deletedColumns.includes(colIndex)));

    setHeaders(headersList);
    setTableData(data);

    // Store the updated data
    localStorage.setItem(`${projectId}_${chartType}_headers`, JSON.stringify(headersList));
    localStorage.setItem(`${projectId}_${chartType}_tableData`, JSON.stringify(data));
  }, [projectId, chartType, initialHeaders, initialData, deletedRows, deletedColumns]);

  useEffect(() => {
    aggregateData();
  }, [aggregationMethod, tableData]);

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

  const handleAggregationMethodChange = (method: 'none' | 'sum' | 'count') => {
    setAggregationMethod(method);
  };

  const aggregateData = () => {
    if (aggregationMethod === 'none') {
      setAggregatedData(tableData);
      return;
    }

    const aggregated = tableData.reduce((acc, curr) => {
      const existingIndex = acc.findIndex((item: any[]) => item[0] === curr[0]);
      if (existingIndex > -1) {
        if (aggregationMethod === 'sum') {
          acc[existingIndex][1] = (parseFloat(acc[existingIndex][1]) + parseFloat(curr[1])).toString();
          acc[existingIndex][2] = (parseFloat(acc[existingIndex][2]) + parseFloat(curr[2])).toString();
        } else if (aggregationMethod === 'count') {
          acc[existingIndex][1] = (parseFloat(acc[existingIndex][1]) + 1).toString();
          acc[existingIndex][2] = (parseFloat(acc[existingIndex][2]) + 1).toString();
        }
      } else {
        if (aggregationMethod === 'count') {
          acc.push([curr[0], '1', '1', curr[3], curr[4]]);
        } else {
          acc.push(curr);
        }
      }
      return acc;
    }, []);

    setAggregatedData(aggregated);
  };

  const displayData = aggregationMethod === 'none' ? tableData : aggregatedData;

  return (
    <div>
      <div id="chart">
        <TableChartDisplay
          headers={headers}
          tableData={displayData}
          tableColor={tableColor}
          titleAlignment={titleAlignment}
          sourceName={sourceName}
          sourceURL={sourceURL}
          chartTitle={chartTitle}
          showBorders={showBorders}
          alternateRowColor={alternateRowColor}
          logoPosition={logoPosition}
          logoUrl={logoUrl}
          showLogo={true}
          showMiniCharts={showMiniCharts}
          showSearch={showSearch}
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
      <TableDataTable
        onDataChange={handleDataChange}
        projectId={projectId}
        chartType={chartType}
        initialData={tableData.length === 0 ? Papa.parse(defaultCSV, { header: false }).data : undefined}
        deletedRows={deletedRows}
        deletedColumns={deletedColumns}
      />
    </div>
  );
};

export default TableChartwithTable;