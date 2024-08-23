"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Link from "next/link";
import { useEffect } from "react";

const FormElements = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get('projectId');
  const chartType = searchParams.get('chartType');

  useEffect(() => {
    console.log('Current project ID:', projectId);
    console.log('Current chart type:', chartType);
  }, [projectId, chartType]);

  const saveChartType = (specificType) => {
    if (projectId && chartType) {
      const projectCharts = JSON.parse(localStorage.getItem('projectCharts') || '{}');
      projectCharts[projectId] = { generalType: chartType, specificType };
      localStorage.setItem('projectCharts', JSON.stringify(projectCharts));
      router.push(`/forms/${specificType}?projectId=${projectId}`);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Chart Types" />
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        <div className="flex flex-col gap-9">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div onClick={() => saveChartType('bar-chart')} className="cursor-pointer">
              <img className="rounded-t-lg" src="/images/chart/barchart.png" alt="Bar Chart" />
            </div>
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

        <div className="flex flex-col gap-9">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div onClick={() => saveChartType('stacked-bar')} className="cursor-pointer">
              <img className="rounded-t-lg" src="/images/chart/stacked bar.png" alt="Stacked Bar Chart" />
            </div>
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Stacked Bar Chart
              </h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {projectId ? `` : 'No project selected'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div onClick={() => saveChartType('grouped-bar')} className="cursor-pointer">
              <img className="rounded-t-lg" src="/images/chart/Grouped bar.png" alt="Grouped Bar Chart" />
            </div>
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Grouped Bar Chart
              </h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {projectId ? `` : 'No project selected'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-9">
          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <div onClick={() => saveChartType('reversed-bar')} className="cursor-pointer">
              <img className="rounded-t-lg" src="/images/chart/Reversed bar.png" alt="Reversed Bar Chart" />
            </div>
            <div className="p-5">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Reversed Bar Chart
              </h5>
              <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                {projectId ? `` : 'No project selected'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormElements;