import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Banknote } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useWorkPayments, useCreateWorkPayment, useDeleteWorkPayment } from '../../services/work-payments'
import type { PaymentMethod } from '../../types'

const methodLabel: Record<PaymentMethod, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  outro: 'Outro',
}

const schema = z.object({
  amount: z.string().min(1, 'Valor é obrigatório'),
  payment_date: z.string().min(1, 'Data é obrigatória'),
  payment_method: z.enum(['pix', 'dinheiro', 'cartao', 'boleto', 'transferencia', 'outro']),
  payer_name: z.string().optional(),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function PaymentsSection({ workId }: { workId: string }) {
  const { organization } = useAuth()
  const { data: payments, isLoading } = useWorkPayments(workId)
  const createPayment = useCreateWorkPayment()
  const deletePayment = useDeleteWorkPayment(workId)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_method: 'pix', payment_date: new Date().toISOString().split('T')[0] },
  })

  async function onSubmit(data: FormData) {
    await createPayment.mutateAsync({
      work_id: workId,
      organization_id: organization!.id,
      amount: parseFloat(data.amount),
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      payer_name: data.payer_name || null,
      description: data.description || null,
    })
    reset({ payment_method: 'pix', payment_date: new Date().toISOString().split('T')[0], amount: '', payer_name: '', description: '' })
    setShowForm(false)
  }

  const total = payments?.reduce((sum, p) => sum + Number(p.amount), 0) ?? 0

  if (isLoading) return <p className="text-sm text-gray-500">Carregando recebimentos...</p>

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">Recebimentos</h2>
          <p className="text-xs text-gray-500">Total recebido: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900">
          <Plus className="h-4 w-4" /> Novo recebimento
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2 rounded-md border border-gray-200 bg-gray-50 p-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <input type="number" step="0.01" min="0.01" {...register('amount')} placeholder="Valor (R$)" className="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
              {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
            </div>
            <select {...register('payment_method')} className="rounded border border-gray-300 px-3 py-2 text-sm">
              {Object.entries(methodLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="date" {...register('payment_date')} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm" />
            <input {...register('payer_name')} placeholder="Pagador (opcional)" className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <input {...register('description')} placeholder="Descrição (opcional)" className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm" />
            <button type="submit" disabled={createPayment.isPending} className="rounded bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50">Salvar</button>
          </div>
        </form>
      )}

      {!payments?.length ? (
        <p className="mt-3 text-sm text-gray-400">Nenhum recebimento registrado.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                  <Banknote className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {Number(p.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {methodLabel[p.payment_method as PaymentMethod] ?? p.payment_method}
                    {p.payer_name && ` · ${p.payer_name}`}
                    {' · '}{new Date(p.payment_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <button onClick={() => deletePayment.mutate(p.id)} className="text-gray-300 hover:text-red-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
