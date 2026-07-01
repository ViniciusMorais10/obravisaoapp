import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, HardHat, DollarSign, Truck, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import ObraVisaoLogo from '../ui/ObraVisaoLogo'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/obras', label: 'Obras', icon: HardHat },
  { to: '/despesas', label: 'Despesas', icon: DollarSign },
  { to: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { to: '/equipe', label: 'Equipe', icon: Users },
]

export default function AppLayout() {
  const { profile, organization, signOut } = useAuth()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 lg:flex-row">
      {/* Mobile header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-slate-800 px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <ObraVisaoLogo size={28} />
          <span className="font-semibold">ObraVisão</span>
        </div>
        <button onClick={signOut} className="rounded p-1 hover:bg-slate-700" title="Sair">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 bg-slate-800 lg:flex lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex items-center gap-2 px-4 py-4 text-white">
          <ObraVisaoLogo size={36} />
          <span className="text-lg font-semibold">ObraVisão</span>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto space-y-1 px-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-700 px-4 py-3">
          <p className="truncate text-sm text-slate-300">{profile?.name}</p>
          <p className="truncate text-xs text-slate-400">{organization?.name}</p>
          <button onClick={signOut} className="mt-2 flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            <LogOut className="h-3 w-3" /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-x-hidden px-4 pb-20 pt-4 lg:ml-56 lg:px-6 lg:pb-6 lg:pt-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 flex border-t border-gray-200 bg-white safe-bottom lg:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `flex flex-1 flex-col items-center py-2.5 text-xs ${isActive ? 'text-slate-800 font-medium' : 'text-gray-400'}`}>
            <Icon className="h-5 w-5" />
            <span className="mt-0.5">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
