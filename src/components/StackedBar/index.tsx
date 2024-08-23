"use client"

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import StackedChartWithTable from "../StackedChartwithTable";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

const StackedBar = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'stacked-bar'; // This identifies the chart type

  const [design, setDesign] = useState(() => localStorage.getItem(`${projectId}_${chartType}_design`) || "default");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGridMode, setIsGridMode] = useState(() => localStorage.getItem(`${projectId}_${chartType}_isGridMode`) === 'true');
  const [gridVariation, setGridVariation] = useState(() => localStorage.getItem(`${projectId}_${chartType}_gridVariation`) || "single");
  const [isLabelStyle, setIsLabelStyle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_isLabelStyle`) === 'true');
  const [labelPosition, setLabelPosition] = useState(() => localStorage.getItem(`${projectId}_${chartType}_labelPosition`) || "axis");
  const [xAxisPosition, setXAxisPosition] = useState(() => localStorage.getItem(`${projectId}_${chartType}_xAxisPosition`) || "bottom");
  const [yAxisPosition, setYAxisPosition] = useState(() => localStorage.getItem(`${projectId}_${chartType}_yAxisPosition`) || "left");
  const [titleAlignment, setTitleAlignment] = useState(() => localStorage.getItem(`${projectId}_${chartType}_titleAlignment`) || "left");
  const [sourceName, setSourceName] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceName`) || "");
  const [sourceURL, setSourceURL] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceURL`) || "");
  const [valuesPosition, setValuesPosition] = useState(() => localStorage.getItem(`${projectId}_${chartType}_valuesPosition`) || "side");
  const [chartTitle, setChartTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_chartTitle`) || "");
  const [color, setColor] = useState(() => localStorage.getItem(`${projectId}_${chartType}_color`) || "#3b82f6");
  const [xAxisTitle, setXAxisTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_xAxisTitle`) || "Countries");
  const [yAxisTitle, setYAxisTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_yAxisTitle`) || "Energy (TWh)");
  const [seriesNames, setSeriesNames] = useState(() => {
    const savedNames = localStorage.getItem(`${projectId}_${chartType}_seriesNames`);
    return savedNames ? JSON.parse(savedNames) : ["Fossil fuels sources", "Low-carbon sources"];
  });

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

  useEffect(() => {
    localStorage.setItem(`${projectId}_${chartType}_design`, design);
    localStorage.setItem(`${projectId}_${chartType}_isGridMode`, isGridMode.toString());
    localStorage.setItem(`${projectId}_${chartType}_gridVariation`, gridVariation);
    localStorage.setItem(`${projectId}_${chartType}_isLabelStyle`, isLabelStyle.toString());
    localStorage.setItem(`${projectId}_${chartType}_labelPosition`, labelPosition);
    localStorage.setItem(`${projectId}_${chartType}_xAxisPosition`, xAxisPosition);
    localStorage.setItem(`${projectId}_${chartType}_yAxisPosition`, yAxisPosition);
    localStorage.setItem(`${projectId}_${chartType}_titleAlignment`, titleAlignment);
    localStorage.setItem(`${projectId}_${chartType}_sourceName`, sourceName);
    localStorage.setItem(`${projectId}_${chartType}_sourceURL`, sourceURL);
    localStorage.setItem(`${projectId}_${chartType}_valuesPosition`, valuesPosition);
    localStorage.setItem(`${projectId}_${chartType}_chartTitle`, chartTitle);
    localStorage.setItem(`${projectId}_${chartType}_seriesNames`, JSON.stringify(seriesNames));
    localStorage.setItem(`${projectId}_${chartType}_color`, color);
    localStorage.setItem(`${projectId}_${chartType}_xAxisTitle`, xAxisTitle);
    localStorage.setItem(`${projectId}_${chartType}_yAxisTitle`, yAxisTitle);
    localStorage.setItem(`${projectId}_${chartType}_logoPosition`, logoPosition);
    localStorage.setItem(`${projectId}_${chartType}_logoUrl`, logoUrl);
  }, [design, isGridMode, gridVariation, isLabelStyle, labelPosition, xAxisPosition, yAxisPosition, titleAlignment, sourceName, sourceURL, valuesPosition, chartTitle, color, seriesNames, xAxisTitle, yAxisTitle, projectId, chartType,logoPosition, logoUrl]);

  const handleDesignChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedDesign = event.target.value;
    setDesign(selectedDesign);
    setIsGridMode(selectedDesign === "grid");
  };

  const handleGridVariationChange = (variation: string) => {
    setGridVariation(variation);
  };

  const handleLabelStyleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setIsLabelStyle(event.target.value === "label");
  };

  const handleLabelPositionChange = (position: "above" | "axis") => {
    setLabelPosition(position);
  };

  const handleXAxisPositionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setXAxisPosition(event.target.value);
  };

  const handleYAxisPositionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setYAxisPosition(event.target.value);
  };

  const handleTitleAlignmentChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setTitleAlignment(event.target.value as "left" | "center" | "right");
  };

  const handleSourceNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSourceName = event.target.value;
    setSourceName(newSourceName);
    console.log("New Source Name:", newSourceName); // Debug log
  };

  const handleSourceURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSourceURL = event.target.value;
    setSourceURL(newSourceURL);
    console.log("New Source URL:", newSourceURL); // Debug log
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChartTitle(event.target.value);
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const toggleValuesPosition = () => {
    setValuesPosition((prevPosition) =>
      prevPosition === "above" ? "side" : "above"
    );
  };

  const handlePublishClick = () => {
    setIsModalOpen(true);
  };

  const handleXAxisTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setXAxisTitle(event.target.value);
  };

  const handleYAxisTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setYAxisTitle(event.target.value);
  };

  const handleSeriesNameChange = (index: number, value: string) => {
    const newSeriesNames = [...seriesNames];
    newSeriesNames[index] = value;
    setSeriesNames(newSeriesNames);
    console.log("Updated Series Names:", newSeriesNames); 
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
        <Breadcrumb pageName="Stacked Bar" />
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={chartRef}>
          <StackedChartWithTable
            design={design}
            color={color}
            gridVariation={gridVariation}
            xAxisPosition={xAxisPosition}
            yAxisPosition={yAxisPosition}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            valuesPosition={valuesPosition}
            chartTitle={chartTitle}
            isLabelStyle={isLabelStyle}
            labelPosition={labelPosition}
            seriesNames={seriesNames}
            xAxisTitle={xAxisTitle}
            yAxisTitle={yAxisTitle}
            projectId={projectId}
            chartType={chartType}
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
            {seriesNames.map((name, index) => (
              <div key={index} className="mb-2">
                <label htmlFor={`series-name-${index}`} className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {`Series ${index + 1} Name`}
                </label>
                <input
                  id={`series-name-${index}`}
                  type="text"
                  value={name}
                  onChange={(e) => handleSeriesNameChange(index, e.target.value)}
                  className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            ))}
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
            <label htmlFor="design-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Chart type</label>
            <select
              id="design-select"
              value={design}
              onChange={handleDesignChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="default">Default</option>
              <option value="grid">Grid Mode</option>
            </select>
          </div>

          {isGridMode && (
            <div className="mb-4">
              <button
                className="block w-full px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleGridVariationChange("single")}
              >
                Single Grid
              </button>
              <button
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleGridVariationChange("multiple")}
              >
                Grids of Chart
              </button>
            </div>
          )}

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
          {isLabelStyle && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Label Position</label>
              <button
                className="block w-full px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleLabelPositionChange('above')}
              >
                Above Bars
              </button>
              <button
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleLabelPositionChange('axis')}
              >
                Axis
              </button>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="color-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Chart Color</label>
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="block w-full p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="xaxis-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">X-axis Position</label>
            <select
              id="xaxis-select"
              value={xAxisPosition}
              onChange={handleXAxisPositionChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="bottom">Bottom</option>
              <option value="top">Top</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="yaxis-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Y-axis Position</label>
            <select
              id="yaxis-select"
              value={yAxisPosition}
              onChange={handleYAxisPositionChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
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

export default StackedBar;