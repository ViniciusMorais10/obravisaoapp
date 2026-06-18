import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Paperclip, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'
import { useWorks } from '../../services/works'
import { useStages } from '../../services/stages'
import { useCreateExpense, validateReceiptFile, uploadReceipt, attachReceipt } from '../../services/expenses'
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
  work_id: z.string().min(1, 'Selecione a obra'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  category: z.enum(['material', 'mao_de_obra', 'terceiros', 'frete', 'equipamento', 'imprevisto', 'outro']),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
  stage_id: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function NovaDespesa() {
  const { organization } = useAuth()
  const { data: works } = useWorks(organization?.id)
  const createExpense = useCreateExpense()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const prefilledWork = searchParams.get('obra') ?? ''
  const [success, setSuccess] = useState(false)
  const [savedWorkId, setSavedWorkId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      work_id: prefilledWork,
      date: new Date().toISOString().split('T')[0],
      category: 'material',
    },
  })

  const selectedWorkId = watch('work_id')
  const { data: stages } = useStages(selectedWorkId || undefined)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    const error = validateReceiptFile(selected)
    if (error) {
      setFileError(error)
      setFile(null)
    } else {
      setFileError('')
      setFile(selected)
    }
  }

  async function onSubmit(data: FormData) {
    // 1. Criar despesa sem receipt
    const expense = await createExpense.mutateAsync({
      work_id: data.work_id,
      organization_id: organization!.id,
      amount: parseFloat(data.amount),
      category: data.category,
      description: data.description,
      date: data.date,
      stage_id: data.stage_id || null,
    })

    // 2. Upload comprovante se houver
    if (file && expense) {
      try {
        const path = await uploadReceipt(organization!.id, data.work_id, expense.id, file)
        await attachReceipt(expense.id, path)
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
      } catch {
        toast.error('Não foi possível enviar o comprovante. A despesa foi salva, mas tente anexar novamente.')
      }
    }

    setSavedWorkId(data.work_id)
    setSuccess(true)
  }

  function handleNewExpense() {
    reset({ work_id: '', date: new Date().toISOString().split('T')[0], category: 'material', description: '', amount: '', stage_id: '' })
    setFile(null)
    setFileError('')
    setSuccess(false)
  }

  if (success) {
    return (
      <div className="mx-auto flex max-w-sm flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-green-500" />
        <p className="mt-3 text-lg font-semibold text-gray-800">Despesa lançada com sucesso!</p>
        <div className="mt-6 flex gap-3">
          <button onClick={handleNewExpense} className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Lançar outra despesa
          </button>
          <Link to={`/obras/${savedWorkId}`} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Ver obra
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-xl font-bold text-gray-900">Lançar despesa</h1>
      <p className="text-sm text-gray-500">Registre uma despesa de forma rápida</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        {/* Obra */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Obra *</label>
          <select {...register('work_id')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none">
            <option value="">Selecione a obra</option>
            {works?.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {errors.work_id && <p className="mt-1 text-xs text-red-600">{errors.work_id.message}</p>}
        </div>

        {/* Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Valor (R$) *</label>
          <input type="number" step="0.01" min="0.01" {...register('amount')} placeholder="Ex: 150.00" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
          {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Categoria *</label>
          <select {...register('category')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none">
            {Object.entries(categoryLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Descrição *</label>
          <input {...register('description')} placeholder="Ex: Cimento CP-II 50kg" className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
        </div>

        {/* Comprovante */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Comprovante ou anexo</label>
          <p className="text-xs text-gray-400">Opcional. Envie uma foto, recibo, comprovante de Pix ou PDF.</p>
          <div className="mt-1.5">
            {file ? (
              <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                <Paperclip className="h-4 w-4 text-gray-500" />
                <span className="flex-1 truncate text-sm text-gray-700">{file.name}</span>
                <button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = '' }} className="text-gray-400 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-2 rounded-md border border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-500 hover:border-gray-400 hover:bg-gray-50">
                <Paperclip className="h-4 w-4" /> Escolher arquivo
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleFileChange} />
            {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
          </div>
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Data *</label>
          <input type="date" {...register('date')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none" />
        </div>

        {/* Etapa (opcional) */}
        {stages && stages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Etapa <span className="text-gray-400">(opcional)</span></label>
            <select {...register('stage_id')} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-slate-500 focus:outline-none">
              <option value="">Nenhuma</option>
              {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={isSubmitting} className="w-full rounded-md bg-slate-800 py-3 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : 'Lançar despesa'}
          </button>
        </div>

        <Link to="/despesas" className="block text-center text-sm text-gray-500 hover:text-gray-700">Cancelar</Link>
      </form>
    </div>
  )
}
