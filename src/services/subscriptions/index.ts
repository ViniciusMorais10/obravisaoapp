import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Subscription } from '../../types'

export async function getSubscription(organizationId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .single()

  if (error) throw error
  return data as Subscription
}

export function useSubscriptionQuery(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['subscription', organizationId],
    queryFn: () => getSubscription(organizationId!),
    enabled: !!organizationId,
  })
}
