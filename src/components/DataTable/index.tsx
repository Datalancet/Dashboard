"use client";
import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import html2canvas from "html2canvas";
import { useSearchParams } from "next/navigation";

const DataTable = ({ onDataChange }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataUploaded, setDataUploaded] = useState(false);
  const [dataPublished, setDataPublished] = useState(false);
  const [embedURL, setEmbedURL] = useState('');
  const chartRef = useRef(null);

  const [defaultCSV, setDefaultCSV] = useState(`Country,Fossil fuels sources,Low-carbon sources,Region
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
South Africa,1308.656389,72.36667817,Sub-Saharan Africa`);

  useEffect(() => {
    if (projectId) {
      const storedData = localStorage.getItem(`tableData_${projectId}`);
      const storedHeaders = localStorage.getItem(`headers_${projectId}`);
      if (storedData && storedHeaders) {
        setTableData(JSON.parse(storedData));
        setHeaders(JSON.parse(storedHeaders));
      } else {
        parseDefaultCSV();
      }
    } else {
      parseDefaultCSV();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && tableData.length > 0) {
      localStorage.setItem(`tableData_${projectId}`, JSON.stringify(tableData));
      localStorage.setItem(`headers_${projectId}`, JSON.stringify(headers));
    }
    if (onDataChange) {
      onDataChange(headers, tableData);
    }
  }, [tableData, headers, projectId]);

  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (dataUploaded && !dataPublished) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dataUploaded, dataPublished]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      try {
        setSelectedFile(file);
        const content = await readFileContent(file);
        setDefaultCSV(content);
        parseCSV(content);
        setDataUploaded(true);
        setDataPublished(false);
        
        if (projectId) {
          await updateDataFileOnServer(content);
        }
      } catch (error) {
        console.error('Error updating data:', error);
        alert(`Failed to update data: ${error.message}`);
      }
    } else {
      alert("Please upload a file smaller than 2MB.");
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  const parseDefaultCSV = () => {
    const result = Papa.parse(defaultCSV, { header: false });
    const [headerRow, ...dataRows] = result.data;
    setHeaders(headerRow);
    setTableData(dataRows);
  };
  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedTableData = [...tableData];
    updatedTableData[rowIndex][colIndex] = value;
    setTableData(updatedTableData);
  };

  const handlePublishClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const parseCSV = (content) => {
    const result = Papa.parse(content, { header: false });
    const [headerRow, ...dataRows] = result.data;
    setHeaders(headerRow);
    setTableData(dataRows);
  };

  const updateDataFileOnServer = async (csvContent) => {
    try {
      // Fetch existing project details
      const projectResponse = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project details: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();
  
      // Extract necessary data from project_data
      const { name, description } = projectData.project_data;
      const htmlContent = projectData.html_file; // HTML file is directly in projectData
  
      if (!htmlContent) {
        throw new Error('HTML file is missing from the project data');
      }
  
      const formData = new FormData();
      formData.append('id', projectId);
      formData.append('name', name);
      formData.append('description', description);
      
      // Append the existing HTML file without modification
      const htmlBlob = new Blob([atob(htmlContent)], { type: 'text/html' });
      formData.append('html_file', htmlBlob, '/demo.html');
      
      // Append the new CSV data
      formData.append('data_file', new Blob([csvContent], { type: 'text/csv' }), 'data.csv');
      formData.append('project_status', 'Draft');
  
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
  
  const updateProjectStatus = async (projectId) => {
    try {
      // Fetch existing project details
      const projectResponse = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project details: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();
  
      console.log('Fetched project data:', projectData);
  
      // Extract name, description, HTML content, and data content from project_data
      const projectName = projectData.project_data.name;
      const projectDescription = projectData.project_data.description;
      const htmlContent = projectData.html_file; // HTML file is directly in projectData
      const dataContent = projectData.data_file; // Data file is directly in projectData
  
      if (!htmlContent) {
        throw new Error('HTML file is missing from the project data');
      }
  
      // Create FormData object
      const formData = new FormData();
      formData.append('id', projectId);
      formData.append('name', projectName);
      formData.append('description', projectDescription);
      
      // Append HTML file
      const htmlBlob = new Blob([atob(htmlContent)], { type: 'text/html' });
      formData.append('html_file', htmlBlob, '/demo.html');
      
      // Append data file
      const dataBlob = new Blob([atob(dataContent)], { type: 'text/csv' });
      formData.append('data_file', dataBlob, 'data.csv');
      
      formData.append('project_status', 'Published');
  
      // Log the formData
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof Blob ? 'Blob data' : pair[1]));
      }
  
      const response = await fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/create-or-upload/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        throw new Error(`Server responded with ${response.status}: ${JSON.stringify(errorData)}`);
      }
  
      const result = await response.json();
      console.log('Update result:', result);
  
      // Combine the result with the original project data
      return {
        ...result,
        name: projectName,
        description: projectDescription,
        html_file: htmlContent,
        data_file: dataContent,
        project_status: 'Published'
      };
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  };

  const handlePublish = async () => {
    try {
      const chartElement = document.getElementById("chart");
      const canvas = await html2canvas(chartElement);
  
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "chart.png";
      link.click();
  
      if (projectId) {
        const updateResult = await updateProjectStatus(projectId);
        
        console.log('Update result:', updateResult);
  
        if (updateResult && updateResult.name && updateResult.description) {
          console.log('Updated project details:', updateResult);
          if (updateResult.project_status === "Published") {
            setDataPublished(true);
            
            // Construct the full embed URL with the domain
            const fullEmbedURL = `http://dashboardtool.pythonanywhere.com${updateResult.embed_url}`;
            setEmbedURL(fullEmbedURL);
            
            console.log('Updated project details with full embed URL:', {
              ...updateResult,
              html_file: updateResult.html_file,
              data_file: updateResult.data_file
            });
            
            alert(`Project published successfully! Embed URL: ${fullEmbedURL}`);
          } else {
            console.warn("Project status not updated to 'Published'. Current status:", updateResult.project_status);
            alert(`Project updated, but status is ${updateResult.project_status}. Please check again in a few moments.`);
          }
        } else {
          console.error('Unexpected update result:', updateResult);
          throw new Error("Failed to update project: Unexpected response from server");
        }
      } else {
        localStorage.setItem(`tableData_null`, JSON.stringify(tableData));
        localStorage.setItem(`headers_null`, JSON.stringify(headers));
        alert("Project data saved locally.");
      }
  
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error publishing project:', error);
      alert(`Failed to publish project: ${error.message}. Please check the console for more details.`);
    }
  };
  const generateEmbedURL = (projectId) => {
    return `http://dashboardtool.pythonanywhere.com/embed/${projectId}`;
  };

  return (
    <div className="relative p-4">
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-900 rounded-l-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
        >
           <a href={`/forms/bar-chart${projectId ? `?projectId=${projectId}` : ''}`}>Preview</a>
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-900 rounded-r-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
        >
           <a href={`/data-table${projectId ? `?projectId=${projectId}` : ''}`}>Data</a>
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
          onClick={handlePublishClick}
        >
          Publish
        </button>
      </div>

      <div className="absolute top-0 right-0 m-4">
        <label
          htmlFor="file-upload"
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-900 rounded-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
        >
          Upload
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {tableData.length > 0 && (
        <div id="chart" ref={chartRef}>
          <table className="min-w-full bg-white border border-gray-200 table-auto">
            <thead>
              <tr>
                {headers.map((header, colIndex) => (
                  <th
                    key={colIndex}
                    className="px-4 py-2 border border-gray-400 bg-gray-100 text-left text-sm font-bold text-gray-600"
                  >
                    <strong>{header}</strong>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 border border-gray-400 text-black"
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) =>
                          handleCellChange(rowIndex, colIndex, e.target.value)
                        }
                        className="w-full px-2 py-1 border-none text-black"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-900">Publish Chart</h2>
            <p className="mt-2 text-sm text-gray-600">Click the button below to download the chart image and publish the project.</p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={handleCloseModal}
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={handlePublish}
              >
                Publish and Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;