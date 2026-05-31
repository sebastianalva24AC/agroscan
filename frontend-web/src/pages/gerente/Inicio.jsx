import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { camposService, alertasService } from '../../services/api'
import Icon from '../../components/Icon'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function Inicio({ usuario }) {
  const [campos, setCampos] = useState([])
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [campoSel, setCampoSel] = useState(null)

  useEffect(() => {
    Promise.all([camposService.listar(), alertasService.noLeidas()])
      .then(([rc, ra]) => {
        setCampos(rc.data)
        setAlertas(ra.data.alertas || [])
        if (rc.data.length > 0) setCampoSel(rc.data[0])
      })
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#9E9E9E' }}>
      Cargando información...
    </div>
  )

  const pos = campoSel
    ? [parseFloat(campoSel.latitud), parseFloat(campoSel.longitud)]
    : [-8.112, -79.028]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>
            Bienvenido, {usuario?.nombre}
          </h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Resumen general de tus operaciones agrícolas
          </p>
        </div>
        <span style={{ fontSize: '13px', color: '#BDBDBD' }}>
          {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Campos activos', value: campos.length, sub: 'registrados', color: '#1B5E20' },
          { label: 'Alertas sin atender', value: alertas.length, sub: alertas.length === 0 ? 'Todo en orden' : 'Requieren atención', color: alertas.length > 0 ? '#E65100' : '#1B5E20' },
          { label: 'Sistema', value: 'Operativo', sub: 'Todos los módulos activos', color: '#1565C0', texto: true },
          { label: 'Fecha de hoy', value: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }), sub: 'Actualizado ahora', color: '#6A1B9A', texto: true },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '12px', padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${s.color}`
          }}>
            <p style={{ fontSize: '12px', color: '#9E9E9E', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              {s.label}
            </p>
            <p style={{ fontSize: s.texto ? '18px' : '30px', fontWeight: '700', color: s.color, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '12px', color: '#BDBDBD', marginTop: '6px' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Mapa + Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', marginBottom: '20px' }}>

        {/* Mapa satelital */}
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E' }}>Mapa de campos</h2>
              <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '2px' }}>Vista satelital en tiempo real</p>
            </div>
            {campos.length > 1 && (
              <select style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #E0E0E0', fontSize: '13px', outline: 'none', cursor: 'pointer' }}
                onChange={e => setCampoSel(campos.find(c => c.id === parseInt(e.target.value)))}>
                {campos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            )}
          </div>

          {campos.length === 0 ? (
            <div style={{ height: '360px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9E9E9E', gap: '12px' }}>
              <Icon name="map" size={40} color="#E0E0E0" />
              <p style={{ fontSize: '14px' }}>No hay campos registrados</p>
              <Link to="/gerente/campos">
                <button style={{ background: '#1B5E20', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Registrar primer campo
                </button>
              </Link>
            </div>
          ) : (
            <MapContainer center={pos} zoom={13} style={{ height: '360px' }} key={campoSel?.id}>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Imagery © Esri"
              />
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.15} />
              {campos.map(c => (
                <Marker key={c.id} position={[parseFloat(c.latitud), parseFloat(c.longitud)]}>
                  <Popup>
                    <strong>{c.nombre}</strong><br />
                    <span style={{ fontSize: '12px', color: '#757575' }}>{c.region} — {c.zona}<br />{c.hectareas} ha</span>
                  </Popup>
                </Marker>
              ))}
              {campoSel && (
                <Circle
                  center={[parseFloat(campoSel.latitud), parseFloat(campoSel.longitud)]}
                  radius={600}
                  pathOptions={{ color: '#4CAF50', fillColor: '#4CAF50', fillOpacity: 0.12 }}
                />
              )}
            </MapContainer>
          )}

          {campoSel && (
            <div style={{ padding: '10px 20px', background: '#F8F9FA', borderTop: '1px solid #F0F0F0', display: 'flex', gap: '20px', fontSize: '12px', color: '#757575' }}>
              <span><strong style={{ color: '#424242' }}>Campo:</strong> {campoSel.nombre}</span>
              <span><strong style={{ color: '#424242' }}>Región:</strong> {campoSel.region}</span>
              <span><strong style={{ color: '#424242' }}>Zona:</strong> {campoSel.zona}</span>
              <span><strong style={{ color: '#424242' }}>Superficie:</strong> {campoSel.hectareas} ha</span>
            </div>
          )}
        </div>

        {/* Panel lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Campos */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Campos activos</h3>
              <Link to="/gerente/campos" style={{ fontSize: '12px', color: '#1B5E20', textDecoration: 'none', fontWeight: '500' }}>Ver todos</Link>
            </div>
            {campos.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9E9E9E', textAlign: 'center', padding: '12px 0' }}>Sin campos registrados</p>
            ) : campos.slice(0, 4).map(c => (
              <div key={c.id} onClick={() => setCampoSel(c)} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                background: campoSel?.id === c.id ? '#F1F8E9' : 'transparent',
                border: `1px solid ${campoSel?.id === c.id ? '#C8E6C9' : 'transparent'}`,
                transition: 'all 0.15s'
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500' }}>{c.nombre}</p>
                  <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }}>{c.region} · {c.hectareas} ha</p>
                </div>
                <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                  {c.zona}
                </span>
              </div>
            ))}
          </div>

          {/* Alertas */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600' }}>Alertas recientes</h3>
              <Link to="/gerente/alertas" style={{ fontSize: '12px', color: '#1B5E20', textDecoration: 'none', fontWeight: '500' }}>Ver todas</Link>
            </div>
            {alertas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#9E9E9E' }}>
                <Icon name="check" size={28} color="#4CAF50" />
                <p style={{ fontSize: '13px', marginTop: '8px' }}>Sin alertas pendientes</p>
              </div>
            ) : alertas.slice(0, 3).map(a => (
              <div key={a.id} style={{
                padding: '10px 12px', borderRadius: '8px', marginBottom: '6px',
                background: a.nivel === 'critico' ? '#FFEBEE' : a.nivel === 'advertencia' ? '#FFFDE7' : '#E3F2FD',
                borderLeft: `3px solid ${a.nivel === 'critico' ? '#C62828' : a.nivel === 'advertencia' ? '#F9A825' : '#1565C0'}`
              }}>
                <p style={{ fontSize: '12px', fontWeight: '500' }}>{a.descripcion}</p>
                <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }}>{a.tipo}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        {[
          { path: '/gerente/campos', label: 'Gestionar campos', desc: 'Registra y edita campos', icon: 'map', bg: '#E8F5E9', iconColor: '#1B5E20' },
          { path: '/gerente/cultivos', label: 'Ver cultivos', desc: 'Seguimiento de ciclos', icon: 'plant', bg: '#E3F2FD', iconColor: '#1565C0' },
          { path: '/gerente/clima', label: 'Monitoreo climático', desc: 'Condiciones en tiempo real', icon: 'cloud', bg: '#FFF3E0', iconColor: '#E65100' },
          { path: '/gerente/trazabilidad', label: 'Trazabilidad', desc: 'Lotes y certificados QR', icon: 'qr', bg: '#F3E5F5', iconColor: '#6A1B9A' },
        ].map(item => (
          <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'white', borderRadius: '12px', padding: '16px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '14px',
              transition: 'box-shadow 0.2s, transform 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={item.icon} size={20} color={item.iconColor} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1A1A2E' }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '2px' }}>{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}