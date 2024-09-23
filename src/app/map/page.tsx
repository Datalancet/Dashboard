import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MapOne from "@/components/Maps/MapOne";
import USMap from "@/components/USmap";

export const metadata: Metadata = {
  title: "Next.js Maps | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Maps for TailAdmin",
};

const Map = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Maps" />
      
      <div className="flex flex-col gap-10">
         <USMap/>
        </div>
    </DefaultLayout>
  );
};

export default Map;