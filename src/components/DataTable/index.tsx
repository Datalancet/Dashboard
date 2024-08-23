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
  const [isPublished, setIsPublished] = useState(false);
  const [embedURL, setEmbedURL] = useState('');
  const [scriptURL, setScriptURL] = useState('');
  const chartRef = useRef(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishedImageURL, setPublishedImageURL] = useState('');
  const [embedType, setEmbedType] = useState('iframe');
  const [isRepublishModalOpen, setIsRepublishModalOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesPopup, setShowUnsavedChangesPopup] = useState(false);


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
  const handleBeforeUnload = (e) => {
    if (hasUnsavedChanges && !isPublished) {
      e.preventDefault();
      e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, [hasUnsavedChanges, isPublished]);

useEffect(() => {
  if (projectId) {
    fetchProjectDetails();
  } else {
    parseDefaultCSV();
  }
}, [projectId]);

  useEffect(() => {
    if (projectId) {
      const storedEmbedURL = localStorage.getItem(`embedURL_${projectId}`);
      const storedScriptURL = localStorage.getItem(`scriptURL_${projectId}`);
      if (storedEmbedURL) setEmbedURL(storedEmbedURL);
      if (storedScriptURL) setScriptURL(storedScriptURL);
    }
  }, [projectId])

  useEffect(() => {
    if (projectId && tableData.length > 0) {
      localStorage.setItem(`tableData_${projectId}`, JSON.stringify(tableData));
      localStorage.setItem(`headers_${projectId}`, JSON.stringify(headers));
    }
    if (onDataChange) {
      onDataChange(headers, tableData);
    }
    updateHTMLFile(headers, tableData);
  }, [tableData, headers, projectId]);
  


  const handleDownloadHTML = () => {
    try {
      if (!projectId) {
        throw new Error('No project ID available');
      }
  
      // Retrieve HTML content from local storage
      const htmlContent = localStorage.getItem(`htmlContent_${projectId}`);
  
      if (!htmlContent) {
        throw new Error('No HTML content found in local storage for this project');
      }
  
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
  
      // Create a temporary URL for the Blob
      const url = URL.createObjectURL(blob);
  
      // Create a temporary anchor element and trigger the download
      const a = document.createElement('a');
      a.href = url;
      a.download = `project_${projectId}_html.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      // Revoke the temporary URL
      URL.revokeObjectURL(url);
  
      console.log('HTML file downloaded successfully from local storage');
    } catch (error) {
      console.error('Error downloading HTML:', error);
      alert(`Failed to download HTML: ${error.message}`);
    }
  };
  const fetchProjectDetails = async () => {
    try {
      console.log(`Fetching project details for projectId: ${projectId}`);
  
      const response = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project details: ${response.status}`);
      }
      const projectData = await response.json();
      
      console.log('Fetched project data:', projectData);
  
      if (projectData && projectData.project_data) {
        console.log('Project status:', projectData.project_data.project_status);
  
        const isPublishedInLocalStorage = localStorage.getItem(`isPublished_${projectId}`) === 'true';
        setIsPublished(isPublishedInLocalStorage);
  
        if (isPublishedInLocalStorage) {
          // Retrieve stored image URL
          const storedImageURL = localStorage.getItem(`publishedImageURL_${projectId}`);
          if (storedImageURL) {
            setPublishedImageURL(storedImageURL);
          }

          // Use stored URLs if available
          const storedEmbedURL = localStorage.getItem(`embedURL_${projectId}`);
          const storedScriptURL = localStorage.getItem(`scriptURL_${projectId}`);
  
          if (storedEmbedURL && storedScriptURL) {
            console.log('Using stored URLs from localStorage');
            setEmbedURL(storedEmbedURL);
            setScriptURL(storedScriptURL);
          } else {
            console.warn('Generating default URLs');
            const fullEmbedURL = `http://dashboardtool.pythonanywhere.com/embed/${projectId}`;
            const fullScriptURL = `http://dashboardtool.pythonanywhere.com/script/${projectId}`;
            setEmbedURL(fullEmbedURL);
            setScriptURL(fullScriptURL);
            localStorage.setItem(`embedURL_${projectId}`, fullEmbedURL);
            localStorage.setItem(`scriptURL_${projectId}`, fullScriptURL);
          }
  
          // Use stored HTML content if available
          const storedHtmlContent = localStorage.getItem(`htmlContent_${projectId}`);
          if (storedHtmlContent) {
            console.log('Using stored HTML content');
            // Update the server with the stored HTML content
            await updateHTMLFileOnServer(storedHtmlContent, false);
          }
        }
  
        // Use stored data if available, otherwise use data from API
        const storedTableData = localStorage.getItem(`tableData_${projectId}`);
        const storedHeaders = localStorage.getItem(`headers_${projectId}`);
        
        if (storedTableData && storedHeaders) {
          setTableData(JSON.parse(storedTableData));
          setHeaders(JSON.parse(storedHeaders));
        } else if (projectData.data_file) {
          console.log('Parsing CSV data from project');
          const csvContent = atob(projectData.data_file);
          parseCSV(csvContent);
        } else {
          console.log('No data found, using default CSV');
          parseDefaultCSV();
        }
      } else {
        console.warn('Unexpected project data structure:', projectData);
        parseDefaultCSV();
      }
    } catch (error) {
      console.error('Error fetching project details:', error);
      parseDefaultCSV();
    }
  };
  const updateHTMLFile = async (headers, data) => {
    const htmlContent = generateHTMLContent(headers, data);
    if (projectId) {
      try {
        await updateHTMLFileOnServer(htmlContent);
      } catch (error) {
        console.error('Error updating HTML file:', error);
      }
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      try {
        setSelectedFile(file);
        const content = await readFileContent(file);
        setDefaultCSV(content);
        parseCSV(content);
        setDataUploaded(true);
        setIsPublished(false);
        setHasUnsavedChanges(true);
        
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
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true);
      setShowUnsavedChangesPopup(true);
    }
  };

  const handlePublishClick = async () => {
    if (isPublished) {
      setIsPublishModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleRepublish = async () => {
    setIsRepublishModalOpen(false);
    await handlePublish();
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

  const generateHTMLContent = (imageDataURL) => {
    return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Energy Sources by Country</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
          }
          #chart-container {
              background-color: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              max-width: 100%;
              max-height: 100vh;
              text-align: center;
          }
          img {
              max-width: 100%;
              height: auto;
              display: block;
              margin: 0 auto;
          }
      </style>
  </head>
  <body>
      <div id="chart-container">
          <img src="${imageDataURL}" alt="Energy Sources by Country Chart" />
      </div>
  </body>
  </html>
    `;
  };

  const convertImageToHTML = async (imageDataURL) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
  
        let html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chart Representation</title>
            <style>
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                background-color: #f4f4f4;
              }
              .chart-container {
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin-left: 5%;
              }
              .pixel-row { position: relative; height: 1px; }
              .pixel-group { position: absolute; height: 1px; }
            </style>
          </head>
          <body>
            <div class="chart-container">
        `;
  
        for (let y = 0; y < canvas.height; y++) {
          html += `<div class="pixel-row">`;
          let currentColor = null;
          let currentWidth = 0;
          let currentX = 0;
  
          for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const a = data[index + 3] / 255;
            const color = `rgba(${r},${g},${b},${a})`;
  
            if (color === currentColor) {
              currentWidth++;
            } else {
              if (currentColor) {
                html += `<div class="pixel-group" style="left:${currentX}px;width:${currentWidth}px;background-color:${currentColor}"></div>`;
              }
              currentColor = color;
              currentX = x;
              currentWidth = 1;
            }
          }
  
          if (currentColor) {
            html += `<div class="pixel-group" style="left:${currentX}px;width:${currentWidth}px;background-color:${currentColor}"></div>`;
          }
  
          html += `</div>`;
        }
  
        html += `
            </div>
          </body>
          </html>
        `;
  
        resolve(html);
      };
      img.src = imageDataURL;
    });
  };
  const updateHTMLFileOnServer = async (htmlContent, forceUpdate = false) => {
    try {
      console.log('Updating HTML file on server...');
  
      const projectResponse = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project details: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();
  
      const { name, description, project_status } = projectData.project_data;
      const dataContent = projectData.data_file;
  
      if (project_status === 'Published' && !forceUpdate) {
        console.log('Project is already published. Skipping HTML update.');
        return projectData;
      }
  
      const formData = new FormData();
      formData.append('id', projectId);
      formData.append('name', name);
      formData.append('description', description);
      
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      formData.append('html_file', htmlBlob, '/demo.html');
      
      const dataBlob = new Blob([atob(dataContent)], { type: 'text/csv' });
      formData.append('data_file', dataBlob, 'data.csv');
  
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
      
      localStorage.setItem(`htmlContent_${projectId}`, htmlContent);
      
      return result;
    } catch (error) {
      console.error('Error updating HTML file on server:', error);
      throw error;
    }
  };

  const updateDataFileOnServer = async (csvContent) => {
    try {
      if (!projectId) {
        throw new Error('No project ID available');
      }
  
      const projectResponse = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project details: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();
  
      const { name, description } = projectData.project_data;
      const htmlContent = projectData.html_file;
  
      if (!htmlContent) {
        throw new Error('HTML file is missing from the project data');
      }
  
      const formData = new FormData();
      formData.append('id', projectId);
      formData.append('name', name);
      formData.append('description', description);
      
      const htmlBlob = new Blob([atob(htmlContent)], { type: 'text/html' });
      formData.append('html_file', htmlBlob, '/demo.html');
      
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
      const projectResponse = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project details: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();
  
      console.log('Fetched project data:', projectData);
  
      const projectName = projectData.project_data.name;
      const projectDescription = projectData.project_data.description;
      const htmlContent = projectData.html_file;
      const dataContent = projectData.data_file;
  
      if (!htmlContent) {
        throw new Error('HTML file is missing from the project data');
      }
  
      const formData = new FormData();
      formData.append('id', projectId);
      formData.append('name', projectName);
      formData.append('description', projectDescription);
      
      const htmlBlob = new Blob([atob(htmlContent)], { type: 'text/html' });
      formData.append('html_file', htmlBlob, '/demo.html');
      
      const dataBlob = new Blob([atob(dataContent)], { type: 'text/csv' });
      formData.append('data_file', dataBlob, 'data.csv');
      
      formData.append('project_status', 'Published');
  
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
      
      const imageDataURL = canvas.toDataURL("image/png");

      setHasUnsavedChanges(false);
  
      // Convert the image to HTML
      const htmlContent = await convertImageToHTML(imageDataURL);
  
      if (projectId) {
        // Store the new HTML content locally
        localStorage.setItem(`htmlContent_${projectId}`, htmlContent);
        // Store the current table data and headers
        localStorage.setItem(`tableData_${projectId}`, JSON.stringify(tableData));
        localStorage.setItem(`headers_${projectId}`, JSON.stringify(headers));
        // Store the image URL
        localStorage.setItem(`publishedImageURL_${projectId}`, imageDataURL);
  
        // Update the HTML file on the server, force update if republishing
        await updateHTMLFileOnServer(htmlContent, isPublished);
        
        const updateResult = await updateProjectStatus(projectId);
        
        console.log('Update result:', updateResult);
  
        if (updateResult && updateResult.name && updateResult.description) {
          console.log('Updated project details:', updateResult);
          if (updateResult.project_status === "Published") {
            setIsPublished(true);
            
            let fullEmbedURL, fullScriptURL;
  
            if (updateResult.embed_url) {
              fullEmbedURL = `http://dashboardtool.pythonanywhere.com${updateResult.embed_url}`;
              fullScriptURL = fullEmbedURL.replace('/embed/', '/script/');
            } else {
              console.warn('Published project missing embed URL, generating default');
              fullEmbedURL = `http://dashboardtool.pythonanywhere.com/embed/${projectId}`;
              fullScriptURL = `http://dashboardtool.pythonanywhere.com/script/${projectId}`;
            }
  
            console.log('Setting embed URL:', fullEmbedURL);
            console.log('Setting script URL:', fullScriptURL);
  
            setEmbedURL(fullEmbedURL);
            setScriptURL(fullScriptURL);
            
            localStorage.setItem(`embedURL_${projectId}`, fullEmbedURL);
            localStorage.setItem(`scriptURL_${projectId}`, fullScriptURL);
            localStorage.setItem(`isPublished_${projectId}`, 'true');
            
            setPublishedImageURL(imageDataURL);
            setIsPublishModalOpen(true);
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
  const handleDownloadImage = () => {
    const link = document.createElement("a");
    link.href = publishedImageURL;
    link.download = "chart.png";
    link.click();
  };

  return (
    <div className="relative p-4">
      <div className="flex space-x-2 mb-4">
      <button
  className={`px-4 py-2 text-sm font-medium text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ${
    isPublished ? 'bg-green-500' : 'bg-primary'
  }`}
  onClick={handlePublishClick}
>
  {isPublished ? 'Published' : 'Publish'}
</button>
        {isPublished && (
          <button
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => setIsRepublishModalOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" width="20px" height="20px">
              <path d="M 15 3 C 12.031398 3 9.3028202 4.0834384 7.2070312 5.875 A 1.0001 1.0001 0 1 0 8.5058594 7.3945312 C 10.25407 5.9000929 12.516602 5 15 5 C 20.19656 5 24.450989 8.9379267 24.951172 14 L 22 14 L 26 20 L 30 14 L 26.949219 14 C 26.437925 7.8516588 21.277839 3 15 3 z M 4 10 L 0 16 L 3.0507812 16 C 3.562075 22.148341 8.7221607 27 15 27 C 17.968602 27 20.69718 25.916562 22.792969 24.125 A 1.0001 1.0001 0 1 0 21.494141 22.605469 C 19.74593 24.099907 17.483398 25 15 25 C 9.80344 25 5.5490109 21.062074 5.0488281 16 L 8 16 L 4 10 z"/>
            </svg>
          </button>
        )}
      </div>

    
      {showUnsavedChangesPopup && !isPublished && (
  <div className="fixed bottom-4 right-4 bg-white border border-yellow-400 rounded-lg shadow-lg w-80 p-4" role="alert">
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <p className="text-lg font-semibold text-yellow-700 mb-2">Unsaved Changes</p>
        <p className="text-sm text-gray-600">Please publish your changes before leaving the page.</p>
      </div>
      <button
        onClick={() => setShowUnsavedChangesPopup(false)}
        className="text-gray-400 hover:text-gray-500 focus:outline-none"
        aria-label="Close alert"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
  </div>
)}
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

      {isModalOpen && !isPublished && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-900">Publish Chart</h2>
            <p className="mt-2 text-sm text-gray-600">Are you sure you want to publish this project?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={handlePublish}
              >
                Confirm Publish
              </button>
            </div>
          </div>
        </div>
      )}

{isPublishModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Project Published Successfully!</h2>
      <div className="mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-2">Embed URL:</h3>
        <input 
          type="text" 
          value={embedURL} 
          readOnly 
          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
        />
      </div>
      <div className="mb-4">
        <h3 className="text-md font-medium text-gray-700 mb-2">Embed Code:</h3>
        <div className="flex items-center space-x-4 mb-2">
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="embedType"
              value="iframe"
              checked={embedType === 'iframe'}
              onChange={() => setEmbedType('iframe')}
            />
            <span className="ml-2">iframe</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              className="form-radio"
              name="embedType"
              value="script"
              checked={embedType === 'script'}
              onChange={() => setEmbedType('script')}
            />
            <span className="ml-2">script</span>
          </label>
        </div>
        <textarea 
          value={embedType === 'iframe' 
            ? `<iframe src="${embedURL}" width="100%" height="400" frameborder="0"></iframe>`
            : `<script src="${scriptURL}"></script>`
          }
          readOnly 
          className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 h-24"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
          onClick={() => setIsPublishModalOpen(false)}
        >
          Close
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          onClick={handleDownloadImage}
        >
          Download Image
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          onClick={handleDownloadHTML}
        >
          Download HTML
        </button>
      </div>
    </div>
  </div>
)}
       {isRepublishModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-900">Republish Project</h2>
            <p className="mt-2 text-sm text-gray-600">Do you want to republish the project again?</p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setIsRepublishModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={handleRepublish}
              >
                Republish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;