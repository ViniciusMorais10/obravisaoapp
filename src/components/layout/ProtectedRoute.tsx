import { Navigate, Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute() {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-800">
        <Building2 className="h-10 w-10 animate-pulse text-white" />
        <p className="mt-4 text-lg font-semibold text-white">ObraVisão</p>
        <p className="mt-2 text-sm text-slate-400">Preparando seu ambiente...</p>
      </div>
    )
  }

  if (!session || !profile) return <Navigate to="/login" replace />

  return <Outlet />
}
