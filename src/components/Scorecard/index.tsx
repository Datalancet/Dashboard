"use client"

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ScoreCardWithTable from "../ScoreCardwithTable";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

const ScoreCard = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'ScoreCard';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleAlignment, setTitleAlignment] = useState(() => localStorage.getItem(`${projectId}_${chartType}_titleAlignment`) || "left");
  const [sourceName, setSourceName] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceName`) || "");
  const [sourceURL, setSourceURL] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceURL`) || "");
  const [chartTitle, setChartTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_chartTitle`) || "");
  const [cardColor, setCardColor] = useState(() => localStorage.getItem(`${projectId}_${chartType}_cardColor`) || "#3b82f6");
  const [showTrend, setShowTrend] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showTrend`) === 'true');
  const [showComparison, setShowComparison] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showComparison`) === 'true');
  const [showStatus, setShowStatus] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showStatus`) === 'true');
  const [showProgressBar, setShowProgressBar] = useState(() => localStorage.getItem(`${projectId}_${chartType}_showProgressBar`) === 'true');
  const [cardLayout, setCardLayout] = useState(() => localStorage.getItem(`${projectId}_${chartType}_cardLayout`) || "horizontal");
  const [scoreData, setScoreData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [useConditionalFormatting, setUseConditionalFormatting] = useState(() => localStorage.getItem(`${projectId}_${chartType}_useConditionalFormatting`) === 'true');
  const [thresholds, setThresholds] = useState(() => JSON.parse(localStorage.getItem(`${projectId}_${chartType}_thresholds`) || '{"good": 80, "bad": 50}'));
  const [useCustomIcons, setUseCustomIcons] = useState(() => localStorage.getItem(`${projectId}_${chartType}_useCustomIcons`) === 'true');
  const [iconSet, setIconSet] = useState(() => localStorage.getItem(`${projectId}_${chartType}_iconSet`) || "default");


  const chartRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
    const storedData = localStorage.getItem(`${projectId}_${chartType}_scoreData`);
  
    if (storedHeaders && storedData) {
      setHeaders(JSON.parse(storedHeaders));
      setScoreData(JSON.parse(storedData));
    }
  }, [projectId, chartType]);
  
  useEffect(() => {
    localStorage.setItem(`${projectId}_${chartType}_titleAlignment`, titleAlignment);
    localStorage.setItem(`${projectId}_${chartType}_sourceName`, sourceName);
    localStorage.setItem(`${projectId}_${chartType}_sourceURL`, sourceURL);
    localStorage.setItem(`${projectId}_${chartType}_chartTitle`, chartTitle);
    localStorage.setItem(`${projectId}_${chartType}_cardColor`, cardColor);
    localStorage.setItem(`${projectId}_${chartType}_showTrend`, showTrend.toString());
    localStorage.setItem(`${projectId}_${chartType}_showComparison`, showComparison.toString());
    localStorage.setItem(`${projectId}_${chartType}_showStatus`, showStatus.toString());
    localStorage.setItem(`${projectId}_${chartType}_showProgressBar`, showProgressBar.toString());
    localStorage.setItem(`${projectId}_${chartType}_cardLayout`, cardLayout);
    localStorage.setItem(`${projectId}_${chartType}_useConditionalFormatting`, useConditionalFormatting.toString());
    localStorage.setItem(`${projectId}_${chartType}_thresholds`, JSON.stringify(thresholds));
    localStorage.setItem(`${projectId}_${chartType}_useCustomIcons`, useCustomIcons.toString());
    localStorage.setItem(`${projectId}_${chartType}_iconSet`, iconSet);
  }, [titleAlignment, sourceName, sourceURL, chartTitle, cardColor, showTrend, showComparison, showStatus, showProgressBar, projectId, chartType, cardLayout,useConditionalFormatting, thresholds, useCustomIcons, iconSet]);

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

  const handleCardColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCardColor(event.target.value);
  };

  const handleShowTrendChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowTrend(event.target.checked);
  };

  const handleShowComparisonChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowComparison(event.target.checked);
  };

  const handleCardLayoutChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setCardLayout(event.target.value);
  };

  const handlePublishClick = () => {
    setIsModalOpen(true);
  };

  const handleShowStatusChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowStatus(event.target.checked);
  };

  const handleShowProgressBarChange = (event: ChangeEvent<HTMLInputElement>) => {
    setShowProgressBar(event.target.checked);
  };

  const handleUseConditionalFormattingChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUseConditionalFormatting(event.target.checked);
  };

  const handleThresholdChange = (type: 'good' | 'bad', value: string) => {
    setThresholds((prev: any) => ({ ...prev, [type]: parseFloat(value) }));
  };

  const handleUseCustomIconsChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUseCustomIcons(event.target.checked);
  };

  const handleIconSetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setIconSet(event.target.value);
  };


  const handlePublish = () => {
    const chartElement = document.getElementById("scorecard");
    if (chartElement) {
      html2canvas(chartElement).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "scorecard.png";
        link.click();
      });
    }
    setIsModalOpen(false);
  };

  const handleDataChange = (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setScoreData(newData);
    localStorage.setItem(`${projectId}_${chartType}_headers`, JSON.stringify(newHeaders));
    localStorage.setItem(`${projectId}_${chartType}_scoreData`, JSON.stringify(newData));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="ScoreCard" />
      
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={chartRef}>
          <ScoreCardWithTable
            cardColor={cardColor}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            chartTitle={chartTitle}
            projectId={projectId}
            chartType={chartType}
            showTrend={showTrend}
            showComparison={showComparison}
            showStatus={showStatus}
            showProgressBar={showProgressBar}
            cardLayout={cardLayout}
            onDataChange={handleDataChange}
            initialHeaders={headers}
            initialData={scoreData}
            useConditionalFormatting={useConditionalFormatting}
            thresholds={thresholds}
            useCustomIcons={useCustomIcons}
            iconSet={iconSet}
          />
        </div>
        
        <div className="w-1/4 pl-4">
          <div className="mb-4">
            <label htmlFor="card-color" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Card Color</label>
            <input
              id="card-color"
              type="color"
              value={cardColor}
              onChange={handleCardColorChange}
              className="block w-full p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showTrend}
                onChange={handleShowTrendChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Trend</span>
            </label>
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={handleShowComparisonChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Comparison</span>
            </label>
          </div>

          <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showStatus}
              onChange={handleShowStatusChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Status Indicator</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showProgressBar}
              onChange={handleShowProgressBarChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Show Progress Bar</span>
          </label>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useConditionalFormatting}
              onChange={handleUseConditionalFormattingChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Use Conditional Formatting</span>
          </label>
        </div>

        {useConditionalFormatting && (
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Thresholds</label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={thresholds.good}
                onChange={(e) => handleThresholdChange('good', e.target.value)}
                className="w-1/2 p-2 text-sm border border-gray-300 rounded-md"
                placeholder="Good threshold"
              />
              <input
                type="number"
                value={thresholds.bad}
                onChange={(e) => handleThresholdChange('bad', e.target.value)}
                className="w-1/2 p-2 text-sm border border-gray-300 rounded-md"
                placeholder="Bad threshold"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useCustomIcons}
              onChange={handleUseCustomIconsChange}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Use Custom Icons</span>
          </label>
        </div>

        {useCustomIcons && (
          <div className="mb-4">
            <label htmlFor="icon-set" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Icon Set</label>
            <select
              id="icon-set"
              value={iconSet}
              onChange={handleIconSetChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="default">Default</option>
              <option value="emoji">Emoji</option>
              <option value="shapes">Shapes</option>
            </select>
          </div>
        )}
      

          <div className="mb-4">
            <label htmlFor="card-layout" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Card Layout</label>
            <select
              id="card-layout"
              value={cardLayout}
              onChange={handleCardLayoutChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="chart-title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">ScoreCard Title</label>
            <input
              id="chart-title"
              type="text"
              value={chartTitle}
              onChange={handleTitleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              placeholder="Enter scorecard title"
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
              placeholder="Enter source name"
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
              placeholder="Enter source URL"
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-900">Publish ScoreCard</h2>
            <p className="mt-2 text-sm text-gray-600">Click the button below to download the scorecard image.</p>
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

export default ScoreCard;