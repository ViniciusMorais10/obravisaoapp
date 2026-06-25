import { useState, useRef } from 'react'
import { ClipboardEdit, Camera, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useWorkUpdates, useCreateWorkUpdate, useDeleteWorkUpdate, uploadPhoto } from '../../services/work-updates'
import { useStages } from '../../services/stages'
import { useAuth } from '../../hooks/useAuth'

export default function UpdatesSection({ workId }: { workId: string }) {
  const { organization, profile } = useAuth()
  const { data: updates, isLoading } = useWorkUpdates(workId)
  const { data: stages } = useStages(workId)
  const createUpdate = useCreateWorkUpdate()
  const deleteUpdate = useDeleteWorkUpdate(workId)
  const [showForm, setShowForm] = useState(false)
  const [description, setDescription] = useState('')
  const [stageId, setStageId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const photos = (updates ?? []).filter((u) => u.photo_url)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) return
    setUploading(true)

    let photo_url: string | null = null
    if (file && organization) {
      photo_url = await uploadPhoto(organization.id, workId, file)
    }

    await createUpdate.mutateAsync({
      work_id: workId,
      organization_id: organization!.id,
      description: description.trim(),
      photo_url,
      stage_id: stageId || null,
      author_name: profile?.name ?? null,
    })

    setDescription('')
    setStageId('')
    setFile(null)
    setShowForm(false)
    setUploading(false)
    toast.success('Atualização registrada com sucesso.')
  }

  if (isLoading) return <div className="flex items-center justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></div>

  return (
    <section className="space-y-6">
      {/* Header + Botão */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Últimas atualizações</h2>
            <p className="text-xs text-gray-500">Registros do dia a dia da obra</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            <ClipboardEdit className="h-4 w-4" /> Registrar atualização
          </button>
        </div>

        {/* Formulário de atualização */}
        {showForm && (
          <form onSubmit={onSubmit} className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">O que foi feito hoje?</label>
              <p className="text-xs text-gray-400">Registre o andamento da obra, ocorrências ou observações importantes.</p>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Finalizada a instalação elétrica da sala e iniciado preparo para pintura."
                className="mt-1.5 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
                rows={3}
              />
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

            {/* Foto opcional */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Foto <span className="text-gray-400">(opcional)</span></label>
              {file ? (
                <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <Camera className="h-4 w-4 text-gray-500" />
                  <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
                  <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="text-gray-400 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:bg-white">
                  <Camera className="h-4 w-4" /> Anexar foto
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={uploading || !description.trim()} className="flex-1 rounded-lg bg-slate-800 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                {uploading ? 'Salvando...' : 'Salvar atualização'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Feed de atualizações */}
      {!updates?.length ? (
        <p className="text-sm text-gray-400">Nenhuma atualização registrada ainda.</p>
      ) : (
        <div className="space-y-3">
          {updates.map((upd) => (
            <div key={upd.id} className="rounded-lg border border-gray-100 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{upd.description}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {upd.author_name && <span className="font-medium text-gray-600">{upd.author_name}</span>}
                    <span>{new Date(upd.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    {upd.stage_id && stages?.find((s) => s.id === upd.stage_id) && (
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-blue-600">{stages.find((s) => s.id === upd.stage_id)?.name}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => setDeleteId(upd.id)} className="shrink-0 text-gray-300 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {upd.photo_url && (
                <button onClick={() => setActiveIndex(photos.findIndex((p) => p.id === upd.id))} className="mt-3 overflow-hidden rounded-lg border border-gray-100 hover:opacity-90 transition-opacity">
                  <img src={upd.photo_url} alt="" className="h-28 w-40 object-cover sm:h-32 sm:w-48" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Galeria de fotos */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Galeria de fotos</h3>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-8">
            {photos.map((photo, idx) => (
              <button
                key={photo.id}
                onClick={() => setActiveIndex(idx)}
                className="aspect-square overflow-hidden rounded-lg border border-gray-100 hover:opacity-80 transition-opacity"
              >
                <img src={photo.photo_url!} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal galeria */}
      {activeIndex !== null && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={() => setActiveIndex(null)}>
          <button onClick={() => setActiveIndex(null)} className="absolute right-4 top-4 text-white/80 hover:text-white">
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(photos[activeIndex].id) }}
            className="absolute left-4 top-4 flex items-center gap-1 rounded bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-600"
          >
            <Trash2 className="h-3 w-3" /> Excluir
          </button>

          {photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex - 1 + photos.length) % photos.length) }} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40">
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div onClick={(e) => e.stopPropagation()} className="flex max-h-[85vh] max-w-[90vw] flex-col items-center">
            <img src={photos[activeIndex].photo_url!} alt="" className="max-h-[70vh] rounded-lg object-contain" />
            <div className="mt-3 rounded-lg bg-black/70 px-4 py-2 text-center backdrop-blur-sm">
              <p className="text-sm font-medium text-white">{photos[activeIndex].description}</p>
              <p className="mt-0.5 text-xs text-gray-300">
                {new Date(photos[activeIndex].created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
              </p>
            </div>
          </div>

          {photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveIndex((activeIndex + 1) % photos.length) }} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white hover:bg-white/40">
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
      {/* Modal confirmação de exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">Excluir atualização</h3>
            <p className="mt-2 text-sm text-gray-500">Tem certeza que deseja excluir esta atualização? Essa ação não pode ser desfeita.</p>
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
