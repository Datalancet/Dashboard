"use client"

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TableChartwithTable from "../TableChartwithTable";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

const TableChart = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'Table';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleAlignment, setTitleAlignment] = useState(() => localStorage.getItem(`${projectId}_${chartType}_titleAlignment`) || "left");
  const [sourceName, setSourceName] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceName`) || "");
  const [sourceURL, setSourceURL] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceURL`) || "");
  const [chartTitle, setChartTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_chartTitle`) || "");
  const [tableColor, setTableColor] = useState(() => localStorage.getItem(`${projectId}_${chartType}_tableColor`) || "#3b82f6");
  const [showBorders, setShowBorders] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showBorders`) === 'true');
  const [alternateRowColor, setAlternateRowColor] = useState(() => localStorage.getItem(`${projectId}_${chartType}_alternateRowColor`) === 'true');
  const [showMiniCharts, setShowMiniCharts] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showMiniCharts`) === 'true');
  const [showSearch, setShowSearch] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showSearch`) === 'true');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [deletedRows, setDeletedRows] = useState<number[]>(() => {
    const storedDeletedRows = localStorage.getItem(`${projectId}_${chartType}_deletedRows`);
    return storedDeletedRows ? JSON.parse(storedDeletedRows) : [];
  });
  const [deletedColumns, setDeletedColumns] = useState<number[]>(() => {
    const storedDeletedColumns = localStorage.getItem(`${projectId}_${chartType}_deletedColumns`);
    return storedDeletedColumns ? JSON.parse(storedDeletedColumns) : [];
  });

  const [logoPosition, setLogoPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>(
    () => (localStorage.getItem(`${projectId}_${chartType}_logoPosition`) as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') || 'top-right'
  );
  const [logoUrl, setLogoUrl] = useState(() => {
    const savedLogoUrl = localStorage.getItem(`${projectId}_${chartType}_logoUrl`);
    return savedLogoUrl || '/favicon.ico';
  });

  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
    const storedData = localStorage.getItem(`${projectId}_${chartType}_tableData`);
  
    if (storedHeaders && storedData) {
      let parsedHeaders = JSON.parse(storedHeaders);
      let parsedData = JSON.parse(storedData);

      // Apply deleted columns
      parsedHeaders = parsedHeaders.filter((_: any, index: number) => !deletedColumns.includes(index));
      parsedData = parsedData.map((row: any[]) => row.filter((_: any, index: number) => !deletedColumns.includes(index)));

      // Apply deleted rows
      parsedData = parsedData.filter((_: any, index: number) => !deletedRows.includes(index));

      setHeaders(parsedHeaders);
      setTableData(parsedData);
    }
  }, [projectId, chartType, deletedRows, deletedColumns]);
  
  useEffect(() => {
    localStorage.setItem(`${projectId}_${chartType}_titleAlignment`, titleAlignment);
    localStorage.setItem(`${projectId}_${chartType}_sourceName`, sourceName);
    localStorage.setItem(`${projectId}_${chartType}_sourceURL`, sourceURL);
    localStorage.setItem(`${projectId}_${chartType}_chartTitle`, chartTitle);
    localStorage.setItem(`${projectId}_${chartType}_tableColor`, tableColor);
    localStorage.setItem(`${projectId}_${chartType}_showBorders`, showBorders.toString());
    localStorage.setItem(`${projectId}_${chartType}_alternateRowColor`, alternateRowColor.toString());
    localStorage.setItem(`${projectId}_${chartType}_logoPosition`, logoPosition);
    localStorage.setItem(`${projectId}_${chartType}_logoUrl`, logoUrl);
    localStorage.setItem(`${projectId}_${chartType}_showMiniCharts`, showMiniCharts.toString());
    localStorage.setItem(`${projectId}_${chartType}_showSearch`, showSearch.toString());
    localStorage.setItem(`${projectId}_${chartType}_deletedRows`, JSON.stringify(deletedRows));
    localStorage.setItem(`${projectId}_${chartType}_deletedColumns`, JSON.stringify(deletedColumns));
  }, [titleAlignment, sourceName, sourceURL, chartTitle, tableColor, showBorders, alternateRowColor, projectId, chartType, logoPosition, logoUrl, showMiniCharts, showSearch, deletedRows, deletedColumns]);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newLogoUrl = e.target?.result as string;
        setLogoUrl(newLogoUrl);
        localStorage.setItem(`${projectId}_${chartType}_logoUrl`, newLogoUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTitleAlignmentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTitleAlignment(event.target.value as "left" | "center" | "right");
  };

  const handleSourceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceName(event.target.value);
  };

  const handleSourceURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSourceURL(event.target.value);
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChartTitle(event.target.value);
  };

  const handleTableColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTableColor(event.target.value);
  };

  const handleShowBordersChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowBorders(event.target.checked);
  };

  const handleAlternateRowColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setAlternateRowColor(event.target.checked);
  };

  const handleShowMiniChartsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowMiniCharts(event.target.checked);
  };

  const handleShowSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowSearch(event.target.checked);
  };

  const handlePublishClick = () => {
    setIsModalOpen(true);
  };

  const handleLogoPositionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLogoPosition(event.target.value as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left');
  };

  const handlePublish = () => {
    const chartElement = document.getElementById("chart");
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "table-chart.png";
        link.click();
      });
    }
    setIsModalOpen(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const deleteRow = (rowIndex: number) => {
    const updatedDeletedRows = [...deletedRows, rowIndex];
    setDeletedRows(updatedDeletedRows);
    localStorage.setItem(`${projectId}_${chartType}_deletedRows`, JSON.stringify(updatedDeletedRows));
  };
  
  const deleteColumn = (columnIndex: number) => {
    const updatedDeletedColumns = [...deletedColumns, columnIndex];
    setDeletedColumns(updatedDeletedColumns);
    localStorage.setItem(`${projectId}_${chartType}_deletedColumns`, JSON.stringify(updatedDeletedColumns));
  };

  const handleDataChange = (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);
    localStorage.setItem(`${projectId}_${chartType}_headers`, JSON.stringify(newHeaders));
    localStorage.setItem(`${projectId}_${chartType}_tableData`, JSON.stringify(newData));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="Table" />
        <div className="relative inline-block text-left">
          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
            onClick={toggleDropdown}
          >
            Delete Options
            <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {showDropdown && (
            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {tableData.map((_, rowIndex) => (
                  <button
                    key={`row-${rowIndex}`}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => deleteRow(rowIndex)}
                  >
                    Delete Row {rowIndex + 1}
                  </button>
                ))}
                {headers.map((_, columnIndex) => (
                  <button
                    key={`column-${columnIndex}`}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    onClick={() => deleteColumn(columnIndex)}
                  >
                    Delete Column {columnIndex + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={chartRef}>
          <TableChartwithTable
            tableColor={tableColor}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            chartTitle={chartTitle}
            projectId={projectId}
            chartType={chartType}
            showBorders={showBorders}
            alternateRowColor={alternateRowColor}
            logoPosition={logoPosition}
            logoUrl={logoUrl}
            showMiniCharts={showMiniCharts}
            showSearch={showSearch}
            onDataChange={handleDataChange}
            initialHeaders={headers}
            initialData={tableData}
            deletedRows={deletedRows}
            deletedColumns={deletedColumns}
          />
        </div>
        
        <div className="w-1/4 pl-4">
          <div className="mb-4">
            <label htmlFor="table-color" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Table Color</label>
            <input
              id="table-color"
              type="color"
              value={tableColor}
              onChange={handleTableColorChange}
              className="block w-full p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showBorders}
                onChange={handleShowBordersChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Borders</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={alternateRowColor}
                onChange={handleAlternateRowColorChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alternate Row Color</span>
            </label>
          </div>

          <div className="mb-4">
            <label htmlFor="logo-upload" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Upload Logo</label>
            <input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="logo-position" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Logo Position</label>
            <select
              id="logo-position"
              value={logoPosition}
              onChange={handleLogoPositionChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showSearch}
                onChange={handleShowSearchChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Search Bar</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showMiniCharts}
                onChange={handleShowMiniChartsChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Mini Charts</span>
            </label>
          </div>

          <div className="mb-4">
            <label htmlFor="chart-title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Table Title</label>
            <input
              id="chart-title"
              type="text"
              value={chartTitle}
              onChange={handleTitleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              placeholder="Enter chart title"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="title-alignment" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Title Alignment</label>
            <select
              id="title-alignment"
              value={titleAlignment}
              onChange={handleTitleAlignmentChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          
          
        </div>
      </div>
    </div>
  );
};

export default TableChart;