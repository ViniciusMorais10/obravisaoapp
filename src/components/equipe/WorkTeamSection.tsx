import { useState } from 'react'
import { Plus, UserMinus, Users, Phone } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useActiveTeamMembers } from '../../services/team-members'
import { useWorkTeamMembers, useAddTeamMemberToWork, useRemoveTeamMemberFromWork } from '../../services/work-team-members'

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

export default function WorkTeamSection({ workId }: { workId: string }) {
  const { organization } = useAuth()
  const { data: workMembers, isLoading } = useWorkTeamMembers(workId)
  const { data: activeMembers } = useActiveTeamMembers(organization?.id)
  const addMember = useAddTeamMemberToWork()
  const removeMember = useRemoveTeamMemberFromWork()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const linkedIds = new Set(workMembers?.map((wm) => wm.team_member_id) ?? [])
  const available = activeMembers?.filter((m) => !linkedIds.has(m.id)) ?? []

  function handleAdd() {
    if (!selectedId || !organization) return
    addMember.mutate({ organization_id: organization.id, work_id: workId, team_member_id: selectedId })
    setSelectedId('')
    setShowAdd(false)
  }

  if (isLoading) return <p className="text-sm text-gray-500">Carregando equipe...</p>

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Equipe da obra</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900">
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </div>

      {showAdd && (
        <div className="mt-3 flex gap-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm">
            <option value="">Selecione um membro</option>
            {available.map((m) => <option key={m.id} value={m.id}>{m.name} — {roleLabel[m.role] ?? m.role}</option>)}
          </select>
          <button onClick={handleAdd} disabled={!selectedId || addMember.isPending} className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">
            Vincular
          </button>
        </div>
      )}

      {!workMembers?.length ? (
        <p className="mt-3 text-sm text-gray-400">Nenhum membro vinculado.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {workMembers.map((wm) => (
            <div key={wm.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{wm.team_member?.name}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
                    <span>{roleLabel[wm.team_member?.role ?? ''] ?? wm.team_member?.role}</span>
                    {wm.team_member?.phone && (
                      <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" /> {wm.team_member.phone}
                      </span>
                    )}
                    {wm.team_member?.daily_rate != null && (
                      <span className="font-medium text-gray-500">
                        {Number(wm.team_member.daily_rate).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/dia
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeMember.mutate({ id: wm.id, work_id: workId })}
                title="Remover da obra"
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <UserMinus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
