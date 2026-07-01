import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, DollarSign, Calendar, Building2, Receipt, Paperclip, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../hooks/useAuth'
import { useAllExpenses, getReceiptUrl } from '../../services/expenses'
import { useWorks } from '../../services/works'
import { supabase } from '../../lib/supabase'
import type { Expense, ExpenseCategory } from '../../types'

const categoryLabel: Record<ExpenseCategory, string> = {
  material: 'Material',
  mao_de_obra: 'Mão de obra',
  terceiros: 'Terceiros',
  frete: 'Frete',
  equipamento: 'Equipamento',
  imprevisto: 'Imprevisto',
  outro: 'Outro',
}

type PeriodFilter = 'mes_atual' | 'mes_anterior' | 'acumulado'

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'mes_atual', label: 'Mês atual' },
  { value: 'mes_anterior', label: 'Mês anterior' },
  { value: 'acumulado', label: 'Acumulado' },
]

function filterByPeriod(expenses: Expense[], period: PeriodFilter): Expense[] {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed

  return expenses.filter((e) => {
    const [year, month] = e.date.split('-').map(Number)
    const expMonth = month - 1

    if (period === 'mes_atual') return expMonth === currentMonth && year === currentYear
    if (period === 'mes_anterior') {
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      return expMonth === prevMonth && year === prevYear
    }
    return true // acumulado
  })
}

export default function Despesas() {
  const { organization } = useAuth()
  const { data: expenses, isLoading } = useAllExpenses(organization?.id)
  const { data: works } = useWorks(organization?.id)
  const [period, setPeriod] = useState<PeriodFilter>('mes_atual')
  const [filterWork, setFilterWork] = useState<string>('todas')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  async function openReceipt(path: string) {
    const url = await getReceiptUrl(path)
    window.open(url, '_blank')
  }

  async function confirmDelete() {
    if (!deleteId) return
    await supabase.from('expenses').delete().eq('id', deleteId)
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    setDeleteId(null)
  }

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      <p className="mt-3 text-sm text-gray-500">Carregando despesas...</p>
    </div>
  )

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const allExpenses = expenses ?? []

  // Filtro de período
  const periodFiltered = filterByPeriod(allExpenses, period)

  // Filtro de obra combinado com período
  const filtered = filterWork === 'todas'
    ? periodFiltered
    : periodFiltered.filter((e) => e.work_id === filterWork)

  // Ordenar por lançamento mais recente
  const sortedFiltered = filtered
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Cards de resumo
  const totalPeriod = periodFiltered.reduce((s, e) => s + Number(e.amount), 0)
  const totalToday = allExpenses.filter((e) => e.date === today).reduce((s, e) => s + Number(e.amount), 0)
  const totalAccumulated = allExpenses.reduce((s, e) => s + Number(e.amount), 0)

  // Obra com maior gasto no período
  const workSpent = new Map<string, number>()
  periodFiltered.forEach((e) => workSpent.set(e.work_id, (workSpent.get(e.work_id) ?? 0) + Number(e.amount)))
  let topWork = ''
  let topAmount = 0
  workSpent.forEach((amount, workId) => { if (amount > topAmount) { topAmount = amount; topWork = workId } })
  const topWorkName = works?.find((w) => w.id === topWork)?.name ?? '—'

  const periodLabel = period === 'mes_atual' ? 'Mês atual' : period === 'mes_anterior' ? 'Mês anterior' : 'Acumulado'

  function getWorkName(workId: string) {
    return works?.find((w) => w.id === workId)?.name ?? ''
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Despesas</h1>
          <p className="text-sm text-gray-500">Lançamentos e resumo financeiro das obras</p>
        </div>
        <Link to="/despesas/nova" className="flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          <Plus className="h-4 w-4" /> Lançar despesa
        </Link>
      </div>

      {/* Filtro de período */}
      <div className="flex gap-2">
        {periodOptions.map(({ value, label }) => (
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

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={<DollarSign className="h-5 w-5 text-red-500" />} label={`Despesas · ${periodLabel}`} value={totalPeriod.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <SummaryCard icon={<Calendar className="h-5 w-5 text-orange-500" />} label="Despesas de hoje" value={totalToday.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
        <SummaryCard icon={<Building2 className="h-5 w-5 text-blue-500" />} label={`Maior gasto · ${periodLabel}`} value={topWorkName} />
        <SummaryCard icon={<Receipt className="h-5 w-5 text-green-600" />} label="Total acumulado" value={totalAccumulated.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
      </div>

      {/* Filtro por obra */}
      <div className="flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilterWork('todas')}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterWork === 'todas' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Todas as obras
        </button>
        {works?.map((w) => (
          <button
            key={w.id}
            onClick={() => setFilterWork(w.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${filterWork === w.id ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {w.name}
          </button>
        ))}
      </div>

      {/* Lista de despesas */}
      {!sortedFiltered.length ? (
        <p className="text-center text-sm text-gray-400">Nenhuma despesa encontrada para o período selecionado.</p>
      ) : (
        <div className="space-y-2">
          {sortedFiltered.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <DollarSign className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{exp.description}</p>
                  <p className="text-xs text-gray-400">
                    {getWorkName(exp.work_id)} · {categoryLabel[exp.category]}{exp.supplier?.name ? ` · ${exp.supplier.name}` : ''} · {exp.date.split('-').reverse().join('/')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{Number(exp.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  {exp.receipt_url && (
                    <button onClick={() => openReceipt(exp.receipt_url!)} className="mt-1 inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors">
                      <Paperclip className="h-3.5 w-3.5" /> Ver comprovante
                    </button>
                  )}
                </div>
                <button onClick={() => setDeleteId(exp.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteId(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800">Excluir despesa?</h3>
            <p className="mt-1 text-sm text-gray-500">Essa ação não pode ser desfeita. Deseja realmente excluir esta despesa?</p>
            <div className="mt-4 flex gap-3">
              <button onClick={confirmDelete} className="flex-1 rounded-md bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700">
                Excluir
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{label}</span>
        {icon}
      </div>
      <p className="mt-2 truncate text-lg font-bold text-gray-900">{value}</p>
    </div>
  )
}
