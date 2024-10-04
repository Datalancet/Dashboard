"use client";

import React, { useState, useEffect, useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface GroupedBarProps {
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
  xAxisColumn: string;
  yAxisColumns: string[];
}

const GroupedBar: React.FC<GroupedBarProps> = ({ 
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
  showLogo = true,
  xAxisColumn,
  yAxisColumns
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
    const xAxisIndex = headers.indexOf(xAxisColumn);
    const yAxisIndices = yAxisColumns.map(col => headers.indexOf(col));
    
    const xAxisData = tableData.map(row => row[xAxisIndex]);
    const yAxisData = yAxisIndices.map(index => 
      tableData.map(row => parseFloat(row[index] as string) || 0)
    );
    
    return { xAxisData, yAxisData };
  }, [headers, tableData, xAxisColumn, yAxisColumns]);

  const options = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: false,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
      padding: { bottom: 20 },
    },
    colors: yAxisColumns.map((_, index) => index === 0 ? color : "#3b82f6"),
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: '55%',
        endingShape: 'rounded',
        dataLabels: {
          position: labelPosition === 'above' ? 'top' : 'center',
        },
      },
    },
    dataLabels: {
      enabled: isLabelStyle,
      offsetX: labelPosition === 'above' ? 0 : -6,
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
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
         
        }
      }],
    },
  }), [
    color, design, gridVariation, xAxisPosition, yAxisPosition, titleAlignment, 
    valuesPosition, chartTitle, sourceName, sourceURL, xAxisTitle,
    yAxisTitle, isLabelStyle, labelPosition, processedData, yAxisColumns
  ]);

  const series = useMemo(() => 
    yAxisColumns.map((column, index) => ({
      name: seriesNames[index] || column,
      data: processedData.yAxisData[index],
    })),
    [yAxisColumns, seriesNames, processedData]
  );

  useEffect(() => {
    console.log("Series Names:", seriesNames);
    console.log("Updated Series:", series);
  }, [seriesNames, series]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div style={{ position: 'relative' }}>
      <div id="GroupedBar" className="-mb-9 -ml-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
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

export default GroupedBar;