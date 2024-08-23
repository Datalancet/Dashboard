"use client";

import React, { useState, useEffect, useMemo } from "react";
import DataTable from "@/components/DataTable/index";
import ReversedBar from "../Charts/ReversedBar";
import html2canvas from "html2canvas";

interface ReversedChartWithTableProps {
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
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
}

const ReversedChartWithTable: React.FC<ReversedChartWithTableProps> = ({
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
  seriesNames,
  xAxisTitle,
  yAxisTitle,
  logoPosition,
  logoUrl
}) => {
  console.log("ReversedChartWithTable rendering");

  // Example data for initial chart rendering
  const initialData = [
    ["Country", "Fossil fuels sources", "Low-carbon sources", "Region", ""],
    ["China", "36222.58785", "7195.872996", "East Asia Pacific", ""],
    ["Indonesia", "2068.531663", "182.877434", "East Asia Pacific", ""],
    ["Russia", "7556.898861", "1133.111644", "Europe and Central Asia", ""],
    ["Turkey", "1581.966414", "279.5225517", "Europe and Central Asia", ""],
    ["Brazil", "1840.248858", "1529.716619", "Latin America and Caribbean", ""],
    ["Mexico", "1657.604034", "216.0925264", "Latin America and Caribbean", ""],
    ["Iran", "3333.616802", "52.55197211", "Middle East and North Africa", ""],
    ["Egypt", "988.2385589", "65.66415167", "Middle East and North Africa", ""],
    ["Canada", "2483.220204", "1366.680287", "North America", ""],
    ["United States", "21016.76361", "4654.851322", "North America", ""],
    ["India", "8814.637053", "948.8110477", "South Asia", ""],
    ["Pakistan", "917.6985869", "152.0718743", "South Asia", ""],
    ["South Africa", "1308.656389", "72.36667817", "Sub-Saharan Africa", ""]
  ];

  const [tableData, setTableData] = useState<string[][]>(initialData.slice(1));
  const [headers, setHeaders] = useState<string[]>(initialData[0]);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);
  

  useEffect(() => {
    console.log("Initial data loaded");
    setIsDataReady(true);
  }, []);

  const handleDataChange = (newHeaders: string[], newData: string[][]) => {
    console.log("Data changed:", newHeaders, newData);
    setHeaders(newHeaders);
    setTableData(newData);
  };

  const chartData = useMemo(() => {
    console.log("Calculating chartData");
    return tableData.map(row => ({
      category: row[0],
      fossilFuels: parseFloat(row[1]),
      lowCarbon: parseFloat(row[2])
    }));
  }, [tableData]);
 

  const categories = useMemo(() => chartData.map(item => item.category), [chartData]);
  const fossilFuelsData = useMemo(() => chartData.map(item => item.fossilFuels), [chartData]);

  console.log("Categories:", categories);
  console.log("Fossil Fuels Data:", fossilFuelsData);

  if (!isDataReady) {
    return <div>Loading...</div>;
  }

 
 
  return (
    <div>
      <div id="chart">
        {categories.length > 0 && fossilFuelsData.length > 0 ? (
          <ReversedBar
            categories={categories}
            data={fossilFuelsData}
            color={color === "custom" ? "yourCustomColor" : color}
            chartTitle={chartTitle}
            xAxisTitle={xAxisTitle}
            yAxisTitle={yAxisTitle}
            sourceName={sourceName}
            sourceURL={sourceURL}
            logoPosition={logoPosition} 
            logoUrl={logoUrl}
            showLogo={true} 
          />
        ) : (
          <div>No data available for chart</div>
        )}
      </div>
      
      <DataTable headers={headers} data={tableData} onDataChange={handleDataChange} />
    </div>
  );
};

export default ReversedChartWithTable;