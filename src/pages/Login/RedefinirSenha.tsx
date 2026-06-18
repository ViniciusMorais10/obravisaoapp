import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Building2, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const schema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a senha'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RedefinirSenha() {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setError('Não foi possível redefinir a senha. O link pode ter expirado.')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-lg font-bold text-gray-900">Senha redefinida com sucesso!</p>
          <p className="mt-1 text-sm text-gray-500">Você já pode acessar o sistema com sua nova senha.</p>
          <Link to="/" className="mt-6 inline-block rounded-lg bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700">
            Acessar o sistema
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900">Redefinir senha</h1>
          <p className="mt-1 text-sm text-gray-500">Escolha uma nova senha para sua conta.</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nova senha</label>
            <input type="password" {...register('password')} placeholder="Mínimo 6 caracteres" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar nova senha</label>
            <input type="password" {...register('confirmPassword')} placeholder="Repita a senha" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50">
            {isSubmitting ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
