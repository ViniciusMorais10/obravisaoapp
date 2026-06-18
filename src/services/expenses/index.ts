import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Expense } from '../../types'

export type ExpenseInput = {
  work_id: string
  stage_id?: string | null
  category: string
  description: string
  amount: number
  date: string
  receipt_url?: string | null
}

async function fetchExpenses(workId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('work_id', workId)
    .order('date', { ascending: false })
  if (error) throw error
  return data as Expense[]
}

async function createExpense(input: ExpenseInput & { organization_id: string }) {
  const { data, error } = await supabase.from('expenses').insert(input).select().single()
  if (error) throw error
  return data as Expense
}

async function updateExpense(id: string, input: Partial<ExpenseInput>) {
  const { data, error } = await supabase.from('expenses').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Expense
}

async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

export function useExpenses(workId: string | undefined) {
  return useQuery({
    queryKey: ['expenses', workId],
    queryFn: () => fetchExpenses(workId!),
    enabled: !!workId,
  })
}

export function useAllExpenses(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['expenses', 'all', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('organization_id', organizationId!)
        .order('date', { ascending: false })
      if (error) throw error
      return data as Expense[]
    },
    enabled: !!organizationId,
  })
}

export function useCreateExpense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['expenses', vars.work_id] })
      qc.invalidateQueries({ queryKey: ['expenses', 'all'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateExpense(workId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<ExpenseInput> & { id: string }) => updateExpense(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', workId] })
      qc.invalidateQueries({ queryKey: ['expenses', 'all'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteExpense(workId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', workId] })
      qc.invalidateQueries({ queryKey: ['expenses', 'all'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// --- Comprovante helpers ---

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export function validateReceiptFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Formato não permitido. Envie imagem ou PDF.'
  if (file.size > MAX_SIZE) return 'Arquivo muito grande. Envie um arquivo de até 5 MB.'
  return null
}

export async function uploadReceipt(organizationId: string, workId: string, expenseId: string, file: File) {
  const path = `${organizationId}/${workId}/${expenseId}/${file.name}`
  const { error } = await supabase.storage.from('comprovantes').upload(path, file)
  if (error) throw new Error('Não foi possível enviar o comprovante. Tente novamente.')
  return path
}

export async function getReceiptUrl(path: string) {
  const { data, error } = await supabase.storage.from('comprovantes').createSignedUrl(path, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function attachReceipt(expenseId: string, receiptPath: string) {
  const { error } = await supabase.from('expenses').update({ receipt_url: receiptPath }).eq('id', expenseId)
  if (error) throw error
}
