import { Link, useParams } from 'react-router-dom'
import { Pencil, Phone, Mail, Users, HardHat } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTeamMember } from '../../services/team-members'
import { useWorks } from '../../services/works'
import { supabase } from '../../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import type { WorkTeamMember } from '../../types'

const roleLabel: Record<string, string> = {
  pedreiro: 'Pedreiro',
  ajudante: 'Ajudante',
  eletricista: 'Eletricista',
  encanador: 'Encanador',
  pintor: 'Pintor',
  mestre_de_obra: 'Mestre de obra',
  engenheiro: 'Engenheiro',
  arquiteto: 'Arquiteto',
  outro: 'Outro',
}

export default function TeamMemberDetail() {
  const { id } = useParams()
  const { organization } = useAuth()
  const { data: member, isLoading } = useTeamMember(id)
  const { data: works } = useWorks(organization?.id)

  const { data: links } = useQuery({
    queryKey: ['work-team-members', 'by-member', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_team_members')
        .select('*')
        .eq('team_member_id', id!)
        .eq('is_active', true)
      if (error) throw error
      return data as WorkTeamMember[]
    },
    enabled: !!id,
  })

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /><p className="mt-3 text-sm text-gray-500">Carregando...</p></div>

  if (!member) return <p className="py-10 text-center text-sm text-gray-500">Membro não encontrado.</p>

  const workName = (workId: string) => works?.find((w) => w.id === workId)?.name ?? ''

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/equipe" className="hover:text-gray-700">Equipe</Link>
          <span>/</span>
          <span className="font-medium text-gray-800">{member.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${member.is_active ? 'border-green-200 bg-green-100 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-600'}`}>
            {member.is_active ? 'Ativo' : 'Inativo'}
          </span>
          <Link to={`/equipe/${id}/editar`} className="rounded-md border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50">
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Dados */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{member.name}</h1>
              <p className="text-sm text-gray-500">{roleLabel[member.role] ?? member.role}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {member.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" /> {member.phone}
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" /> {member.email}
              </div>
            )}
          </div>

          {member.notes && (
            <p className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{member.notes}</p>
          )}
        </div>

        {/* Resumo */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="space-y-3">
            <span className="text-sm text-gray-500">Obras vinculadas</span>
            <p className="text-3xl font-bold text-gray-900">{links?.length ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Obras vinculadas */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="font-semibold text-gray-800">Obras em que participa</h2>

        {!links?.length ? (
          <p className="mt-4 text-center text-sm text-gray-400">Nenhuma obra vinculada.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {links.map((link) => (
              <Link key={link.id} to={`/obras/${link.work_id}`} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 hover:bg-gray-100">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <HardHat className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{workName(link.work_id)}</p>
                  {link.role_in_work && <p className="text-xs text-gray-400">{link.role_in_work}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
