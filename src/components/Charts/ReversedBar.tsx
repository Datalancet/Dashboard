import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ReversedBarProps {
  categories: ReadonlyArray<string>;
  data: ReadonlyArray<number>;
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
  categories,
  data,
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
  const reversedCategories = useMemo(() => {
    return [...categories].reverse();
  }, [categories]);

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
    colors: [color],
    xaxis: {
      categories: reversedCategories,
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
      reversed: true,
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
          text: `Source: ${sourceName}${sourceURL ? ' - ' + sourceURL : ''}`.trim(),
          position: 'left',
          offsetX: 0,
          offsetY: 320,
          textAnchor: 'start',
        }
      }],
    },
  }), [reversedCategories, color, chartTitle, xAxisTitle, yAxisTitle, sourceName, sourceURL,logoPosition]);

  const series = useMemo(() => [{
    data: [...data].map(value => -Math.abs(value))  // Make all values negative
  }], [data]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
       <div style={{ position: 'relative' }}>
      <div id="ReversedBar" className="-mb-9 -ml-5">
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
      </div>
    </div>
  );
};

export default ReversedBar;