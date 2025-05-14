'use client';

interface StatsCardProps {
  label: string;
  value: number | string;
}

function StatsCard({ label, value }: StatsCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <p className="text-xl font-semibold text-gray-900">
        {value === '--' ? value : typeof value === 'number' ? value.toLocaleString('nb-NO') : value}
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
    <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6">
      {cards.map(({ label, value }) => (
        <StatsCard key={label} label={label} value={value} />
      ))}
    </div>
  );
}
