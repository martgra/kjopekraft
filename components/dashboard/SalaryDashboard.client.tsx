'use client';

import React from 'react';
import { useInflation } from '@/features/inflation/hooks/useInflation';
import { useSalaryPoints } from '@/features/paypoints/hooks/useSalaryPoints';
import { useSalaryCalculations } from '@/features/paypoints/hooks/useSalaryCalculations';
import { TEXT } from '@/lib/constants/text';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ResponsiveChartWrapper from '@/components/ui/ResponsiveChartWrapper';
import PayDevelopmentChart from '@/components/charts/PayDevelopmentChart';
import PayPointsManager from '@/features/paypoints/PayPointsManager';
import InflationDataDisplay from '@/components/ui/InflationDataDisplay';
import SalaryStats from '@/components/stats/SalaryStats';
import MobilePayChart from '@/components/charts/MobilePayChart';
export default function SalaryDashboard() {
  // Fetch inflation data via SWR
  const { data: inflationData = [], error: infError, isLoading: infLoading } = useInflation();

  // Manage salary points in localStorage once inflationData is ready
  const {
    payPoints,
    addPoint,
    removePoint,
    editPoint,
    resetPoints,
    validatePoint,
    isLoading: ptsLoading,
  } = useSalaryPoints(inflationData);

  // Derive salary statistics
  const {
    statistics,
    hasData,
    isLoading: statsLoading,
  } = useSalaryCalculations(payPoints, inflationData);

  // Global loading or error
  if (infLoading || ptsLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner size="large" text={TEXT.common.loadingData} />
      </div>
    );
  }
  if (infError) {
    return <div>{TEXT.common.error}</div>;
  }

  // Display stats fallback
  const displayStats = {
    startingPay: hasData ? statistics.startingPay : '--',
    latestPay: hasData ? statistics.latestPay : '--',
    inflationAdjustedPay: hasData ? statistics.inflationAdjustedPay : '--',
    gapPercent: hasData ? statistics.gapPercent : '--',
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 px-4 sm:px-6 bg-gray-50 flex flex-col items-center space-y-8 sm:space-y-12 w-full h-full">
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-center items-center">
        <h2 className="text-2xl sm:text-4xl text-center font-semibold text-gray-800">
          {TEXT.dashboard.title}
        </h2>
      </header>

      {/* Stats Cards */}
      <div className="w-full max-w-5xl">
        <SalaryStats
          startingPay={displayStats.startingPay}
          latestPay={displayStats.latestPay}
          inflationAdjustedPay={displayStats.inflationAdjustedPay}
          gapPercent={displayStats.gapPercent}
        />
      </div>

      {/* Chart + Input */}
      <div className="w-full h-full max-w-5xl flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Chart area */}
        <div className="flex-1 bg-white shadow-xl rounded-xl flex flex-col">
          <div className="flex-grow h-full p-0">
            <ResponsiveChartWrapper
              mobileBreakpoint={768}
                mobileView={
    <MobilePayChart
      payPoints={payPoints}
      inflationData={inflationData}
    />
  }
              className="w-full"
            >
              <PayDevelopmentChart
                payPoints={payPoints}
                inflationData={inflationData}
              />
            </ResponsiveChartWrapper>
          </div>
        </div>

        {/* Sidebar Input */}
        <aside className="w-full lg:w-1/3 bg-white shadow-lg rounded-xl p-3 sm:p-4 space-y-3 sm:space-y-4">
          <h3 className="text-lg sm:text-xl font-medium text-gray-700">
            {TEXT.dashboard.addPointsTitle}
          </h3>
          <PayPointsManager
            payPoints={payPoints}
            onAdd={addPoint}
            onRemove={removePoint}
            onEdit={editPoint}
            onReset={resetPoints}
            validatePoint={validatePoint}
            isLoading={ptsLoading}
            inflationData={inflationData}
          />
          <InflationDataDisplay data={inflationData} />
        </aside>
      </div>
    </section>
  );
}