'use client';

import { TEXT } from '@/lib/constants/text';

interface StatsCardProps {
  label: string;
  value: number | string;
}

function StatsCard({ label, value }: StatsCardProps) {
  // Format the value based on its type and value
  const formattedValue = (() => {
    if (value === '--' || value === undefined || value === null) return '--';
    if (typeof value === 'number') {
      if (isNaN(value)) return '--';
      return value.toLocaleString('nb-NO');
    }
    return value;
  })();

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md p-3 sm:p-4 stat-card h-full">
      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <div className="flex items-center h-7 sm:h-8">
        <p className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
          {formattedValue}
        </p>
      </div>
    </div>
  );
}

interface SalaryStatsProps {
  startingPay: number | string;
  latestPay: number | string;
  inflationAdjustedPay: number | string;
  gapPercent: number | string;
}

export default function SalaryStats({ 
  startingPay, 
  latestPay, 
  inflationAdjustedPay, 
  gapPercent 
}: SalaryStatsProps) {
  const cards = [
    { label: TEXT.stats.startingSalary, value: startingPay },
    { label: TEXT.stats.currentSalary, value: latestPay },
    { label: TEXT.stats.inflationAdjusted, value: inflationAdjustedPay },
    { label: TEXT.stats.gap, value: gapPercent },
  ];

  return (
    <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {cards.map(({ label, value }) => (
        <StatsCard key={label} label={label} value={value} />
      ))}
    </div>
  );
}
