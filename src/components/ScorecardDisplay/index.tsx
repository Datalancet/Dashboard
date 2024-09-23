"use client"

import React from "react";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface ScoreCardDisplayProps {
  headers: string[];
  scoreData: (string | number)[][];
  cardColor: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  showTrend: boolean;
  showComparison: boolean;
  showStatus: boolean;
  showProgressBar: boolean;
  cardLayout: string;
  useConditionalFormatting: boolean;
  thresholds: { good: number; bad: number };
  useCustomIcons: boolean;
  iconSet: string;
}

const ScoreCardDisplay: React.FC<ScoreCardDisplayProps> = ({
  headers,
  scoreData,
  cardColor,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  showTrend,
  showComparison,
  showStatus,
  showProgressBar,
  cardLayout,
  useConditionalFormatting,
  thresholds,
  useCustomIcons,
  iconSet
}) => {
  const parseNumericValue = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const getConditionalColor = (value: number, target: number) => {
    const percentage = (value / target) * 100;
    if (percentage >= thresholds.good) return "text-green-500";
    if (percentage >= thresholds.bad) return "text-yellow-500";
    return "text-red-500";
  };

  const renderTrendIcon = (trend: string | number | null | undefined) => {
    if (typeof trend !== 'string') return <MinusIcon className="h-5 w-5 text-gray-500" />;

    const trendLower = trend.toLowerCase();
    if (useCustomIcons) {
      switch (iconSet) {
        case 'emoji':
          return trendLower === 'up' ? '😀' : trendLower === 'down' ? '☹️' : '😐';
        case 'shapes':
          return trendLower === 'up' ? '▲' : trendLower === 'down' ? '▼' : '■';
        default:
          break;
      }
    }

    if (trendLower === 'up') {
      return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
    } else if (trendLower === 'down') {
      return <ArrowDownIcon className="h-5 w-5 text-red-500" />;
    } else if (trendLower === 'neutral') {
      return <MinusIcon className="h-5 w-5 text-yellow-500" />;
    }
    
    return <MinusIcon className="h-5 w-5 text-gray-500" />;
  };

  const renderComparisonValue = (current: number, previous: number) => {
    if (isNaN(current) || isNaN(previous) || previous === 0) return null;
    
    const difference = current - previous;
    const percentageChange = ((difference / previous) * 100).toFixed(2);
    const isPositive = difference >= 0;
    
    return (
      <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
        {isPositive ? '+' : ''}{percentageChange}%
      </span>
    );
  };

  const renderStatusIndicator = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    let color;
    if (percentage >= 100) color = "bg-green-500";
    else if (percentage >= 70) color = "bg-yellow-500";
    else color = "bg-red-500";

    return (
      <div className="flex items-center mt-2">
        <div className={`w-3 h-3 rounded-full ${color} mr-2`}></div>
        <span className="text-sm">{percentage.toFixed(0)}% of goal</span>
      </div>
    );
  };

  const renderProgressBar = (current: number, target: number) => {
    const percentage = Math.min((current / target) * 100, 100);
    const difference = target - current;
    const isExceeded = current > target;
    const barColor = isExceeded ? "bg-green-500" : "bg-blue-500";
    const textColor = isExceeded ? "text-green-700" : "text-blue-700";

    return (
      <div className="w-full mt-2">
        <div className="flex justify-between mb-1">
          <span className={`text-sm font-medium ${textColor}`}>{current.toFixed(2)}</span>
          <span className="text-sm font-medium text-gray-700">{target.toFixed(2)}</span>
        </div>
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`${barColor} h-full transition-all duration-500 ease-out`} 
            style={{ width: `${percentage}%` }}
          >
            {isExceeded && (
              <div 
                className="absolute top-0 right-0 h-full bg-green-600" 
                style={{ width: `${(current - target) / target * 100}%` }}
              ></div>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-semibold text-white drop-shadow-md">
              {isExceeded 
                ? `+${(current - target).toFixed(2)}`
                : `-${difference.toFixed(2)}`
              }
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {isExceeded 
            ? `Exceeded target by ${(current - target).toFixed(2)}`
            : `${difference.toFixed(2)} more to reach target`
          }
        </div>
      </div>
    );
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4">
        <h2 style={{ textAlign: titleAlignment, color: cardColor }}>{chartTitle}</h2>
      </div>
      <div className={`grid ${cardLayout === 'horizontal' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-4`}>
        {scoreData.map((row, index) => {
          if (!Array.isArray(row) || row.length < 4) {
            console.error(`Invalid row data at index ${index}:`, row);
            return null; // Skip this row
          }

          const currentValue = parseNumericValue(row[1]);
          const previousValue = parseNumericValue(row[2]);
          const targetValue = parseNumericValue(row[3]);
          const conditionalColor = useConditionalFormatting ? getConditionalColor(currentValue, targetValue) : '';
          
          return (
            <div key={index} className="bg-gray-100 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2" style={{ color: cardColor }}>{row[0]}</h3>
              <div className={`text-3xl font-bold mb-2 ${conditionalColor}`}>{row[1]}</div>
              {showComparison && (
                <div className="text-sm text-gray-600 mb-1">
                  vs Previous: {row[2]} {renderComparisonValue(currentValue, previousValue)}
                </div>
              )}
              {showComparison && (
                <div className="text-sm text-gray-600 mb-1">
                  Target: {row[3]}
                </div>
              )}
              {showTrend && (
                <div className="flex items-center">
                  <span className="mr-1">Trend:</span>
                  {renderTrendIcon(row[4])}
                </div>
              )}
              {showStatus && renderStatusIndicator(currentValue, targetValue)}
              {showProgressBar && renderProgressBar(currentValue, targetValue)}
            </div>
          );
        })}
      </div>
      {(sourceName || sourceURL) && (
        <div className="mt-4 text-sm text-gray-500">
          {sourceName && <span>Source: {sourceName}</span>}
          {sourceURL && (
            <>
              {sourceName && " - "}
              <a href={sourceURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {sourceURL}
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreCardDisplay;