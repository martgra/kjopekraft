// Server component for Home page
import Dashboard from '@/components/dashboard/Dashboard'
import { getInflationData } from '@/lib/models/getInflationData'

export default async function Page() {
  // Fetch inflation data on the server
  const inflationData = await getInflationData()
  // Render the new Dashboard component with SSR inflation data
  return <Dashboard inflationData={inflationData} />
}
