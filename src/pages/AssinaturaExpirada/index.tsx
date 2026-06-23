import { AlertTriangle, MessageCircle, CreditCard, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'

const WHATSAPP_NUMBER = '5561996082955'
const WHATSAPP_MESSAGE = encodeURIComponent('Olá! Gostaria de regularizar minha assinatura do ObraVisão.')

export default function AssinaturaExpirada() {
  const { signOut, organization } = useAuth()
  const { subscription } = useSubscription()

  const statusMessage = () => {
    if (!subscription) return 'Sua assinatura não foi encontrada.'
    switch (subscription.status) {
      case 'trial':
        return 'Seu período de teste gratuito expirou.'
      case 'past_due':
        return 'Seu pagamento está pendente e o prazo de tolerância expirou.'
      case 'cancelled':
        return 'Sua assinatura foi cancelada.'
      case 'expired':
        return 'Sua assinatura expirou.'
      default:
        return 'Sua assinatura não está ativa.'
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Acesso expirado</h1>
          {organization && (
            <p className="mt-1 text-sm text-gray-500">{organization.name}</p>
          )}
          <p className="mt-3 text-gray-600">{statusMessage()}</p>
          <p className="mt-2 text-sm text-gray-500">
            Seus dados estão seguros. Regularize sua assinatura para voltar a usar o sistema.
          </p>
        </div>

        <div className="space-y-3">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </a>

          <button
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <CreditCard className="h-5 w-5" />
            Pagar assinatura (em breve)
          </button>

          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm text-gray-500 transition hover:text-gray-700"
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}
