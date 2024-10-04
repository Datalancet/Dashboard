"use client"

import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface DonutPieChartProps {
  headers?: string[];
  tableData?: (string | number)[][];
  color: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  isLabelStyle: boolean;
  donutSize: number;
  startAngle: number;
  endAngle: number;
  sliceColors: string[];
  showPercentages: boolean;
  explodedSlice: number;
  isDonut: boolean;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
  categoryColumn: string;
  valueColumn: string;
  
}

const DonutPieChart: React.FC<DonutPieChartProps> = ({
  headers = [],
  tableData = [],
  color,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  isLabelStyle,
  donutSize = 65,
  startAngle = 0,
  endAngle = 360,
  sliceColors,
  showPercentages,
  explodedSlice,
  isDonut,
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


  const formatValue = (val: string | number): string => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(numVal) ? '0' : numVal.toFixed(2);
  };

  const options = useMemo(() => ({
    chart: {
      type: isDonut ? 'donut' as const : 'pie' as const,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    colors: sliceColors,
    labels: labels,
    dataLabels: {
      enabled: isLabelStyle,
      formatter: function (val: string | number, opts: any) {
        const label = opts.w.globals.labels[opts.seriesIndex];
        const formattedVal = formatValue(val);
        return showPercentages ? `${label}: ${formattedVal}%` : label;
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
    subtitle: {
     
      align: 'center',
      style: {
        fontSize: '14px',
        fontWeight: 'normal',
        color: '#666'
      }
    },
    legend: {
      position: "bottom",
    },
    tooltip: {
      y: {
        formatter: function (val: string | number) {
          return formatValue(val);
        }
      }
    },
    annotations: {
      texts: [{
        x: '50%',
        y: '105%',
        text: `Source: ${sourceName}${sourceURL ? ' - ' + sourceURL : ''}`.trim(),
        style: {
          fontSize: '12px',
          color: '#777',
        },
      }],
    },
    plotOptions: {
      pie: {
        donut: {
          size: `${donutSize}%`,
          labels: {
            show: isDonut,
            name: {
              show: true,
            },
            value: {
              show: true,
              formatter: function (val: string | number) {
                const formattedVal = formatValue(val);
                return showPercentages ? formattedVal + "%" : formattedVal;
              }
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function (w: any) {
                const total = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                const formattedTotal = formatValue(total);
                return showPercentages ? formattedTotal + "%" : formattedTotal;
              }
            }
          }
        },
        startAngle: startAngle,
        endAngle: endAngle,
        expandOnClick: false,
      },
    },
    states: {
      hover: {
        filter: {
          type: 'none',
        }
      },
      active: {
        filter: {
          type: 'none',
        }
      },
    },
  }), [color, titleAlignment, chartTitle, sourceName, sourceURL, isLabelStyle, labels, donutSize, startAngle, endAngle, sliceColors, showPercentages, isDonut, logoPosition, categoryColumn, valueColumn]);

  const series = useMemo(() => values, [values]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <div style={{ position: 'relative' }}>
      <div id="donutPieChart" className="-mb-9 -ml-5">
        <ReactApexChart
          options={{
            ...options,
            plotOptions: {
              ...options.plotOptions,
              donut: {
                ...options.plotOptions.pie,
                expandOnClick: true,
                customScale: 1,
                offsetX: explodedSlice !== -1 ? 20 : 0,
                offsetY: explodedSlice !== -1 ? 20 : 0,
              },
            },
          }}
          series={series}
          type="donut" 
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

export default DonutPieChart;