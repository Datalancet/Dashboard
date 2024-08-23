"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable/index";
import ChartTwo from "@/components/Charts/ChartTwo";
import html2canvas from "html2canvas";

interface ChartWithTableProps {
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
  projectId: string;
  chartType: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
}

const ChartWithTable: React.FC<ChartWithTableProps> = ({
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
  seriesNames,
  projectId,
  chartType,
  logoPosition,
  logoUrl
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);

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
          acc[existingIndex][2] = (parseFloat(acc[existingIndex][2]) + parseFloat(curr[2])).toString();
        } else if (aggregationMethod === 'count') {
          acc[existingIndex][1] = (parseFloat(acc[existingIndex][1]) + 1).toString();
          acc[existingIndex][2] = (parseFloat(acc[existingIndex][2]) + 1).toString();
        }
      } else {
        if (aggregationMethod === 'count') {
          acc.push([curr[0], '1', '1', curr[3], curr[4]]);
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
        <ChartTwo
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
          logoPosition={logoPosition} 
          logoUrl={logoUrl}
          showLogo={true} />
      </div>
      <div className="mt-4 mb-4">
        
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
      <DataTable onDataChange={handleDataChange} projectId={projectId} chartType={chartType} />
    </div>
  );
};

export default ChartWithTable;