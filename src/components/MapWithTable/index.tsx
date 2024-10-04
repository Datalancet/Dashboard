"use client";

import React, { useState, useEffect, useRef } from "react";
import MapDataTable from "../MapDataTable";
import MapOne from "@/components/Maps/MapOne";
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
  const [mapData, setMapData] = useState<[string, number][]>([]);
  const mapRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    } else {
      const initialData = [
        ['in-ap', 'Andhra Pradesh', 49506799],
        ['in-ar', 'Arunachal Pradesh', 1383727],
        ['in-as', 'Assam', 31205576],
        ['in-br', 'Bihar', 104099452],
        ['in-ct', 'Chhattisgarh', 25545198],
        ['in-ga', 'Goa', 1458545],
        ['in-gj', 'Gujarat', 60439692],
        ['in-hr', 'Haryana', 25351462],
        ['in-hp', 'Himachal Pradesh', 6864602],
        ['in-jk', 'Jammu and Kashmir', 12267032],
        ['in-jh', 'Jharkhand', 32988134],
        ['in-ka', 'Karnataka', 61095297],
        ['in-kl', 'Kerala', 33406061],
        ['in-mp', 'Madhya Pradesh', 72626809],
        ['in-mh', 'Maharashtra', 112374333],
        ['in-mn', 'Manipur', 2855794],
        ['in-ml', 'Meghalaya', 2966889],
        ['in-mz', 'Mizoram', 1097206],
        ['in-nl', 'Nagaland', 1978502],
        ['in-or', 'Odisha', 41974218],
        ['in-pb', 'Punjab', 27743338],
        ['in-rj', 'Rajasthan', 68548437],
        ['in-sk', 'Sikkim', 610577],
        ['in-tn', 'Tamil Nadu', 72147030],
        ['in-tg', 'Telangana', 35003674],
        ['in-tr', 'Tripura', 3673917],
        ['in-ut', 'Uttarakhand', 10086292],
        ['in-up', 'Uttar Pradesh', 199812341],
        ['in-wb', 'West Bengal', 91276115],
        ['in-an', 'Andaman and Nicobar Islands', 380581],
        ['in-ch', 'Chandigarh', 1055450],
        ['in-dn', 'Dadra and Nagar Haveli', 343709],
        ['in-dd', 'Daman and Diu', 243247],
        ['in-dl', 'Delhi', 16787941],
        ['in-ld', 'Lakshadweep', 64473],
        ['in-py', 'Puducherry', 1247953]
      ];
      setHeaders(['State Code', 'State Name', 'Population']);
      setTableData(initialData);
      updateMapData(initialData);
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project details: ${response.status}`);
      }
      const projectData = await response.json();
      
      if (projectData && projectData.data_file) {
        const csvContent = atob(projectData.data_file);
        parseCSV(csvContent);
      }
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  };

  const updateMapData = (data: any[]) => {
    const newMapData: [string, number][] = data.map(row => [row[0], parseFloat(row[2])]);
    setMapData(newMapData);
  };

  const parseCSV = (content: string) => {
    const result = Papa.parse(content, { header: false });
    const [headerRow, ...dataRows] = result.data;
    setHeaders(headerRow);
    setTableData(dataRows);
    updateMapData(dataRows); // Update map data when CSV is parsed
  };

  
  
  const handleDataChange = async (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);
    updateMapData(newData); // Update map data when table data changes

    if (projectId) {
      try {
        const csvContent = Papa.unparse([newHeaders, ...newData]);
        await updateDataFileOnServer(csvContent);
      } catch (error) {
        console.error('Error saving data to API:', error);
      }
    }
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

  return (
    <div className="flex flex-col h-full">
      <div className="mt-4">
        <div ref={mapRef}>
          <MapOne
            design={design}
            color={color}
            mapTitle={mapTitle}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            logoPosition={logoPosition}
            logoUrl={logoUrl}
            data={mapData} // Pass mapData instead of tableData
            headers={headers}
          />
        </div>
      </div>
      <div className="mt-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <MapDataTable 
            onDataChange={handleDataChange}
            projectId={projectId}
            chartType={chartType}   
            initialData={tableData}
            initialHeaders={headers}
            mapRef={mapRef}
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
    </div>
  );
};

export default MapWithTable;