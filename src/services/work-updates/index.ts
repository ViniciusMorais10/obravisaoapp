import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { WorkUpdate } from '../../types'

export type WorkUpdateInput = {
  work_id: string
  stage_id?: string | null
  description: string
  photo_url?: string | null
  author_name?: string | null
}

async function fetchWorkUpdates(workId: string) {
  const { data, error } = await supabase
    .from('work_updates')
    .select('*')
    .eq('work_id', workId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as WorkUpdate[]
}

async function createWorkUpdate(input: WorkUpdateInput & { organization_id: string }) {
  const { data, error } = await supabase.from('work_updates').insert(input).select().single()
  if (error) throw error
  return data as WorkUpdate
}

async function deleteWorkUpdate(id: string) {
  const { error } = await supabase.from('work_updates').delete().eq('id', id)
  if (error) throw error
}

export async function uploadPhoto(organizationId: string, workId: string, file: File) {
  const path = `${organizationId}/${workId}/${Date.now()}-${file.name}`
  const { error } = await supabase.storage.from('obra-fotos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('obra-fotos').getPublicUrl(path)
  return data.publicUrl
}

export function useWorkUpdates(workId: string | undefined) {
  return useQuery({
    queryKey: ['work_updates', workId],
    queryFn: () => fetchWorkUpdates(workId!),
    enabled: !!workId,
  })
}

export function useCreateWorkUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createWorkUpdate,
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['work_updates', vars.work_id] }),
  })
}

export function useDeleteWorkUpdate(workId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteWorkUpdate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work_updates', workId] }),
  })
}
