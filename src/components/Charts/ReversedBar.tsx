"use client"
import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ReversedBarProps {
  data: Array<Record<string, string | number>>;
  xAxisColumn: string;
  yAxisColumns: string[];
  color: string;
  chartTitle: string;
  xAxisTitle: string;
  yAxisTitle: string;
  sourceName: string;
  sourceURL: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
}

const ReversedBar: React.FC<ReversedBarProps> = ({
  data,
  xAxisColumn,
  yAxisColumns,
  color,
  chartTitle,
  xAxisTitle,
  yAxisTitle,
  sourceName,
  sourceURL,
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

  const chartData = useMemo(() => {
    const categories = data.map(item => item[xAxisColumn] as string).reverse();
    const series = yAxisColumns.map(column => ({
      name: column,
      data: data.map(item => Number(item[column]) || 0).reverse()
    }));
    return { categories, series };
  }, [data, xAxisColumn, yAxisColumns]);

  const options = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['#fff']
      },
      formatter: function (val: number) {
        return Math.abs(val).toFixed(2);
      },
      offsetX: 6,
    },
    colors: [color, ...Array(Math.max(0, yAxisColumns.length - 1)).fill("#3b82f6")],
    xaxis: {
      categories: chartData.categories,
      title: {
        text: xAxisTitle,
      },
      labels: {
        formatter: function (val: string) {
          return val;
        }
      },
    },
    yaxis: {
      title: {
        text: yAxisTitle,
      },
      reversed: false,
    },
    title: {
      text: chartTitle,
      align: 'center' as const,
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        fontFamily: undefined,
        color: '#263238'
      },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val: number) {
          return Math.abs(val).toFixed(2);
        }
      }
    },
    annotations: {
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
  }), [chartData.categories, color, chartTitle, xAxisTitle, yAxisTitle, sourceName, sourceURL, yAxisColumns]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
       <div style={{ position: 'relative' }}>
      <div id="ReversedBar" className="-mb-9 -ml-5">
        <ReactApexChart
          options={options}
          series={chartData.series}
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

export default ReversedBar;