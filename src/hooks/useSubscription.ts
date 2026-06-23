import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { useSubscriptionQuery } from '../services/subscriptions'

export function useSubscription() {
  const { organization } = useAuth()
  const { data: subscription, isLoading } = useSubscriptionQuery(organization?.id)

  const result = useMemo(() => {
    if (!subscription) return { subscription: null, isBlocked: false, daysLeft: 0, isLoading: true }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const trialEnd = new Date(subscription.trial_end + 'T00:00:00')
    const paidUntil = subscription.paid_until ? new Date(subscription.paid_until + 'T00:00:00') : null
    const graceUntil = subscription.grace_period_until ? new Date(subscription.grace_period_until + 'T00:00:00') : null

    let isBlocked = false
    let daysLeft = 0

    switch (subscription.status) {
      case 'trial':
        daysLeft = Math.ceil((trialEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        isBlocked = today > trialEnd
        break
      case 'active':
        if (paidUntil) {
          daysLeft = Math.ceil((paidUntil.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }
        isBlocked = false
        break
      case 'past_due':
        isBlocked = graceUntil ? today > graceUntil : true
        break
      case 'cancelled':
      case 'expired':
        isBlocked = true
        break
    }

    return { subscription, isBlocked, daysLeft, isLoading: false }
  }, [subscription])

  return { ...result, isLoading: isLoading || result.isLoading }
}
