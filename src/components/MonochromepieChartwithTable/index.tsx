"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable/index";
import MonochromePieChart from "../Charts/Monochromepie";

interface MonochromepieChartWithTableProps {
  color: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  projectId: string;
  chartType: string;
  donutSize: number;
  startAngle: number;
  endAngle: number;
  isDonut: boolean;
  sliceColors: string[];
  showPercentages: boolean;
  explodedSlice: number;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
}

const MonochromepieChartWithTable: React.FC<MonochromepieChartWithTableProps> = ({
  color,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  projectId,
  chartType,
  donutSize,
  startAngle,
  endAngle,
  isDonut,
  sliceColors,
  showPercentages,
  explodedSlice,
  logoPosition,
  logoUrl
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

  // Example data for initial pie chart rendering
  const initialData = [
    ["Category", "Value"],
    ["Slice 1", 30],
    ["Slice 2", 25],
    ["Slice 3", 20],
    ["Slice 4", 15],
    ["Slice 5", 10]
  ];

  useEffect(() => {
    // Load data from localStorage based on projectId and chartType
    const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
    const storedData = localStorage.getItem(`${projectId}_${chartType}_tableData`);

    if (storedHeaders && storedData) {
      const parsedHeaders = JSON.parse(storedHeaders);
      const parsedData = JSON.parse(storedData);
      setHeaders(parsedHeaders);
      setTableData(parsedData);
    } else {
      // Use initial data if no stored data is found
      setHeaders(initialData[0]);
      setTableData(initialData.slice(1));
    }
  }, [projectId, chartType]);

  useEffect(() => {
    aggregateData();
  }, [tableData, aggregationMethod]);

  const handleDataChange = (newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setTableData(newData);

    // Save data to localStorage based on projectId and chartType
    localStorage.setItem(`${projectId}_${chartType}_headers`, JSON.stringify(newHeaders));
    localStorage.setItem(`${projectId}_${chartType}_tableData`, JSON.stringify(newData));
  };

  const handleAggregationMethodChange = (method: 'none' | 'sum' | 'count') => {
    setAggregationMethod(method);
  };

  const aggregateData = () => {
    if (aggregationMethod === 'none') {
      setAggregatedData(tableData);
      return;
    }

    const aggregated = tableData.reduce((acc, curr) => {
      const existingIndex = acc.findIndex(item => item[0] === curr[0]);
      if (existingIndex > -1) {
        if (aggregationMethod === 'sum') {
          acc[existingIndex][1] = (parseFloat(acc[existingIndex][1]) + parseFloat(curr[1])).toString();
        } else if (aggregationMethod === 'count') {
          acc[existingIndex][1] = (parseFloat(acc[existingIndex][1]) + 1).toString();
        }
      } else {
        if (aggregationMethod === 'count') {
          acc.push([curr[0], '1']);
        } else {
          acc.push(curr);
        }
      }
      return acc;
    }, []);

    setAggregatedData(aggregated);
  }; 

  return (
    <div>
      <div id="chart">
        <MonochromePieChart
          headers={headers}
          tableData={aggregationMethod === 'none' ? tableData : aggregatedData}
          color={color === "custom" ? "yourCustomColor" : color}
          titleAlignment={titleAlignment}
          chartTitle={chartTitle}
          isLabelStyle={isLabelStyle}
          sourceName={sourceName}
          sourceURL={sourceURL}
          donutSize={donutSize}
          startAngle={startAngle}
          endAngle={endAngle}
          isDonut={isDonut}
          sliceColors={sliceColors}
          showPercentages={showPercentages}
          explodedSlice={explodedSlice}
          logoPosition={logoPosition} 
          logoUrl={logoUrl}
          showLogo={true}
          projectId={projectId}
          chartType={chartType}
        />
      </div>
      <div className="mt-4 mb-4">
        <label htmlFor="aggregation-method" className="mr-2">Aggregation Method:</label>
        <select
          id="aggregation-method"
          value={aggregationMethod}
          onChange={(e) => handleAggregationMethodChange(e.target.value as 'none' | 'sum' | 'count')}
          className="p-2 border rounded"
        >
          <option value="none">None</option>
          <option value="sum">Sum</option>
          <option value="count">Count</option>
        </select>
      </div>
      <DataTable 
        onDataChange={handleDataChange} 
        projectId={projectId} 
        chartType={chartType}
        initialData={tableData.length === 0 ? initialData : undefined}
      />
    </div>
  );
};

export default MonochromepieChartWithTable;