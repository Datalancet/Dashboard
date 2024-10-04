"use client"

import React, { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ChartTwoProps {
  headers: string[];
  tableData: (string | number)[][];
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
  seriesNames: string[];
  xAxisTitle: string;
  yAxisTitle: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
}

const ChartTwo: React.FC<ChartTwoProps> = ({ 
  headers, 
  tableData, 
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
  seriesNames,
  xAxisTitle,
  yAxisTitle,
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showLogo = true
}) => {
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

  const processedData = useMemo(() => {
    const xAxisData = tableData.map(row => row[0]);
    const yAxisData = headers.slice(1).map((_, index) => 
      tableData.map(row => parseFloat(row[index + 1] as string) || 0)
    );
    return { xAxisData, yAxisData };
  }, [headers, tableData]);

  const options = useMemo(() => ({
    chart: {
      type: "bar", // Always set to "bar"
      stacked: false, // Ensure it's not stacked
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
      padding: { bottom: 20 },
    },
    colors: headers.length > 1 
      ? [color, ...Array(Math.max(0, headers.length - 2)).fill("#3b82f6")]
      : [color],
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 0,
        columnWidth: "25%",
        barHeight: '65%', // Adjust this value to change the height of the bars
        distributed: false, // Ensure bars are not distributed
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
      categories: processedData.xAxisData,
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
    yAxisTitle, isLabelStyle, labelPosition, processedData, headers
  ]);

  const series = useMemo(() => 
    headers.slice(1).map((header, index) => ({
      name: seriesNames[index] || header,
      data: processedData.yAxisData[index],
    })),
    [headers, seriesNames, processedData]
  );

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