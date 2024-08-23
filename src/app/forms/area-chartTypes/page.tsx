import React from "react";
import AreaChartTypes from "@/components/AreaChartTypes";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const AreaChart = () => {
  return (
    <DefaultLayout>
      <AreaChartTypes/>
    </DefaultLayout>
  );
};

export default AreaChart;