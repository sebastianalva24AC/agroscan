import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import RutaProtegida from './components/RutaProtegida'
import Login from './pages/Login'
import RegistroEmpresa from './pages/RegistroEmpresa'
import DashboardGerente from './pages/gerente/Dashboard'
import DashboardTecnico from './pages/tecnico/Dashboard'
import DashboardComprador from './pages/comprador/Dashboard'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroEmpresa />} />
          <Route path="/gerente/*" element={
            <RutaProtegida roles={['gerente']}>
              <DashboardGerente />
            </RutaProtegida>
          } />
          <Route path="/tecnico/*" element={
            <RutaProtegida roles={['tecnico_agronomo']}>
              <DashboardTecnico />
            </RutaProtegida>
          } />
          <Route path="/comprador/*" element={
            <RutaProtegida roles={['comprador_extranjero']}>
              <DashboardComprador />
            </RutaProtegida>
          } />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/no-autorizado" element={
            <div className="min-h-screen flex items-center justify-center">
              <h1 className="text-2xl text-red-600">No tienes acceso a esta página</h1>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App