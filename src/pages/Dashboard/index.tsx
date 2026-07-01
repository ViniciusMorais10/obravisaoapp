import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, AlertTriangle, TrendingDown, DollarSign, Clock, Image as ImageIcon } from 'lucide-react'
import { useDashboard } from '../../services/dashboard'
import { useAuth } from '../../hooks/useAuth'
import SubscriptionBanner from '../../components/dashboard/SubscriptionBanner'
import type { Work, Expense } from '../../types'

type PeriodFilter = 'mes_atual' | 'mes_anterior' | 'acumulado'

function filterExpensesByPeriod(expenses: Expense[], period: PeriodFilter): Expense[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed

  return expenses.filter((e) => {
    const [year, month] = e.date.split('-').map(Number)
    const expMonth = month - 1 // converter para 0-indexed

    if (period === 'mes_atual') {
      return expMonth === currentMonth && year === currentYear
    }
    if (period === 'mes_anterior') {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return expMonth === prevMonth && year === prevYear
    }
    return true // acumulado: todas
  })
}

export default function Dashboard() {
  const { profile, organization } = useAuth()
  const { data, isLoading } = useDashboard(organization?.id)
  const [period, setPeriod] = useState<PeriodFilter>('mes_atual')

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
        <p className="mt-3 text-sm text-gray-500">Carregando informações...</p>
      </div>
    )
  }

  const works = data?.works ?? []
  const expenses = data?.expenses ?? []
  const stages = data?.stages ?? []
  const workUpdates = data?.workUpdates ?? []

  const activeWorks = works.filter((w) => w.status === 'em_andamento')
  const lateWorks = works.filter((w) => w.expected_end_date && new Date(w.expected_end_date) < new Date() && ['planejada', 'em_andamento'].includes(w.status))
  const overBudgetWorks = works.filter((w) => {
    if (!w.expected_budget) return false
    const spent = expenses.filter((e) => e.work_id === w.id).reduce((s, e) => s + Number(e.amount), 0)
    return spent > Number(w.expected_budget)
  })
  const totalSpentMonth = filterExpensesByPeriod(expenses, period)
    .reduce((s, e) => s + Number(e.amount), 0)

  // Etapas paradas: em_andamento ou nao_iniciada sem atualização recente
  const stoppedStages = stages
    .filter((s) => s.status === 'nao_iniciada' || s.status === 'em_andamento')
    .map((s) => {
      const daysStopped = Math.floor((Date.now() - new Date(s.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      const work = works.find((w) => w.id === s.work_id)
      return { ...s, daysStopped, workName: work?.name ?? '' }
    })
    .filter((s) => s.daysStopped >= 2)
    .sort((a, b) => b.daysStopped - a.daysStopped)
    .slice(0, 5)

  const recentExpenses = filterExpensesByPeriod(expenses, period)
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4)
  const recentPhotos = workUpdates.filter((u) => u.photo_url).slice(0, 4)

  function getWorkSpent(workId: string) {
    return expenses.filter((e) => e.work_id === workId).reduce((s, e) => s + Number(e.amount), 0)
  }

  function getWorkProgress(workId: string) {
    const ws = stages.filter((s) => s.work_id === workId)
    if (!ws.length) return 0
    return Math.round(ws.reduce((s, st) => s + st.percentage, 0) / ws.length)
  }

  function getWorkStatus(work: Work): { label: string; color: string; dot: string } {
    const isLate = work.expected_end_date && new Date(work.expected_end_date) < new Date() && work.status !== 'concluida'
    const spent = getWorkSpent(work.id)
    const isOver = work.expected_budget && spent > Number(work.expected_budget)
    if (isLate) return { label: 'Atrasada', color: 'text-red-600', dot: 'bg-red-500' }
    if (isOver) return { label: 'Atenção', color: 'text-orange-500', dot: 'bg-orange-400' }
    return { label: 'No prazo', color: 'text-green-600', dot: 'bg-green-500' }
  }

  return (
    <div className="space-y-6">
      <SubscriptionBanner />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard geral</h1>
          <p className="text-sm text-gray-500">Visão consolidada das obras em andamento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-500">Administrador</p>
            <p className="text-sm font-semibold text-gray-800">{profile?.name} - {organization?.name}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
            {profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Filtro de período */}
      <div className="flex gap-2">
        {([
          { value: 'mes_atual', label: 'Mês atual' },
          { value: 'mes_anterior', label: 'Mês anterior' },
          { value: 'acumulado', label: 'Acumulado' },
        ] as { value: PeriodFilter; label: string }[]).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === value
                ? 'bg-slate-800 text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:border-slate-400 hover:text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={<TrendingUp className="h-5 w-5 text-blue-500" />} label="Obras em andamento" value={activeWorks.length} />
        <SummaryCard icon={<AlertTriangle className="h-5 w-5 text-red-500" />} label="Obras atrasadas" value={lateWorks.length} />
        <SummaryCard icon={<TrendingDown className="h-5 w-5 text-orange-500" />} label="Acima do previsto" value={overBudgetWorks.length} />
        <SummaryCard icon={<DollarSign className="h-5 w-5 text-red-500" />} label={period === 'mes_atual' ? 'Despesas do mês' : period === 'mes_anterior' ? 'Despesas mês anterior' : 'Despesas acumuladas'} value={totalSpentMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      </div>

      {/* Última atualização */}
      {workUpdates[0] && (
        <p className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" /> Último RDO: {new Date(workUpdates[0].created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
        </p>
      )}

      {/* Tabela de obras em andamento */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 lg:p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-800">Obras em andamento</h2>
            <p className="text-xs text-gray-500">Progresso físico vs. financeiro</p>
          </div>
          <Link to="/obras" className="text-sm text-gray-500 hover:text-gray-800">Ver todas →</Link>
        </div>

        {/* Desktop: tabela */}
        <div className="mt-4 hidden lg:block">
          <div className="grid grid-cols-[2fr_1.5fr_0.5fr_1fr_1fr_auto] gap-4 border-b border-gray-100 pb-2 text-xs font-medium text-gray-500">
            <span>Obra</span><span>Progresso</span><span></span><span>Status</span><span>Gasto / Orçado</span><span></span>
          </div>
          {activeWorks.map((w) => {
            const progress = getWorkProgress(w.id)
            const spent = getWorkSpent(w.id)
            const st = getWorkStatus(w)
            return (
              <div key={w.id} className="grid grid-cols-[2fr_1.5fr_0.5fr_1fr_1fr_auto] items-center gap-4 border-b border-gray-50 py-3">
                <span className="text-sm font-medium text-gray-800">{w.name}</span>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <span className="text-xs text-gray-600">{progress}%</span>
                <span className={`flex items-center gap-1 text-xs font-medium ${st.color}`}>
                  <span className={`h-2 w-2 rounded-full ${st.dot}`} /> {st.label}
                </span>
                <span className="text-xs text-gray-700">
                  <span className="font-semibold">{spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  {w.expected_budget ? ` / ${Number(w.expected_budget).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ''}
                </span>
                <Link to={`/obras/${w.id}`} className="rounded-md bg-slate-800 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700">Abrir</Link>
              </div>
            )
          })}
          {!activeWorks.length && <p className="py-4 text-center text-sm text-gray-400">Nenhuma obra em andamento</p>}
        </div>

        {/* Mobile: cards */}
        <div className="mt-4 space-y-3 lg:hidden">
          {activeWorks.map((w) => {
            const progress = getWorkProgress(w.id)
            const spent = getWorkSpent(w.id)
            const st = getWorkStatus(w)
            return (
              <Link key={w.id} to={`/obras/${w.id}`} className="block rounded-lg border border-gray-100 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">{w.name}</span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${st.color}`}>
                    <span className={`h-2 w-2 rounded-full ${st.dot}`} /> {st.label}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>{progress}%</span>
                  <span>{spent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} {w.expected_budget ? `/ ${Number(w.expected_budget).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : ''}</span>
                </div>
              </Link>
            )
          })}
          {!activeWorks.length && <p className="text-center text-sm text-gray-400">Nenhuma obra em andamento</p>}
        </div>
      </div>

      {/* Seções inferiores: 3 colunas */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Etapas paradas */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-semibold text-gray-800">Etapas paradas</h3>
          <p className="text-xs text-gray-500">Sem atualização há mais de 48h</p>
          {!stoppedStages.length ? (
            <p className="mt-3 text-sm text-gray-400">Nenhuma etapa parada</p>
          ) : (
            <div className="mt-3 space-y-3">
              {stoppedStages.map((s) => (
                <div key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.workName}</p>
                  </div>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s.daysStopped}d parado</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fotos recentes */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-semibold text-gray-800">Fotos recentes</h3>
          <p className="text-xs text-gray-500">Últimos registros enviados</p>
          {!recentPhotos.length ? (
            <p className="mt-3 text-sm text-gray-400">Nenhuma foto registrada</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {recentPhotos.map((u) => (
                <div key={u.id} className="overflow-hidden rounded-lg border border-gray-100">
                  {u.photo_url ? (
                    <img src={u.photo_url} alt={u.description} className="h-24 w-full object-cover" />
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-gray-50">
                      <ImageIcon className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                  <div className="px-2 py-1.5">
                    <p className="truncate text-xs font-medium text-gray-700">{u.description}</p>
                    <p className="text-[10px] text-gray-400">
                      {works.find((w) => w.id === u.work_id)?.name} · {new Date(u.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Despesas recentes */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-semibold text-gray-800">Despesas recentes</h3>
          <p className="text-xs text-gray-500">
            {period === 'mes_atual' ? 'Mês atual' : period === 'mes_anterior' ? 'Mês anterior' : 'Acumulado'} · últimos lançamentos
          </p>
          {!recentExpenses.length ? (
            <p className="mt-3 text-sm text-gray-400">Nenhuma despesa lançada</p>
          ) : (
            <div className="mt-3 space-y-3">
              {recentExpenses.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-red-50">
                      <DollarSign className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{e.description}</p>
                      <p className="text-xs text-gray-400">{works.find((w) => w.id === e.work_id)?.name}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{Number(e.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
