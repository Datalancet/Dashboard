"use client";
import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Function to read the HTML file and convert it to base64
const getBase64HTMLFile = async (filePath) => {
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Failed to fetch HTML file: ${response.statusText}`);
    }
    const htmlContent = await response.text();
    return btoa(htmlContent);
  } catch (error) {
    console.error("Error loading HTML file:", error);
    throw error;
  }
};

const DataTable = ({ onDataChange }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [base64HTML, setBase64HTML] = useState("");
  const [loadingHTML, setLoadingHTML] = useState(true);
  const [htmlLoadError, setHtmlLoadError] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem("tableData");
    if (storedData) {
      setTableData(JSON.parse(storedData));
    }
    const storedHeaders = localStorage.getItem("headers");
    if (storedHeaders) {
      setHeaders(JSON.parse(storedHeaders));
    }

    // Load and encode the HTML file
    getBase64HTMLFile("/demo.html")
      .then((encodedHTML) => {
        console.log("Encoded HTML:", encodedHTML);
        setBase64HTML(encodedHTML);
        setLoadingHTML(false);
      })
      .catch((error) => {
        console.error("Error encoding HTML file:", error);
        setLoadingHTML(false);
        setHtmlLoadError(true);
      });
  }, []);

  useEffect(() => {
    if (tableData.length > 0) {
      localStorage.setItem("tableData", JSON.stringify(tableData));
      localStorage.setItem("headers", JSON.stringify(headers));
    }
    if (onDataChange) {
      onDataChange(headers, tableData);
    }
  }, [tableData, headers]);

  const handleFileChange = async (event) => {
    if (loadingHTML) {
      alert("HTML file is still loading. Please try again in a moment.");
      return;
    }
    
    if (htmlLoadError) {
      alert("Failed to load HTML file. Please try again later.");
      return;
    }

    const file = event.target.files[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setSelectedFile(file);
      const fileContent = await readFileContent(file);
      parseCSV(file);
      uploadData(fileContent);
    } else {
      alert("Please upload a file smaller than 2MB.");
    }
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        const [headerRow, ...dataRows] = result.data;
        setHeaders(headerRow);
        setTableData(dataRows);
      },
      header: false,
    });
  };

  const uploadData = async (fileContent) => {
    const base64Content = fileContent.split(",")[1];
    const requestBody = {
      name: "Sample Project",
      description: "This is a sample project.",
      html_file: base64HTML,
      data_file: base64Content,
      project_status: "Draft",
      selected_column: []
    };

    console.log("Request Body:", requestBody);

    try {
      const response = await fetch("https://dashboardtool.pythonanywhere.com/api/v1/projects/create-or-upload/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded successfully:", data.message);
        // Optionally handle the embed_url or other response data
      } else {
        const errorData = await response.json();
        console.error("Error uploading file:", errorData.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    const updatedTableData = [...tableData];
    updatedTableData[rowIndex][colIndex] = value;
    setTableData(updatedTableData);
  };

  return (
    <div className="relative p-4">
      <div className="absolute top-0 right-0 m-4">
        <label
          htmlFor="file-upload"
          className={`px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-900 rounded-md ${
            loadingHTML ? "cursor-not-allowed opacity-50" : "hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
          }`}
        >
          {loadingHTML ? "Loading..." : "Upload"}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
          disabled={loadingHTML}
        />
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-900 rounded-l-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
        >
          <a href="/forms/bar-chart">Preview</a>
        </button>
        <button
          type="button"
          className="px-4 py-2 text-sm font-medium text-white bg-primary border border-gray-900 rounded-r-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700"
        >
          <a href="/data-table">Data</a>
        </button>
      </div>

      {tableData.length > 0 && (
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
      )}
    </div>
  );
};

export default DataTable;
