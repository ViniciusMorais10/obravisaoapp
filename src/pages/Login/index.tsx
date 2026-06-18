import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { session, profile, loading } = useAuth()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (!loading && session && profile) return <Navigate to="/" replace />

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) setError('E-mail ou senha inválidos.')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Branding */}
        <div className="mb-6 text-center">
          <img src="/favicon.svg" alt="ObraVisão" className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Entrar no ObraVisão</h1>
          <p className="mt-1 text-sm text-gray-500">Controle obras, despesas e atualizações em um só lugar.</p>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" {...register('email')} placeholder="seu@email.com" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" {...register('password')} placeholder="••••••••" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50">
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-center text-sm">
          <Link to="/esqueci-senha" className="block text-gray-500 hover:text-slate-800">Esqueci minha senha</Link>
          <p className="text-gray-500">
            Não tem conta? <Link to="/cadastro" className="font-medium text-slate-800 hover:underline">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
