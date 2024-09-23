import React from "react";
import HeatMapChartTypes from "@/components/HeatMapChartTypes";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const HeatMap = () => {
  return (
    <DefaultLayout>
      <HeatMapChartTypes/>
    </DefaultLayout>
  );
};

export default HeatMap;