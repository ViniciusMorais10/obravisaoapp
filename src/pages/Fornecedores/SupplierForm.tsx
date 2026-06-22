import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useSupplier, useCreateSupplier, useUpdateSupplier } from '../../services/suppliers'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  type: z.enum(['material', 'mao_de_obra', 'servico', 'equipamento', 'outro']),
  phone: z.string().optional(),
  email: z.string().optional(),
  document: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function SupplierForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { data: supplier } = useSupplier(id)
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'outro' },
  })

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        type: supplier.type,
        phone: supplier.phone ?? '',
        email: supplier.email ?? '',
        document: supplier.document ?? '',
        notes: supplier.notes ?? '',
      })
    }
  }, [supplier, reset])

  async function onSubmit(data: FormData) {
    const payload = {
      name: data.name,
      type: data.type,
      phone: data.phone || null,
      email: data.email || null,
      document: data.document || null,
      notes: data.notes || null,
    }

    if (isEdit) {
      await updateSupplier.mutateAsync({ id, ...payload })
    } else {
      await createSupplier.mutateAsync({ ...payload, organization_id: organization!.id })
    }
    navigate('/fornecedores')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-gray-800">{isEdit ? 'Editar fornecedor' : 'Novo fornecedor'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome *</label>
          <input {...register('name')} placeholder="Ex: Materiais São Paulo" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo *</label>
          <select {...register('type')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none">
            <option value="material">Material</option>
            <option value="mao_de_obra">Mão de obra</option>
            <option value="servico">Serviço</option>
            <option value="equipamento">Equipamento</option>
            <option value="outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input {...register('phone')} placeholder="(11) 99999-9999" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input {...register('email')} type="email" placeholder="contato@fornecedor.com" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
          <input {...register('document')} placeholder="00.000.000/0000-00" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea {...register('notes')} rows={3} placeholder="Informações adicionais..." className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate('/fornecedores')} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
