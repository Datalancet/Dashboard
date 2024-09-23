"use client";

import React, { useState, useEffect } from "react";
import MapDataTable from "../MapDataTable";
import MapOne from "../Maps/MapOne";
import Papa from "papaparse";

interface MapWithTableProps {
  design: string;
  color: string;
  mapTitle: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  projectId: string;
  chartType: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
}

const MapWithTable: React.FC<MapWithTableProps> = ({
  design,
  color,
  mapTitle,
  titleAlignment,
  sourceName,
  sourceURL,
  projectId,
  chartType,
  logoPosition,
  logoUrl
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  const initialMapData = [
    ['us-nd', 2.0], ['us-sd', 2.0], ['us-vt', 2.1], ['us-ne', 2.5], ['us-nh', 2.5],
    ['us-md', 2.7], ['us-va', 2.7], ['us-ia', 2.8], ['us-mn', 2.8], ['us-ms', 2.8],
    ['us-ks', 2.9], ['us-ut', 2.9], ['us-wi', 2.9], ['us-wy', 2.9], ['us-al', 3.0],
    ['us-hi', 3.0], ['us-me', 3.0], ['us-ma', 3.0], ['us-tn', 3.0], ['us-mt', 3.1],
    ['us-ga', 3.2], ['us-fl', 3.3], ['us-id', 3.3], ['us-az', 3.4], ['us-ar', 3.4],
    ['us-pa', 3.4], ['us-sc', 3.4], ['us-mo', 3.5], ['us-ok', 3.5], ['us-nc', 3.6],
    ['us-in', 3.7], ['us-co', 3.8], ['us-nm', 3.8], ['us-de', 3.9], ['us-mi', 3.9],
    ['us-tx', 4.0], ['us-la', 4.1], ['us-ny', 4.2], ['us-oh', 4.2], ['us-or', 4.2],
    ['us-wv', 4.2], ['us-ct', 4.3], ['us-ri', 4.3], ['us-ak', 4.5], ['us-ky', 4.6],
    ['us-nj', 4.6], ['us-il', 4.9], ['us-wa', 4.9], ['us-nv', 5.1], ['us-ca', 5.2],
    ['us-dc', 5.3]
  ];

  const [mapData, setMapData] = useState(initialMapData);

  useEffect(() => {
    setHeaders(['State Code', 'Value']);
    setTableData(initialMapData);
    aggregateData();
  }, []);

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
    
    // Update mapData when table data changes
    const updatedMapData = newData.map(row => [row[0], parseFloat(row[1])]);
    setMapData(updatedMapData);
  
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
    if (aggregationMethod === 'none') {
      setAggregatedData(tableData);
      return;
    }

    const aggregated = tableData.reduce((acc, curr) => {
      const existingIndex = acc.findIndex(item => item[0] === curr[0]);
      if (existingIndex > -1) {
        if (aggregationMethod === 'sum') {
          acc[existingIndex][1] = (parseFloat(acc[existingIndex][1]) + parseFloat(curr[1])).toString();
        } else if (aggregationMethod === 'count') {
          acc[existingIndex][1] = (parseFloat(acc[existingIndex][1]) + 1).toString();
        }
      } else {
        if (aggregationMethod === 'count') {
          acc.push([curr[0], '1']);
        } else {
          acc.push(curr);
        }
      }
      return acc;
    }, []);

    setAggregatedData(aggregated);
  };



  
  return (
    <div className="flex flex-col h-full">
      <div className="mt-4">
      
          <div className="">
          <MapOne
  design={design}
  color={color}
  mapTitle={mapTitle}
  titleAlignment={titleAlignment}
  sourceName={sourceName}
  sourceURL={sourceURL}
  logoPosition={logoPosition}
  logoUrl={logoUrl}
/>
    </div>
        
       
      </div>
      <div className="mt-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <MapDataTable onDataChange={handleDataChange} projectId={projectId} chartType={chartType}   initialData={mapData}
        initialHeaders={headers} />
        </div>
      </div>
    </div>
  );
};

export default MapWithTable;