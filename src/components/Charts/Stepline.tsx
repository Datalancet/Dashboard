"use client"

import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SteplineChartProps {
  headers?: string[];
  tableData?: (string | number)[][];
  lineColors: string[];
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  showMarkers: boolean;
  curveType: "straight" | "smooth" | "stepline";
  xAxisTitle: string;
  yAxisTitle: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
}

const SteplineChart: React.FC<SteplineChartProps> = ({
  headers = [],
  tableData = [],
  lineColors,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  showMarkers,
  curveType,
  xAxisTitle,
  yAxisTitle,
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showLogo = true
}) => {
  const categories = useMemo(() => tableData.map(row => row[0] as string), [tableData]);
  const series = useMemo(() => {
    return headers.slice(1).map((header, index) => ({
      name: header,
      data: tableData.map(row => parseFloat(row[index + 1] as string) || 0)
    }));
  }, [headers, tableData]);

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

  const options = useMemo(() => ({
    chart: {
      type: 'line' as const,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    colors: lineColors,
    dataLabels: {
      enabled: isLabelStyle,
    },
    stroke: {
      curve: 'stepline', // Always set to stepline for this chart type
      width: 2,
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
  }), [categories, lineColors, titleAlignment, chartTitle, sourceName, sourceURL, isLabelStyle, showMarkers, xAxisTitle, yAxisTitle, logoPosition]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
      <div style={{ position: 'relative' }}>
        <div id="steplineChart" className="-mb-9 -ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="line"
            height={350}
            width={"100%"}
          />
        </div>
        {showLogo && (
          <img 
            src={logoUrl}
            alt="Logo" 
            style={logoStyle as React.CSSProperties}
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

export default SteplineChart;