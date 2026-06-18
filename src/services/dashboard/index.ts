import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Work, Expense, Stage, WorkUpdate } from '../../types'

export interface DashboardData {
  works: Work[]
  expenses: Expense[]
  stages: Stage[]
  workUpdates: WorkUpdate[]
}

async function fetchDashboardData(organizationId: string): Promise<DashboardData> {
  const [worksRes, expensesRes, stagesRes, updatesRes] = await Promise.all([
    supabase.from('works').select('*').eq('organization_id', organizationId),
    supabase.from('expenses').select('*').eq('organization_id', organizationId).order('date', { ascending: false }),
    supabase.from('stages').select('*').eq('organization_id', organizationId),
    supabase.from('work_updates').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(6),
  ])

  if (worksRes.error) throw worksRes.error
  if (expensesRes.error) throw expensesRes.error
  if (stagesRes.error) throw stagesRes.error
  if (updatesRes.error) throw updatesRes.error

  return {
    works: worksRes.data as Work[],
    expenses: expensesRes.data as Expense[],
    stages: stagesRes.data as Stage[],
    workUpdates: updatesRes.data as WorkUpdate[],
  }
}

export function useDashboard(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard', organizationId],
    queryFn: () => fetchDashboardData(organizationId!),
    enabled: !!organizationId,
  })
}
