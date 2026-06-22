-- ObraVisao Beta 0.1 - Recebimentos
-- Tabela work_payments

CREATE TABLE public.work_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  work_id uuid NOT NULL REFERENCES public.works(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  payment_date date NOT NULL DEFAULT current_date,
  payment_method text NOT NULL DEFAULT 'pix',
  payer_name text,
  description text,
  notes text,
  attachment_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_work_payments_org ON public.work_payments(organization_id);
CREATE INDEX idx_work_payments_work ON public.work_payments(work_id);

CREATE TRIGGER set_updated_at_work_payments
  BEFORE UPDATE ON public.work_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.work_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_select_work_payments"
  ON public.work_payments FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "org_insert_work_payments"
  ON public.work_payments FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "org_update_work_payments"
  ON public.work_payments FOR UPDATE
  USING (organization_id = public.get_user_organization_id())
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "org_delete_work_payments"
  ON public.work_payments FOR DELETE
  USING (organization_id = public.get_user_organization_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_payments TO authenticated;
