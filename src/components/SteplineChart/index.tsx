"use client"

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import SteplineChartWithTable from "../SteplineChartwithTable";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

const SteplineChart = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'Stepline';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLabelStyle, setIsLabelStyle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_isLabelStyle`) === 'true');
  const [titleAlignment, setTitleAlignment] = useState(() => localStorage.getItem(`${projectId}_${chartType}_titleAlignment`) || "left");
  const [sourceName, setSourceName] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceName`) || "");
  const [sourceURL, setSourceURL] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceURL`) || "");
  const [chartTitle, setChartTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_chartTitle`) || "");
  const [lineColors, setLineColors] = useState(() => {
    const storedColors = localStorage.getItem(`${projectId}_${chartType}_lineColors`);
    return storedColors ? JSON.parse(storedColors) : ["#3b82f6", "#10b981"];
  });
  const [showMarkers, setShowMarkers] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showMarkers`) === 'true');
  const [curveType, setCurveType] = useState(() => localStorage.getItem(`${projectId}_${chartType}_curveType`) || "straight");
  const [showColorOptions, setShowColorOptions] = useState(() => 
    localStorage.getItem(`${projectId}_${chartType}_showColorOptions`) === 'true'
  );
  const [xAxisTitle, setXAxisTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_xAxisTitle`) || "X Axis");
  const [yAxisTitle, setYAxisTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_yAxisTitle`) || "Y Axis");

  const [logoPosition, setLogoPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>(
    () => (localStorage.getItem(`${projectId}_${chartType}_logoPosition`) as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') || 'top-right'
  );
  const [logoUrl, setLogoUrl] = useState(() => {
    const savedLogoUrl = localStorage.getItem(`${projectId}_${chartType}_logoUrl`);
    return savedLogoUrl || '/favicon.ico';
  });
  
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

  const colorOptions = [
    { name: "Blue", value: "#3b82f6" },
    { name: "Green", value: "#10b981" },
    { name: "Red", value: "#ef4444" },
    { name: "Yellow", value: "#f59e0b" },
    { name: "Purple", value: "#8b5cf6" },
    { name: "Pink", value: "#ec4899" },
    { name: "Indigo", value: "#6366f1" },
    { name: "Gray", value: "#6b7280" },
  ];

  useEffect(() => {
    localStorage.setItem(`${projectId}_${chartType}_isLabelStyle`, isLabelStyle.toString());
    localStorage.setItem(`${projectId}_${chartType}_titleAlignment`, titleAlignment);
    localStorage.setItem(`${projectId}_${chartType}_sourceName`, sourceName);
    localStorage.setItem(`${projectId}_${chartType}_sourceURL`, sourceURL);
    localStorage.setItem(`${projectId}_${chartType}_chartTitle`, chartTitle);
    localStorage.setItem(`${projectId}_${chartType}_lineColors`, JSON.stringify(lineColors));
    localStorage.setItem(`${projectId}_${chartType}_showMarkers`, showMarkers.toString());
    localStorage.setItem(`${projectId}_${chartType}_curveType`, curveType);
    localStorage.setItem(`${projectId}_${chartType}_showColorOptions`, showColorOptions.toString());
    localStorage.setItem(`${projectId}_${chartType}_xAxisTitle`, xAxisTitle);
    localStorage.setItem(`${projectId}_${chartType}_yAxisTitle`, yAxisTitle);
    localStorage.setItem(`${projectId}_${chartType}_logoPosition`, logoPosition);
    localStorage.setItem(`${projectId}_${chartType}_logoUrl`, logoUrl);

  }, [isLabelStyle, titleAlignment, sourceName, sourceURL, chartTitle, lineColors, showMarkers, curveType, showColorOptions, xAxisTitle, yAxisTitle, projectId, chartType,logoPosition, logoUrl]);

  const handleLabelStyleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setIsLabelStyle(event.target.value === "label");
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

  const handleLineColorChange = (index: number, color: string) => {
    const newColors = [...lineColors];
    newColors[index] = color;
    setLineColors(newColors);
  };

  const handleShowMarkersChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowMarkers(event.target.checked);
  };

  const handleCurveTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCurveType(event.target.value as "straight" | "smooth" | "stepline");
  };

  const toggleColorOptions = () => {
    setShowColorOptions(!showColorOptions);
  };

  const handleXAxisTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setXAxisTitle(event.target.value);
  };

  const handleYAxisTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYAxisTitle(event.target.value);
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
        link.download = "chart.png";
        link.click();
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="Stepline Chart" />
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={chartRef}>
          <SteplineChartWithTable
            lineColors={lineColors}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            chartTitle={chartTitle}
            isLabelStyle={isLabelStyle}
            projectId={projectId}
            chartType={chartType}
            showMarkers={showMarkers}
            curveType={curveType as "straight" | "smooth" | "stepline"}
            xAxisTitle={xAxisTitle}
            yAxisTitle={yAxisTitle}
            logoPosition={logoPosition}
            logoUrl={logoUrl}
          />
        </div>
        
        <div className="w-1/4 pl-4">
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
            <label htmlFor="label-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Label Style</label>
            <select
              id="label-select"
              value={isLabelStyle ? "label" : "default"}
              onChange={handleLabelStyleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="default">Default</option>
              <option value="label">Label Style</option>
            </select>
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
            <label htmlFor="show-markers" className="flex items-center">
              <input
                id="show-markers"
                type="checkbox"
                checked={showMarkers}
                onChange={handleShowMarkersChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Markers</span>
            </label>
          </div>

          
          <div className="mb-4">
            <button
              onClick={toggleColorOptions}
              className="flex items-center justify-between w-full p-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
            >
              <span>Line Colors</span>
              <svg
                className={`w-5 h-5 ${showColorOptions ? 'transform rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {showColorOptions && (
              <div className="mt-2 space-y-2">
                {lineColors.map((color, index) => (
                  <div key={index} className="flex items-center">
                    <select
                      value={color}
                      onChange={(e) => handleLineColorChange(index, e.target.value)}
                      className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
                    >
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <span className="ml-2">Line {index + 1}</span>
                  </div>
                ))}
              </div>
            )}
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-900">Publish Chart</h2>
            <p className="mt-2 text-sm text-gray-600">Click the button below to download the chart image.</p>
            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={handlePublish}
              >
                Download Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SteplineChart;