import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ToggleLeft, ToggleRight, Pencil, Eye, Users } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTeamMembers, useToggleTeamMemberActive } from '../../services/team-members'

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

export default function Equipe() {
  const { organization } = useAuth()
  const { data: members, isLoading } = useTeamMembers(organization?.id)
  const toggle = useToggleTeamMemberActive()
  const [search, setSearch] = useState('')

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /><p className="mt-3 text-sm text-gray-500">Carregando equipe...</p></div>

  const filtered = members?.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Equipe</h1>
          <p className="text-sm text-gray-500">Gerencie os membros da sua equipe</p>
        </div>
        <Link to="/equipe/novo" className="flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          <Plus className="h-4 w-4" /> Novo membro
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-gray-300 py-2.5 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none"
        />
      </div>

      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">{search ? 'Nenhum membro encontrado.' : 'Nenhum membro cadastrado.'}</p>
          {!search && (
            <Link to="/equipe/novo" className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Cadastrar primeiro membro
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((member) => (
            <div key={member.id} className={`rounded-lg border bg-white p-4 ${member.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{member.name}</p>
                  <p className="text-xs text-gray-400">
                    {roleLabel[member.role] ?? member.role}
                    {member.phone && ` · ${member.phone}`}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                <Link to={`/equipe/${member.id}`} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                  <Eye className="h-4 w-4" /> Detalhes
                </Link>
                <button
                  onClick={() => toggle.mutate({ id: member.id, is_active: !member.is_active })}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${member.is_active ? 'text-green-700 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {member.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {member.is_active ? 'Inativar' : 'Ativar'}
                </button>
                <Link to={`/equipe/${member.id}/editar`} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
                  <Pencil className="h-4 w-4" /> Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
