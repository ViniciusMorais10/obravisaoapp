import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useWorks } from '../../services/works'
import { useDashboard } from '../../services/dashboard'
import type { WorkStatus } from '../../types'

const statusLabel: Record<WorkStatus, string> = {
  planejada: 'Planejada',
  em_andamento: 'Em andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

const statusStyle: Record<WorkStatus, { dot: string; text: string }> = {
  planejada: { dot: 'bg-blue-500', text: 'text-blue-700' },
  em_andamento: { dot: 'bg-green-500', text: 'text-green-700' },
  pausada: { dot: 'bg-yellow-500', text: 'text-yellow-700' },
  concluida: { dot: 'bg-gray-400', text: 'text-gray-600' },
}

export default function Obras() {
  const { organization } = useAuth()
  const { data: works, isLoading, error } = useWorks(organization?.id)
  const { data: dashData } = useDashboard(organization?.id)
  const [filter, setFilter] = useState<WorkStatus | 'todas'>('todas')

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /><p className="mt-3 text-sm text-gray-500">Carregando obras...</p></div>
  if (error) return <p className="text-sm text-red-600">Erro ao carregar obras</p>

  const allExpenses = dashData?.expenses ?? []
  const allStages = dashData?.stages ?? []
  const filteredWorks = filter === 'todas' ? works : works?.filter((w) => w.status === filter)

  function getWorkSpent(workId: string) {
    return allExpenses.filter((e) => e.work_id === workId).reduce((s, e) => s + Number(e.amount), 0)
  }

  function getWorkProgress(workId: string) {
    const ws = allStages.filter((s) => s.work_id === workId)
    if (!ws.length) return 0
    return Math.round(ws.reduce((s, st) => s + st.percentage, 0) / ws.length)
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Obras</h1>
          <p className="text-sm text-gray-500">{works?.length ?? 0} obra{(works?.length ?? 0) !== 1 ? 's' : ''} cadastrada{(works?.length ?? 0) !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/obras/nova" className="flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          <Plus className="h-4 w-4" /> Nova obra
        </Link>
      </div>

      {/* Filtro por status */}
      <div className="mt-4 flex gap-2 overflow-x-auto">
        {(['todas', 'planejada', 'em_andamento', 'pausada', 'concluida'] as const).map((s) => {
          const colors: Record<string, { active: string; inactive: string }> = {
            todas: { active: 'bg-slate-800 text-white', inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
            planejada: { active: 'bg-blue-600 text-white', inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            em_andamento: { active: 'bg-green-600 text-white', inactive: 'bg-green-50 text-green-700 hover:bg-green-100' },
            pausada: { active: 'bg-yellow-500 text-white', inactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
            concluida: { active: 'bg-gray-600 text-white', inactive: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
          }
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filter === s ? colors[s].active : colors[s].inactive}`}
            >
              {s === 'todas' ? 'Todas' : statusLabel[s]}
            </button>
          )
        })}
      </div>

      {!filteredWorks?.length ? (
        <div className="mt-12 flex flex-col items-center justify-center text-center">
          {filter === 'todas' ? (
            <>
              <p className="text-gray-400">Nenhuma obra cadastrada ainda.</p>
              <Link to="/obras/nova" className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
                <Plus className="h-4 w-4" /> Criar primeira obra
              </Link>
            </>
          ) : (
            <p className="text-gray-400">
              Nenhuma obra com status <span className="font-medium text-gray-600">"{statusLabel[filter]}"</span> encontrada.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {filteredWorks.map((work) => {
            const spent = getWorkSpent(work.id)
            const progress = getWorkProgress(work.id)
            const budget = Number(work.expected_budget ?? 0)
            const overBudget = budget > 0 && spent > budget
            const style = statusStyle[work.status]

            return (
              <Link key={work.id} to={`/obras/${work.id}`} className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                {/* Linha 1: nome + status */}
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">{work.name}</h2>
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${style.text}`}>
                    <span className={`h-2 w-2 rounded-full ${style.dot}`} />
                    {statusLabel[work.status]}
                  </span>
                </div>

                {/* Linha 2: cliente + endereço + data */}
                <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-gray-400">
                  {work.client && <span>Cliente: {work.client}</span>}
                  {work.address && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{work.address}</span>}
                  {work.start_date && <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{new Date(work.start_date).toLocaleDateString('pt-BR')}</span>}
                </div>

                {/* Linha 3: barra de progresso */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium text-gray-600">{progress}%</span>
                </div>

                {/* Linha 4: financeiro */}
                {budget > 0 && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      Previsto: {budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                    <span className={`font-semibold ${overBudget ? 'text-red-600' : 'text-gray-700'}`}>
                      Gasto: {spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
