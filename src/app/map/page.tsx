import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import IndiaMap from "@/components/IndiaMap";


export const metadata: Metadata = {
  title: "Next.js Maps | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Maps for TailAdmin",
};

export default function MapPage() {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Maps" />
      
      <div className="flex flex-col gap-10">
        <IndiaMap/>
      </div>
    </DefaultLayout>
  );
}