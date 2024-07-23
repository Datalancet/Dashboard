"use client";

import { useSearchParams } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";

const FormElements = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  console.log('Current project ID:', projectId);

  return (
    <>
      <Breadcrumb pageName="Form Elements" />
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <Link href={`/forms/bar-chart${projectId ? `?projectId=${projectId}` : ''}`}>
              <img className="rounded-t-lg" src="/images/chart/barchart.png" alt="Bar Chart" />
            </Link>
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Bar Chart
              </h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {projectId ? `` : 'No project selected'}
              </p>
             
            </div>
          </div>
        </div>
      </div>
      <br />
    </>
  );
};

export default FormElements;