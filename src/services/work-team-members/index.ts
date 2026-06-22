import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { WorkTeamMember } from '../../types'

export function useWorkTeamMembers(workId: string | undefined) {
  return useQuery({
    queryKey: ['work-team-members', workId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_team_members')
        .select('*, team_member:team_members(*)')
        .eq('work_id', workId!)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as WorkTeamMember[]
    },
    enabled: !!workId,
  })
}

export function useAddTeamMemberToWork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { organization_id: string; work_id: string; team_member_id: string; role_in_work?: string | null }) => {
      const { data, error } = await supabase.from('work_team_members').insert(input).select('*, team_member:team_members(*)').single()
      if (error) throw error
      return data as WorkTeamMember
    },
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['work-team-members', vars.work_id] }) },
  })
}

export function useRemoveTeamMemberFromWork() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, work_id }: { id: string; work_id: string }) => {
      const { error } = await supabase.from('work_team_members').update({ is_active: false }).eq('id', id)
      if (error) throw error
      return work_id
    },
    onSuccess: (workId) => { qc.invalidateQueries({ queryKey: ['work-team-members', workId] }) },
  })
}
