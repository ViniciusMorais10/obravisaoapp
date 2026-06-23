import { Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'

export default function SubscriptionBanner() {
  const { subscription, daysLeft } = useSubscription()

  if (!subscription) return null

  if (subscription.status === 'trial') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <Clock className="h-4 w-4 shrink-0" />
        <span>Seu teste gratuito termina em <strong>{daysLeft} {daysLeft === 1 ? 'dia' : 'dias'}</strong></span>
      </div>
    )
  }

  if (subscription.status === 'active') {
    const paidUntil = subscription.paid_until
      ? new Date(subscription.paid_until + 'T00:00:00').toLocaleDateString('pt-BR')
      : null
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>Plano ativo{paidUntil ? ` até ${paidUntil}` : ''}</span>
      </div>
    )
  }

  if (subscription.status === 'past_due') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Pagamento pendente — regularize para não perder o acesso</span>
      </div>
    )
  }

  return null
}
