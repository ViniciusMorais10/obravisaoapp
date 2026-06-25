import { useState } from 'react'
import { Eye, Copy, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useEnablePublicShare, useDisablePublicShare, useRegeneratePublicShare } from '../../services/public-share'

interface Props {
  workId: string
  publicShareEnabled: boolean
  publicShareToken: string | null
}

export default function PublicShareSection({ workId, publicShareEnabled, publicShareToken }: Props) {
  const enable = useEnablePublicShare()
  const disable = useDisablePublicShare()
  const regenerate = useRegeneratePublicShare()
  const [copied, setCopied] = useState(false)

  const publicUrl = publicShareToken ? `${window.location.origin}/acompanhamento/${publicShareToken}` : ''

  async function handleEnable() {
    await enable.mutateAsync(workId)
    toast.success('Link de acompanhamento ativado.')
  }

  async function handleDisable() {
    await disable.mutateAsync(workId)
    toast.success('Link de acompanhamento desativado.')
  }

  async function handleRegenerate() {
    await regenerate.mutateAsync(workId)
    toast.success('Novo link gerado com sucesso.')
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Eye className="h-5 w-5 text-slate-700" />
        <h2 className="font-semibold text-gray-800">Link de acompanhamento</h2>
      </div>
      <p className="mt-1 text-xs text-gray-500">Compartilhe com o cliente para que ele acompanhe as atualizações e fotos da obra sem precisar criar conta.</p>

      {publicShareEnabled && publicShareToken ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <input readOnly value={publicUrl} className="flex-1 truncate bg-transparent text-sm text-gray-700 outline-none" />
            <button onClick={handleCopy} className="shrink-0 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <><Copy className="inline h-3.5 w-3.5" /> Copiar</>}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleDisable} disabled={disable.isPending} className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              <XCircle className="h-3.5 w-3.5" /> Desativar
            </button>
            <button onClick={handleRegenerate} disabled={regenerate.isPending} className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              <RefreshCw className="h-3.5 w-3.5" /> Gerar novo link
            </button>
          </div>
        </div>
      ) : (
        <button onClick={handleEnable} disabled={enable.isPending} className="mt-4 flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
          <Eye className="h-4 w-4" /> {enable.isPending ? 'Gerando...' : 'Gerar link de acompanhamento'}
        </button>
      )}
    </section>
  )
}
