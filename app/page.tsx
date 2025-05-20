// Server component for Home page
import { HomeClient } from './HomeClient'
import { getInflationData } from '@/lib/models/getInflationData'

export default async function Page() {
  // Fetch inflation data on the server
  const inflationData = await getInflationData()
  // Render the client Home component with SSR inflation data
  return <HomeClient inflationData={inflationData} />
}
