import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, CheckCircle2, AlertTriangle } from 'lucide-react'
import { validateToken, submitPublicUpdate } from '../../services/share-links'

const schema = z.object({
  author_name: z.string().min(2, 'Informe seu nome'),
  description: z.string().min(3, 'Descreva o que foi feito'),
})

type FormData = z.infer<typeof schema>

interface LinkData {
  organization_id: string
  work_id: string
}

export default function PublicUpdate() {
  const { token } = useParams<{ token: string }>()
  const [linkData, setLinkData] = useState<LinkData | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!token) { setInvalid(true); setLoading(false); return }
    validateToken(token).then((data) => {
      if (data) setLinkData({ organization_id: data.organization_id, work_id: data.work_id })
      else setInvalid(true)
      setLoading(false)
    })
  }, [token])

  async function onSubmit(data: FormData) {
    if (!linkData) return
    await submitPublicUpdate(linkData.organization_id, linkData.work_id, data.author_name, data.description)
    setSuccess(true)
  }

  function handleAnother() {
    reset()
    setSuccess(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    )
  }

  if (invalid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto h-10 w-10 text-orange-500" />
          <p className="mt-4 text-sm text-gray-700">Este link de atualização não está mais disponível.</p>
          <p className="mt-1 text-xs text-gray-500">Solicite um novo link ao responsável pela obra.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-lg font-semibold text-gray-800">Atualização enviada com sucesso!</p>
          <button onClick={handleAnother} className="mt-6 rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-700">
            Enviar outra atualização
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Branding */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="mt-3 text-lg font-bold text-gray-900">Atualização da obra</h1>
          <p className="mt-1 text-sm text-gray-500">Preencha o resumo do que foi feito hoje.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Seu nome *</label>
            <input {...register('author_name')} placeholder="Nome de quem está registrando" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
            {errors.author_name && <p className="mt-1 text-xs text-red-600">{errors.author_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">O que foi feito hoje? *</label>
            <textarea
              {...register('description')}
              placeholder="Ex: Finalizada a instalação elétrica da sala e iniciado preparo para pintura."
              className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none"
              rows={4}
            />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">
            {isSubmitting ? 'Enviando...' : 'Enviar atualização'}
          </button>
        </form>
      </div>
    </div>
  )
}
