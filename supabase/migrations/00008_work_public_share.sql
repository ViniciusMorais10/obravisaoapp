-- ObraVisão — Link público de acompanhamento (somente leitura)
-- Campos na tabela works para controlar compartilhamento público

ALTER TABLE public.works
  ADD COLUMN IF NOT EXISTS public_share_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS public_share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS public_share_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS public_share_updated_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_works_public_share_token ON public.works(public_share_token);

-- Anon pode ler obra e atualizações pelo token público (somente leitura)
CREATE POLICY "Anon pode ler obra por token público"
  ON public.works FOR SELECT TO anon
  USING (public_share_enabled = true AND public_share_token IS NOT NULL);

CREATE POLICY "Anon pode ler atualizações de obra pública"
  ON public.work_updates FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.works
      WHERE id = work_updates.work_id
        AND public_share_enabled = true
        AND public_share_token IS NOT NULL
    )
  );

CREATE POLICY "Anon pode ler etapas de obra pública"
  ON public.stages FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.works
      WHERE id = stages.work_id
        AND public_share_enabled = true
        AND public_share_token IS NOT NULL
    )
  );
