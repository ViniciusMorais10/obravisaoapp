import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Work } from '../../types'

export type WorkInput = {
  name: string
  client?: string | null
  address?: string | null
  start_date?: string | null
  expected_end_date?: string | null
  expected_budget?: number | null
  status?: string
}

async function fetchWorks(organizationId: string) {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Work[]
}

async function fetchWork(id: string) {
  const { data, error } = await supabase
    .from('works')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Work
}

async function createWork(input: WorkInput & { organization_id: string }) {
  const { data, error } = await supabase.from('works').insert(input).select().single()
  if (error) throw error
  return data as Work
}

async function updateWork(id: string, input: Partial<WorkInput>) {
  const { data, error } = await supabase.from('works').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Work
}

async function deleteWork(id: string) {
  const { error } = await supabase.from('works').delete().eq('id', id)
  if (error) throw error
}

export function useWorks(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['works', organizationId],
    queryFn: () => fetchWorks(organizationId!),
    enabled: !!organizationId,
  })
}

export function useWork(id: string | undefined) {
  return useQuery({
    queryKey: ['works', 'detail', id],
    queryFn: () => fetchWork(id!),
    enabled: !!id,
  })
}

export function useCreateWork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWork,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['works'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateWork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<WorkInput> & { id: string }) => updateWork(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['works'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteWork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWork,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['works'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
