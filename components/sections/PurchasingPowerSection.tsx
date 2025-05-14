// components/sections/PurchasingPowerSection.tsx
'use client';

import React from 'react';
import PayPointsManager from '@/components/features/PayPointsManager';
import PayDevelopmentChart from '@/components/features/PayDevelopmentChart';
import SalaryStats from '@/components/ui/SalaryStats';
import { usePayPoints } from '@/components/context/PayPointsContext';
import { calculateSalaryStatistics } from '@/lib/salaryCalculations';

export default function PurchasingPowerSection() {
  // Use the context instead of local state
  const { payPoints } = usePayPoints();

  // Calculate statistics using our business logic
  const { startingPay, latestPay, inflationAdjustedPay, gapPercent } = 
    payPoints.length > 0 
      ? calculateSalaryStatistics(payPoints)
      : { startingPay: '--', latestPay: '--', inflationAdjustedPay: '--', gapPercent: '--' };

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
      <SalaryStats
        startingPay={startingPay}
        latestPay={latestPay}
        inflationAdjustedPay={inflationAdjustedPay}
        gapPercent={gapPercent}
      />

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
