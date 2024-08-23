"use client";

import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable/index";
import SteplineChart from "../Charts/Stepline";

interface SteplineChartWithTableProps {
  lineColors: string[];
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  projectId: string;
  chartType: string;
  showMarkers: boolean;
  curveType: "straight" | "smooth" | "stepline";
  xAxisTitle: string;
  yAxisTitle: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
}

const SteplineChartWithTable: React.FC<SteplineChartWithTableProps> = ({
  lineColors,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  projectId,
  chartType,
  showMarkers,
  curveType,
  xAxisTitle,
  yAxisTitle,
  logoPosition,
  logoUrl
}) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationMethod, setAggregationMethod] = useState<'none' | 'sum' | 'count'>('none');
  const [aggregatedData, setAggregatedData] = useState<any[]>([]);


  // Example data for initial line chart rendering
  const initialData = [
    ["Month", "Product One", "Product Two"],
    ["Jan", 23, 30],
    ["Feb", 11, 25],
    ["Mar", 22, 36],
    ["Apr", 27, 30],
    ["May", 13, 45],
    ["Jun", 22, 35],
    ["Jul", 37, 64],
    ["Aug", 21, 52],
    ["Sep", 44, 59],
    ["Oct", 22, 36],
    ["Nov", 30, 39],
    ["Dec", 45, 51],
  ];

  useEffect(() => {
    const storedHeaders = localStorage.getItem(`${projectId}_${chartType}_headers`);
    const storedData = localStorage.getItem(`${projectId}_${chartType}_tableData`);

    if (storedHeaders && storedData) {
      setHeaders(JSON.parse(storedHeaders));
      setTableData(JSON.parse(storedData));
    } else if (tableData.length === 0) {
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
        <SteplineChart
          headers={headers}
          tableData={tableData}
          lineColors={lineColors}
          titleAlignment={titleAlignment}
          sourceName={sourceName}
          sourceURL={sourceURL}
          chartTitle={chartTitle}
          isLabelStyle={isLabelStyle}
          showMarkers={showMarkers}
          curveType={curveType}
          xAxisTitle={xAxisTitle}
          yAxisTitle={yAxisTitle}
          logoPosition={logoPosition} 
          logoUrl={logoUrl}
          showLogo={true}
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

export default SteplineChartWithTable;