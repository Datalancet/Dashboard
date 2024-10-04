"use client"

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import HeatMapChartwithTable from "../HeatMapChartwithTable";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

const HeatMap = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'Heatmap';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleAlignment, setTitleAlignment] = useState(() => localStorage.getItem(`${projectId}_${chartType}_titleAlignment`) || "left");
  const [sourceName, setSourceName] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceName`) || "");
  const [sourceURL, setSourceURL] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceURL`) || "");
  const [chartTitle, setChartTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_chartTitle`) || "");
  const [heatmapColor, setHeatmapColor] = useState(() => localStorage.getItem(`${projectId}_${chartType}_heatmapColor`) || "#3b82f6");
  const [xAxisTitle, setXAxisTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_xAxisTitle`) || "X Axis");
  const [yAxisTitle, setYAxisTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_yAxisTitle`) || "Y Axis");
  const [showLegend, setShowLegend] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showLegend`) === 'true');
  const [reversedYAxis, setReversedYAxis] = useState(() => localStorage.getItem(`${projectId}_${chartType}_reversedYAxis`) === 'true');
  const [cellRadius, setCellRadius] = useState(() => parseInt(localStorage.getItem(`${projectId}_${chartType}_cellRadius`) || "0"));

  const [logoPosition, setLogoPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>(
    () => (localStorage.getItem(`${projectId}_${chartType}_logoPosition`) as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') || 'top-right'
  );
  const [logoUrl, setLogoUrl] = useState(() => {
    const savedLogoUrl = localStorage.getItem(`${projectId}_${chartType}_logoUrl`);
    return savedLogoUrl || '/favicon.ico';
  });

  const [seriesNames, setSeriesNames] = useState(() => {
    const savedNames = localStorage.getItem(`${projectId}_${chartType}_seriesNames`);
    return savedNames ? JSON.parse(savedNames) : ["Fossil fuels sources", "Low-carbon sources"];
  });

  const [xAxisColumn, setXAxisColumn] = useState(() => 
    localStorage.getItem(`${projectId}_${chartType}_xAxisColumn`) || ""
  );
  const [yAxisColumns, setYAxisColumns] = useState(() => {
    const savedColumns = localStorage.getItem(`${projectId}_${chartType}_yAxisColumns`);
    return savedColumns ? JSON.parse(savedColumns) : [];
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [alphabeticColumns, setAlphabeticColumns] = useState<string[]>([]);
  const [numericColumns, setNumericColumns] = useState<string[]>([]);

  const [isYAxisDropdownOpen, setIsYAxisDropdownOpen] = useState(false);
  const yAxisDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (yAxisDropdownRef.current && !yAxisDropdownRef.current.contains(event.target)) {
        setIsYAxisDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleYAxisColumn = (column: string) => {
    setYAxisColumns(prev => {
      const newYAxisColumns = prev.includes(column)
        ? prev.filter(c => c !== column)
        : [...prev, column];
      
      // Save the updated Y-axis columns to local storage
      localStorage.setItem(`${projectId}_${chartType}_yAxisColumns`, JSON.stringify(newYAxisColumns));
      
      return newYAxisColumns;
    });
  };

  useEffect(() => {
    const savedYAxisColumns = localStorage.getItem(`${projectId}_${chartType}_yAxisColumns`);
    if (savedYAxisColumns) {
      setYAxisColumns(JSON.parse(savedYAxisColumns));
    }
  }, [projectId, chartType]);

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

  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(`${projectId}_${chartType}_titleAlignment`, titleAlignment);
    localStorage.setItem(`${projectId}_${chartType}_sourceName`, sourceName);
    localStorage.setItem(`${projectId}_${chartType}_sourceURL`, sourceURL);
    localStorage.setItem(`${projectId}_${chartType}_chartTitle`, chartTitle);
    localStorage.setItem(`${projectId}_${chartType}_heatmapColor`, heatmapColor);
    localStorage.setItem(`${projectId}_${chartType}_xAxisTitle`, xAxisTitle);
    localStorage.setItem(`${projectId}_${chartType}_yAxisTitle`, yAxisTitle);
    localStorage.setItem(`${projectId}_${chartType}_showLegend`, showLegend.toString());
    localStorage.setItem(`${projectId}_${chartType}_reversedYAxis`, reversedYAxis.toString());
    localStorage.setItem(`${projectId}_${chartType}_cellRadius`, cellRadius.toString());
    localStorage.setItem(`${projectId}_${chartType}_logoPosition`, logoPosition);
    localStorage.setItem(`${projectId}_${chartType}_logoUrl`, logoUrl);
  }, [titleAlignment, sourceName, sourceURL, chartTitle, heatmapColor, xAxisTitle, yAxisTitle, showLegend, reversedYAxis, cellRadius, projectId, chartType, logoPosition, logoUrl]);

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

  const handleHeatmapColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setHeatmapColor(event.target.value);
  };

  const handleXAxisTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setXAxisTitle(event.target.value);
  };

  const handleYAxisTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYAxisTitle(event.target.value);
  };

  const handleShowLegendChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowLegend(event.target.checked);
  };

  const handleReversedYAxisChange = (event: ChangeEvent<HTMLInputElement>) => {
    setReversedYAxis(event.target.checked);
  };

  const handleCellRadiusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCellRadius(parseInt(event.target.value));
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
        link.download = "heatmap.png";
        link.click();
      });
    }
    setIsModalOpen(false);
  };

  const handleXAxisColumnChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newXAxisColumn = event.target.value;
    setXAxisColumn(newXAxisColumn);
    localStorage.setItem(`${projectId}_${chartType}_xAxisColumn`, newXAxisColumn);
  };

  const handleYAxisColumnChange = (column: string) => {
    const newYAxisColumns = yAxisColumns.includes(column)
      ? yAxisColumns.filter(c => c !== column)
      : [...yAxisColumns, column];
    setYAxisColumns(newYAxisColumns);
    localStorage.setItem(`${projectId}_${chartType}_yAxisColumns`, JSON.stringify(newYAxisColumns));
  };

  const updateAvailableColumns = (headers: string[], data: any[][], defaultX: string, defaultY: string[]) => {
    setAvailableColumns(headers);
  
    const alphabetic = headers.filter((_, index) => 
      data.every(row => isNaN(Number(row[index])))
    );
    setAlphabeticColumns(alphabetic);
  
    const numeric = headers.filter((_, index) => 
      data.every(row => !isNaN(Number(row[index])))
    );
    setNumericColumns(numeric);
  
    // Update yAxisColumns to only include available numeric columns
    setYAxisColumns(prev => prev.filter(col => numeric.includes(col)));
  
    // Only set default X and Y axis if they haven't been set before
    if (!xAxisColumn && defaultX) {
      setXAxisColumn(defaultX);
      localStorage.setItem(`${projectId}_${chartType}_xAxisColumn`, defaultX);
    }
    if (yAxisColumns.length === 0 && defaultY.length > 0) {
      const availableDefaultY = defaultY.filter(col => numeric.includes(col));
      setYAxisColumns(availableDefaultY);
      localStorage.setItem(`${projectId}_${chartType}_yAxisColumns`, JSON.stringify(availableDefaultY));
    }
  };

  const handleAxisChange = (newXAxis: string, newYAxes: string[]) => {
    setXAxisColumn(newXAxis);
    setYAxisColumns(newYAxes);
    
    // Update series names if necessary
    if (newYAxes.length !== seriesNames.length) {
      setSeriesNames(newYAxes);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="Heat Map" />
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={chartRef}>
          <HeatMapChartwithTable
            heatmapColor={heatmapColor}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            chartTitle={chartTitle}
            projectId={projectId}
            chartType={chartType}
            xAxisTitle={xAxisTitle}
            yAxisTitle={yAxisTitle}
            showLegend={showLegend}
            reversedYAxis={reversedYAxis}
            cellRadius={cellRadius}
            logoPosition={logoPosition}
            logoUrl={logoUrl}
            xAxisColumn={xAxisColumn}
            yAxisColumns={yAxisColumns}
            updateAvailableColumns={updateAvailableColumns}
            onAxisChange={handleAxisChange}
          />
        </div>
        
        <div className="w-1/4 pl-4">
        <div className="mb-4">
          <label htmlFor="x-axis-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            X-Axis Column
          </label>
          <select
            id="x-axis-select"
            value={xAxisColumn}
            onChange={handleXAxisColumnChange}
            className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
          >
            {alphabeticColumns.map((column) => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>
{/* Y-Axis Selection */}
<div className="mb-4 relative" ref={yAxisDropdownRef}>
  <label htmlFor="y-axis-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
    Y-Axis Columns
  </label>
  <div
    className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary cursor-pointer"
    onClick={() => setIsYAxisDropdownOpen(!isYAxisDropdownOpen)}
  >
    {yAxisColumns.filter(col => numericColumns.includes(col)).length > 0 
      ? yAxisColumns.filter(col => numericColumns.includes(col)).join(', ') 
      : 'Select Y-Axis Columns'}
  </div>
  {isYAxisDropdownOpen && (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
      {numericColumns.map((column) => (
        <div key={column} className="flex items-center p-2 hover:bg-gray-100">
          <input
            type="checkbox"
            id={`y-axis-${column}`}
            checked={yAxisColumns.includes(column)}
            onChange={() => toggleYAxisColumn(column)}
            className="mr-2"
          />
          <label htmlFor={`y-axis-${column}`} className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
            {column}
          </label>
        </div>
      ))}
    </div>
  )}
</div>
          <div className="mb-4">
            <label htmlFor="x-axis-title" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              X-Axis Title
            </label>
            <input
              id="x-axis-title"
              type="text"
              value={xAxisTitle}
              onChange={handleXAxisTitleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="y-axis-title" className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Y-Axis Title
            </label>
            <input
              id="y-axis-title"
              type="text"
              value={yAxisTitle}
              onChange={handleYAxisTitleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
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
            <label htmlFor="heatmap-color" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Heatmap Color</label>
            <input
              id="heatmap-color"
              type="color"
              value={heatmapColor}
              onChange={handleHeatmapColorChange}
              className="block w-full p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showLegend}
                onChange={handleShowLegendChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Legend</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={reversedYAxis}
                onChange={handleReversedYAxisChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reverse Y-Axis</span>
            </label>
          </div>

          <div className="mb-4">
            <label htmlFor="cell-radius" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Cell Radius</label>
            <input
              id="cell-radius"
              type="range"
              min="0"
              max="10"
              value={cellRadius}
              onChange={handleCellRadiusChange}
              className="block w-full"
            />
            <span className="text-sm text-gray-500">{cellRadius}</span>
          </div>

          <div className="mb-4">
            <label htmlFor="chart-title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Chart Title</label>
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

          <div className="mb-4">
            <label htmlFor="source-name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Source Name</label>
            <input
              id="source-name"
              type="text"
              value={sourceName}
              onChange={handleSourceNameChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="source-url" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Source URL</label>
            <input
              id="source-url"
              type="text"
              value={sourceURL}
              onChange={handleSourceURLChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            />
          </div>

         
        </div>
      </div>

    
    </div>
  );
};

export default HeatMap;