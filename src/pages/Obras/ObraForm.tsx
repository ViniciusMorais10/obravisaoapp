import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useWork, useCreateWork, useUpdateWork } from '../../services/works'

const schema = z.object({
  name: z.string().min(2, 'Nome da obra é obrigatório'),
  client: z.string().optional(),
  address: z.string().optional(),
  start_date: z.string().optional(),
  expected_end_date: z.string().optional(),
  expected_budget: z.string().optional(),
  status: z.enum(['planejada', 'em_andamento', 'pausada', 'concluida']),
})

type FormData = z.infer<typeof schema>

export default function ObraForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { data: work } = useWork(id)
  const createWork = useCreateWork()
  const updateWork = useUpdateWork()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'planejada' },
  })

  useEffect(() => {
    if (work) {
      reset({
        name: work.name,
        client: work.client ?? '',
        address: work.address ?? '',
        start_date: work.start_date ?? '',
        expected_end_date: work.expected_end_date ?? '',
        expected_budget: work.expected_budget?.toString() ?? '',
        status: work.status,
      })
    }
  }, [work, reset])

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      client: data.client || null,
      address: data.address || null,
      start_date: data.start_date || null,
      expected_end_date: data.expected_end_date || null,
      expected_budget: data.expected_budget ? parseFloat(data.expected_budget) : null,
      status: data.status,
    }

    if (isEdit) {
      await updateWork.mutateAsync({ id, ...payload })
    } else {
      await createWork.mutateAsync({ ...payload, organization_id: organization!.id })
    }
    navigate('/obras')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-gray-800">{isEdit ? 'Editar obra' : 'Nova obra'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome da obra *</label>
          <input {...register('name')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente</label>
          <input {...register('client')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Endereço</label>
          <input {...register('address')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data início</label>
            <input type="date" {...register('start_date')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Previsão entrega</label>
            <input type="date" {...register('expected_end_date')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Orçamento previsto (R$)</label>
          <input type="number" step="0.01" min="0" {...register('expected_budget')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select {...register('status')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none">
            <option value="planejada">Planejada</option>
            <option value="em_andamento">Em andamento</option>
            <option value="pausada">Pausada</option>
            <option value="concluida">Concluída</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate('/obras')} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
