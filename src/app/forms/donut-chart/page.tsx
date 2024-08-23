import React from "react";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import DonutChart from "@/components/DonutChart";
export const metadata: Metadata = {
  title: "Next.js Form Elements | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Form Elements page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const FormLayoutPage = () => {
  return (
    <DefaultLayout>
      <DonutChart />
    </DefaultLayout>
  );
};

export default FormLayoutPage;