'use client';

import React, { useEffect, useState } from 'react';
import { usePayPoints } from '@/components/context/PayPointsContext';
import { InflationDataPoint } from '@/lib/models/inflation';

export default function InflationDataDisplay() {
  const { inflationData } = usePayPoints();
  const [isClient, setIsClient] = useState(false);
  
  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // If not on client yet, show nothing (avoid hydration mismatch)
  if (!isClient) return null;
  
  // If no inflation data, show a message
  if (!inflationData || inflationData.length === 0) {
    return (
      <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-md">
        <h3 className="text-sm font-medium text-yellow-900">Ingen inflasjonsdata</h3>
        <p className="text-sm text-yellow-800 mt-1">
          Kunne ikke laste inflasjonsdata fra SSB API. Bruker forhåndsdefinerte verdier.
        </p>
      </div>
    );
  }

  // Find the latest year with inflation data
  const latestData = [...inflationData].sort((a, b) => b.year - a.year)[0];
  
  return (
    <div className="mt-6 p-4 bg-blue-100 border border-blue-300 rounded-md">
      <h3 className="text-sm font-medium text-blue-900">Inflasjonsdata fra SSB</h3>
      <p className="text-sm text-blue-800 mt-1">
        Siste år: {latestData.year} med inflasjon {latestData.inflation.toFixed(1)}%
      </p>
      <details className="mt-3">
        <summary className="text-xs text-blue-800 font-medium cursor-pointer hover:text-blue-900 hover:underline focus:outline-none">
          Vis alle år ({inflationData.length})
        </summary>
        <div className="mt-3 overflow-y-auto max-h-48 bg-white rounded-md shadow-sm">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-blue-900 bg-blue-100">
                <th className="text-left p-1 font-medium">År</th>
                <th className="text-right p-1 font-medium">Inflasjon (%)</th>
              </tr>
            </thead>
            <tbody>
              {[...inflationData]
                .sort((a, b) => b.year - a.year)
                .map(item => (
                  <tr 
                    key={item.year} 
                    className="border-t border-blue-200 hover:bg-blue-200 transition-colors"
                  >
                    <td className="p-1 text-blue-900 font-medium">{item.year}</td>
                    <td className="text-right p-1 text-blue-900 font-medium">{item.inflation.toFixed(1)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
