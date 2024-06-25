import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import MapOne from "@/components/Maps/MapOne";

export const metadata: Metadata = {
  title: "Next.js Maps | TailAdmin - Next.js Dashboard Template",
  description:
    "This is Next.js Maps for TailAdmin",
};

const Map = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Maps" />

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
       <MapOne/>
      </div>
    </DefaultLayout>
  );
};

export default Map;