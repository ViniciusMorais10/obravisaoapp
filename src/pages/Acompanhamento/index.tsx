import { useParams } from 'react-router-dom'
import { Building2, AlertTriangle, Calendar, Camera } from 'lucide-react'
import { usePublicWork, usePublicUpdates, usePublicStages } from '../../services/public-share'

const statusLabel: Record<string, string> = {
  planejada: 'Planejada',
  em_andamento: 'Em andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

const stageStatusLabel: Record<string, string> = {
  nao_iniciada: 'Não iniciada',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
}

export default function Acompanhamento() {
  const { token } = useParams<{ token: string }>()
  const { data: work, isLoading, isError } = usePublicWork(token)
  const { data: updates } = usePublicUpdates(work?.id)
  const { data: stages } = usePublicStages(work?.id)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    )
  }

  if (!work || isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto h-10 w-10 text-orange-500" />
          <p className="mt-4 text-sm font-medium text-gray-800">Link indisponível</p>
          <p className="mt-1 text-xs text-gray-500">Este link de acompanhamento não está mais disponível ou foi desativado. Entre em contato com o responsável pela obra.</p>
        </div>
      </div>
    )
  }

  const progress = stages?.length
    ? Math.round(stages.reduce((s, st) => s + st.percentage, 0) / stages.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{work.name}</h1>
            {work.client && <p className="text-xs text-gray-500">Cliente: {work.client}</p>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        {/* Status + progresso */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Progresso da obra</p>
              <p className="text-3xl font-bold text-gray-900">{progress}%</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {statusLabel[work.status] ?? work.status}
            </span>
          </div>
          <div className="mt-3 h-2.5 w-full rounded-full bg-gray-100">
            <div className="h-2.5 rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          {(work.start_date || work.expected_end_date) && (
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="h-3.5 w-3.5" />
              {work.start_date && <span>Início: {new Date(work.start_date).toLocaleDateString('pt-BR')}</span>}
              {work.start_date && work.expected_end_date && <span>•</span>}
              {work.expected_end_date && <span>Previsão: {new Date(work.expected_end_date).toLocaleDateString('pt-BR')}</span>}
            </div>
          )}
        </div>

        {/* Etapas */}
        {stages && stages.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold text-gray-800">Etapas</h2>
            <div className="mt-3 space-y-2">
              {stages.map((stage) => (
                <div key={stage.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800">{stage.name}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      {stageStatusLabel[stage.status] ?? stage.status}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{stage.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Atualizações */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-800">Últimas atualizações</h2>
          {!updates?.length ? (
            <p className="mt-3 text-sm text-gray-400">Nenhuma atualização registrada ainda.</p>
          ) : (
            <div className="mt-3 space-y-4">
              {updates.map((upd) => (
                <div key={upd.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm text-gray-800">{upd.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {upd.author_name && <span className="font-medium text-gray-600">{upd.author_name}</span>}
                    <span>{new Date(upd.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  {upd.photo_url && (
                    <div className="mt-2 overflow-hidden rounded-lg border border-gray-100">
                      <img src={upd.photo_url} alt="" className="w-full max-w-md object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Galeria de fotos */}
        {updates && updates.filter((u) => u.photo_url).length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Fotos</h2>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {updates.filter((u) => u.photo_url).map((u) => (
                <a key={u.id} href={u.photo_url!} target="_blank" rel="noopener noreferrer" className="aspect-square overflow-hidden rounded-lg border border-gray-100 hover:opacity-80 transition-opacity">
                  <img src={u.photo_url!} alt="" className="h-full w-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">Acompanhamento gerado por ObraVisão</p>
      </main>
    </div>
  )
}
