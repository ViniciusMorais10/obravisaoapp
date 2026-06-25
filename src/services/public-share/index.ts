import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function enablePublicShare(workId: string) {
  const token = generateToken()
  const { error } = await supabase
    .from('works')
    .update({
      public_share_enabled: true,
      public_share_token: token,
      public_share_created_at: new Date().toISOString(),
      public_share_updated_at: new Date().toISOString(),
    })
    .eq('id', workId)
  if (error) throw error
  return token
}

export async function disablePublicShare(workId: string) {
  const { error } = await supabase
    .from('works')
    .update({
      public_share_enabled: false,
      public_share_updated_at: new Date().toISOString(),
    })
    .eq('id', workId)
  if (error) throw error
}

export async function regeneratePublicShare(workId: string) {
  const token = generateToken()
  const { error } = await supabase
    .from('works')
    .update({
      public_share_token: token,
      public_share_enabled: true,
      public_share_updated_at: new Date().toISOString(),
    })
    .eq('id', workId)
  if (error) throw error
  return token
}

export async function fetchWorkByPublicToken(token: string) {
  const { data, error } = await supabase
    .from('works')
    .select('id, name, client, status, start_date, expected_end_date, public_share_enabled')
    .eq('public_share_token', token)
    .eq('public_share_enabled', true)
    .maybeSingle()
  if (error || !data) return null
  return data
}

export async function fetchPublicUpdates(workId: string) {
  const { data, error } = await supabase
    .from('work_updates')
    .select('id, description, photo_url, author_name, created_at, stage_id')
    .eq('work_id', workId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchPublicStages(workId: string) {
  const { data, error } = await supabase
    .from('stages')
    .select('id, name, status, percentage')
    .eq('work_id', workId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export function useEnablePublicShare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: enablePublicShare,
    onSuccess: (_, workId) => {
      qc.invalidateQueries({ queryKey: ['works', 'detail', workId] })
    },
  })
}

export function useDisablePublicShare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: disablePublicShare,
    onSuccess: (_, workId) => {
      qc.invalidateQueries({ queryKey: ['works', 'detail', workId] })
    },
  })
}

export function useRegeneratePublicShare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: regeneratePublicShare,
    onSuccess: (_, workId) => {
      qc.invalidateQueries({ queryKey: ['works', 'detail', workId] })
    },
  })
}

export function usePublicWork(token: string | undefined) {
  return useQuery({
    queryKey: ['public_work', token],
    queryFn: () => fetchWorkByPublicToken(token!),
    enabled: !!token,
  })
}

export function usePublicUpdates(workId: string | undefined) {
  return useQuery({
    queryKey: ['public_updates', workId],
    queryFn: () => fetchPublicUpdates(workId!),
    enabled: !!workId,
  })
}

export function usePublicStages(workId: string | undefined) {
  return useQuery({
    queryKey: ['public_stages', workId],
    queryFn: () => fetchPublicStages(workId!),
    enabled: !!workId,
  })
}
