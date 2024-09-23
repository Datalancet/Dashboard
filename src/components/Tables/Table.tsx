"use client"

import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, ResponsiveContainer, Cell } from 'recharts';

interface TableChartDisplayProps {
  headers: string[];
  tableData: (string | number)[][];
  tableColor: string;
  titleAlignment: "left" | "center" | "right";
  sourceName: string;
  sourceURL: string;
  chartTitle: string;
  showBorders: boolean;
  alternateRowColor: boolean;
  logoPosition: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showLogo: boolean;
  logoUrl: string;
  showMiniCharts: boolean;
  showSearch: boolean;
}

const TableChartDisplay: React.FC<TableChartDisplayProps> = ({
  headers,
  tableData,
  tableColor,
  titleAlignment,
  sourceName,
  sourceURL,
  chartTitle,
  showBorders,
  alternateRowColor,
  logoPosition = 'top-right',
  logoUrl = '/favicon.ico',
  showLogo = true,
  showMiniCharts = false,
  showSearch = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(tableData);

  useEffect(() => {
    if (showSearch && searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const filtered = tableData.filter(row =>
        row.some((cell: string | number) => 
          cell.toString().toLowerCase().includes(lowercasedTerm)
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(tableData);
    }
  }, [searchTerm, tableData, showSearch]);

  const getLogoStyle = (position: string) => {
    const base = {
      position: 'absolute' as const,
      width: '20px',
      height: '20px',
    };
    switch (position) {
      case 'top-right':
        return { ...base, top: '-30px', right: '-20px' };
      case 'top-left':
        return { ...base, top: '-30px', left: '-20px' };
      case 'bottom-right':
        return { ...base, bottom: '-30px', right: '-20px' };
      case 'bottom-left':
        return { ...base, bottom: '-30px', left: '-20px' };
      default:
        return { ...base, top: '-30px', right: '-20px' };
    }
  };

  const logoStyle = getLogoStyle(logoPosition);

  const isNumeric = (value: any) => !isNaN(parseFloat(value)) && isFinite(value);

  const getColumnData = (columnIndex: number) => {
    return tableData.map(row => parseFloat(row[columnIndex] as string)).filter(isNumeric);
  };

  const calculateDifferences = (data: number[]) => {
    return data.slice(1).map((value, index) => value - data[index]);
  };

  const renderMiniChart = (columnIndex: number) => {
    const data = getColumnData(columnIndex);
    const differences = calculateDifferences(data);
    const chartData = differences.map((value, index) => ({ name: index, value }));
    
    const minValue = Math.min(...differences);
    const maxValue = Math.max(...differences);
    const absMax = Math.max(Math.abs(minValue), Math.abs(maxValue));
    
    const lastDifference = differences.length > 0 ? differences[differences.length - 1] : null;
    
    return (
        <div style={{ display: 'flex', alignItems: 'center', height: '30px' }}>
        <span style={{ fontSize: '10px', marginRight: '5px', width: '30px', textAlign: 'right' }}>
          {lastDifference !== null ? lastDifference.toFixed(2) : 'N/A'}
        </span>
        <div style={{ flex: 1, display: 'flex' }}>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="50%" height={30}>
                <BarChart data={chartData}>
                  <Bar dataKey="value" fill={tableColor}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value >= 0 ? tableColor : '#FF0000'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="50%" height={30}>
                <LineChart data={chartData}>
                  <Line type="monotone" dataKey="value" stroke={tableColor} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </>
          ) : (
            <span style={{ fontSize: '10px', color: '#999' }}>Insufficient data</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
      <div style={{ position: 'relative' }}>
        <h2 style={{ textAlign: titleAlignment, marginBottom: '20px', color: tableColor }}>
          {chartTitle}
        </h2>
        {showSearch && (
          <div className="mb-4 flex justify-start">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/3 p-1 text-xs border border-gray-300 rounded"
              style={{ maxWidth: '200px' }}
            />
          </div>
        )}
        <table style={{
          width: '100%',
          borderCollapse: showBorders ? 'collapse' : 'separate',
          borderSpacing: showBorders ? '0' : '2px',
        }}>
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index} style={{
                  padding: '10px',
                  backgroundColor: tableColor,
                  color: 'white',
                  border: showBorders ? `1px solid ${tableColor}` : 'none'
                }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
        {filteredData.map((row, rowIndex) => (
          <tr key={rowIndex} style={{
            backgroundColor: alternateRowColor && rowIndex % 2 === 0 ? '#f2f2f2' : 'white'
          }}>
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} style={{
                padding: '10px',
                border: showBorders ? `1px solid ${tableColor}` : 'none'
              }}>
                {cell}
                {showMiniCharts && isNumeric(cell) && cellIndex > 0 && (
                  <div style={{ marginTop: '5px' }}>
                    {renderMiniChart(cellIndex)}
                  </div>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
        </table>
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

export default TableChartDisplay;