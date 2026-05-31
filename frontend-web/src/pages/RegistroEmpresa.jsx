import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/api'
import Icon from '../components/Icon'

export default function RegistroEmpresa() {
  const [paso, setPaso] = useState(1)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nombre_empresa: '', ruc: '', region: '', plan: 'estandar',
    nombre_usuario: '', email: '', password: '', confirmar_password: ''
  })
  const { login } = useAuth()
  const navigate = useNavigate()

  const planes = [
    { value: 'basico', label: 'Básico', precio: 'S/ 299/mes', desc: 'Hasta 50 hectáreas', color: '#1B5E20' },
    { value: 'estandar', label: 'Estándar', precio: 'S/ 699/mes', desc: 'Hasta 200 hectáreas', color: '#1565C0' },
    { value: 'premium', label: 'Premium', precio: 'S/ 1,499/mes', desc: 'Hasta 500 hectáreas', color: '#6A1B9A' },
  ]

  const regiones = ['La Libertad', 'Ica', 'Piura', 'Lambayeque', 'Ancash', 'Lima', 'Arequipa', 'Junin', 'Otra']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmar_password) {
      setError('Las contraseñas no coinciden')
      return
    }
    setCargando(true)
    setError('')
    try {
      const res = await authService.registroEmpresa({
        nombre_empresa: form.nombre_empresa,
        ruc: form.ruc,
        region: form.region,
        plan: form.plan,
        nombre_usuario: form.nombre_usuario,
        email: form.email,
        password: form.password
      })
      const { access_token, empresa_id, usuario_id } = res.data
      login(access_token, {
        email: form.email,
        rol: 'gerente',
        nombre: form.nombre_usuario,
        empresa_id
      })
      navigate('/gerente')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar. El RUC o email puede estar en uso.')
    } finally {
      setCargando(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E0E0E0', borderRadius: '8px',
    fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif'
  }
  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: '500', marginBottom: '6px', color: '#424242'
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #1A3C24 0%, #2E7D32 50%, #388E3C 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{width: '56px', height: '56px', background: 'white', borderRadius: '14px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'}}>🌿
          </div>
          <h1 style={{ color: 'white', fontSize: '22px', fontWeight: '700' }}>AgroScan</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', marginTop: '4px' }}>
            Registro de empresa agroexportadora
          </p>
        </div>

        {/* Indicador de pasos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3].map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: paso >= p ? 'white' : 'rgba(255,255,255,0.2)',
                color: paso >= p ? '#1B5E20' : 'rgba(255,255,255,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: '700', transition: 'all 0.2s'
              }}>{p}</div>
              {p < 3 && <div style={{ width: '32px', height: '2px', background: paso > p ? 'white' : 'rgba(255,255,255,0.2)' }} />}
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

          {error && (
            <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <form onSubmit={paso < 3 ? (e) => { e.preventDefault(); setPaso(paso + 1) } : handleSubmit}>

            {/* Paso 1: Datos de la empresa */}
            {paso === 1 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A2E', marginBottom: '4px' }}>
                  Datos de tu empresa
                </h2>
                <p style={{ fontSize: '13px', color: '#9E9E9E', marginBottom: '24px' }}>
                  Información de tu empresa agroexportadora
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Nombre de la empresa</label>
                  <input style={inputStyle} placeholder="Ej: Agroexportadora del Norte SAC"
                    value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>RUC</label>
                    <input style={inputStyle} placeholder="20123456789" maxLength={11}
                      value={form.ruc} onChange={e => setForm({ ...form, ruc: e.target.value })} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Región principal</label>
                    <select style={inputStyle} value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} required>
                      <option value="">Seleccionar</option>
                      {regiones.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Plan */}
            {paso === 2 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A2E', marginBottom: '4px' }}>
                  Elige tu plan
                </h2>
                <p style={{ fontSize: '13px', color: '#9E9E9E', marginBottom: '24px' }}>
                  Puedes cambiarlo en cualquier momento
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  {planes.map(pl => (
                    <div key={pl.value} onClick={() => setForm({ ...form, plan: pl.value })} style={{
                      border: `2px solid ${form.plan === pl.value ? pl.color : '#E0E0E0'}`,
                      borderRadius: '10px', padding: '16px 20px', cursor: 'pointer',
                      background: form.plan === pl.value ? '#F8FFF8' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all 0.15s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '50%',
                          border: `2px solid ${form.plan === pl.value ? pl.color : '#E0E0E0'}`,
                          background: form.plan === pl.value ? pl.color : 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {form.plan === pl.value && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{pl.label}</p>
                          <p style={{ fontSize: '12px', color: '#9E9E9E' }}>{pl.desc}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: pl.color }}>{pl.precio}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paso 3: Cuenta del gerente */}
            {paso === 3 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A2E', marginBottom: '4px' }}>
                  Crea tu cuenta
                </h2>
                <p style={{ fontSize: '13px', color: '#9E9E9E', marginBottom: '24px' }}>
                  Credenciales de acceso del gerente
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Nombre completo</label>
                  <input style={inputStyle} placeholder="Tu nombre completo"
                    value={form.nombre_usuario} onChange={e => setForm({ ...form, nombre_usuario: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Email</label>
                  <input style={inputStyle} type="email" placeholder="gerente@empresa.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label style={labelStyle}>Contraseña</label>
                    <input style={inputStyle} type="password" placeholder="Mínimo 8 caracteres"
                      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmar contraseña</label>
                    <input style={inputStyle} type="password" placeholder="Repite la contraseña"
                      value={form.confirmar_password} onChange={e => setForm({ ...form, confirmar_password: e.target.value })} required />
                  </div>
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
              {paso > 1 ? (
                <button type="button" onClick={() => setPaso(paso - 1)} style={{
                  background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                  borderRadius: '8px', padding: '11px 20px', cursor: 'pointer',
                  fontSize: '14px', fontWeight: '600'
                }}>
                  Anterior
                </button>
              ) : (
                <Link to="/login" style={{ fontSize: '13px', color: '#9E9E9E', textDecoration: 'none' }}>
                  Ya tengo cuenta
                </Link>
              )}
              <button type="submit" disabled={cargando} style={{
                background: '#1B5E20', color: 'white', border: 'none',
                borderRadius: '8px', padding: '11px 24px', cursor: cargando ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: '600', opacity: cargando ? 0.7 : 1
              }}>
                {paso < 3 ? 'Siguiente' : cargando ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}