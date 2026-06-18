import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  company_name: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Cadastro() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name, company_name: data.company_name },
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este e-mail já está cadastrado. Tente fazer login.')
      } else {
        setError(error.message)
      }
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        {/* Branding */}
        <div className="mb-6 text-center">
          <img src="/favicon.svg" alt="ObraVisão" className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="mt-1 text-sm text-gray-500">Comece a organizar suas obras com mais clareza.</p>
        </div>

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm font-medium text-green-700">Conta criada com sucesso!</p>
            <Link to="/login" className="mt-1 inline-block text-sm font-semibold text-slate-800 hover:underline">Fazer login</Link>
          </div>
        )}

        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Seu nome</label>
              <input {...register('name')} placeholder="Nome completo" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da empresa</label>
              <input {...register('company_name')} placeholder="Construtora, escritório..." className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
              {errors.company_name && <p className="mt-1 text-xs text-red-600">{errors.company_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input type="email" {...register('email')} placeholder="seu@email.com" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input type="password" {...register('password')} placeholder="Mínimo 6 caracteres" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50">
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-gray-500">
          Já tem conta? <Link to="/login" className="font-medium text-slate-800 hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
