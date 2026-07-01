export type SupplierType = 'material' | 'mao_de_obra' | 'servico' | 'equipamento' | 'outro'

export interface Supplier {
  id: string
  organization_id: string
  name: string
  phone: string | null
  email: string | null
  document: string | null
  type: SupplierType
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

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
  public_share_enabled: boolean
  public_share_token: string | null
  public_share_created_at: string | null
  public_share_updated_at: string | null
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
  supplier_id: string | null
  category: ExpenseCategory
  description: string
  amount: number
  date: string
  receipt_url: string | null
  created_at: string
  supplier?: { name: string } | null
}

export type TeamMemberRole = 'pedreiro' | 'ajudante' | 'eletricista' | 'encanador' | 'pintor' | 'mestre_de_obra' | 'engenheiro' | 'arquiteto' | 'outro'

export interface TeamMember {
  id: string
  organization_id: string
  name: string
  phone: string | null
  email: string | null
  role: string
  daily_rate: number | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkTeamMember {
  id: string
  organization_id: string
  work_id: string
  team_member_id: string
  role_in_work: string | null
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  team_member?: TeamMember
}

export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'boleto' | 'transferencia' | 'outro'

export interface WorkPayment {
  id: string
  organization_id: string
  work_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  payer_name: string | null
  description: string | null
  notes: string | null
  attachment_url: string | null
  created_at: string
  updated_at: string
}

export interface WorkUpdate {
  id: string
  organization_id: string
  work_id: string
  stage_id: string | null
  description: string
  photo_url: string | null
  photo_urls: string[] | null
  author_name: string | null
  report_date: string | null
  responsible: string | null
  activities_done: string | null
  issues: string | null
  next_activities: string | null
  observations: string | null
  created_at: string
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired'

export interface Subscription {
  id: string
  organization_id: string
  status: SubscriptionStatus
  plan_name: string
  plan_price: number
  trial_start: string
  trial_end: string
  paid_until: string | null
  grace_period_until: string | null
  payment_provider: string | null
  provider_customer_id: string | null
  provider_subscription_id: string | null
  created_at: string
  updated_at: string
}
