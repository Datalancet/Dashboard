"use client"

import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface HeatMapMultiProps {
  headers?: string[];
  tableData?: (string | number)[][];
  heatmapColors: string[];
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  showLegend: boolean;
  reversedYAxis: boolean;
  cellRadius: number;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
}

const HeatMapMulti: React.FC<HeatMapMultiProps> = ({
  headers = [],
  tableData = [],
  heatmapColors,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  xAxisTitle,
  yAxisTitle,
  showLegend,
  reversedYAxis,
  cellRadius,
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

  const series = useMemo(() => {
    return headers.slice(1).map((header, index) => ({
      name: header,
      data: tableData.map(row => ({
        x: row[0] as string,
        y: parseFloat(row[index + 1] as string) || 0
      }))
    }));
  }, [headers, tableData]);

  const options = useMemo(() => ({
    chart: {
      type: 'heatmap' as const,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    colors: heatmapColors,
    dataLabels: {
      enabled: false,
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
    plotOptions: {
      heatmap: {
        radius: cellRadius,
        enableShades: true,
        shadeIntensity: 0.5,
        reverseNegativeShade: true,
        distributed: false,
        colorScale: {
          ranges: heatmapColors.map((color, index) => ({
            from: index * (100 / heatmapColors.length),
            to: (index + 1) * (100 / heatmapColors.length),
            color: color,
            name: `Series ${index + 1}`,
          })),
        },
      },
    },
    legend: {
      show: showLegend,
      position: "bottom",
    },
    xaxis: {
      title: {
        text: xAxisTitle
      }
    },
    yaxis: {
      title: {
        text: yAxisTitle
      },
      reversed: reversedYAxis,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return val.toFixed(2);
        }
      }
    },
  }), [headers, tableData, heatmapColors, titleAlignment, chartTitle, xAxisTitle, yAxisTitle, showLegend, reversedYAxis, cellRadius]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
      <div style={{ position: 'relative' }}>
        <div id="heatMap" className="-mb-9 -ml-5">
          <ReactApexChart
            options={options}
            series={series}
            type="heatmap"
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

export default HeatMapMulti;