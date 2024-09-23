"use client"

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import highchartsMap from 'highcharts/modules/map';
import usaMap from '@highcharts/map-collection/countries/us/us-all.geo.json';

// Initialize highchartsMap
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
  data: [string, number][]; 
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
 
}) => {
  const data = [
    ['us-nd', 2.0], ['us-sd', 2.0], ['us-vt', 2.1], ['us-ne', 2.5], ['us-nh', 2.5],
    ['us-md', 2.7], ['us-va', 2.7], ['us-ia', 2.8], ['us-mn', 2.8], ['us-ms', 2.8],
    ['us-ks', 2.9], ['us-ut', 2.9], ['us-wi', 2.9], ['us-wy', 2.9], ['us-al', 3.0],
    ['us-hi', 3.0], ['us-me', 3.0], ['us-ma', 3.0], ['us-tn', 3.0], ['us-mt', 3.1],
    ['us-ga', 3.2], ['us-fl', 3.3], ['us-id', 3.3], ['us-az', 3.4], ['us-ar', 3.4],
    ['us-pa', 3.4], ['us-sc', 3.4], ['us-mo', 3.5], ['us-ok', 3.5], ['us-nc', 3.6],
    ['us-in', 3.7], ['us-co', 3.8], ['us-nm', 3.8], ['us-de', 3.9], ['us-mi', 3.9],
    ['us-tx', 4.0], ['us-la', 4.1], ['us-ny', 4.2], ['us-oh', 4.2], ['us-or', 4.2],
    ['us-wv', 4.2], ['us-ct', 4.3], ['us-ri', 4.3], ['us-ak', 4.5], ['us-ky', 4.6],
    ['us-nj', 4.6], ['us-il', 4.9], ['us-wa', 4.9], ['us-nv', 5.1], ['us-ca', 5.2],
    ['us-dc', 5.3]
  ];

  const options = {
    chart: {
      map: usaMap,
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
      min: 2,
      max: 5.5,
      type: 'linear',
      minColor: design === 'custom' ? Highcharts.color(color).brighten(0.4).get() : '#EEEEFF',
      maxColor: design === 'custom' ? color : '#000022',
      stops: [
        [0, design === 'custom' ? Highcharts.color(color).brighten(0.4).get() : '#EEEEFF'],
        [0.67, design === 'custom' ? Highcharts.color(color).brighten(0.2).get() : '#4444FF'],
        [1, design === 'custom' ? color : '#000022']
      ]
    },
    series: [{
      data: data,
      name: 'State Data',
      states: {
        hover: {
          color: '#BADA55'
        }
      },
      dataLabels: {
        enabled: true,
        format: '{point.name}'
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