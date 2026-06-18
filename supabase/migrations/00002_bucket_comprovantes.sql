-- ObraVisão Beta 0.1 — Bucket comprovantes + policies
-- Aplicar no SQL Editor do Supabase

-- Criar bucket privado
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'comprovantes',
  'comprovantes',
  false,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Upload — usuário autenticado na própria organização
CREATE POLICY "Upload comprovante da organização"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'comprovantes'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE user_id = auth.uid())
  );

-- Policy: Download — usuário autenticado na própria organização
CREATE POLICY "Download comprovante da organização"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'comprovantes'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE user_id = auth.uid())
  );

-- Policy: Delete — usuário autenticado na própria organização
CREATE POLICY "Delete comprovante da organização"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'comprovantes'
    AND (storage.foldername(name))[1] = (SELECT organization_id::text FROM public.profiles WHERE user_id = auth.uid())
  );
