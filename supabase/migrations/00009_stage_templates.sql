-- Stage Templates por organização
-- organization_id NULL = templates padrão do sistema

create table public.stage_templates (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique(organization_id, name)
);

-- RLS
alter table public.stage_templates enable row level security;

-- Leitura: templates do sistema (org null) + templates da organização do usuário
create policy "stage_templates_select" on public.stage_templates for select using (
  organization_id is null
  or organization_id = (select organization_id from public.profiles where user_id = auth.uid())
);

-- Insert: apenas na própria organização
create policy "stage_templates_insert" on public.stage_templates for insert with check (
  organization_id = (select organization_id from public.profiles where user_id = auth.uid())
);

-- Delete: apenas templates da própria organização (não os do sistema)
create policy "stage_templates_delete" on public.stage_templates for delete using (
  organization_id is not null
  and organization_id = (select organization_id from public.profiles where user_id = auth.uid())
);

-- Seed: templates padrão do sistema
insert into public.stage_templates (organization_id, name) values
  (null, 'Serviços Preliminares'),
  (null, 'Demolição e Construção'),
  (null, 'Instalações Elétricas'),
  (null, 'Instalações Hidrossanitárias'),
  (null, 'Instalações Frigorígenas'),
  (null, 'Serviços de Forro'),
  (null, 'Serviços de Revestimento'),
  (null, 'Serviços de Louças e Metais'),
  (null, 'Instalação de Acabamentos Elétricos'),
  (null, 'Serviços de Iluminação'),
  (null, 'Serviços de Emassamento e Pintura'),
  (null, 'Finalização');
