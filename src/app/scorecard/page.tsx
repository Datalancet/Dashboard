import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import Scorecard from "@/components/Scorecard";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

export const metadata: Metadata = {
  title: "Next.js Tables | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Tables page for TailAdmin - Next.js Tailwind CSS Admin Dashboard Template",
};

const ScorecardPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="" />

      <div className="flex flex-col gap-10">
       <Scorecard/>
      </div>
    </DefaultLayout>
  );
};

export default ScorecardPage;

