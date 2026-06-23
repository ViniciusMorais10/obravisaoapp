-- ============================================================
-- TABELA: subscriptions
-- ============================================================

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'trial',
  plan_name text not null default 'mensal',
  plan_price numeric(10,2) not null default 97.90,
  trial_start date not null default current_date,
  trial_end date not null default (current_date + 7),
  paid_until date null,
  grace_period_until date null,
  payment_provider text null,
  provider_customer_id text null,
  provider_subscription_id text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint subscriptions_status_check check (status in ('trial', 'active', 'past_due', 'cancelled', 'expired'))
);

-- Índice por organization_id
create unique index subscriptions_organization_id_idx on public.subscriptions(organization_id);

-- Trigger updated_at
create trigger set_updated_at_subscriptions
  before update on public.subscriptions
  for each row execute function public.handle_updated_at();

-- ============================================================
-- RLS
-- ============================================================

alter table public.subscriptions enable row level security;

create policy "Usuário lê subscription da própria organização"
  on public.subscriptions for select
  using (
    organization_id in (
      select p.organization_id from public.profiles p where p.user_id = auth.uid()
    )
  );

-- ============================================================
-- Alterar trigger handle_new_user para criar subscription
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare
  org_id uuid;
  user_name text;
  company text;
begin
  user_name := coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), 'Usuário');
  company := coalesce(nullif(trim(new.raw_user_meta_data->>'company_name'), ''), 'Minha Empresa');

  insert into public.organizations (name)
  values (company)
  returning id into org_id;

  insert into public.profiles (user_id, organization_id, name)
  values (new.id, org_id, user_name);

  insert into public.subscriptions (organization_id, status, trial_start, trial_end)
  values (org_id, 'trial', current_date, current_date + 7);

  return new;
end;
$$;
