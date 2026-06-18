import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

type FormData = z.infer<typeof schema>

export default function EsqueciSenha() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    if (error) {
      setError('Não foi possível enviar o e-mail. Tente novamente.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <img src="/favicon.svg" alt="ObraVisão" className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-xl font-bold text-gray-900">Recuperar senha</h1>
          <p className="mt-1 text-sm text-gray-500">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>
        </div>

        {sent ? (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm font-medium text-green-700">E-mail enviado! Verifique sua caixa de entrada para redefinir a senha.</p>
            <Link to="/login" className="mt-3 inline-block text-sm font-semibold text-slate-800 hover:underline">Voltar para login</Link>
          </div>
        ) : (
          <>
            {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">E-mail</label>
                <input type="email" {...register('email')} placeholder="seu@email.com" className="mt-1.5 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-none" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-slate-800 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-50">
                {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              <Link to="/login" className="font-medium text-slate-800 hover:underline">Voltar para login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
