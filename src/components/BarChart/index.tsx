"use client";
import { useState, useRef } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ChartTwo from "@/components/Charts/ChartTwo";
import ChartWithTable from "../ChartwithTable";
import html2canvas from "html2canvas";

const BarChart = () => {
  const [design, setDesign] = useState("default");
  const [color, setColor] = useState("blue");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGridMode, setIsGridMode] = useState(false);
  const [gridVariation, setGridVariation] = useState("single");
  const [isLabelStyle, setIsLabelStyle] = useState(false);
  const [xAxisValue, setXAxisValue] = useState("default");
  const [isXAxisPosition, setIsXAxisPosition] = useState(false);
  const [xAxisPosition, setXAxisPosition] = useState("bottom");
  const [isYAxisVisible, setIsYAxisVisible] = useState(true); 
  const [yAxisValue, setYAxisValue] = useState("default");
  const [isYAxisPosition, setIsYAxisPosition] = useState(false);
  const [yAxisPosition, setYAxisPosition] = useState("default");
  const [titleType, setTitleType] = useState("");
  const [titleAlignment, setTitleAlignment] = useState("left");
  const [footerType, setFooterType] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceURL, setSourceURL] = useState("");
  const [Bars, setBars] = useState("");
  const [barHeight, setBarHeight] = useState(50);
  const [barOpacity, setBarOpacity] = useState(1);
  const [mainSpacing, setMainSpacing] = useState(10);
  const [stackSpacing, setStackSpacing] = useState(5);
  const [titleText, setTitleText] = useState('');
  const [subtitleText, setSubtitleText] = useState('');
  const [valuesPosition, setValuesPosition] = useState("side");

  const chartRef = useRef(null);

  const handlePublishClick = () => {
    setIsModalOpen(true);
  };

  const handleDesignChange = (event) => {
    const selectedDesign = event.target.value;
    if (selectedDesign === "grid") {
      setIsGridMode((prev) => !prev);
    } else {
      setIsGridMode(false);
    }
    setDesign(selectedDesign);
  };

  const handleColorChange = (event) => {
    const selectedColor = event.target.value;
    if (selectedColor === "label") {
      setIsLabelStyle((prev) => !prev);
    } else {
      setIsLabelStyle(false);
      setColor(selectedColor);
    }
  };

  const handleXAxisValueChange = (event) => {
    const selectedXAxisValue = event.target.value;
    if (selectedXAxisValue === "position") {
      setIsXAxisPosition((prev) => !prev);
    } else {
      setIsXAxisPosition(false);
      setXAxisValue(selectedXAxisValue);
    }
  };

  const handleXAxisPositionChange = (position) => {
    setXAxisPosition(position);
  };

  const handleYAxisValueChange = (event) => {
    const selectedYAxisValue = event.target.value;
    if (selectedYAxisValue === "position") {
      setIsYAxisPosition((prev) => !prev);
    } else {
      setIsYAxisPosition(false);
      setYAxisValue(selectedYAxisValue);
    }
  };

  const handleYAxisPositionChange = (position) => {
    setYAxisPosition(position);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

 
  const handlePublish = () => {
    const chartElement = document.getElementById("chart");
    html2canvas(chartElement).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "chart.png";
      link.click();
  
      // Fetch the list of projects to find the specific project
      fetch('https://dashboardtool.pythonanywhere.com/api/v1/projects/list/')
        .then(response => response.json())
        .then(projects => {
          const project = projects.find(p => p.name === "Sample Project"); // Change this to match the project you want to update
          if (project) {
            // Simulating update by displaying the project details
            console.log('Project found:', project);
            console.log('Simulating update to "published" status...');
          } else {
            console.error('Project not found');
          }
        })
        .catch((error) => {
          console.error('Error fetching projects:', error);
        });
    });
  };
  

  const handleGridVariationChange = (variation) => {
    setGridVariation(variation);
  };

  const handleTitleTypeChange = (e) => {
    setTitleType(e.target.value);
    setTitleText('');
    setSubtitleText('');
  };
  const handleTitleAlignmentChange = (alignment) => {
    setTitleAlignment(alignment);
  };

  const handleFooterTypeChange = (event) => {
    setFooterType(event.target.value);
  };

  const handleSourceNameChange = (event) => {
    setSourceName(event.target.value);
  };

  const handleSourceURLChange = (event) => {
    setSourceURL(event.target.value);
  };

  const handleBarsChange = (event) => {
    setBars(event.target.value);
  };

  const handleBarHeightChange = (event) => {
    setBarHeight(event.target.value);
  };

  const handleBarOpacityChange = (event) => {
    setBarOpacity(event.target.value);
  };

  const handleMainSpacingChange = (event) => {
    setMainSpacing(event.target.value);
  };

  const handleStackSpacingChange = (event) => {
    setStackSpacing(event.target.value);
  };

  const toggleValuesPosition = () => {
    setValuesPosition((prevPosition) =>
      prevPosition === "above" ? "side" : "above"
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="Bar Chart" />

        <div className="inline-flex rounded-md shadow-sm" role="group">
          
          
        </div>

        
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={chartRef}>
          <ChartWithTable design={design} color={color} gridVariation={gridVariation} xAxisPosition={xAxisPosition} yAxisPosition={yAxisPosition} titleAlignment={titleAlignment} sourceName={sourceName} sourceURL={sourceURL}  valuesPosition={valuesPosition} />
        </div>
        <div className="w-1/4 pl-4">
          <div className="mb-4">
            <label htmlFor="design-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Chart type</label>
            <select
              id="design-select"
              value={design}
              onChange={handleDesignChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="grid">Grid Mode</option>
              <option value="default">Default</option>
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
            <label htmlFor="color-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Label</label>
            <select
              id="color-select"
              value={isLabelStyle ? "label" : color}
              onChange={handleColorChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="label">Label Style</option>
              <option value="blue">Default</option>
            </select>
          </div>

          {isLabelStyle && (
            <div className="mt-4">
              <button
                className="block w-full px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => console.log("Set Bar Labels Style")}
              >
                Above Bars
              </button>
              <button
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => console.log("Set Axes Labels Style")}
              >
                Axis
              </button>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="xaxis-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">X-axis Value</label>
            <select
              id="xaxis-select"
              value={isXAxisPosition ? "position" : xAxisValue}
              onChange={handleXAxisValueChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="position">Position</option>
              <option value="default">Default</option>
            </select>
          </div>

          {isXAxisPosition && (
            <div className="mt-4">
              <button
                className="block w-full px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleXAxisPositionChange("bottom")}
              >
                Bottom
              </button>
              <button
                className="block w-full px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleXAxisPositionChange("top")}
              >
                Top
              </button>
              <button
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleXAxisPositionChange("hidden")}
              >
                Hidden
              </button>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="yaxis-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Y-axis Value</label>
            <select
              id="yaxis-select"
              value={isYAxisPosition ? "position" : yAxisValue}
              onChange={handleYAxisValueChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="position">Position</option>
              <option value="default">Default</option>
            </select>
          </div>

          {isYAxisPosition && (
            <div className="mt-4">
              <button
                className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleYAxisPositionChange("visible")}
              >
                Axis Visible
              </button>
              <div className="mt-4">
                <button
                  className="block w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                  onClick={() => handleYAxisPositionChange("hidden")}
                >
                  Axis Hidden
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="title-type-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Title Type</label>
            <select
              id="title-type-select"
              value={titleType}
              onChange={handleTitleTypeChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="">Select Title Type</option>
              <option value="title">Title</option>
              <option value="subtitle">Subtitle</option>
            </select>
          </div>

            
      {(titleType === 'title' || titleType === 'subtitle') && (
        <div>
          <div className="mb-4">
            <label htmlFor="alignment-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Title Alignment
            </label>
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleTitleAlignmentChange('left')}
              >
                Left
              </button>
              <button
                className="px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleTitleAlignmentChange('center')}
              >
                Center
              </button>
              <button
                className="px-4 py-2 mb-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
                onClick={() => handleTitleAlignmentChange('right')}
              >
                Right
              </button>
            </div>
          </div>

          {titleType === 'title' && (
            <div className="mb-4">
              <label htmlFor="title-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Title Text
              </label>
              <input
                type="text"
                id="title-input"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}

          {titleType === 'subtitle' && (
            <div className="mb-4">
              <label htmlFor="subtitle-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Subtitle Text
              </label>
              <input
                type="text"
                id="subtitle-input"
                value={subtitleText}
                onChange={(e) => setSubtitleText(e.target.value)}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}
        </div>
      )}

          <div className="mb-4">
            <label htmlFor="footer-type-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Footer</label>
            <select
              id="footer-type-select"
              value={footerType}
              onChange={handleFooterTypeChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="">Select Footer Type</option>
              <option value="sourceName">Source Name</option>
              <option value="sourceURL">Source URL</option>
            </select>
          </div>

          {footerType === "sourceName" && (
            <div className="mb-4">
              <label htmlFor="source-name-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Source Name</label>
              <input
                id="source-name-input"
                type="text"
                value={sourceName}
                onChange={handleSourceNameChange}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}

          {footerType === "sourceURL" && (
            <div className="mb-4">
              <label htmlFor="source-url-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Source URL</label>
              <input
                id="source-url-input"
                type="text"
                value={sourceURL}
                onChange={handleSourceURLChange}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="Bars-type-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Bars</label>
            <select
              id="footer-type-select"
              value={Bars}
              onChange={handleBarsChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="">Bars Thickness</option>
              <option value="barHeight">Bar Height</option>
              <option value="barOpacity">Bar Opacity</option>
              <option value="spacingMain">Spacing (main)</option>
              <option value="spacingGroup">Spacing (in group)</option>
            </select>
          </div>
          {Bars === "barHeight" && (
            <div className="mb-4">
              <label htmlFor="source-name-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Bar Height</label>
              <input
                id="source-name-input"
                type="text"
                value={barHeight}
                onChange={handleBarHeightChange}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}

           {Bars === "barOpacity" && (
            <div className="mb-4">
              <label htmlFor="source-name-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Bar Opacity</label>
              <input
                id="source-name-input"
                type="text"
                value={barOpacity}
                onChange={handleBarOpacityChange}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}
          {Bars === "spacingMain" && (
            <div className="mb-4">
              <label htmlFor="source-name-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Spacing (main)</label>
              <input
                id="source-name-input"
                type="text"
                value={mainSpacing}
                onChange={handleMainSpacingChange}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}

           {Bars === "spacingGroup" && (
            <div className="mb-4">
              <label htmlFor="source-name-input" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Spacing (in group)</label>
              <input
                id="source-name-input"
                type="text"
                value={stackSpacing}
                onChange={handleStackSpacingChange}
                className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              />
            </div>
          )}
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
                onClick={handleCloseModal}
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

export default BarChart;














