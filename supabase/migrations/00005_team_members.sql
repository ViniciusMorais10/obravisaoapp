-- ObraVisao Beta 0.1 - Equipe
-- Tabela team_members + work_team_members

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  role text NOT NULL DEFAULT 'outro',
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_members_organization_id ON public.team_members(organization_id);
CREATE INDEX idx_team_members_active ON public.team_members(organization_id, is_active);

CREATE TRIGGER set_updated_at_team_members
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_team_members"
  ON public.team_members FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "org_insert_team_members"
  ON public.team_members FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "org_update_team_members"
  ON public.team_members FOR UPDATE
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "org_delete_team_members"
  ON public.team_members FOR DELETE
  USING (organization_id = public.get_user_organization_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;

-- work_team_members

CREATE TABLE public.work_team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  team_member_id uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  role_in_work text,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_team_members_org ON public.work_team_members(organization_id);
CREATE INDEX idx_work_team_members_work ON public.work_team_members(work_id);
CREATE INDEX idx_work_team_members_member ON public.work_team_members(team_member_id);
CREATE UNIQUE INDEX idx_work_team_members_unique_active ON public.work_team_members(work_id, team_member_id) WHERE is_active = true;

CREATE TRIGGER set_updated_at_work_team_members
  BEFORE UPDATE ON public.work_team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.work_team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_work_team_members"
  ON public.work_team_members FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "org_insert_work_team_members"
  ON public.work_team_members FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "org_update_work_team_members"
  ON public.work_team_members FOR UPDATE
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "org_delete_work_team_members"
  ON public.work_team_members FOR DELETE
  USING (organization_id = public.get_user_organization_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_team_members TO authenticated;
