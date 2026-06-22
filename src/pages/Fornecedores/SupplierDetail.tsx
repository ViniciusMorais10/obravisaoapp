import { Link, useParams } from 'react-router-dom'
import { Pencil, DollarSign, Phone, Mail, FileText, Truck } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSupplier } from '../../services/suppliers'
import { useAllExpenses } from '../../services/expenses'
import { useWorks } from '../../services/works'
import type { SupplierType } from '../../types'

const typeLabel: Record<SupplierType, string> = {
  material: 'Material',
  mao_de_obra: 'Mão de obra',
  servico: 'Serviço',
  equipamento: 'Equipamento',
  outro: 'Outro',
}

export default function SupplierDetail() {
  const { id } = useParams()
  const { organization } = useAuth()
  const { data: supplier, isLoading } = useSupplier(id)
  const { data: allExpenses } = useAllExpenses(organization?.id)
  const { data: works } = useWorks(organization?.id)

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /><p className="mt-3 text-sm text-gray-500">Carregando...</p></div>

  if (!supplier) return <p className="py-10 text-center text-sm text-gray-500">Fornecedor não encontrado.</p>

  const expenses = allExpenses?.filter((e) => e.supplier_id === id) ?? []
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0)
  const workName = (workId: string) => works?.find((w) => w.id === workId)?.name ?? ''

  return (
    <div className="space-y-6">
      {/* Breadcrumb + ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/fornecedores" className="hover:text-gray-700">Fornecedores</Link>
          <span>/</span>
          <span className="font-medium text-gray-800">{supplier.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-medium ${supplier.is_active ? 'border-green-200 bg-green-100 text-green-700' : 'border-gray-200 bg-gray-100 text-gray-600'}`}>
            {supplier.is_active ? 'Ativo' : 'Inativo'}
          </span>
          <Link to={`/fornecedores/${id}/editar`} className="rounded-md border border-gray-300 p-1.5 text-gray-500 hover:bg-gray-50">
            <Pencil className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Cards resumo */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Card dados */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{supplier.name}</h1>
              <p className="text-sm text-gray-500">{typeLabel[supplier.type]}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {supplier.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4 text-gray-400" /> {supplier.phone}
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4 text-gray-400" /> {supplier.email}
              </div>
            )}
            {supplier.document && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4 text-gray-400" /> {supplier.document}
              </div>
            )}
          </div>

          {supplier.notes && (
            <p className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-600">{supplier.notes}</p>
          )}
        </div>

        {/* Card financeiro */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total de despesas</span>
              <span className="text-xs text-gray-400">{expenses.length} lançamentos</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <div className="h-1 w-full rounded-full bg-gray-100">
              <div className="h-1 rounded-full bg-red-400" style={{ width: expenses.length ? '100%' : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de despesas */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Despesas vinculadas</h2>
          <div className="flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1">
            <DollarSign className="h-4 w-4 text-red-500" />
            <span className="text-sm font-bold text-red-700">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
        </div>

        {!expenses.length ? (
          <p className="mt-4 text-center text-sm text-gray-400">Nenhuma despesa vinculada a este fornecedor.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {expenses.map((exp) => (
              <div key={exp.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                    <DollarSign className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{exp.description}</p>
                    <p className="text-xs text-gray-400">{workName(exp.work_id)} · {new Date(exp.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-900">{Number(exp.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
