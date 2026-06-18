-- ObraVisão Beta 0.1 — Link público de atualização
-- Tabela work_share_links + campo author_name em work_updates

-- ============================================================
-- CAMPO author_name em work_updates
-- ============================================================

ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS author_name text;

-- ============================================================
-- TABELA work_share_links
-- ============================================================

CREATE TABLE public.work_share_links (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  type text NOT NULL DEFAULT 'update_only',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_share_links_token ON public.work_share_links(token);
CREATE INDEX idx_work_share_links_work_id ON public.work_share_links(work_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.work_share_links ENABLE ROW LEVEL SECURITY;

-- Admin vê links da própria organização
CREATE POLICY "Usuário vê links da organização"
  ON public.work_share_links FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Usuário cria links na organização"
  ON public.work_share_links FOR INSERT
  WITH CHECK (
    organization_id = public.get_user_organization_id()
    AND EXISTS (
      SELECT 1 FROM public.works
      WHERE id = work_id AND organization_id = public.get_user_organization_id()
    )
  );

CREATE POLICY "Usuário atualiza links da organização"
  ON public.work_share_links FOR UPDATE
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Usuário exclui links da organização"
  ON public.work_share_links FOR DELETE
  USING (organization_id = public.get_user_organization_id());

-- ============================================================
-- GRANTS
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_share_links TO authenticated;

-- Acesso anônimo para validar token e inserir atualização via link público
GRANT SELECT ON public.work_share_links TO anon;
GRANT INSERT ON public.work_updates TO anon;

-- Policy para anon: pode ler links ativos (necessário para validar token)
CREATE POLICY "Anon pode ler link ativo por token"
  ON public.work_share_links FOR SELECT TO anon
  USING (active = true);

-- Policy para anon: pode inserir work_updates se o link for válido
-- (a validação do token é feita no frontend antes de inserir)
CREATE POLICY "Anon pode criar atualização via link público"
  ON public.work_updates FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.work_share_links
      WHERE work_id = work_updates.work_id
        AND organization_id = work_updates.organization_id
        AND active = true
        AND (expires_at IS NULL OR expires_at > now())
    )
  );
