import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, CheckCircle2, Circle, Loader2, Trash2 } from 'lucide-react'
import { useStages, useCreateStage, useUpdateStage, useDeleteStage } from '../../services/stages'
import { useStageTemplates, useCreateStageTemplate } from '../../services/stage-templates'
import { useAuth } from '../../hooks/useAuth'
import type { StageStatus } from '../../types'

const statusLabel: Record<StageStatus, string> = {
  nao_iniciada: 'Não iniciado',
  em_andamento: 'Em andamento',
  concluida: 'Concluído',
  atrasada: 'Atrasada',
}

const statusBadge: Record<StageStatus, string> = {
  nao_iniciada: 'bg-gray-100 text-gray-600',
  em_andamento: 'bg-blue-50 text-blue-700',
  concluida: 'bg-green-100 text-green-700',
  atrasada: 'bg-red-100 text-red-700',
}

function StatusIcon({ status }: { status: StageStatus }) {
  if (status === 'concluida') return <CheckCircle2 className="h-6 w-6 text-green-600" />
  if (status === 'em_andamento') return <Loader2 className="h-6 w-6 text-blue-500" />
  return <Circle className="h-6 w-6 text-gray-300" />
}

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  expected_date: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const CREATE_NEW_VALUE = '__create_new__'

export default function StagesSection({ workId }: { workId: string }) {
  const { organization } = useAuth()
  const { data: stages, isLoading } = useStages(workId)
  const createStage = useCreateStage()
  const updateStage = useUpdateStage(workId)
  const deleteStage = useDeleteStage(workId)
  const { data: templates } = useStageTemplates()
  const createTemplate = useCreateStageTemplate()
  const [showForm, setShowForm] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customName, setCustomName] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const availableTemplates = templates ?? []

  function handleSelectChange(value: string) {
    if (value === CREATE_NEW_VALUE) {
      setShowCustomInput(true)
      setValue('name', '')
    } else if (value) {
      setShowCustomInput(false)
      setValue('name', value)
    }
  }

  async function handleCreateCustom() {
    const trimmed = customName.trim()
    if (!trimmed || !organization) return
    await createTemplate.mutateAsync({ organization_id: organization.id, name: trimmed })
    setValue('name', trimmed)
    setCustomName('')
    setShowCustomInput(false)
  }

  async function onSubmit(data: FormData) {
    await createStage.mutateAsync({
      name: data.name,
      expected_date: data.expected_date || null,
      organization_id: organization!.id,
      work_id: workId,
    })
    reset()
    setShowForm(false)
    setShowCustomInput(false)
  }

  function handleStatusChange(id: string, status: string) {
    const percentage = status === 'concluida' ? 100 : status === 'nao_iniciada' ? 0 : undefined
    updateStage.mutate({ id, status, ...(percentage !== undefined && { percentage }) })
  }

  if (isLoading) return <p className="text-sm text-gray-500">Carregando etapas...</p>

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">Etapas da obra</h2>
          <p className="text-xs text-gray-500">{stages?.length ?? 0} etapas planejadas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <select
            onChange={(e) => handleSelectChange(e.target.value)}
            defaultValue=""
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-700"
          >
            <option value="" disabled>Selecione uma etapa...</option>
            {availableTemplates.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
            <option value={CREATE_NEW_VALUE}>+ Criar nova etapa</option>
          </select>

          {showCustomInput && (
            <div className="flex gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nome da nova etapa"
                className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleCreateCustom}
                disabled={createTemplate.isPending || !customName.trim()}
                className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                Criar
              </button>
            </div>
          )}

          <input type="hidden" {...register('name')} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          <div className="flex gap-2">
            <input type="date" {...register('expected_date')} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm" />
            <button type="submit" disabled={createStage.isPending} className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">Salvar</button>
          </div>
        </form>
      )}

      {!stages?.length ? (
        <p className="mt-3 text-sm text-gray-400">Nenhuma etapa cadastrada.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {stages.map((stage) => (
            <div key={stage.id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
              <StatusIcon status={stage.status} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{stage.name}</p>
                <p className="text-xs text-gray-400">{statusLabel[stage.status]}</p>
              </div>
              <select
                value={stage.status}
                onChange={(e) => handleStatusChange(stage.id, e.target.value)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusBadge[stage.status]}`}
              >
                {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={() => deleteStage.mutate(stage.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
