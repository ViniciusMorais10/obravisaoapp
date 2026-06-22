import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { WorkPayment } from '../../types'

export type WorkPaymentInput = {
  work_id: string
  organization_id: string
  amount: number
  payment_date: string
  payment_method: string
  payer_name?: string | null
  description?: string | null
  notes?: string | null
}

export function useWorkPayments(workId: string | undefined) {
  return useQuery({
    queryKey: ['work-payments', workId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_payments')
        .select('*')
        .eq('work_id', workId!)
        .order('payment_date', { ascending: false })
      if (error) throw error
      return data as WorkPayment[]
    },
    enabled: !!workId,
  })
}

export function useCreateWorkPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: WorkPaymentInput) => {
      const { data, error } = await supabase.from('work_payments').insert(input).select().single()
      if (error) throw error
      return data as WorkPayment
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['work-payments', vars.work_id] }) },
  })
}

export function useDeleteWorkPayment(workId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('work_payments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['work-payments', workId] }) },
  })
}
