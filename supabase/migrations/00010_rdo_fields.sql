-- Migration: Expandir work_updates para suportar RDO / Diário da Obra
-- Todos os campos são opcionais para manter compatibilidade com registros existentes

-- Novos campos do RDO
ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT NULL;
ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS report_date date DEFAULT NULL;
ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS responsible text DEFAULT NULL;
ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS activities_done text DEFAULT NULL;
ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS issues text DEFAULT NULL;
ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS next_activities text DEFAULT NULL;
ALTER TABLE public.work_updates ADD COLUMN IF NOT EXISTS observations text DEFAULT NULL;

-- Índice para busca por data do RDO
CREATE INDEX IF NOT EXISTS idx_work_updates_report_date ON public.work_updates(report_date);
