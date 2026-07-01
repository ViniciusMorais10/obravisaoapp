import { useParams } from 'react-router-dom'
import { Building2, AlertTriangle, Calendar, Camera, FileText } from 'lucide-react'
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

  // Collect all photos from updates
  const allPhotos: { url: string; description: string; date: string }[] = []
  updates?.forEach((upd) => {
    const date = upd.report_date
      ? new Date(upd.report_date + 'T12:00:00').toLocaleDateString('pt-BR')
      : new Date(upd.created_at).toLocaleDateString('pt-BR')
    if (upd.photo_url) allPhotos.push({ url: upd.photo_url, description: upd.description, date })
    if (upd.photo_urls) {
      upd.photo_urls.forEach((url: string) => {
        if (url !== upd.photo_url) allPhotos.push({ url, description: upd.description, date })
      })
    }
  })

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

        {/* RDOs - Linha do tempo */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-600" />
            <h2 className="font-semibold text-gray-800">RDO / Diário da Obra</h2>
          </div>
          {!updates?.length ? (
            <p className="mt-3 text-sm text-gray-400">Nenhum registro diário disponível.</p>
          ) : (
            <div className="mt-4 relative">
              {/* Timeline line */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

              <div className="space-y-6">
                {updates.map((upd) => {
                  const displayDate = upd.report_date
                    ? new Date(upd.report_date + 'T12:00:00').toLocaleDateString('pt-BR')
                    : new Date(upd.created_at).toLocaleDateString('pt-BR')

                  const photos: string[] = []
                  if (upd.photo_url) photos.push(upd.photo_url)
                  if (upd.photo_urls) upd.photo_urls.forEach((url: string) => { if (url !== upd.photo_url) photos.push(url) })

                  return (
                    <div key={upd.id} className="relative pl-8">
                      {/* Timeline dot */}
                      <div className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-slate-600 bg-white" />

                      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                        {/* Data e responsável */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                            {displayDate}
                          </span>
                          {(upd.responsible || upd.author_name) && (
                            <span className="text-gray-600">{upd.responsible || upd.author_name}</span>
                          )}
                        </div>

                        {/* Descrição */}
                        <p className="mt-2 text-sm text-gray-800">{upd.description}</p>

                        {/* Campos expandidos */}
                        {upd.activities_done && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">Atividades executadas:</span>
                            <p className="text-sm text-gray-700">{upd.activities_done}</p>
                          </div>
                        )}
                        {upd.issues && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-orange-600">Ocorrências:</span>
                            <p className="text-sm text-gray-700">{upd.issues}</p>
                          </div>
                        )}
                        {upd.next_activities && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">Próximas atividades:</span>
                            <p className="text-sm text-gray-700">{upd.next_activities}</p>
                          </div>
                        )}
                        {upd.observations && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">Observações:</span>
                            <p className="text-sm text-gray-700">{upd.observations}</p>
                          </div>
                        )}

                        {/* Fotos do RDO */}
                        {photos.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {photos.map((url, idx) => (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="overflow-hidden rounded-lg border border-gray-100 hover:opacity-80 transition-opacity"
                              >
                                <img src={url} alt="" className="h-20 w-28 object-cover sm:h-24 sm:w-36" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Galeria de fotos */}
        {allPhotos.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-gray-600" />
              <h2 className="font-semibold text-gray-800">Fotos</h2>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {allPhotos.map((photo, idx) => (
                <a key={idx} href={photo.url} target="_blank" rel="noopener noreferrer" className="aspect-square overflow-hidden rounded-lg border border-gray-100 hover:opacity-80 transition-opacity">
                  <img src={photo.url} alt="" className="h-full w-full object-cover" />
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
