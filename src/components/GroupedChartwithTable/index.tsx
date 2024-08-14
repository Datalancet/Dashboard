"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable/index";
import GroupedBar from "../Charts/GroupedBar";
import html2canvas from "html2canvas";
import { useSearchParams } from 'next/navigation';

interface GroupedChartWithTableProps {
  design: string;
  color: string;
  gridVariation: string;
  xAxisPosition: string;
  yAxisPosition: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  valuesPosition: string;
  chartTitle: string;
  isLabelStyle: boolean;
  labelPosition: "above" | "axis";
  seriesNames: string[];
  xAxisTitle: string;
  yAxisTitle: string;
}

const GroupedChartWithTable: React.FC<GroupedChartWithTableProps> = ({
  design,
  color,
  gridVariation,
  xAxisPosition,
  yAxisPosition,
  titleAlignment,
  sourceName,
  sourceURL,
  valuesPosition,
  chartTitle,
  isLabelStyle,
  labelPosition,
  xAxisTitle,
  yAxisTitle,
  seriesNames
}) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId') || 'default';
  const chartType = 'grouped-bar'; // This identifies the chart type

  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Example data for initial chart rendering
  const initialData = [
    ["Country", "Fossil fuels sources", "Low-carbon sources", "Region", ""],
    ["China", 36222.58785, 7195.872996, "East Asia Pacific", ""],
    ["Indonesia", 2068.531663, 182.877434, "East Asia Pacific", ""],
    ["Russia", 7556.898861, 1133.111644, "Europe and Central Asia", ""],
    ["Turkey", 1581.966414, 279.5225517, "Europe and Central Asia", ""],
    ["Brazil", 1840.248858, 1529.716619, "Latin America and Caribbean", ""],
    ["Mexico", 1657.604034, 216.0925264, "Latin America and Caribbean", ""],
    ["Iran", 3333.616802, 52.55197211, "Middle East and North Africa", ""],
    ["Egypt", 988.2385589, 65.66415167, "Middle East and North Africa", ""],
    ["Canada", 2483.220204, 1366.680287, "North America", ""],
    ["United States", 21016.76361, 4654.851322, "North America", ""],
    ["India", 8814.637053, 948.8110477, "South Asia", ""],
    ["Pakistan", 917.6985869, 152.0718743, "South Asia", ""],
    ["South Africa", 1308.656389, 72.36667817, "Sub-Saharan Africa", ""]
  ];

  useEffect(() => {
    // Load data from localStorage based on projectId and chartType
    const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
    const storedData = localStorage.getItem(`${projectId}_${chartType}_tableData`);

    if (storedHeaders && storedData) {
      setHeaders(JSON.parse(storedHeaders));
      setTableData(JSON.parse(storedData));
    } else if (tableData.length === 0) {
      // Use initial data if no stored data is found
      setHeaders(initialData[0]);
      setTableData(initialData.slice(1));
    }
  }, [projectId, chartType]);

  const handleDataChange = (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);

    // Save data to localStorage based on projectId and chartType
    localStorage.setItem(`${projectId}_${chartType}_headers`, JSON.stringify(newHeaders));
    localStorage.setItem(`${projectId}_${chartType}_tableData`, JSON.stringify(newData));
  };

  console.log("GroupedChartWithTable received title:", chartTitle);
  console.log("GroupedChartWithTable - Source Name:", sourceName);
  console.log("GroupedChartWithTable - Source URL:", sourceURL);

  return (
    <div>
      <div id="chart">
        <GroupedBar
          headers={headers}
          tableData={tableData}
          design={design}
          color={color === "custom" ? "yourCustomColor" : color}
          gridVariation={gridVariation}
          xAxisPosition={xAxisPosition}
          yAxisPosition={yAxisPosition}
          titleAlignment={titleAlignment}
          valuesPosition={valuesPosition}
          chartTitle={chartTitle}
          isLabelStyle={isLabelStyle}
          labelPosition={labelPosition}
          sourceName={sourceName}
          sourceURL={sourceURL}
          seriesNames={seriesNames}
          xAxisTitle={xAxisTitle}
          yAxisTitle={yAxisTitle}
        />
      </div>
      <DataTable onDataChange={handleDataChange} projectId={projectId} chartType={chartType} />
    </div>
  );
};

export default GroupedChartWithTable;