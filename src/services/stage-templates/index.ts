import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export interface StageTemplate {
  id: string
  organization_id: string | null
  name: string
  created_at: string
}

async function fetchStageTemplates() {
  const { data, error } = await supabase
    .from('stage_templates')
    .select('*')
    .order('name')
  if (error) throw error
  return data as StageTemplate[]
}

async function createStageTemplate(input: { organization_id: string; name: string }) {
  const { data, error } = await supabase
    .from('stage_templates')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as StageTemplate
}

export function useStageTemplates() {
  return useQuery({
    queryKey: ['stage-templates'],
    queryFn: fetchStageTemplates,
  })
}

export function useCreateStageTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createStageTemplate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stage-templates'] })
    },
  })
}
