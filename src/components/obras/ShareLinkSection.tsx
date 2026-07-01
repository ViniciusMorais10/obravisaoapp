import { useState } from 'react'
import { Link2, Copy, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'
import { useShareLink, useGenerateLink, useDeactivateLink } from '../../services/share-links'

export default function ShareLinkSection({ workId }: { workId: string }) {
  const { organization } = useAuth()
  const { data: link, isLoading } = useShareLink(workId)
  const generateLink = useGenerateLink()
  const deactivateLink = useDeactivateLink()
  const [copied, setCopied] = useState(false)

  const publicUrl = link ? `${window.location.origin}/atualizar/${link.token}` : ''

  async function handleGenerate() {
    await generateLink.mutateAsync({ organizationId: organization!.id, workId })
    toast.success('Link gerado com sucesso.')
  }

  async function handleDeactivate() {
    if (!link) return
    await deactivateLink.mutateAsync(link.id)
    toast.success('Link desativado.')
  }

  function handleCopy() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    toast.success('Link copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) return null

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-slate-700" />
        <h2 className="font-semibold text-gray-800">Link de RDO da obra</h2>
      </div>
      <p className="mt-1 text-xs text-gray-500">Envie este link para quem precisa registrar RDOs desta obra. A pessoa não terá acesso ao painel completo.</p>

      {link ? (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <input readOnly value={publicUrl} className="flex-1 truncate bg-transparent text-sm text-gray-700 outline-none" />
            <button onClick={handleCopy} className="shrink-0 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
              {copied ? <CheckCircle2 className="h-4 w-4" /> : <><Copy className="inline h-3.5 w-3.5" /> Copiar</>}
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDeactivate} disabled={deactivateLink.isPending} className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              <XCircle className="h-3.5 w-3.5" /> Desativar link
            </button>
            <button onClick={handleGenerate} disabled={generateLink.isPending} className="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">
              <RefreshCw className="h-3.5 w-3.5" /> Gerar novo link
            </button>
          </div>
        </div>
      ) : (
        <button onClick={handleGenerate} disabled={generateLink.isPending} className="mt-4 flex items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
          <Link2 className="h-4 w-4" /> {generateLink.isPending ? 'Gerando...' : 'Gerar link de RDO'}
        </button>
      )}
    </section>
  )
}
