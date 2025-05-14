// app/page.tsx
import PurchasingPowerSection from '@/components/sections/PurchasingPowerSection';
import { PayPointsProvider } from '@/components/context/PayPointsContext';
import { DEFAULT_SALARY } from '@/lib/constants';

export default function Home() {
  // seed with initial points using constants
  const initialPoints = [
    { year: 2015, pay: DEFAULT_SALARY },
    { year: 2023, pay: DEFAULT_SALARY },
  ];

  return (
    <PayPointsProvider initialPoints={initialPoints}>
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <PurchasingPowerSection />
      </div>
    </PayPointsProvider>
  );
}
