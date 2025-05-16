'use client';

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
    <div className="flex flex-col bg-white rounded-xl shadow-md p-3 sm:p-4 stat-card">
      <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
        {formattedValue}
      </p>
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
    { label: 'Startlønn', value: startingPay },
    { label: 'Nåværende lønn', value: latestPay },
    { label: 'Inflasjonsjustert', value: inflationAdjustedPay },
    { label: 'Gap (%)', value: gapPercent },
  ];

  return (
    <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
      {cards.map(({ label, value }) => (
        <StatsCard key={label} label={label} value={value} />
      ))}
    </div>
  );
}
