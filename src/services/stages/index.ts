import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Stage } from '../../types'

export type StageInput = {
  name: string
  status?: string
  expected_date?: string | null
  percentage?: number
  notes?: string | null
}

async function fetchStages(workId: string) {
  const { data, error } = await supabase
    .from('stages')
    .select('*')
    .eq('work_id', workId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as Stage[]
}

async function createStage(input: StageInput & { organization_id: string; work_id: string }) {
  const { data, error } = await supabase.from('stages').insert(input).select().single()
  if (error) throw error
  return data as Stage
}

async function updateStage(id: string, input: Partial<StageInput>) {
  const { data, error } = await supabase.from('stages').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Stage
}

async function deleteStage(id: string) {
  const { error } = await supabase.from('stages').delete().eq('id', id)
  if (error) throw error
}

export function useStages(workId: string | undefined) {
  return useQuery({
    queryKey: ['stages', workId],
    queryFn: () => fetchStages(workId!),
    enabled: !!workId,
  })
}

export function useCreateStage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createStage,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['stages', vars.work_id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateStage(workId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<StageInput> & { id: string }) => updateStage(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stages', workId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteStage(workId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteStage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stages', workId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
