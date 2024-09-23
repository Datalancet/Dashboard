"use client"
import React, { useState, useEffect, useCallback, useMemo } from "react";
import ScorecardDataTable from "../ScorecardDataTable";
import ScoreCardDisplay from "../ScorecardDisplay";

interface ScoreCardWithTableProps {
  cardColor: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  projectId: string;
  chartType: string;
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

const ScoreCardWithTable: React.FC<ScoreCardWithTableProps> = ({
  cardColor,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  projectId,
  chartType,
  showTrend,
  showComparison,
  showStatus,
  showProgressBar,
  cardLayout,
  useConditionalFormatting,
  thresholds,
  useCustomIcons,
  iconSet,
}) => {
  const [scoreData, setScoreData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [aggregationType, setAggregationType] = useState<string>(() => {
    // Initialize aggregationType from local storage or default to "none"
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`aggregationType_${projectId}`) || "none";
    }
    return "none";
  });

  useEffect(() => {
    // Save aggregationType to local storage whenever it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem(`aggregationType_${projectId}`, aggregationType);
    }
  }, [aggregationType, projectId]);

  const handleDataChange = useCallback((newHeaders: string[], newData: any[]) => {
    setHeaders(newHeaders);
    setScoreData(newData);
  }, []);

  const aggregateData = useCallback((data: any[], type: string) => {
    if (type === "none") return data;

    return data.reduce((acc, curr) => {
      const existingIndex = acc.findIndex((item: any[]) => item[0] === curr[0]);
      if (existingIndex === -1) {
        acc.push([...curr]);
      } else {
        for (let i = 1; i < curr.length; i++) {
          if (typeof curr[i] === 'number' || !isNaN(parseFloat(curr[i]))) {
            const value = parseFloat(curr[i]);
            const existingValue = parseFloat(acc[existingIndex][i]);
            let result: number;
            switch (type) {
              case "sum":
                result = existingValue + value;
                break;
              case "average":
                result = (existingValue + value) / 2;
                break;
              case "count":
                result = existingValue + 1;
                break;
              default:
                result = existingValue;
            }
            acc[existingIndex][i] = result.toFixed(5).replace(/\.?0+$/, '');
          }
        }
      }
      return acc;
    }, []);
  }, []);

  const displayData = useMemo(() => {
    return aggregateData(scoreData, aggregationType);
  }, [scoreData, aggregationType, aggregateData]);

  const handleAggregationChange = (type: string) => {
    setAggregationType(type);
  };

  return (
    <div id="scorecard-container">
      <div id="scorecard-for-publish">
        <ScoreCardDisplay
          headers={headers}
          scoreData={displayData}
          cardColor={cardColor}
          titleAlignment={titleAlignment}
          sourceName={sourceName}
          sourceURL={sourceURL}
          chartTitle={chartTitle}
          showTrend={showTrend}
          showComparison={showComparison}
          showStatus={showStatus}
          showProgressBar={showProgressBar}
          cardLayout={cardLayout}
          useConditionalFormatting={useConditionalFormatting}
          thresholds={thresholds}
          useCustomIcons={useCustomIcons}
          iconSet={iconSet}
        />
      </div>
      <div className="mb-4 flex items-center">
        <label htmlFor="aggregation-type" className="mr-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          Aggregation:
        </label>
        <select
          id="aggregation-type"
          value={aggregationType}
          onChange={(e) => handleAggregationChange(e.target.value)}
          className="w-auto p-1 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-black dark:focus:ring-primary dark:focus:border-primary"
        >
          <option value="none">None</option>
          <option value="sum">Sum</option>
          <option value="average">Avg</option>
          <option value="count">Count</option>
        </select>
      </div>
      <ScorecardDataTable
        onDataChange={handleDataChange}
        projectId={projectId}
        chartType={chartType}
      />
    </div>
  );
};

export default ScoreCardWithTable;