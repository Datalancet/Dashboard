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
}) => {
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
  }), [reversedCategories, color, chartTitle, xAxisTitle, yAxisTitle, sourceName, sourceURL]);

  const series = useMemo(() => [{
    data: [...data].map(value => -Math.abs(value))  // Make all values negative
  }], [data]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div id="ReversedBar" className="-mb-9 -ml-5">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
          width={"100%"}
        />
      </div>
    </div>
  );
};

export default ReversedBar;