"use client"

import React, { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartTwoProps {
  headers?: string[];
  tableData?: (string | number)[][];
  color: string;
  design: string;
  gridVariation: string;
  xAxisPosition: string;
  yAxisPosition: string;
  titleAlignment: "left" | "center" | "right";
  valuesPosition: string;
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  labelPosition: "above" | "axis";
  seriesNames?: string[];
  xAxisTitle: string;
  yAxisTitle: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
  
}

const ChartTwo: React.FC<ChartTwoProps> = ({ 
  headers = [], 
  tableData = [], 
  color,
  design,
  gridVariation,
  xAxisPosition,
  yAxisPosition,
  titleAlignment,
  valuesPosition,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  labelPosition,
  xAxisTitle,
  yAxisTitle,
  seriesNames = ["Fossil fuels sources", "Low-carbon sources"],
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showLogo = true
}) => {
  const countries = tableData.map(row => row[0] as string);
  const fossilFuels = tableData.map(row => parseFloat(row[1] as string) || 0);
  const lowCarbon = tableData.map(row => parseFloat(row[2] as string) || 0);


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
      type: design === "grid" && gridVariation === "multiple" ? "line" : "bar",
      stacked: design === "grid" && gridVariation === "single",
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
      padding: { bottom: 20 },
    },
    colors: [color, "#3b82f6"],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 0,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
        dataLabels: {
          position: labelPosition === 'above' ? 'top' : 'bottom',
        },
      },
    },
    dataLabels: {
      enabled: isLabelStyle && labelPosition === 'above',
      offsetX: labelPosition === 'above' ? 10 : 0,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    xaxis: {
      categories: countries,
      position: xAxisPosition as "top" | "bottom",
      title: {
        text: xAxisTitle,
      },
    },
    yaxis: {
      title: {
        text: yAxisTitle,
      },
      position: yAxisPosition as "left" | "right",
      labels: {
        show: !isLabelStyle || labelPosition === 'axis',
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
      position: "top",
      horizontalAlign: "left",
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(2) + " TWh";
        }
      }
    },
    annotations: {
      images: [{
      
      }],
      yaxis: [{
        y: 0,
        borderColor: 'transparent',
        label: {
          borderColor: 'transparent',
          style: {
            fontSize: '12px',
            color: '#777',
            background: 'transparent',
          },
          text: `Source: ${sourceName}${sourceURL ? ' - ' + sourceURL : ''}`.trim(),
          position: 'left',
          offsetX: 0,
          offsetY: 320,
          textAnchor: 'start',
        }
      }],
    },
  }), [
    color, design, gridVariation, xAxisPosition, yAxisPosition, titleAlignment, 
    valuesPosition, chartTitle, sourceName, sourceURL, xAxisTitle,
    yAxisTitle, isLabelStyle, labelPosition, countries, logoPosition
  ]);

  const series = useMemo(() => [
    {
      name: seriesNames[0],
      data: fossilFuels,
    },
    {
      name: seriesNames[1],
      data: lowCarbon,
    },
  ], [seriesNames, fossilFuels, lowCarbon]);

  useEffect(() => {
    console.log("Series Names:", seriesNames);
    console.log("Updated Series:", series);
  }, [seriesNames, series]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
       <div style={{ position: 'relative' }}>
      <div id="chartTwo" className="-mb-9 -ml-5">
        <ReactApexChart
          options={options}
          series={series}
          type={options.chart.type}
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

export default ChartTwo;