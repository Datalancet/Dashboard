"use client"

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MapWithTable from "../MapWithTable";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

const IndiaMap = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'indiamap';

  const [design, setDesign] = useState(() => localStorage.getItem(`${projectId}_${chartType}_design`) || "default");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [color, setColor] = useState(() => localStorage.getItem(`${projectId}_${chartType}_color`) || "#3b82f6");
  const [mapTitle, setMapTitle] = useState(() => localStorage.getItem(`${projectId}_${chartType}_mapTitle`) || "India States Data");
  const [titleAlignment, setTitleAlignment] = useState(() => localStorage.getItem(`${projectId}_${chartType}_titleAlignment`) || "left");
  const [sourceName, setSourceName] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceName`) || "");
  const [sourceURL, setSourceURL] = useState(() => localStorage.getItem(`${projectId}_${chartType}_sourceURL`) || "");
  const [logoPosition, setLogoPosition] = useState<'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'>(
    () => (localStorage.getItem(`${projectId}_${chartType}_logoPosition`) as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left') || 'top-right'
  );
  const [logoUrl, setLogoUrl] = useState(() => {
    const savedLogoUrl = localStorage.getItem(`${projectId}_${chartType}_logoUrl`);
    return savedLogoUrl || '/favicon.ico';
  });
  
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem(`${projectId}_${chartType}_design`, design);
    localStorage.setItem(`${projectId}_${chartType}_color`, color);
    localStorage.setItem(`${projectId}_${chartType}_mapTitle`, mapTitle);
    localStorage.setItem(`${projectId}_${chartType}_titleAlignment`, titleAlignment);
    localStorage.setItem(`${projectId}_${chartType}_sourceName`, sourceName);
    localStorage.setItem(`${projectId}_${chartType}_sourceURL`, sourceURL);
    localStorage.setItem(`${projectId}_${chartType}_logoPosition`, logoPosition);
    localStorage.setItem(`${projectId}_${chartType}_logoUrl`, logoUrl);
  }, [design, color, mapTitle, titleAlignment, sourceName, sourceURL, projectId, chartType, logoPosition, logoUrl]);

  const handleDesignChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setDesign(event.target.value);
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    setColor(event.target.value);
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMapTitle(event.target.value);
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

  const handleLogoPositionChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLogoPosition(event.target.value as 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left');
  };

  const handlePublishClick = () => {
    setIsModalOpen(true);
  };

  const handlePublish = () => {
    const mapContainer = document.querySelector('.col-span-12');
    if (mapContainer) {
      html2canvas(mapContainer as HTMLElement, {
        allowTaint: true,
        useCORS: true,
        logging: true,
      }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "india_map.png";
        link.click();
      }).catch((error) => {
        console.error("Error capturing map:", error);
      });
    } else {
      console.error('Map container not found');
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb pageName="India Map" />
      </div>
      
      <div className="flex">
        <div className="w-3/4" ref={mapRef}>
          <MapWithTable
            design={design}
            color={color}
            mapTitle={mapTitle}
            titleAlignment={titleAlignment}
            sourceName={sourceName}
            sourceURL={sourceURL}
            projectId={projectId}
            chartType={chartType}
            logoPosition={logoPosition}
            logoUrl={logoUrl}
          />
        </div>
        
        <div className="w-1/4 pl-4">
          <div className="mb-4">
            <label htmlFor="design-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Map Design</label>
            <select
              id="design-select"
              value={design}
              onChange={handleDesignChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
            >
              <option value="default">Default</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="color-select" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Map Color</label>
            <input
              type="color"
              value={color}
              onChange={handleColorChange}
              className="block w-full p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="map-title" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Map Title</label>
            <input
              id="map-title"
              type="text"
              value={mapTitle}
              onChange={handleTitleChange}
              className="block w-full p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
              placeholder="Enter map title"
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
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-medium text-gray-900">Publish Map</h2>
            <p className="mt-2 text-sm text-gray-600">Click the button below to download the map image.</p>
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

export default IndiaMap;