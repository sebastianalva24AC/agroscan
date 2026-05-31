import { useAuth } from '../../context/AuthContext'
import { useNavigate, Routes, Route } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import Inicio from './Inicio'
import Campos from './Campos'
import Cultivos from './Cultivos'
import Clima from './Clima'
import Alertas from './Alertas'
import Trazabilidad from './Trazabilidad'
import DiagnosticoIA from './DiagnosticoIA'
import Usuarios from './Usuarios'
import Reportes from './Reportes'

export default function DashboardGerente() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FA' }}>
      <Sidebar usuario={usuario} onLogout={handleLogout} />
      <main style={{
        marginLeft: '240px', flex: 1,
        padding: '32px',
        maxWidth: 'calc(100vw - 240px)',
        minHeight: '100vh'
      }}>
        <Routes>
          <Route index element={<Inicio usuario={usuario} />} />
          <Route path="campos" element={<Campos />} />
          <Route path="cultivos" element={<Cultivos />} />
          <Route path="clima" element={<Clima />} />
          <Route path="alertas" element={<Alertas />} />
          <Route path="diagnostico" element={<DiagnosticoIA />} />
          <Route path="trazabilidad" element={<Trazabilidad />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="reportes" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  )
}