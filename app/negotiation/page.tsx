import NegotiationClientPage from '@/features/negotiation/components/NegotiationClientPage'
import { getInflationData } from '@/services/inflation'

export default async function Page() {
  const inflationData = await getInflationData()
  return <NegotiationClientPage inflationData={inflationData} />
}
