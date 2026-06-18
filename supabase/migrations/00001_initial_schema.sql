-- ObraVisão Beta 0.1 — Migration Inicial (v3 final)
-- Inclui: tabelas, índices, funções, triggers, RLS, storage, view, grants

-- ============================================================
-- EXTENSÕES
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id)
);

create table public.works (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  client text,
  address text,
  start_date date,
  expected_end_date date,
  expected_budget numeric(12,2) check (expected_budget >= 0),
  status text not null default 'planejada' check (status in ('planejada', 'em_andamento', 'pausada', 'concluida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stages (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_id uuid not null references public.works(id) on delete cascade,
  name text not null,
  status text not null default 'nao_iniciada' check (status in ('nao_iniciada', 'em_andamento', 'concluida', 'atrasada')),
  expected_date date,
  percentage int not null default 0 check (percentage >= 0 and percentage <= 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_id uuid not null references public.works(id) on delete cascade,
  stage_id uuid references public.stages(id) on delete set null,
  category text not null check (category in ('material', 'mao_de_obra', 'terceiros', 'frete', 'equipamento', 'imprevisto', 'outro')),
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  date date not null,
  receipt_url text,
  created_at timestamptz not null default now()
);

create table public.work_updates (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  work_id uuid not null references public.works(id) on delete cascade,
  stage_id uuid references public.stages(id) on delete set null,
  description text not null,
  photo_url text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

create index idx_profiles_user_id on public.profiles(user_id);
create index idx_profiles_organization_id on public.profiles(organization_id);
create index idx_works_organization_id on public.works(organization_id);
create index idx_stages_organization_id on public.stages(organization_id);
create index idx_stages_work_id on public.stages(work_id);
create index idx_expenses_organization_id on public.expenses(organization_id);
create index idx_expenses_work_id on public.expenses(work_id);
create index idx_work_updates_organization_id on public.work_updates(organization_id);
create index idx_work_updates_work_id on public.work_updates(work_id);

-- ============================================================
-- FUNÇÕES
-- ============================================================

-- Obter organization_id do usuário autenticado
create or replace function public.get_user_organization_id()
returns uuid
language sql stable security definer
set search_path = public, pg_temp
as $$
  select organization_id from public.profiles where user_id = auth.uid()
$$;

-- updated_at automático
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Criar organization + profile no signup
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

  return new;
end;
$$;

-- Impedir alteração de user_id e organization_id no profile
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'Não é permitido alterar user_id';
  end if;
  if new.organization_id is distinct from old.organization_id then
    raise exception 'Não é permitido alterar organization_id';
  end if;
  return new;
end;
$$;

-- Helper: safe uuid cast para storage policies
create or replace function public.safe_cast_uuid(val text)
returns uuid
language plpgsql immutable
set search_path = public, pg_temp
as $$
begin
  return val::uuid;
exception when others then
  return null;
end;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

create trigger set_updated_at_works
  before update on public.works
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_stages
  before update on public.stages
  for each row execute function public.handle_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger protect_profile_immutable_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ============================================================
-- RLS — HABILITAR
-- ============================================================

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.stages enable row level security;
alter table public.expenses enable row level security;
alter table public.work_updates enable row level security;

-- ============================================================
-- RLS — POLICIES: organizations
-- ============================================================

create policy "Usuário vê própria organização"
  on public.organizations for select
  using (id = public.get_user_organization_id());

create policy "Usuário atualiza própria organização"
  on public.organizations for update
  using (id = public.get_user_organization_id());

-- ============================================================
-- RLS — POLICIES: profiles
-- ============================================================

create policy "Usuário vê próprio profile"
  on public.profiles for select
  using (user_id = auth.uid());

create policy "Usuário atualiza próprio profile"
  on public.profiles for update
  using (user_id = auth.uid());

-- ============================================================
-- RLS — POLICIES: works
-- ============================================================

create policy "Usuário vê obras da organização"
  on public.works for select
  using (organization_id = public.get_user_organization_id());

create policy "Usuário cria obras na organização"
  on public.works for insert
  with check (organization_id = public.get_user_organization_id());

create policy "Usuário edita obras da organização"
  on public.works for update
  using (organization_id = public.get_user_organization_id())
  with check (organization_id = public.get_user_organization_id());

create policy "Usuário exclui obras da organização"
  on public.works for delete
  using (organization_id = public.get_user_organization_id());

-- ============================================================
-- RLS — POLICIES: stages
-- ============================================================

create policy "Usuário vê etapas da organização"
  on public.stages for select
  using (organization_id = public.get_user_organization_id());

create policy "Usuário cria etapas na organização"
  on public.stages for insert
  with check (
    organization_id = public.get_user_organization_id()
    and exists (
      select 1 from public.works
      where id = work_id and organization_id = public.get_user_organization_id()
    )
  );

create policy "Usuário edita etapas da organização"
  on public.stages for update
  using (organization_id = public.get_user_organization_id())
  with check (
    organization_id = public.get_user_organization_id()
    and exists (
      select 1 from public.works
      where id = work_id and organization_id = public.get_user_organization_id()
    )
  );

create policy "Usuário exclui etapas da organização"
  on public.stages for delete
  using (organization_id = public.get_user_organization_id());

-- ============================================================
-- RLS — POLICIES: expenses
-- ============================================================

create policy "Usuário vê despesas da organização"
  on public.expenses for select
  using (organization_id = public.get_user_organization_id());

create policy "Usuário cria despesas na organização"
  on public.expenses for insert
  with check (
    organization_id = public.get_user_organization_id()
    and exists (
      select 1 from public.works
      where id = work_id and organization_id = public.get_user_organization_id()
    )
    and (
      stage_id is null
      or exists (
        select 1 from public.stages
        where id = stage_id and work_id = expenses.work_id and organization_id = public.get_user_organization_id()
      )
    )
  );

create policy "Usuário edita despesas da organização"
  on public.expenses for update
  using (organization_id = public.get_user_organization_id())
  with check (
    organization_id = public.get_user_organization_id()
    and exists (
      select 1 from public.works
      where id = work_id and organization_id = public.get_user_organization_id()
    )
    and (
      stage_id is null
      or exists (
        select 1 from public.stages
        where id = stage_id and work_id = expenses.work_id and organization_id = public.get_user_organization_id()
      )
    )
  );

create policy "Usuário exclui despesas da organização"
  on public.expenses for delete
  using (organization_id = public.get_user_organization_id());

-- ============================================================
-- RLS — POLICIES: work_updates
-- ============================================================

create policy "Usuário vê atualizações da organização"
  on public.work_updates for select
  using (organization_id = public.get_user_organization_id());

create policy "Usuário cria atualizações na organização"
  on public.work_updates for insert
  with check (
    organization_id = public.get_user_organization_id()
    and exists (
      select 1 from public.works
      where id = work_id and organization_id = public.get_user_organization_id()
    )
    and (
      stage_id is null
      or exists (
        select 1 from public.stages
        where id = stage_id and work_id = work_updates.work_id and organization_id = public.get_user_organization_id()
      )
    )
  );

create policy "Usuário edita atualizações da organização"
  on public.work_updates for update
  using (organization_id = public.get_user_organization_id())
  with check (
    organization_id = public.get_user_organization_id()
    and exists (
      select 1 from public.works
      where id = work_id and organization_id = public.get_user_organization_id()
    )
    and (
      stage_id is null
      or exists (
        select 1 from public.stages
        where id = stage_id and work_id = work_updates.work_id and organization_id = public.get_user_organization_id()
      )
    )
  );

create policy "Usuário exclui atualizações da organização"
  on public.work_updates for delete
  using (organization_id = public.get_user_organization_id());

-- ============================================================
-- VIEW: dashboard_work_summary (security_invoker respeita RLS)
-- ============================================================

create or replace view public.dashboard_work_summary
with (security_invoker = true)
as
select
  w.id as work_id,
  w.organization_id,
  w.name,
  w.status,
  w.expected_budget,
  w.start_date,
  w.expected_end_date,
  coalesce(e.total_spent, 0) as total_spent,
  coalesce(w.expected_budget, 0) - coalesce(e.total_spent, 0) as budget_remaining,
  case
    when w.expected_budget > 0 and coalesce(e.total_spent, 0) > w.expected_budget then true
    else false
  end as over_budget,
  coalesce(s.avg_percentage, 0) as progress_percentage,
  coalesce(s.total_stages, 0) as total_stages,
  coalesce(s.completed_stages, 0) as completed_stages,
  case
    when w.expected_end_date < current_date and w.status in ('planejada', 'em_andamento') then true
    else false
  end as is_late
from public.works w
left join (
  select work_id, sum(amount) as total_spent
  from public.expenses
  group by work_id
) e on e.work_id = w.id
left join (
  select
    work_id,
    avg(percentage)::int as avg_percentage,
    count(*)::int as total_stages,
    count(*) filter (where status = 'concluida')::int as completed_stages
  from public.stages
  group by work_id
) s on s.work_id = w.id;

-- ============================================================
-- GRANTS para role authenticated
-- ============================================================

grant usage on schema public to authenticated;

grant select, update on public.organizations to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.works to authenticated;
grant select, insert, update, delete on public.stages to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.work_updates to authenticated;
grant select on public.dashboard_work_summary to authenticated;

-- ============================================================
-- STORAGE: bucket para fotos de obra
-- ============================================================

insert into storage.buckets (id, name, public)
values ('obra-fotos', 'obra-fotos', false)
on conflict (id) do nothing;

-- ============================================================
-- STORAGE POLICIES: obra-fotos
-- Usa safe_cast_uuid para evitar erro de cast inválido
-- Path esperado: {organization_id}/{work_id}/{file-name}
-- ============================================================

create policy "Upload fotos da organização"
  on storage.objects for insert
  with check (
    bucket_id = 'obra-fotos'
    and (storage.foldername(name))[1] = public.get_user_organization_id()::text
    and public.safe_cast_uuid((storage.foldername(name))[2]) is not null
    and exists (
      select 1 from public.works
      where id = public.safe_cast_uuid((storage.foldername(name))[2])
        and organization_id = public.get_user_organization_id()
    )
  );

create policy "Download fotos da organização"
  on storage.objects for select
  using (
    bucket_id = 'obra-fotos'
    and (storage.foldername(name))[1] = public.get_user_organization_id()::text
    and public.safe_cast_uuid((storage.foldername(name))[2]) is not null
    and exists (
      select 1 from public.works
      where id = public.safe_cast_uuid((storage.foldername(name))[2])
        and organization_id = public.get_user_organization_id()
    )
  );

create policy "Delete fotos da organização"
  on storage.objects for delete
  using (
    bucket_id = 'obra-fotos'
    and (storage.foldername(name))[1] = public.get_user_organization_id()::text
    and public.safe_cast_uuid((storage.foldername(name))[2]) is not null
    and exists (
      select 1 from public.works
      where id = public.safe_cast_uuid((storage.foldername(name))[2])
        and organization_id = public.get_user_organization_id()
    )
  );
