"use client";

import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface MonochromePieChartProps {
  headers: string[];
  tableData: any[];
  color: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  projectId: string;
  chartType: string;
  donutSize: number;
  startAngle: number;
  endAngle: number;
  isDonut: boolean;
  showPercentages: boolean;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
  categoryColumn: string;
  valueColumn: string;
}

const MonochromePieChart: React.FC<MonochromePieChartProps> = ({
  headers,
  tableData,
  color,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  projectId,
  chartType,
  donutSize,
  startAngle,
  endAngle,
  isDonut,
  showPercentages,
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showLogo = true,
  categoryColumn,
  valueColumn
}) => {
  const categoryIndex = headers.indexOf(categoryColumn);
  const valueIndex = headers.indexOf(valueColumn);

  const labels = useMemo(() => tableData.map(row => row[categoryIndex] as string), [tableData, categoryIndex]);
  const values = useMemo(() => tableData.map(row => parseFloat(row[valueIndex] as string) || 0), [tableData, valueIndex]);

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
      type: 'pie' as const,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    theme: {
      monochrome: {
        enabled: true,
        color: color,
        shadeTo: 'light',
        shadeIntensity: 0.65
      }
    },
    labels: labels,
    dataLabels: {
      enabled: isLabelStyle,
      formatter: function (val: number, opts: any) {
        const label = opts.w.globals.labels[opts.seriesIndex];
        return showPercentages ? `${label}: ${val.toFixed(1)}%` : label;
      },
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
    plotOptions: {
      pie: {
        donut: {
          size: isDonut ? `${donutSize}%` : '0%',
        },
        startAngle: startAngle,
        endAngle: endAngle,
        expandOnClick: true,
      },
    },
  }), [color, titleAlignment, chartTitle, sourceName, sourceURL, isLabelStyle, labels, donutSize, startAngle, endAngle, isDonut, showPercentages, logoPosition,categoryColumn, valueColumn]);

  const series = useMemo(() => values, [values]);

  return (
    <div>
      <div id="chart">
        <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div style={{ position: 'relative' }}>
          <div id="MonochromePie" className="-mb-9 -ml-5">
            <ReactApexChart
              options={options}
              series={series}
              type={isDonut ? "donut" : "pie"}
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
      </div>
    </div>
  );
};

export default MonochromePieChart;