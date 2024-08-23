"use client"

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import PieChartWithTable from "../PieChartwithTable";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

const PieChart = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'pie'; // This identifies the chart type

  const [design, setDesign] = useState(() => localStorage.getItem(`${projectId}_${chartType}_design`) || "default");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGridMode, setIsGridMode] = useState(() => localStorage.getItem(`${projectId}_${chartType}_isGridMode`) === 'true');
  const [gridVariation, setGridVariation] = useState(() => localStorage.getItem(`${projectId}_${chartType}_gridVariation`) || "single");
  const [isLabelStyle, setIsLabelStyle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_isLabelStyle`) === 'true');
  const [labelPosition, setLabelPosition] = useState(() => localStorage.getItem(`${projectId}_${chartType}_labelPosition`) || "axis");
  const [titleAlignment, setTitleAlignment] = useState(() => localStorage.getItem(`${projectId}_${chartType}_titleAlignment`) || "left");
  const [sourceName, setSourceName] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceName`) || "");
  const [sourceURL, setSourceURL] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceURL`) || "");
  const [valuesPosition, setValuesPosition] = useState(() => localStorage.getItem(`${projectId}_${chartType}_valuesPosition`) || "side");
  const [chartTitle, setChartTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_chartTitle`) || "");
  const [color, setColor] = useState(() => localStorage.getItem(`${projectId}_${chartType}_color`) || "#3b82f6");
  const [seriesNames, setSeriesNames] = useState(() => {
    const savedNames = localStorage.getItem(`${projectId}_${chartType}_seriesNames`);
    return savedNames ? JSON.parse(savedNames) : ["Slice 1", "Slice 2", "Slice 3", "Slice 4", "Slice 5"];
  });

  const [isDonut, setIsDonut] = useState(() => localStorage.getItem(`${projectId}_${chartType}_isDonut`) === 'true');
  const [donutSize, setDonutSize] = useState(() => parseInt(localStorage.getItem(`${projectId}_${chartType}_donutSize`) || "65"));
  const [startAngle, setStartAngle] = useState(() => parseInt(localStorage.getItem(`${projectId}_${chartType}_startAngle`) || "0"));
  const [endAngle, setEndAngle] = useState(() => parseInt(localStorage.getItem(`${projectId}_${chartType}_endAngle`) || "360"));

  const [sliceColors, setSliceColors] = useState(() => {
    const savedColors = localStorage.getItem(`${projectId}_${chartType}_sliceColors`);
    return savedColors ? JSON.parse(savedColors) : ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1"];
  });
  const [showPercentages, setShowPercentages] = useState(() => 
    localStorage.getItem(`${projectId}_${chartType}_showPercentages`) === 'true'
  );
  const [explodedSlice, setExplodedSlice] = useState(() => 
    parseInt(localStorage.getItem(`${projectId}_${chartType}_explodedSlice`) || '-1')
  );
  const [showColorOptions, setShowColorOptions] = useState(() => 
    localStorage.getItem(`${projectId}_${chartType}_showColorOptions`) === 'true'
  );

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
    localStorage.setItem(`${projectId}_${chartType}_titleAlignment`, titleAlignment);
    localStorage.setItem(`${projectId}_${chartType}_sourceName`, sourceName);
    localStorage.setItem(`${projectId}_${chartType}_sourceURL`, sourceURL);
    localStorage.setItem(`${projectId}_${chartType}_valuesPosition`, valuesPosition);
    localStorage.setItem(`${projectId}_${chartType}_chartTitle`, chartTitle);
    localStorage.setItem(`${projectId}_${chartType}_seriesNames`, JSON.stringify(seriesNames));
    localStorage.setItem(`${projectId}_${chartType}_color`, color);
    localStorage.setItem(`${projectId}_${chartType}_isDonut`, isDonut.toString());
    localStorage.setItem(`${projectId}_${chartType}_donutSize`, donutSize.toString());
    localStorage.setItem(`${projectId}_${chartType}_startAngle`, startAngle.toString());
    localStorage.setItem(`${projectId}_${chartType}_endAngle`, endAngle.toString());
    localStorage.setItem(`${projectId}_${chartType}_sliceColors`, JSON.stringify(sliceColors));
    localStorage.setItem(`${projectId}_${chartType}_showPercentages`, showPercentages.toString());
    localStorage.setItem(`${projectId}_${chartType}_explodedSlice`, explodedSlice.toString());
    localStorage.setItem(`${projectId}_${chartType}_showColorOptions`, showColorOptions.toString());
    localStorage.setItem(`${projectId}_${chartType}_logoPosition`, logoPosition);
    localStorage.setItem(`${projectId}_${chartType}_logoUrl`, logoUrl);
  }, [design, isGridMode, gridVariation, isLabelStyle, labelPosition, titleAlignment, sourceName, sourceURL, chartTitle, color, seriesNames, isDonut, donutSize, startAngle, endAngle, projectId, chartType, sliceColors, showPercentages, explodedSlice,showColorOptions, logoPosition, logoUrl]);
 

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

  const handleSeriesNameChange = (index: number, value: string) => {
    const newSeriesNames = [...seriesNames];
    newSeriesNames[index] = value;
    setSeriesNames(newSeriesNames);
    console.log("Updated Series Names:", newSeriesNames); 
  };

  const handleChartTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setIsDonut(event.target.value === "donut");
  };

  const handleDonutSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDonutSize(Number(event.target.value));
  };

  const handleStartAngleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartAngle(Number(event.target.value));
  };

  const handleEndAngleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEndAngle(Number(event.target.value));
  };

  const handleSliceColorChange = (index: number, color: string) => {
    const newColors = [...sliceColors];
    newColors[index] = color;
    setSliceColors(newColors);
  };

  const toggleShowPercentages = () => {
    setShowPercentages(!showPercentages);
  };

  const handleExplodedSliceChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setExplodedSlice(parseInt(event.target.value));
  };

  const toggleColorOptions = () => {
    setShowColorOptions(!showColorOptions);
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
        <Breadcrumb pageName="Pie Chart" />
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={chartRef}>
        <PieChartWithTable
            design={design}
            color={color}
            gridVariation={gridVariation}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            valuesPosition={valuesPosition}
            chartTitle={chartTitle}
            isLabelStyle={isLabelStyle}
            labelPosition={labelPosition}
            seriesNames={seriesNames}
            projectId={projectId}
            chartType={chartType}
            isDonut={isDonut}
            donutSize={donutSize}
            startAngle={startAngle}
            endAngle={endAngle}
            sliceColors={sliceColors}
            showPercentages={showPercentages}
            explodedSlice={explodedSlice}
            logoPosition={logoPosition}
            logoUrl={logoUrl}
            />
        </div>
        
        <div className="w-1/4 pl-4">



          <div className="mb-4">
            <label htmlFor="chart-type" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Chart Type</label>
            <select
              id="chart-type"
              value={isDonut ? "donut" : "pie"}
              onChange={handleChartTypeChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="pie">Pie Chart</option>
            
            </select>
          </div>

          {isDonut && (
            <div className="mb-4">
              <label htmlFor="donut-size" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Donut Size</label>
              <input
                id="donut-size"
                type="range"
                min="0"
                max="100"
                value={donutSize}
                onChange={handleDonutSizeChange}
                className="block w-full"
              />
              <span>{donutSize}%</span>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="start-angle" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Start Angle</label>
            <input
              id="start-angle"
              type="number"
              min="0"
              max="360"
              value={startAngle}
              onChange={handleStartAngleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="end-angle" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">End Angle</label>
            <input
              id="end-angle"
              type="number"
              min="0"
              max="360"
              value={endAngle}
              onChange={handleEndAngleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
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
          <button
            onClick={toggleColorOptions}
            className="flex items-center justify-between w-full p-2 text-sm font-medium text-left text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75"
          >
            <span>Slice Colors</span>
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
              {sliceColors.map((color, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleSliceColorChange(index, e.target.value)}
                    className="mr-2"
                  />
                  <span>Slice {index + 1}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showPercentages}
              onChange={toggleShowPercentages}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Percentages</span>
          </label>
        </div>

        <div className="mb-4">
          <label htmlFor="exploded-slice" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Exploded Slice</label>
          <select
            id="exploded-slice"
            value={explodedSlice}
            onChange={handleExplodedSliceChange}
            className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
          >
            <option value="-1">None</option>
            {seriesNames.map((_, index) => (
              <option key={index} value={index}>Slice {index + 1}</option>
            ))}
          </select>
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
          {isLabelStyle && (
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Label Position</label>
              <button
                className="block w-full px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleLabelPositionChange('above')}
              >
                Above
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

export default PieChart;