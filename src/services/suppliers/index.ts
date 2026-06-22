import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Supplier } from '../../types'

export type SupplierInput = {
  name: string
  phone?: string | null
  email?: string | null
  document?: string | null
  type: string
  notes?: string | null
}

async function fetchSuppliers(organizationId: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('organization_id', organizationId)
    .order('name')
  if (error) throw error
  return data as Supplier[]
}

async function fetchActiveSuppliers(organizationId: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data as Supplier[]
}

async function createSupplier(input: SupplierInput & { organization_id: string }) {
  const { data, error } = await supabase.from('suppliers').insert(input).select().single()
  if (error) throw error
  return data as Supplier
}

async function updateSupplier(id: string, input: Partial<SupplierInput>) {
  const { data, error } = await supabase.from('suppliers').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Supplier
}

async function toggleSupplierActive(id: string, is_active: boolean) {
  const { error } = await supabase.from('suppliers').update({ is_active }).eq('id', id)
  if (error) throw error
}

export function useSupplier(id: string | undefined) {
  return useQuery({
    queryKey: ['suppliers', 'detail', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('suppliers').select('*').eq('id', id!).single()
      if (error) throw error
      return data as Supplier
    },
    enabled: !!id,
  })
}

export function useSuppliers(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['suppliers', organizationId],
    queryFn: () => fetchSuppliers(organizationId!),
    enabled: !!organizationId,
  })
}

export function useActiveSuppliers(organizationId: string | undefined) {
  return useQuery({
    queryKey: ['suppliers', 'active', organizationId],
    queryFn: () => fetchActiveSuppliers(organizationId!),
    enabled: !!organizationId,
  })
}

export function useCreateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }) },
  })
}

export function useUpdateSupplier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: Partial<SupplierInput> & { id: string }) => updateSupplier(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }) },
  })
}

export function useToggleSupplierActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => toggleSupplierActive(id, is_active),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['suppliers'] }) },
  })
}
