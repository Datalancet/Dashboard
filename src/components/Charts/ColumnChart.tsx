import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ColumnChartProps {
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
  showPercentages: boolean;
}

const ColumnChart: React.FC<ColumnChartProps> = ({ 
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
  seriesNames = ["Series 1", "Series 2"],
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showPercentages,
  showLogo = true
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
    },
    colors: [color, "#3b82f6"],
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
      enabled: isLabelStyle && labelPosition === 'above',
      offsetY: labelPosition === 'above' ? -10 : 0,
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
          return val.toFixed(2) + (showPercentages ? "%" : " TWh");
        }
      }
    },
  }), [
    color, design, gridVariation, xAxisPosition, yAxisPosition, titleAlignment, 
    valuesPosition, chartTitle, xAxisTitle, yAxisTitle, isLabelStyle, 
    labelPosition, chartData.categories, showPercentages
  ]);

  if (chartData.series.length === 0) {
    return <div>No data available for the chart</div>;
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div style={{ position: 'relative' }}>
        <div id="columnChart" className="-mb-9 -ml-5">
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

export default ColumnChart;