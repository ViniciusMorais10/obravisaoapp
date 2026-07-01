import { useState, useRef } from 'react'
import { ClipboardEdit, Camera, Trash2, X, ChevronLeft, ChevronRight, Calendar, User, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useWorkUpdates, useCreateWorkUpdate, useDeleteWorkUpdate, uploadMultiplePhotos, uploadPhoto } from '../../services/work-updates'
import { useStages } from '../../services/stages'
import { useAuth } from '../../hooks/useAuth'
import type { WorkUpdate } from '../../types'

/** Extrai todas as URLs de foto de um update, sem duplicar */
function getUpdatePhotos(upd: WorkUpdate): string[] {
  const urls = new Set<string>()
  if (upd.photo_url) urls.add(upd.photo_url)
  if (upd.photo_urls && Array.isArray(upd.photo_urls)) {
    upd.photo_urls.forEach((url) => urls.add(url))
  }
  return Array.from(urls)
}

export default function UpdatesSection({ workId }: { workId: string }) {
  const { organization, profile } = useAuth()
  const { data: updates, isLoading } = useWorkUpdates(workId)
  const { data: stages } = useStages(workId)
  const createUpdate = useCreateWorkUpdate()
  const deleteUpdate = useDeleteWorkUpdate(workId)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form state
  const [description, setDescription] = useState('')
  const [stageId, setStageId] = useState('')
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0])
  const [responsible, setResponsible] = useState(profile?.name ?? '')
  const [activitiesDone, setActivitiesDone] = useState('')
  const [issues, setIssues] = useState('')
  const [nextActivities, setNextActivities] = useState('')
  const [observations, setObservations] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  // Collect all photos from all updates for gallery (deduplicated)
  const allPhotos: { url: string; update: WorkUpdate }[] = []
  ;(updates ?? []).forEach((u) => {
    const photos = getUpdatePhotos(u)
    photos.forEach((url) => {
      allPhotos.push({ url, update: u })
    })
  })

  function resetForm() {
    setDescription('')
    setStageId('')
    setReportDate(new Date().toISOString().split('T')[0])
    setResponsible(profile?.name ?? '')
    setActivitiesDone('')
    setIssues('')
    setNextActivities('')
    setObservations('')
    setFiles([])
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files
    if (selected && selected.length > 0) {
      const newFiles = Array.from(selected)
      setFiles((prev) => [...prev, ...newFiles])
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() && !activitiesDone.trim()) {
      toast.error('Informe a descrição ou as atividades executadas.')
      return
    }
    setUploading(true)

    try {
      let photo_url: string | null = null
      let photo_urls: string[] | null = null

      if (files.length > 0) {
        if (!organization) {
          console.error('RDO: organization não disponível para upload')
          toast.error('Erro: organização não encontrada. Recarregue a página.')
          setUploading(false)
          return
        }

        if (files.length === 1) {
          const url = await uploadPhoto(organization.id, workId, files[0])
          photo_url = url
          photo_urls = [url]
        } else {
          const urls = await uploadMultiplePhotos(organization.id, workId, files)
          photo_url = urls[0]
          photo_urls = urls
        }
      }

      const payload = {
        work_id: workId,
        organization_id: organization!.id,
        description: description.trim() || activitiesDone.trim(),
        photo_url,
        photo_urls,
        stage_id: stageId || null,
        author_name: responsible.trim() || profile?.name || null,
        report_date: reportDate || null,
        responsible: responsible.trim() || null,
        activities_done: activitiesDone.trim() || null,
        issues: issues.trim() || null,
        next_activities: nextActivities.trim() || null,
        observations: observations.trim() || null,
      }

      await createUpdate.mutateAsync(payload)

      resetForm()
      setShowForm(false)
      toast.success('RDO registrado com sucesso.')
    } catch (err) {
      console.error('Erro ao salvar RDO:', err)
      toast.error('Erro ao salvar RDO. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) return <div className="flex items-center justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></div>

  return (
    <section className="space-y-6">
      {/* Header + Botão */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">RDO / Diário da Obra</h2>
            <p className="text-xs text-gray-500">Registros diários de obra</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            <ClipboardEdit className="h-4 w-4" /> Novo RDO
          </button>
        </div>

        {/* Formulário de RDO */}
        {showForm && (
          <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            {/* Data e Responsável */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-3.5 w-3.5" />
                  Data do RDO
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <User className="mr-1 inline h-3.5 w-3.5" />
                  Responsável
                </label>
                <input
                  type="text"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Nome do responsável"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Etapa opcional */}
            {stages && stages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Etapa <span className="text-gray-400">(opcional)</span></label>
                <select value={stageId} onChange={(e) => setStageId(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:outline-none">
                  <option value="">Nenhuma</option>
                  {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}

            {/* Descrição / Resumo */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Resumo do dia *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva resumidamente o que aconteceu na obra hoje."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                rows={2}
              />
            </div>

            {/* Atividades executadas */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Atividades executadas</label>
              <textarea
                value={activitiesDone}
                onChange={(e) => setActivitiesDone(e.target.value)}
                placeholder="Ex: Concretagem da laje do 2º pavimento, instalação de tubulação hidráulica."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                rows={2}
              />
            </div>

            {/* Ocorrências / Problemas */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Ocorrências / Problemas <span className="text-gray-400">(opcional)</span></label>
              <textarea
                value={issues}
                onChange={(e) => setIssues(e.target.value)}
                placeholder="Ex: Chuva forte impediu trabalho externo. Atraso na entrega de material."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                rows={2}
              />
            </div>

            {/* Próximas atividades */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Próximas atividades <span className="text-gray-400">(opcional)</span></label>
              <textarea
                value={nextActivities}
                onChange={(e) => setNextActivities(e.target.value)}
                placeholder="Ex: Iniciar pintura interna, receber carga de cerâmica."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                rows={2}
              />
            </div>

            {/* Observações */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Observações <span className="text-gray-400">(opcional)</span></label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Informações adicionais relevantes."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                rows={2}
              />
            </div>

            {/* Fotos */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Camera className="mr-1 inline h-3.5 w-3.5" />
                Fotos <span className="text-gray-400">(opcional, múltiplas)</span>
              </label>
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5">
                      <Camera className="h-3.5 w-3.5 text-gray-500" />
                      <span className="max-w-[120px] truncate text-xs text-gray-700">{f.name}</span>
                      <button type="button" onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:bg-white">
                <Camera className="h-4 w-4" /> {files.length > 0 ? 'Adicionar mais fotos' : 'Anexar fotos'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={uploading || (!description.trim() && !activitiesDone.trim())} className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                {uploading ? 'Salvando...' : 'Salvar RDO'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); resetForm() }} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Feed de RDOs */}
      {!updates?.length ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center">
          <FileText className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">Nenhum RDO registrado ainda.</p>
          <p className="text-xs text-gray-400">Clique em "Novo RDO" para registrar o primeiro diário da obra.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((upd) => {
            const photos = getUpdatePhotos(upd)
            const displayDate = upd.report_date
              ? new Date(upd.report_date + 'T12:00:00').toLocaleDateString('pt-BR')
              : new Date(upd.created_at).toLocaleDateString('pt-BR')

            return (
              <div key={upd.id} className="rounded-lg border border-gray-100 bg-white p-4">
                {/* Header do RDO */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {displayDate}
                      </span>
                      {(upd.responsible || upd.author_name) && (
                        <span className="text-xs text-gray-600">{upd.responsible || upd.author_name}</span>
                      )}
                      {upd.stage_id && stages?.find((s) => s.id === upd.stage_id) && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-xs text-blue-600">{stages.find((s) => s.id === upd.stage_id)?.name}</span>
                      )}
                    </div>
                    {/* Descrição/Resumo */}
                    <p className="mt-2 text-sm text-gray-800">{upd.description}</p>
                  </div>
                  <button onClick={() => setDeleteId(upd.id)} className="shrink-0 text-gray-300 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Campos expandidos do RDO */}
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
                      <button
                        key={idx}
                        onClick={() => setActiveIndex(allPhotos.findIndex((p) => p.url === url))}
                        className="overflow-hidden rounded-lg border border-gray-100 hover:opacity-90 transition-opacity"
                      >
                        <img src={url} alt="" className="h-20 w-28 object-cover sm:h-24 sm:w-36" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className="mt-2 text-xs text-gray-400">
                  Registrado em {new Date(upd.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Galeria de fotos da obra */}
      {allPhotos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Galeria de fotos da obra</h3>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className="aspect-square overflow-hidden rounded-lg border border-gray-100 hover:opacity-80 transition-opacity"
              >
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal galeria */}
      {activeIndex !== null && allPhotos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setActiveIndex(null)}>
          <button onClick={() => setActiveIndex(null)} className="absolute right-4 top-4 text-white/80 hover:text-white">
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(allPhotos[activeIndex].update.id) }}
            className="absolute left-4 top-4 flex items-center gap-1 rounded bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-600"
          >
            <Trash2 className="h-3 w-3" /> Excluir RDO
          </button>

          {allPhotos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + allPhotos.length) % allPhotos.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] max-w-[90vw] flex-col items-center">
            <img src={allPhotos[activeIndex].url} alt="" className="max-h-[70vh] rounded-lg object-contain" />
            <div className="mt-3 rounded-lg bg-black/70 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-white">{allPhotos[activeIndex].update.description}</p>
              <p className="mt-0.5 text-xs text-gray-300">
                {allPhotos[activeIndex].update.report_date
                  ? new Date(allPhotos[activeIndex].update.report_date + 'T12:00:00').toLocaleDateString('pt-BR')
                  : new Date(allPhotos[activeIndex].update.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                {allPhotos[activeIndex].update.responsible && ` • ${allPhotos[activeIndex].update.responsible}`}
              </p>
            </div>
          </div>

          {allPhotos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % allPhotos.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40">
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* Modal confirmação de exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">Excluir RDO</h3>
            <p className="mt-2 text-sm text-gray-500">Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => { deleteUpdate.mutate(deleteId); setDeleteId(null); setActiveIndex(null) }}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
