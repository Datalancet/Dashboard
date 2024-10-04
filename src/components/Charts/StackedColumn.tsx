import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StackedColumnChartProps {
  headers?: string[];
  tableData?: (string | number)[][];
  colors: string[];
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
  xAxisTitle: string;
  yAxisTitle: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
  showPercentages: boolean;
  seriesNames: string[];
}

const StackedColumnChart: React.FC<StackedColumnChartProps> = ({ 
  headers = [], 
  tableData = [], 
  colors,
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
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showPercentages,
  showLogo = true,
  seriesNames
}) => {
  const chartData = useMemo(() => {
    if (!tableData || tableData.length === 0 || headers.length < 2) {
      return {
        categories: [],
        series: []
      };
    }

    const categories = tableData.map(row => String(row[0]));
    const series = headers.slice(1).map((header, index) => ({
      name: seriesNames[index] || header,
      data: tableData.map(row => {
        const value = row[index + 1];
        return typeof value === 'number' ? value : parseFloat(value as string) || 0;
      })
    }));

    return { categories, series };
  }, [headers, tableData, seriesNames]);

  const getLogoStyle = (position: string) => {
    const base = {
      position: 'absolute' as 'absolute',
      width: '20px',
      height: '20px',
    };
    switch (position) {
      case 'top-right':
        return { ...base, top: '10px', right: '10px' };
      case 'top-left':
        return { ...base, top: '10px', left: '10px' };
      case 'bottom-right':
        return { ...base, bottom: '10px', right: '10px' };
      case 'bottom-left':
        return { ...base, bottom: '10px', left: '10px' };
      default:
        return { ...base, top: '10px', right: '10px' };
    }
  };

  const logoStyle = getLogoStyle(logoPosition);

  const options = useMemo(() => ({
    chart: {
      type: 'bar',
      stacked: true,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    colors: colors,
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: "50%",
        dataLabels: {
          position: labelPosition === 'above' ? 'top' : 'center',
        },
      },
    },
    dataLabels: {
      enabled: isLabelStyle,
      formatter: function (val: number) {
        return showPercentages ? `${val.toFixed(1)}%` : val.toFixed(0);
      },
      style: {
        fontSize: '12px',
        colors: ['#fff']
      }
    },
    xaxis: {
      categories: chartData.categories,
      position: xAxisPosition as "top" | "bottom",
      title: {
        text: xAxisTitle,
      },
    },
    yaxis: {
      title: {
        text: yAxisTitle,
      },
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
          return showPercentages ? `${val.toFixed(1)}%` : val.toFixed(2);
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
  }), [
    colors, design, gridVariation, xAxisPosition, yAxisPosition, titleAlignment, 
    valuesPosition, chartTitle, sourceName, sourceURL, xAxisTitle,
    yAxisTitle, isLabelStyle, labelPosition, chartData.categories, logoPosition, showPercentages,
    seriesNames
  ]);

  if (chartData.series.length === 0) {
    return <div>No data available for the chart</div>;
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div style={{ position: 'relative' }}>
        <div id="stackedColumnChart" className="-mb-9 -ml-5">
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
            style={logoStyle}
          />
        )}
        {(sourceName || sourceURL) && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            fontSize: '10px',
            color: '#777',
            zIndex: 1,
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

export default StackedColumnChart;