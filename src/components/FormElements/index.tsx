"use client";
import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";


const FormElements = () => {
  return (
    <>
      <Breadcrumb pageName="Bar Chart" />
      <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
        <div className="flex flex-col gap-9">
         

          <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
           <a href="/forms/bar-chart">
          <img className="rounded-t-lg" src="/images/chart/barchart.png" alt="" />
          </a>
          <div className="p-5">
         <a href="#">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Bar Chart</h5>
        </a>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400"></p>
        </div>
        </div>        
        </div>
      </div>
      <br />
      
    </>
  );
};

export default FormElements;

