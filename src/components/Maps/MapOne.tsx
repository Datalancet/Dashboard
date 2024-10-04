"use client"
import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMap from 'highcharts/modules/map';
import indiaMap from '@highcharts/map-collection/countries/in/custom/in-all-disputed.geo.json';

if (typeof Highcharts === 'object') {
  highchartsMap(Highcharts);
}

interface MapOneProps {
  design: string;
  color: string;
  mapTitle: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  logoUrl: string;
  data: any[][];
  headers: string[];
}

const MapOne: React.FC<MapOneProps> = ({
  design,
  color,
  mapTitle,
  titleAlignment,
  sourceName,
  sourceURL,
  logoPosition,
  logoUrl,
  data,
  headers,
}) => {
  const [formattedData, setFormattedData] = useState<any[]>([]);
  const [seriesName, setSeriesName] = useState<string>('Value');
  const [minValue, setMinValue] = useState<number>(0);
  const [maxValue, setMaxValue] = useState<number>(0);

  useEffect(() => {
    formatData();
  }, [data, headers]);

  const formatData = () => {
    if (data.length === 0 || headers.length === 0) return;

    const stateCodeIndex = headers.findIndex(header => 
      header.toLowerCase().includes('state') || header.toLowerCase().includes('code'));
    const valueIndex = headers.findIndex(header => 
      header.toLowerCase().includes('value') || header.toLowerCase().includes('population'));

    if (stateCodeIndex === -1 || valueIndex === -1) {
      console.error('Could not find state code or value columns');
      return;
    }

    setSeriesName(headers[valueIndex]);

    const formatted = data.reduce((acc, row) => {
      const stateCode = row[stateCodeIndex];
      const value = row[valueIndex];

      if (stateCode && value !== undefined && value !== null) {
        let formattedStateCode = String(stateCode).toLowerCase();
        if (!formattedStateCode.startsWith('in-')) {
          formattedStateCode = 'in-' + formattedStateCode;
        }
        
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
          acc.push([formattedStateCode, numericValue]);
        }
      }

      return acc;
    }, []);

    if (formatted.length === 0) {
      console.error('No valid data points after formatting');
      return;
    }

    const values = formatted.map(item => item[1]);
    setMinValue(Math.min(...values));
    setMaxValue(Math.max(...values));
    setFormattedData(formatted);
  };

  const getColorStops = (baseColor: string) => {
    const lightenColor = Highcharts.color(baseColor).brighten(0.4).get();
    const darkenColor = Highcharts.color(baseColor).brighten(-0.3).get();
    return [
      [0, lightenColor],
      [0.5, baseColor],
      [1, darkenColor]
    ];
  };

  const options: Highcharts.Options = {
    chart: {
      map: indiaMap,
      height: '500px',
      style: {
        fontFamily: 'Arial, sans-serif'
      }
    },
    title: {
      text: mapTitle,
      align: titleAlignment
    },
    subtitle: {
      text: `Source: ${sourceName}`,
      align: titleAlignment,
      style: {
        color: '#666666'
      }
    },
    mapNavigation: {
      enabled: true,
      buttonOptions: {
        verticalAlign: 'bottom'
      }
    },
    colorAxis: {
      min: minValue,
      max: maxValue,
      type: 'linear',
      stops: design === 'custom' ? getColorStops(color) : [
        [0, '#EEEEFF'],
        [0.5, '#4444FF'],
        [1, '#000022']
      ]
    },
    series: [{
      type: 'map',
      name: seriesName,
      data: formattedData,
      states: {
        hover: {
          color: Highcharts.color(design === 'custom' ? color : '#4444FF').brighten(0.2).get()
        }
      },
      dataLabels: {
        enabled: true,
        format: '{point.name}'
      },
      tooltip: {
        pointFormat: '{point.name}: {point.value:,.0f}'
      }
    }],
    credits: {
      enabled: false
    }
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8 relative">
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        constructorType={'mapChart'}
      />
      {logoUrl && (
        <img
          src={logoUrl}
          alt="Logo"
          className={`absolute ${
            logoPosition === 'top-right'
              ? 'top-0 right-0'
              : logoPosition === 'top-left'
              ? 'top-0 left-0'
              : logoPosition === 'bottom-right'
              ? 'bottom-0 right-0'
              : 'bottom-0 left-0'
          } w-6 h-6 m-2`}
        />
      )}
      {sourceURL && (
        <div className={`absolute bottom-0 ${titleAlignment === 'left' ? 'left-0' : titleAlignment === 'right' ? 'right-0' : 'left-1/2 transform -translate-x-1/2'} m-2`}>
          <a href={sourceURL} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline">
            {sourceName}
          </a>
        </div>
      )}
    </div>
  );
};

export default MapOne;