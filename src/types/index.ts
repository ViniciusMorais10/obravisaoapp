export type WorkStatus = 'planejada' | 'em_andamento' | 'pausada' | 'concluida'

export type StageStatus = 'nao_iniciada' | 'em_andamento' | 'concluida' | 'atrasada'

export type ExpenseCategory =
  | 'material'
  | 'mao_de_obra'
  | 'terceiros'
  | 'frete'
  | 'equipamento'
  | 'imprevisto'
  | 'outro'

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  organization_id: string
  name: string
  created_at: string
}

export interface Work {
  id: string
  organization_id: string
  name: string
  client: string | null
  address: string | null
  start_date: string | null
  expected_end_date: string | null
  expected_budget: number | null
  status: WorkStatus
  created_at: string
  updated_at: string
}

export interface Stage {
  id: string
  organization_id: string
  work_id: string
  name: string
  status: StageStatus
  expected_date: string | null
  percentage: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  organization_id: string
  work_id: string
  stage_id: string | null
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  receipt_url: string | null
  created_at: string
}

export interface WorkUpdate {
  id: string
  organization_id: string
  work_id: string
  stage_id: string | null
  description: string
  photo_url: string | null
  author_name: string | null
  created_at: string
}
