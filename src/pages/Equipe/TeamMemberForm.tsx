import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTeamMember, useCreateTeamMember, useUpdateTeamMember } from '../../services/team-members'

const schema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  role: z.string().min(1, 'Função é obrigatória'),
  custom_role: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function TeamMemberForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { organization } = useAuth()
  const { data: member } = useTeamMember(id)
  const createMember = useCreateTeamMember()
  const updateMember = useUpdateTeamMember()

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'outro' },
  })

  const selectedRole = watch('role')

  const predefinedRoles = ['pedreiro', 'ajudante', 'eletricista', 'encanador', 'pintor', 'mestre_de_obra', 'engenheiro', 'arquiteto', 'outro']

  useEffect(() => {
    if (member) {
      const isPredefined = predefinedRoles.includes(member.role)
      reset({
        name: member.name,
        role: isPredefined ? member.role : 'outro',
        custom_role: isPredefined ? '' : member.role,
        phone: member.phone ?? '',
        email: member.email ?? '',
        notes: member.notes ?? '',
      })
    }
  }, [member, reset])

  async function onSubmit(data: FormData) {
    const finalRole = data.role === 'outro' && data.custom_role ? data.custom_role : data.role
    const payload = {
      name: data.name,
      role: finalRole,
      phone: data.phone || null,
      email: data.email || null,
      notes: data.notes || null,
    }

    if (isEdit) {
      await updateMember.mutateAsync({ id, ...payload })
    } else {
      await createMember.mutateAsync({ ...payload, organization_id: organization!.id })
    }
    navigate('/equipe')
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-semibold text-gray-800">{isEdit ? 'Editar membro' : 'Novo membro'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nome *</label>
          <input {...register('name')} placeholder="Ex: João da Silva" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Função *</label>
          <select {...register('role')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none">
            <option value="pedreiro">Pedreiro</option>
            <option value="ajudante">Ajudante</option>
            <option value="eletricista">Eletricista</option>
            <option value="encanador">Encanador</option>
            <option value="pintor">Pintor</option>
            <option value="mestre_de_obra">Mestre de obra</option>
            <option value="engenheiro">Engenheiro</option>
            <option value="arquiteto">Arquiteto</option>
            <option value="outro">Outro</option>
          </select>
          {selectedRole === 'outro' && (
            <input {...register('custom_role')} placeholder="Digite a função" className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
          )}
          {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Telefone</label>
          <input {...register('phone')} placeholder="(11) 99999-9999" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input {...register('email')} type="email" placeholder="joao@email.com" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Observações</label>
          <textarea {...register('notes')} rows={3} placeholder="Informações adicionais..." className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={() => navigate('/equipe')} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
