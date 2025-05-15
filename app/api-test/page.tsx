'use client';

import React, { useEffect, useState } from 'react';
import { getInflationData } from '@/app/actions/getInflation';
import { InflationDataPoint } from '@/lib/models/inflation';
import { INFLATION_DATA } from '@/lib/constants';

export default function ApiTest() {
  const [apiData, setApiData] = useState<InflationDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getInflationData();
        setApiData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const constantsData = INFLATION_DATA;

  // Compare API data with constants
  const hasMoreYears = apiData.length > constantsData.length;
  const latestYearApi = apiData.length > 0 ? Math.max(...apiData.map(d => d.year)) : 0;
  const latestYearConstants = constantsData.length > 0 
    ? Math.max(...constantsData.map(d => d.year)) 
    : 0;
  const hasNewerData = latestYearApi > latestYearConstants;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Inflation API Test</h1>
      
      {isLoading ? (
        <div className="p-4 bg-blue-50 rounded-md">Loading data from API...</div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-medium text-green-800 mb-2">
              Success! API returned {apiData.length} years of inflation data
            </h2>
            <p className="text-sm text-green-700">
              Latest year from API: {latestYearApi} with {apiData.find(d => d.year === latestYearApi)?.inflation.toFixed(1)}% inflation
            </p>
            {hasMoreYears && (
              <p className="text-sm text-green-700 mt-1">
                The API has {apiData.length - constantsData.length} more years of data than hardcoded constants
              </p>
            )}
            {hasNewerData && (
              <p className="text-sm text-green-700 mt-1 font-medium">
                The API has data for {latestYearApi - latestYearConstants} years newer than hardcoded constants
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-white shadow-md rounded-md">
              <h2 className="text-lg font-medium mb-2">API Data ({apiData.length} years)</h2>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Year</th>
                      <th className="p-2 text-right">Inflation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiData.sort((a, b) => b.year - a.year).map(item => (
                      <tr key={`api-${item.year}`} className="border-t">
                        <td className="p-2">{item.year}</td>
                        <td className="p-2 text-right">{item.inflation.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 bg-white shadow-md rounded-md">
              <h2 className="text-lg font-medium mb-2">Constants Data ({constantsData.length} years)</h2>
              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left">Year</th>
                      <th className="p-2 text-right">Inflation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {constantsData.sort((a, b) => b.year - a.year).map(item => (
                      <tr key={`constant-${item.year}`} className="border-t">
                        <td className="p-2">{item.year}</td>
                        <td className="p-2 text-right">{item.inflation.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
