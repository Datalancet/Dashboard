"use client"

import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SplineChartProps {
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

const SplineChart: React.FC<SplineChartProps> = ({
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
  const categories = tableData.map(row => row[0] as string);
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

  const getSourceText = () => {
    if (sourceName && sourceURL) {
      return `Source: ${sourceName} - ${sourceURL}`;
    } else if (sourceName) {
      return `Source: ${sourceName}`;
    }
    return '';
  };

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
      curve: 'smooth', // Always set to smooth
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
    subtitle: {
      text: getSourceText(),
      align: 'center',
      style: {
        fontSize: '12px',
        color: '#777',
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
  }), [categories, lineColors, titleAlignment, chartTitle, sourceName, sourceURL, isLabelStyle, showMarkers, headers, xAxisTitle, yAxisTitle, logoPosition]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
       <div style={{ position: 'relative' }}>
      <div id="lineChart" className="-mb-9 -ml-5">
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
            style={logoStyle}
          />
        )}
      </div>
    </div>
  );
};

export default SplineChart;