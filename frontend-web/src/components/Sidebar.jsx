import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'

const NAV_ITEMS = [
  { path: '/gerente', label: 'Dashboard', icon: 'dashboard' },
  { path: '/gerente/campos', label: 'Campos', icon: 'map' },
  { path: '/gerente/cultivos', label: 'Cultivos', icon: 'plant' },
  { path: '/gerente/clima', label: 'Clima', icon: 'cloud' },
  { path: '/gerente/alertas', label: 'Alertas', icon: 'bell' },
  { path: '/gerente/diagnostico', label: 'Análisis IA', icon: 'ai' },
  { path: '/gerente/trazabilidad', label: 'Trazabilidad', icon: 'qr' },
  { path: '/gerente/usuarios', label: 'Usuarios', icon: 'users' },
  { path: '/gerente/reportes', label: 'Reportes', icon: 'chart' },
]

export default function Sidebar({ usuario, onLogout }) {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/gerente') return location.pathname === '/gerente'
    return location.pathname.startsWith(path)
  }

  return (
    <aside style={{
      width: '240px', minHeight: '100vh', background: '#1A3C24',
      position: 'fixed', left: 0, top: 0,
      display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)'
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#2E7D32',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ fontSize: '16px' }}>🌿</span>
          </div>
          <span style={{ color: 'white', fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px' }}>
            AgroScan
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginLeft: '42px' }}>
          Panel de Gerencia
        </p>
      </div>

      {/* Navegación */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {NAV_ITEMS.map(item => {
          const activo = isActive(item.path)
          return (
            <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '11px 20px', cursor: 'pointer',
                background: activo ? 'rgba(255,255,255,0.10)' : 'transparent',
                borderLeft: `3px solid ${activo ? '#81C784' : 'transparent'}`,
                transition: 'all 0.15s'
              }}>
                <Icon name={item.icon} size={17} color={activo ? 'white' : 'rgba(255,255,255,0.50)'} />
                <span style={{
                  fontSize: '14px',
                  color: activo ? 'white' : 'rgba(255,255,255,0.65)',
                  fontWeight: activo ? '600' : '400'
                }}>
                  {item.label}
                </span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Usuario y logout */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ color: 'white', fontSize: '13px', fontWeight: '500' }}>
            {usuario?.nombre}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', marginTop: '2px' }}>
            {usuario?.email}
          </p>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', padding: '9px 12px',
          background: 'transparent',
          color: 'rgba(255,255,255,0.55)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.15s'
        }}>
          <Icon name="logout" size={14} color="rgba(255,255,255,0.55)" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}