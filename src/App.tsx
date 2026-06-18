import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
import { AuthProvider } from './hooks/useAuth'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import EsqueciSenha from './pages/Login/EsqueciSenha'
import RedefinirSenha from './pages/Login/RedefinirSenha'
import Cadastro from './pages/Cadastro'
import Dashboard from './pages/Dashboard'
import Obras from './pages/Obras'
import ObraForm from './pages/Obras/ObraForm'
import ObraDetalhe from './pages/ObraDetalhe'
import Despesas from './pages/Despesas'
import NovaDespesa from './pages/Despesas/NovaDespesa'
import PublicUpdate from './pages/PublicUpdate'

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Ocorreu um erro. Tente novamente.')
    },
  }),
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" richColors closeButton />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/esqueci-senha" element={<EsqueciSenha />} />
            <Route path="/redefinir-senha" element={<RedefinirSenha />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/atualizar/:token" element={<PublicUpdate />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/obras" element={<Obras />} />
                <Route path="/obras/nova" element={<ObraForm />} />
                <Route path="/obras/:id" element={<ObraDetalhe />} />
                <Route path="/obras/:id/editar" element={<ObraForm />} />
                <Route path="/despesas" element={<Despesas />} />
                <Route path="/despesas/nova" element={<NovaDespesa />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
