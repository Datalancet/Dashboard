"use client";
import React, { useState, useEffect } from "react";
import DataTable from "@/components/DataTable";
import ChartTwo from "@/components/ChartTwo";

const DataContext = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Load table data from local storage if it exists
    const storedData = localStorage.getItem("tableData");
    if (storedData) {
      setTableData(JSON.parse(storedData));
    }
  }, []);

  useEffect(() => {
    // Save table data to local storage whenever it changes
    if (tableData.length > 0) {
      localStorage.setItem("tableData", JSON.stringify(tableData));
    }
  }, [tableData]);

  return (
    <div>
      <DataTable tableData={tableData} setTableData={setTableData} />
      <ChartTwo tableData={tableData} />
    </div>
  );
};

export default DataContext;

