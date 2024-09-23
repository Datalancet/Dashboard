import React, { useMemo } from "react";
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface HeatMapRangeProps {
  headers?: string[];
  tableData?: (string | number)[][];
  colorRanges: { from: number; to: number; color: string }[];
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

const generateData = (count: number, { min, max }: { min: number; max: number }) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      x: `w${i + 1}`,
      y: Math.floor(Math.random() * (max - min + 1)) + min
    });
  }
  return data;
};

const HeatMapRange: React.FC<HeatMapRangeProps> = ({
  headers = [],
  tableData = [],
  colorRanges,
  titleAlignment = 'left',
  sourceName = '',
  sourceURL = '',
  chartTitle = 'HeatMap Chart with Color Range',
  xAxisTitle = '',
  yAxisTitle = '',
  showLegend = true,
  reversedYAxis = false,
  cellRadius = 0,
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
    if (headers.length > 0 && tableData.length > 0) {
      return headers.slice(1).map((header, index) => ({
        name: header,
        data: tableData.map(row => ({
          x: row[0] as string,
          y: parseFloat(row[index + 1] as string) || 0
        }))
      }));
    } else {
      // Default series data
      return [
       
      ];
    }
  }, [headers, tableData]);

  const options = useMemo(() => ({
    chart: {
      height: 350,
      type: 'heatmap' as const,
      toolbar: { show: false },
      events: {
        mounted: (chart: any) => {
          chart.windowResizeHandler();
        },
      },
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        radius: cellRadius,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: colorRanges.map((range, index) => ({
            from: range.from,
            to: range.to,
            name: `Range ${index + 1}`,
            color: range.color
          }))
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 1
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
    xaxis: {
      type: 'category' as const,
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
    legend: {
      show: showLegend,
      position: "bottom",
    },
  }), [chartTitle, titleAlignment, xAxisTitle, yAxisTitle, showLegend, reversedYAxis, cellRadius, colorRanges]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
      <div style={{ position: 'relative' }}>
        <div id="heatMapRange" className="-mb-9 -ml-5">
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

export default HeatMapRange;