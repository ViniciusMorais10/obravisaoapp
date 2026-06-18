import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface WorkShareLink {
  id: string
  organization_id: string
  work_id: string
  token: string
  type: string
  active: boolean
  expires_at: string | null
  created_at: string
}

async function fetchLinkByWork(workId: string) {
  const { data, error } = await supabase
    .from('work_share_links')
    .select('*')
    .eq('work_id', workId)
    .eq('active', true)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as WorkShareLink | null
}

async function generateLink(organizationId: string, workId: string) {
  // Desativar links anteriores
  await supabase
    .from('work_share_links')
    .update({ active: false })
    .eq('work_id', workId)
    .eq('active', true)

  // Criar novo
  const { data, error } = await supabase
    .from('work_share_links')
    .insert({ organization_id: organizationId, work_id: workId })
    .select()
    .single()
  if (error) throw error
  return data as WorkShareLink
}

async function deactivateLink(linkId: string) {
  const { error } = await supabase
    .from('work_share_links')
    .update({ active: false })
    .eq('id', linkId)
  if (error) throw error
}

export function useShareLink(workId: string | undefined) {
  return useQuery({
    queryKey: ['share_link', workId],
    queryFn: () => fetchLinkByWork(workId!),
    enabled: !!workId,
  })
}

export function useGenerateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ organizationId, workId }: { organizationId: string; workId: string }) => generateLink(organizationId, workId),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['share_link', vars.workId] }),
  })
}

export function useDeactivateLink() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deactivateLink,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['share_link'] }),
  })
}

// --- Funções públicas (anon) para a tela pública ---

export async function validateToken(token: string) {
  const { data, error } = await supabase
    .from('work_share_links')
    .select('id, organization_id, work_id, active, expires_at')
    .eq('token', token)
    .eq('active', true)
    .maybeSingle()

  if (error || !data) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  return data
}

export async function submitPublicUpdate(organizationId: string, workId: string, authorName: string, description: string) {
  const { error } = await supabase
    .from('work_updates')
    .insert({
      organization_id: organizationId,
      work_id: workId,
      author_name: authorName,
      description,
    })
  if (error) throw error
}
