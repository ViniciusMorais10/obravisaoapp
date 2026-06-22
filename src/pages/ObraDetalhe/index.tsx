import { useParams, Link } from 'react-router-dom'
import { Calendar, Pencil } from 'lucide-react'
import { useWork, useUpdateWork } from '../../services/works'
import { useExpenses } from '../../services/expenses'
import { useStages } from '../../services/stages'
import { useWorkPayments } from '../../services/work-payments'
import StagesSection from '../../components/etapas/StagesSection'
import ExpensesSection from '../../components/despesas/ExpensesSection'
import PaymentsSection from '../../components/recebimentos/PaymentsSection'
import UpdatesSection from '../../components/fotos/UpdatesSection'
import ShareLinkSection from '../../components/obras/ShareLinkSection'
import WorkTeamSection from '../../components/equipe/WorkTeamSection'
import type { WorkStatus } from '../../types'

const statusLabel: Record<WorkStatus, string> = {
  planejada: 'Planejada',
  em_andamento: 'Em andamento',
  pausada: 'Pausada',
  concluida: 'Concluída',
}

const statusColor: Record<WorkStatus, string> = {
  planejada: 'bg-blue-100 text-blue-700 border-blue-200',
  em_andamento: 'bg-green-100 text-green-700 border-green-200',
  pausada: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  concluida: 'bg-gray-100 text-gray-600 border-gray-200',
}

export default function ObraDetalhe() {
  const { id } = useParams<{ id: string }>()
  const { data: work, isLoading } = useWork(id)
  const { data: expenses } = useExpenses(id)
  const { data: stages } = useStages(id)
  const { data: payments } = useWorkPayments(id)
  const updateWork = useUpdateWork()

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /><p className="mt-3 text-sm text-gray-500">Carregando obra...</p></div>
  if (!work) return <p className="text-sm text-red-600">Obra não encontrada</p>

  const totalSpent = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0
  const totalReceived = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0
  const budget = Number(work.expected_budget ?? 0)
  const saldo = budget - totalSpent
  const saldoReal = totalReceived - totalSpent
  const overBudget = budget > 0 && totalSpent > budget

  const stagesList = stages ?? []
  const progress = stagesList.length ? Math.round(stagesList.reduce((s, st) => s + st.percentage, 0) / stagesList.length) : 0

  const isLate = work.expected_end_date && new Date(work.expected_end_date) < new Date() && work.status !== 'concluida'

  function handleStatusChange(status: string) {
    updateWork.mutate({ id: work!.id, status })
  }

  function getBadgeClass() {
    if (isLate) return 'bg-red-100 text-red-700 border-red-200'
    if (overBudget) return 'bg-orange-100 text-orange-700 border-orange-200'
    return statusColor[work!.status]
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-gray-700">Dashboard</Link>
          <span>/</span>
          <span className="font-medium text-gray-800">{work.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={work.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`rounded-full border px-3 py-1 text-sm font-medium ${getBadgeClass()}`}
          >
            {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Link to={`/obras/${work.id}/editar`} className="rounded-md border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50">
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Status geral + Financeiro */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Card progresso */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Status geral da obra</p>
              <p className="text-4xl font-bold text-gray-900">{progress}%</p>
            </div>
            {work.expected_end_date && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                Entrega prevista: <span className="font-semibold">{new Date(work.expected_end_date).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
          <div className="mt-4 h-3 w-full rounded-full bg-gray-100">
            <div className="h-3 rounded-full bg-green-500 transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>Início: {work.start_date ? new Date(work.start_date).toLocaleDateString('pt-BR') : '—'}</span>
            <span>Entrega: {work.expected_end_date ? new Date(work.expected_end_date).toLocaleDateString('pt-BR') : '—'}</span>
          </div>
        </div>

        {/* Card financeiro */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="space-y-3">
            {budget > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Orçamento previsto</span>
                  <span className="text-sm font-semibold text-gray-800">{budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Saldo previsto</span>
                  <span className={`text-sm font-semibold ${overBudget ? 'text-red-600' : 'text-gray-800'}`}>
                    {saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <hr className="border-gray-100" />
              </>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total gasto</span>
              <span className="text-sm font-semibold text-red-600">{totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total recebido</span>
              <span className="text-sm font-semibold text-green-600">{totalReceived.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Saldo</span>
              <span className={`text-lg font-bold ${saldoReal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {saldoReal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Etapas + Despesas lado a lado */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <StagesSection workId={work.id} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <ExpensesSection workId={work.id} />
        </div>
      </div>

      {/* Recebimentos */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <PaymentsSection workId={work.id} />
      </div>

      {/* Link de atualização */}
      <ShareLinkSection workId={work.id} />

      {/* Equipe da obra */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <WorkTeamSection workId={work.id} />
      </div>

      {/* Atualizações + Fotos */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <UpdatesSection workId={work.id} />
      </div>
    </div>
  )
}
