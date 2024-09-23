"use client"

import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SteplineAreaChartProps {
  headers?: string[];
  tableData?: (string | number)[][];
  areaColors: string[];
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  showMarkers: boolean;
  curveType?: "straight" | "smooth" | "stepline";
  xAxisTitle: string;
  yAxisTitle: string;
  fillOpacity: number;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
}

const SteplineAreaChart: React.FC<SteplineAreaChartProps> = ({
  headers = [],
  tableData = [],
  areaColors,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  showMarkers,
  curveType = "stepline", // Set default to "smooth"
  xAxisTitle,
  yAxisTitle,
  fillOpacity,
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showLogo = true
}) => {
  const categories = tableData.map(row => row[0] as string);

  const getLogoStyle = (position: string) => {
    const base = {
      position: 'absolute',
      width: '20px',
      height: '20px',
    };
    switch (position) {
      case 'top-right':
        return { ...base, top: '-20px', right: '-20px' };
      case 'top-left':
        return { ...base, top: '-20px', left: '-20px' };
      case 'bottom-right':
        return { ...base, bottom: '20px', right: '-20px' };
      case 'bottom-left':
        return { ...base, bottom: '20px', left: '-20px' };
      default:
        return { ...base, top: '10px', right: '10px' };
    }
  };

  const logoStyle = getLogoStyle(logoPosition);

  const series = useMemo(() => {
    return headers.slice(1).map((header, index) => ({
      name: header,
      data: tableData.map(row => parseFloat(row[index + 1] as string) || 0)
    }));
  }, [headers, tableData]);

 

  const options = useMemo(() => ({
    chart: {
      type: 'area' as const,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    colors: areaColors,
    dataLabels: {
      enabled: isLabelStyle,
    },
    stroke: {
      curve: 'stepline',
      width: 2,
    },
    fill: {
      type: 'solid',
      opacity: fillOpacity,
    },
    title: {
      text: chartTitle,
      align: titleAlignment,
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: undefined,
        color: '#263238'
      },
    },
   
    legend: {
      position: "bottom",
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(2);
        }
      }
    },
    xaxis: {
      categories: categories,
      title: {
        text: xAxisTitle
      }
    },
    yaxis: {
      title: {
        text: yAxisTitle
      }
    },
    markers: {
      size: showMarkers ? 4 : 0,
      strokeWidth: 2,
      hover: {
        size: 6,
      }
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      },
    },
  }), [categories, areaColors, titleAlignment, chartTitle, sourceName, sourceURL, isLabelStyle, showMarkers, headers, xAxisTitle, yAxisTitle, curveType, fillOpacity, logoPosition]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
       <div style={{ position: 'relative' }}>
      <div id="areaChart" className="-mb-9 -ml-5">
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={350}
          width={"100%"}
        />
      </div>
      {showLogo && (
          <img 
            src={logoUrl}
            alt="Logo" 
            style={logoStyle}
          />
        )}
         {(sourceName || sourceURL) && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '20px',
            fontSize: '10px',
            color: '#777',
            zIndex: 1,
            maxWidth: '50%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {sourceName && <span>Source: {sourceName}</span>}
            {sourceURL && (
              <>
                {sourceName && " - "}
                <a href={sourceURL} target="_blank" rel="noopener noreferrer" style={{ color: '#0000EE' }}>
                  {sourceURL}
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SteplineAreaChart;