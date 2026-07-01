import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { TeamMember } from '../../types'

export type TeamMemberInput = {
  name: string
  phone?: string | null
  email?: string | null
  role: string
  daily_rate?: number | null
  notes?: string | null
}

async function fetchTeamMembers(organizationId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name')
  if (error) throw error
  return data as TeamMember[]
}

async function fetchActiveTeamMembers(organizationId: string) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data as TeamMember[]
}

export function useTeamMember(id: string | undefined) {
  return useQuery({
    queryKey: ['team-members', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_members').select('*').eq('id', id!).single()
      if (error) throw error
      return data as TeamMember
    },
    enabled: !!id,
  })
}

export function useTeamMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['team-members', organizationId],
    queryFn: () => fetchTeamMembers(organizationId!),
    enabled: !!organizationId,
  })
}

export function useActiveTeamMembers(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['team-members', 'active', organizationId],
    queryFn: () => fetchActiveTeamMembers(organizationId!),
    enabled: !!organizationId,
  })
}

export function useCreateTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: TeamMemberInput & { organization_id: string }) => {
      const { data, error } = await supabase.from('team_members').insert(input).select().single()
      if (error) throw error
      return data as TeamMember
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members'] }) },
  })
}

export function useUpdateTeamMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<TeamMemberInput> & { id: string }) => {
      const { data, error } = await supabase.from('team_members').update(input).eq('id', id).select().single()
      if (error) throw error
      return data as TeamMember
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members'] }) },
  })
}

export function useToggleTeamMemberActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('team_members').update({ is_active }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['team-members'] }) },
  })
}
