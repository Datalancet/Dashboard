"use client";
import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import html2canvas from "html2canvas";
import { useSearchParams } from "next/navigation";
import ReactDOM from "react-dom";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
      <div className="relative p-8 bg-white w-full max-w-md m-auto flex-col flex rounded-lg">
        <div>{children}</div>
        <button
          className="absolute top-0 right-0 mt-4 mr-4 text-black hover:text-gray-700"
          onClick={onClose}
        >
          &times;
        </button>
      </div>
    </div>,
    document.body
  );
};

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
  onDataChange?: (headers: string[], data: any[][]) => void; // Add this line
  mapRef: React.RefObject<HTMLDivElement>; 
}

const MapDataTable: React.FC<MapWithTableProps> = ({
  design,
  color,
  mapTitle,
  titleAlignment,
  sourceName,
  sourceURL,
  chartType,
  logoPosition,
  logoUrl,
    onDataChange,
    mapRef
}) => {
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
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAPIModalOpen, setIsAPIModalOpen] = useState(false);
  const [apiURL, setApiURL] = useState('');
  const [apiError, setApiError] = useState('');
  const [tableHeight, setTableHeight] = useState(500);
  const [sliderValue, setSliderValue] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const tableRef = useRef(null);
  const tableContentRef = useRef(null);


  const [defaultCSV, setDefaultCSV] = useState(`
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
`);


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
      saveDataToAPI(headers, tableData);
    }
    if (onDataChange) {
      onDataChange(headers, tableData);
    }
  }, [tableData, headers, projectId]);

  const saveDataToAPI = async (headers, data) => {
    if (!projectId) return;

    try {
      const csvContent = Papa.unparse([headers, ...data]);
      await updateDataFileOnServer(csvContent);
    } catch (error) {
      console.error('Error saving data to API:', error);
    }
  };

  useEffect(() => {
    const updateTableHeight = () => {
      const windowHeight = window.innerHeight;
      const topOffset = tableRef.current ? tableRef.current.getBoundingClientRect().top : 0;
      const newHeight = windowHeight - topOffset - 100; // 100px buffer
      setTableHeight(Math.max(newHeight, 300)); // Minimum height of 300px
    };

    updateTableHeight();
    window.addEventListener('resize', updateTableHeight);
    return () => window.removeEventListener('resize', updateTableHeight);
  }, []);

  useEffect(() => {
    const checkScrollable = () => {
      if (tableRef.current && tableContentRef.current) {
        const isContentScrollable = tableContentRef.current.scrollHeight > tableRef.current.clientHeight;
        setIsScrollable(isContentScrollable);
      }
    };

    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [tableData]);

  


  const handleDownloadHTML = async () => {
    try {
      if (!projectId) {
        throw new Error('No project ID available');
      }
  
      // Fetch HTML content from API
      const htmlContent = await fetchHTMLContentFromAPI(projectId);
  
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
  
      console.log('HTML file downloaded successfully from API');
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
  
        setIsPublished(projectData.project_data.project_status === 'Published');
  
        if (projectData.data_file) {
          console.log('Parsing CSV data from project');
          const csvContent = atob(projectData.data_file);
          parseCSV(csvContent);
        } else {
          console.log('No data found, using default CSV');
          parseDefaultCSV();
        }
  
        // Check localStorage for stored embed URLs
        const storedEmbedURL = localStorage.getItem(`embedURL_${projectId}`);
        const storedScriptURL = localStorage.getItem(`scriptURL_${projectId}`);
  
        if (storedEmbedURL && storedScriptURL) {
          console.log('Using stored URLs from localStorage');
          setEmbedURL(storedEmbedURL);
          setScriptURL(storedScriptURL);
        } else if (projectData.project_data.embed_url) {
          // If no stored URLs, use the ones from the API response
          const fullEmbedURL = `http://dashboardtool.pythonanywhere.com${projectData.project_data.embed_url}`;
          const fullScriptURL = fullEmbedURL.replace('/embed/', '/script/');
          setEmbedURL(fullEmbedURL);
          setScriptURL(fullScriptURL);
  
          // Save to localStorage
          localStorage.setItem(`embedURL_${projectId}`, fullEmbedURL);
          localStorage.setItem(`scriptURL_${projectId}`, fullScriptURL);
        } else if (projectData.project_data.project_status === 'Published') {
          // If the project is published but doesn't have embed URLs, generate default ones
          const fullEmbedURL = `http://dashboardtool.pythonanywhere.com/embed/${projectId}`;
          const fullScriptURL = `http://dashboardtool.pythonanywhere.com/script/${projectId}`;
          setEmbedURL(fullEmbedURL);
          setScriptURL(fullScriptURL);
  
          // Save to localStorage
          localStorage.setItem(`embedURL_${projectId}`, fullEmbedURL);
          localStorage.setItem(`scriptURL_${projectId}`, fullScriptURL);
        }
  
        localStorage.setItem(`isPublished_${projectId}`, projectData.project_data.project_status === 'Published' ? 'true' : 'false');
  
        const storedImageURL = localStorage.getItem(`publishedImageURL_${projectId}`);
        if (storedImageURL) {
          setPublishedImageURL(storedImageURL);
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

  const parseCSV = (content: string) => {
    const result = Papa.parse(content, { header: false });
    const [headerRow, ...dataRows] = result.data;
    setHeaders(headerRow);
    setTableData(dataRows);
  };

  const handleDataChange = async (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);
  
    if (projectId) {
      try {
        const csvContent = Papa.unparse([newHeaders, ...newData]);
        await updateDataFileOnServer(csvContent);
      } catch (error) {
        console.error('Error saving data to API:', error);
      }
    }
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
        const maxWidth = Math.min(1200, window.innerWidth * 0.9);
        const maxHeight = window.innerHeight * 0.9;
        const scaleX = maxWidth / img.width;
        const scaleY = maxHeight / img.height;
        const scale = Math.min(scaleX, scaleY, 1);
  
        const scaledWidth = Math.floor(img.width * scale);
        const scaledHeight = Math.floor(img.height * scale);
  
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
  
        const imageData = ctx.getImageData(0, 0, scaledWidth, scaledHeight);
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
                justify-content: center;
                align-items: center;
                background-color: #f4f4f4;
              }
              .chart-container {
                background-color: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                overflow: auto;
                max-width: 95vw;
                max-height: 95vh;
              }
              .chart-content {
                width: ${scaledWidth}px;
                height: ${scaledHeight}px;
                position: relative;
              }
              .pixel-row { position: relative; height: 1px; }
              .pixel-group { position: absolute; height: 1px; }
            </style>
          </head>
          <body>
            <div class="chart-container">
              <div class="chart-content">
        `;
  
        for (let y = 0; y < scaledHeight; y++) {
          html += `<div class="pixel-row">`;
          let currentColor = null;
          let currentWidth = 0;
          let currentX = 0;
  
          for (let x = 0; x < scaledWidth; x++) {
            const index = (y * scaledWidth + x) * 4;
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

  const updateProjectStatus = async (projectId, htmlContent) => {
    try {
      const projectResponse = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!projectResponse.ok) {
        throw new Error(`Failed to fetch project details: ${projectResponse.status}`);
      }
      const projectData = await projectResponse.json();
  
      console.log('Fetched project data:', projectData);
  
      const projectName = projectData.project_data.name;
      const projectDescription = projectData.project_data.description;
      const dataContent = projectData.data_file;
  
      const formData = new FormData();
      formData.append('id', projectId);
      formData.append('name', projectName);
      formData.append('description', projectDescription);
      
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
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

  const fetchHTMLContentFromAPI = async (projectId) => {
    try {
      const response = await fetch(`https://dashboardtool.pythonanywhere.com/api/v1/projects/detail/?id=${projectId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch project details: ${response.status}`);
      }
      const projectData = await response.json();
      return atob(projectData.html_file); // Decode the base64 encoded HTML content
    } catch (error) {
      console.error('Error fetching HTML content:', error);
      throw error;
    }
  };
  const handlePublish = async () => {
    setIsModalOpen(false);
    setIsPublishing(true);
    try {
      // Use the mapRef to get the map element
      if (!mapRef.current) {
        throw new Error("Map element not found");
      }

      // Capture only the map element
      const canvas = await html2canvas(mapRef.current);
      const imageDataURL = canvas.toDataURL("image/png");

      setHasUnsavedChanges(false);

      // Generate HTML content
      const htmlContent = await convertImageToHTML(imageDataURL);

      if (projectId) {
        // Update the HTML file on the server
        await updateHTMLFileOnServer(htmlContent, true);

        const updateResult = await updateProjectStatus(projectId, htmlContent);
        
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
            
            // Use try-catch for localStorage operations
            try {
              localStorage.setItem(`embedURL_${projectId}`, fullEmbedURL);
              localStorage.setItem(`scriptURL_${projectId}`, fullScriptURL);
              localStorage.setItem(`isPublished_${projectId}`, 'true');
              
              // Attempt to store the image URL, but don't throw an error if it fails
              try {
                localStorage.setItem(`publishedImageURL_${projectId}`, imageDataURL);
              } catch (storageError) {
                console.warn('Unable to store image URL in localStorage:', storageError);
              }
            } catch (storageError) {
              console.warn('Unable to store some items in localStorage:', storageError);
            }
            
            setPublishedImageURL(imageDataURL);
            setIsPublishModalOpen(true);

          } else {
            console.warn("Project status not updated to 'Published'. Current status:", updateResult.project_status);
            alert(`Project updated, but status is ${updateResult.project_status}. Please check again in a few moments.`);
          }
        } else {
          throw new Error("Failed to update project: Unexpected response from server");
        }
      } else {
        // Handle case where there's no projectId (local storage only)
        try {
          localStorage.setItem(`tableData_null`, JSON.stringify(tableData));
          localStorage.setItem(`headers_null`, JSON.stringify(headers));
          alert("Project data saved locally. Note: Without a project ID, this data is only stored on your device.");
        } catch (storageError) {
          console.warn('Unable to store project data in localStorage:', storageError);
          alert("Unable to save project data locally due to storage limitations. The data is available for this session only.");
        }
      }

    } catch (error) {
      console.error('Error publishing project:', error);
      alert(`Failed to publish project: ${error.message}. Please check the console for more details.`);
    } finally {
      setIsPublishing(false);
    }
  };


  const handleDownloadImage = () => {
    if (publishedImageURL) {
      const link = document.createElement("a");
      link.href = publishedImageURL;
      link.download = "chart.png";
      link.click();
    } else {
      alert("No published image available. Please re-publish the project first.");
    }
  };

  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  const handleCSVUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      handleFileChange(event);
    } else {
      alert("Please upload a CSV file smaller than 2MB.");
    }
    setIsUploadModalOpen(false);
  };

  const handleLiveAPIUpload = () => {
    setIsUploadModalOpen(false);
    setIsAPIModalOpen(true);
  };

  const handleAPIURLChange = (event) => {
    setApiURL(event.target.value);
  };

  const handleAPISubmit = async () => {
    try {
      setApiError('');
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Assuming the API returns an array of objects
      // Convert the data to CSV format
      const csvData = Papa.unparse(data);
      
      // Use the existing CSV parsing logic
      parseCSV(csvData);
      
      setDataUploaded(true);
      setIsPublished(false);
      setHasUnsavedChanges(true);
      setIsAPIModalOpen(false);

      if (projectId) {
        await updateDataFileOnServer(csvData);
      }
    } catch (error) {
      console.error('Error fetching API data:', error);
      setApiError(`Failed to fetch data: ${error.message}`);
    }
  };

  const handleSliderChange = (event) => {
    if (!isScrollable) return;
    setSliderValue(Number(event.target.value));
    if (tableContentRef.current) {
      const scrollHeight = tableContentRef.current.scrollHeight - tableContentRef.current.clientHeight;
      const scrollTop = (scrollHeight * event.target.value) / 100;
      tableContentRef.current.scrollTop = scrollTop;
    }
  };

  const handleTableScroll = () => {
    if (!isScrollable) return;
    if (tableContentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = tableContentRef.current;
      const newSliderValue = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setSliderValue(newSliderValue);
    }
  };

  const PublishSuccessModal = () => (
    <Modal isOpen={isPublishModalOpen} onClose={() => setIsPublishModalOpen(false)}>
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
    </Modal>
  );

  
  return (
    <div className="relative p-4">
      <div className="flex space-x-2 mb-4">
      <button
          className={`px-4 py-2 text-sm font-medium text-white rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 ${
            isPublished ? 'bg-green-500' : 'bg-primary'
          } ${isPublishing ? 'opacity-75 cursor-not-allowed' : ''}`}
          onClick={handlePublishClick}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Publishing...
            </>
          ) : isPublished ? 'Published' : 'Publish'}
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
        <button
          onClick={handleUploadClick}
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-900 rounded-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
        >
          Upload
        </button>
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 transform transition-all ease-in-out duration-300">
            <div className="border-b px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Choose Upload Method</h3>
              <button onClick={handleCloseUploadModal} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-4">
                <label className="flex items-center justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6" />
                    </svg>
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload CSV File
                    </span>
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                </label>
                <button
                  onClick={handleLiveAPIUpload}
                  className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Use Live API
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Modal */}
      {isAPIModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-xl w-96 transform transition-all ease-in-out duration-300">
            <div className="border-b px-4 py-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Enter API URL</h3>
              <button onClick={() => setIsAPIModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="api-url" className="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                <input
                  id="api-url"
                  type="text"
                  value={apiURL}
                  onChange={handleAPIURLChange}
                  placeholder="https://api.example.com/data"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {apiError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {apiError}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAPIModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAPISubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Fetch Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


{tableData.length > 0 && (
        <div className="flex-grow flex flex-col">
          <div 
            id="chart" 
            ref={tableRef} 
            className="overflow-hidden flex-grow relative"
            style={{ height: `${tableHeight}px` }}
          >
            <div 
              ref={tableContentRef}
              className={`absolute top-0 left-0 right-0 bottom-0 ${isScrollable ? 'overflow-y-scroll' : ''} scrollbar-hide`}
              onScroll={handleTableScroll}
            >
              <table className="min-w-full bg-white border border-gray-200 table-auto">
                <thead className="sticky top-0 bg-white z-10">
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
          </div>
         
        </div>
      )}


     

<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
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
      </Modal>

      <PublishSuccessModal />

      <Modal isOpen={isRepublishModalOpen} onClose={() => setIsRepublishModalOpen(false)}>
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
      </Modal>
    </div>
  );
};

export default MapDataTable;