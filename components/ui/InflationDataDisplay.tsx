'use client';

import React, { useState, useEffect } from 'react';
import { InflationDataPoint } from '@/lib/models/inflation';
import { TEXT } from '@/lib/constants/text';

interface InflationDataDisplayProps {
  data: InflationDataPoint[];
}

export default function InflationDataDisplay({ data: inflationData }: InflationDataDisplayProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  if (!inflationData || inflationData.length === 0) {
    return (
      <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
        <h3 className="text-sm font-medium text-yellow-900">{TEXT.inflation.noDataTitle}</h3>
        <p className="text-sm text-yellow-800 mt-1">
          {TEXT.inflation.noDataMessage}
        </p>
      </div>
    );
  }

  // Sort descending by year and take the latest entry
  const latestData = [...inflationData].sort((a, b) => b.year - a.year)[0];

  return (
    <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-md">
      <h3 className="text-sm font-medium text-blue-900">{TEXT.inflation.title}</h3>
      <p className="text-sm text-blue-800 mt-1">
        {TEXT.inflation.latestData.replace('{year}', String(latestData.year)).replace('{inflation}', latestData.inflation.toFixed(1))}
      </p>
      <details className="mt-3">
        <summary className="text-xs text-blue-800 font-medium cursor-pointer hover:text-blue-900 hover:underline focus:outline-none">
          {TEXT.inflation.showAllYears.replace('{count}', String(inflationData.length))}
        </summary>
        <div className="mt-3 bg-white rounded-md shadow-sm md:overflow-y-auto md:max-h-48">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-blue-900 bg-blue-100">
                <th className="text-left p-1 font-medium">{TEXT.inflation.yearHeader}</th>
                <th className="text-right p-1 font-medium">{TEXT.inflation.inflationHeader}</th>
              </tr>
            </thead>
            <tbody>
              {inflationData
                .slice()
                .sort((a, b) => b.year - a.year)
                .map(item => (
                  <tr
                    key={item.year}
                    className="border-t border-blue-200 hover:bg-blue-200 transition-colors"
                  >
                    <td className="p-1 text-blue-900 font-medium">{item.year}</td>
                    <td className="text-right p-1 text-blue-900 font-medium">
                      {item.inflation.toFixed(1)}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
