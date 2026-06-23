import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import AssinaturaExpirada from '../../pages/AssinaturaExpirada'

export default function SubscriptionGuard() {
  const { isBlocked, isLoading } = useSubscription()

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-800">
        <Building2 className="h-10 w-10 animate-pulse text-white" />
        <p className="mt-4 text-lg font-semibold text-white">ObraVisão</p>
        <p className="mt-2 text-sm text-slate-400">Verificando assinatura...</p>
      </div>
    )
  }

  if (isBlocked) return <AssinaturaExpirada />

  return <Outlet />
}
