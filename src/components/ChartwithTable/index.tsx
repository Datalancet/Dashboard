"use client";
import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable/index";
import ChartTwo from "@/components/Charts/ChartTwo";
import html2canvas from "html2canvas";

const ChartWithTable = () => {
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);

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
    // Load initial data when component mounts
    if (tableData.length === 0) {
      setHeaders(initialData[0]);
      setTableData(initialData.slice(1));
    }
  }, []);

  const handleDataChange = (newHeaders, newData) => {
    setHeaders(newHeaders);
    setTableData(newData);
  };

  return (
    <div>
      <div id="chart">
        <ChartTwo headers={headers} tableData={tableData} />
      </div>
      <DataTable onDataChange={handleDataChange} />
    </div>
  );
};

export default ChartWithTable;
