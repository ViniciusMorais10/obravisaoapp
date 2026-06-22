import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ToggleLeft, ToggleRight, Pencil, Truck, Eye } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSuppliers, useToggleSupplierActive } from '../../services/suppliers'
import type { SupplierType } from '../../types'

const typeLabel: Record<SupplierType, string> = {
  material: 'Material',
  mao_de_obra: 'Mão de obra',
  servico: 'Serviço',
  equipamento: 'Equipamento',
  outro: 'Outro',
}

export default function Fornecedores() {
  const { organization } = useAuth()
  const { data: suppliers, isLoading } = useSuppliers(organization?.id)
  const toggle = useToggleSupplierActive()
  const [search, setSearch] = useState('')

  if (isLoading) return <div className="flex flex-col items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /><p className="mt-3 text-sm text-gray-500">Carregando fornecedores...</p></div>

  const filtered = suppliers?.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-sm text-gray-500">Gerencie seus fornecedores e prestadores</p>
        </div>
        <Link to="/fornecedores/novo" className="flex items-center gap-1.5 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
          <Plus className="h-4 w-4" /> Novo fornecedor
        </Link>
      </div>

      {/* Busca */}
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

      {/* Lista */}
      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Truck className="h-10 w-10 text-gray-300" />
          <p className="mt-3 text-sm text-gray-500">{search ? 'Nenhum fornecedor encontrado.' : 'Nenhum fornecedor cadastrado.'}</p>
          {!search && (
            <Link to="/fornecedores/novo" className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
              Cadastrar primeiro fornecedor
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((supplier) => (
            <div key={supplier.id} className={`rounded-lg border bg-white p-4 ${supplier.is_active ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Truck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{supplier.name}</p>
                  <p className="text-xs text-gray-400">
                    {typeLabel[supplier.type]}
                    {supplier.phone && ` · ${supplier.phone}`}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                <Link to={`/fornecedores/${supplier.id}`} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
                  <Eye className="h-4 w-4" /> Detalhes
                </Link>
                <button
                  onClick={() => toggle.mutate({ id: supplier.id, is_active: !supplier.is_active })}
                  className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${supplier.is_active ? 'text-green-700 hover:bg-green-50' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {supplier.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                  {supplier.is_active ? 'Inativar' : 'Ativar'}
                </button>
                <Link to={`/fornecedores/${supplier.id}/editar`} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
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
