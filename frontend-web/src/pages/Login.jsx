import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const response = await authService.login(email, password)
      const { access_token, rol, nombre, empresa_id } = response.data
      login(access_token, { email, rol, nombre, empresa_id })
      if (rol === 'gerente') navigate('/gerente')
      else if (rol === 'tecnico_agronomo') navigate('/tecnico')
      else if (rol === 'comprador_extranjero') navigate('/comprador')
    } catch (err) {
      setError('Email o contraseña incorrectos')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)'
    }}>
      <div style={{
        margin: 'auto',
        width: '100%',
        maxWidth: '420px',
        padding: '0 20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '80px', height: '80px',
            background: 'white', borderRadius: '50%',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px'
          }}>🌿</div>
          <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '700' }}>AgroScan</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            Monitoreo inteligente de cultivos
          </p>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '8px' }}>
            Bienvenido
          </h2>
          <p style={{ color: '#757575', fontSize: '14px', marginBottom: '24px' }}>
            Ingresa tus credenciales para continuar
          </p>

          {error && (
            <div style={{
              background: '#FFEBEE', color: '#C62828',
              padding: '12px', borderRadius: '8px',
              marginBottom: '16px', fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={cargando}>
              {cargando ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#757575' }}>
            ¿Primera vez?{' '}
            <Link to="/registro" style={{ color: '#1B5E20', fontWeight: '600' }}>
              Registra tu empresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}