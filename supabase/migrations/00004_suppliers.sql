ObraVisão Beta 0.1 — Fornecedores
  -- Tabela suppliers + campo supplier_id em expenses

  -- ============================================================
  -- TABELA suppliers
  -- ============================================================

  CREATE TABLE public.suppliers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE
  CASCADE,
    name text NOT NULL,
    phone text,
    email text,
    document text,
    type text NOT NULL DEFAULT 'outro' CHECK (type IN ('material', 'mao_de_obra',
  'servico', 'equipamento', 'outro')),
    notes text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  -- ============================================================
  -- ÍNDICES
  -- ============================================================

  CREATE INDEX idx_suppliers_organization_id ON public.suppliers(organization_id);
  CREATE INDEX idx_suppliers_active ON public.suppliers(organization_id,
  is_active);

  -- ============================================================
  -- TRIGGER updated_at
  -- ============================================================

  CREATE TRIGGER set_updated_at_suppliers
    BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

  -- ============================================================
  -- RLS
  -- ============================================================

  ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Usuário vê fornecedores da organização"
    ON public.suppliers FOR SELECT
    USING (organization_id = public.get_user_organization_id());

  CREATE POLICY "Usuário cria fornecedores na organização"
    ON public.suppliers FOR INSERT
    WITH CHECK (organization_id = public.get_user_organization_id());

  CREATE POLICY "Usuário edita fornecedores da organização"
    ON public.suppliers FOR UPDATE
    USING (organization_id = public.get_user_organization_id())
    WITH CHECK (organization_id = public.get_user_organization_id());

  CREATE POLICY "Usuário exclui fornecedores da organização"
    ON public.suppliers FOR DELETE
    USING (organization_id = public.get_user_organization_id());

  -- ============================================================
  -- GRANTS
  -- ============================================================

  GRANT SELECT, INSERT, UPDATE, DELETE ON public.suppliers TO authenticated;

  -- ============================================================
  -- CAMPO supplier_id em expenses
  -- ============================================================

  ALTER TABLE public.expenses ADD COLUMN supplier_id uuid REFERENCES
  public.suppliers(id) ON DELETE SET NULL;

  CREATE INDEX idx_expenses_supplier_id ON public.expenses(supplier_id);

  ────────────────────────────────────────────────────────────────────────────────

  Resumo da migration:

  ┌─────────────────┬──────────────────────────────────────────────────────────┐
  │ Elemento        │ Detalhe                                                  │
  ├─────────────────┼──────────────────────────────────────────────────────────┤
  │ Tabela          │ suppliers com 10 campos (name, phone, email, document,   │
  │                 │ type, notes, is_active, timestamps)                      │
  ├─────────────────┼──────────────────────────────────────────────────────────┤
  │ Type constraint │ CHECK: material, mao_de_obra, servico, equipamento,      │
  │                 │ outro                                                    │
  ├─────────────────┼──────────────────────────────────────────────────────────┤
  │ Soft delete     │ is_active boolean (sem exclusão física)                  │
  ├─────────────────┼──────────────────────────────────────────────────────────┤
  │ Trigger         │ updated_at reutiliza handle_updated_at() existente       │
  ├─────────────────┼──────────────────────────────────────────────────────────┤
  │ RLS             │ 4 policies (SELECT/INSERT/UPDATE/DELETE) por             │
  │                 │ organization_id                                          │
  ├─────────────────┼──────────────────────────────────────────────────────────┤
  │ Expenses        │ Nova coluna supplier_id uuid nullable, FK com ON DELETE  │
  │                 │ SET NULL                                                 │
  ├─────────────────┼──────────────────────────────────────────────────────────┤
  │ Índices         │ organization_id, (organization_id, is_active),           │
  │                 │ supplier_id em expenses                                  │
  └─────────────────┴─────
