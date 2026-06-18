import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Paperclip } from 'lucide-react'
import { useExpenses, useCreateExpense, useDeleteExpense, getReceiptUrl } from '../../services/expenses'
import { useAuth } from '../../hooks/useAuth'
import type { ExpenseCategory } from '../../types'

const categoryLabel: Record<ExpenseCategory, string> = {
  material: 'Material',
  mao_de_obra: 'Mão de obra',
  terceiros: 'Terceiros',
  frete: 'Frete',
  equipamento: 'Equipamento',
  imprevisto: 'Imprevisto',
  outro: 'Outro',
}

const schema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  category: z.enum(['material', 'mao_de_obra', 'terceiros', 'frete', 'equipamento', 'imprevisto', 'outro']),
  date: z.string().min(1, 'Data é obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function ExpensesSection({ workId }: { workId: string }) {
  const { organization } = useAuth()
  const { data: expenses, isLoading } = useExpenses(workId)
  const createExpense = useCreateExpense()
  const deleteExpense = useDeleteExpense(workId)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: 'material', date: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(data: FormData) {
    await createExpense.mutateAsync({
      work_id: workId,
      organization_id: organization!.id,
      description: data.description,
      amount: parseFloat(data.amount),
      category: data.category,
      date: data.date,
    })
    reset()
    setShowForm(false)
  }

  const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ?? 0

  async function openReceipt(path: string) {
    const url = await getReceiptUrl(path)
    window.open(url, '_blank')
  }

  if (isLoading) return <p className="text-sm text-gray-500">Carregando despesas...</p>

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">Despesas da obra</h2>
          <p className="text-xs text-gray-500">Total lançado: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900">
          <Plus className="h-4 w-4" /> Novo lançamento
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <input {...register('description')} placeholder="Descrição" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
          <div className="flex gap-2">
            <input type="number" step="0.01" min="0.01" {...register('amount')} placeholder="Valor" className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm" />
            <select {...register('category')} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm">
              {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="date" {...register('date')} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm" />
            <button type="submit" disabled={createExpense.isPending} className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">Salvar</button>
          </div>
        </form>
      )}

      {!expenses?.length ? (
        <p className="mt-3 text-sm text-gray-400">Nenhuma despesa lançada.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {expenses.map((exp) => (
            <div key={exp.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
              <div>
                <span className="text-sm text-gray-700">{exp.description}</span>
                {exp.receipt_url && (
                  <button onClick={() => openReceipt(exp.receipt_url!)} className="ml-2 inline-flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200 transition-colors">
                    <Paperclip className="h-3 w-3" /> Ver comprovante
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{Number(exp.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                <button onClick={() => deleteExpense.mutate(exp.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
