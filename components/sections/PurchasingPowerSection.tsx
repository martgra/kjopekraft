// components/sections/PurchasingPowerSection.tsx
'use client';

import React from 'react';
import PayPointsManager from '@/components/features/PayPointsManager';
import PayDevelopmentChart from '@/components/features/PayDevelopmentChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import SalaryStats from '@/components/ui/SalaryStats';
import { useSalaryCalculations } from '@/lib/hooks/useSalaryCalculations';

export default function PurchasingPowerSection() {
  // Use our custom hook for all salary calculations
  const { statistics, hasData, isLoading } = useSalaryCalculations();

  // Extract statistics using destructuring and apply proper formatting
  // For empty state, we'll use placeholders
  const displayStats = {
    startingPay: hasData ? statistics.startingPay : '--',
    latestPay: hasData ? statistics.latestPay : '--',
    inflationAdjustedPay: hasData ? statistics.inflationAdjustedPay : '--',
    gapPercent: hasData ? statistics.gapPercent : '--'
  };

  return (
    <section
      id="kjøpekraft"
      className="py-16 px-6 bg-gray-50 flex flex-col items-center space-y-12"
    >
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">
          Din lønnsutvikling vs. inflasjon
        </h2>
      </header>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="w-full max-w-5xl flex justify-center p-6 bg-white rounded-xl shadow-lg">
          <LoadingSpinner size="medium" text="Loading statistics..." />
        </div>
      ) : (
        <SalaryStats
          startingPay={displayStats.startingPay}
          latestPay={displayStats.latestPay}
          inflationAdjustedPay={displayStats.inflationAdjustedPay}
          gapPercent={displayStats.gapPercent}
        />
      )}

      {/* Chart + Input */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8">
        {/* Chart */}
        <div className="flex-1 bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="h-[60vh]">
            {/* chart now gets data from context directly */}
            <PayDevelopmentChart />
          </div>
        </div>

        {/* Sidebar Input */}
        <aside className="w-full lg:w-1/3 bg-white shadow-lg rounded-xl p-6 space-y-4">
          <h3 className="text-xl font-medium text-gray-700">
            Legg til lønnspunkter
          </h3>
          <PayPointsManager />
        </aside>
      </div>
    </section>
  );
}
