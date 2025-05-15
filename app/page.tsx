// app/page.tsx
import PurchasingPowerSection from '@/components/sections/PurchasingPowerSection';
import { PayPointsProvider } from '@/components/context/PayPointsContext';
import { DEFAULT_SALARY } from '@/lib/constants';
import { getCachedInflationData } from '@/app/actions/getInflation';
import { InflationDataPoint } from '@/lib/models/inflation';

// This function pre-loads data for the entire page using server components
async function getInflationServerData() {
  try {
    // Pre-fetch inflation data on the server
    const data = await getCachedInflationData();
    return { inflationData: data };
  } catch (error) {
    console.error('Failed to pre-fetch inflation data:', error);
    return { inflationData: [] as InflationDataPoint[] };
  }
}

export default async function Home() {
  // Get inflation data from server
  const { inflationData } = await getInflationServerData();
  
  // Get the current year and minimum year from inflation data
  const currentYear = new Date().getFullYear();
  const minYear = inflationData.length > 0
    ? Math.min(...inflationData.map(d => d.year))
    : 2015; // Fallback to 2015 if no inflation data
  
  // seed with initial points using dynamic min year and current year
  const initialPoints = [
    { year: minYear, pay: DEFAULT_SALARY },
    { year: currentYear, pay: DEFAULT_SALARY },
  ];

  return (
    <PayPointsProvider initialPoints={initialPoints} preloadedInflationData={inflationData}>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gray-50">
        <PurchasingPowerSection />
      </div>
    </PayPointsProvider>
  );
}
