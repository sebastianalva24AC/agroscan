import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RutaProtegida({ children, roles }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ color: '#1B5E20', fontSize: '20px' }}>
        Cargando AgroScan...
      </div>
    </div>
  )

  if (!usuario) return <Navigate to="/login" replace />

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/no-autorizado" replace />
  }

  return children
}