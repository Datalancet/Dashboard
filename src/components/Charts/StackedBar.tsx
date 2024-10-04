"use client"

import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface StackedBarProps {
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

const StackedBar: React.FC<StackedBarProps> = ({ 
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
      position: 'absolute' as const,
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

  const colorPalette = useMemo(() => {
    return [color, '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', 
      '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];
  }, [color]);

  const processedData = useMemo(() => {
    if (!tableData || !tableData.length || !xAxisColumn || !yAxisColumns.length) {
      return { xAxisData: [], yAxisData: [] };
    }

    const xIndex = headers.indexOf(xAxisColumn);
    const yIndices = yAxisColumns.map(col => headers.indexOf(col));

    const xAxisData = tableData.map(row => row[xIndex] ?? '');
    const yAxisData = yIndices.map(index => 
      tableData.map(row => parseFloat(row[index] as string) || 0)
    );

    return { xAxisData, yAxisData };
  }, [tableData, headers, xAxisColumn, yAxisColumns]);

  const options = useMemo(() => ({
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
      padding: { bottom: 20 },
    },
    colors: yAxisColumns.map((_, index) => colorPalette[index % colorPalette.length]), // Use the same color for all columns
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 0,
        columnWidth: "25%",
        barHeight: '60%', // Reduced from 65% to 60%
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
    yAxisTitle, isLabelStyle, labelPosition, processedData, yAxisColumns
  ]);

  const series = useMemo(() => 
    yAxisColumns.map((column, index) => ({
      name: seriesNames[index] || column,
      data: processedData.yAxisData[index] ?? [],
    })),
    [yAxisColumns, seriesNames, processedData]
  );

  if (!processedData.xAxisData.length || !processedData.yAxisData.length) {
    return <div>No data available to display the chart.</div>;
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
       <div style={{ position: 'relative' }}>
        <div id="chartTwo" className="-mb-9 -ml-5">
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
            style={logoStyle}
          />
        )}
      </div>
    </div>
  );
};

export default StackedBar;