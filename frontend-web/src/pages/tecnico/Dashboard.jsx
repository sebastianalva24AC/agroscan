import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { camposService, cultivosService, climaService, alertasService, diagnosticoService } from '../../services/api'
import Icon from '../../components/Icon'

export default function DashboardTecnico() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [campos, setCampos] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [clima, setClima] = useState(null)
  const [alertas, setAlertas] = useState([])
  const [historial, setHistorial] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState('inicio')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [rc, rcu, ra] = await Promise.all([
          camposService.listar(),
          cultivosService.listar(),
          alertasService.noLeidas()
        ])
        setCampos(rc.data)
        setCultivos(rcu.data)
        setAlertas(ra.data.alertas || [])

        if (rc.data.length > 0) {
          const climaRes = await climaService.actual(rc.data[0].id)
          setClima(climaRes.data.clima)
        }

        if (rcu.data.length > 0) {
          const histRes = await diagnosticoService.historial(rcu.data[0].id)
          setHistorial(histRes.data.registros || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const colorTipo = {
    saludable: { bg: '#E8F5E9', color: '#1B5E20', label: 'Saludable' },
    enfermedad: { bg: '#FFF3E0', color: '#E65100', label: 'Enfermedad' },
    plaga: { bg: '#FFEBEE', color: '#C62828', label: 'Plaga' },
    estres_hidrico: { bg: '#E3F2FD', color: '#1565C0', label: 'Estrés hídrico' },
    deficiencia_nutricional: { bg: '#F3E5F5', color: '#6A1B9A', label: 'Def. nutricional' },
    otro: { bg: '#F5F5F5', color: '#424242', label: 'Otro' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FA' }}>

      {/* Header */}
      <header style={{
        background: '#1A3C24', padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#2E7D32',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '16px'
          }}>
            🌿
          </div>
          <div>
            <span style={{ color: 'white', fontSize: '16px', fontWeight: '700' }}>AgroScan</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginLeft: '8px' }}>
              Portal del Técnico
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            {usuario?.nombre}
          </span>
          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.1)', color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px', padding: '7px 14px', cursor: 'pointer',
            fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            <Icon name="logout" size={14} color="white" />
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Navegación de vistas */}
      <div style={{ background: 'white', borderBottom: '1px solid #F0F0F0', padding: '0 32px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { key: 'inicio', label: 'Mi campo', icon: 'dashboard' },
            { key: 'clima', label: 'Clima', icon: 'cloud' },
            { key: 'historial', label: 'Mis registros', icon: 'chart' },
            { key: 'alertas', label: 'Alertas', icon: 'bell' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setVista(tab.key)} style={{
              padding: '16px 20px', border: 'none', cursor: 'pointer',
              background: 'transparent', fontSize: '14px', fontWeight: '500',
              color: vista === tab.key ? '#1B5E20' : '#9E9E9E',
              borderBottom: vista === tab.key ? '2px solid #1B5E20' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.15s'
            }}>
              <Icon name={tab.icon} size={16} color={vista === tab.key ? '#1B5E20' : '#9E9E9E'} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', padding: '80px', color: '#9E9E9E' }}>
            Cargando información...
          </p>
        ) : (
          <>
            {/* Vista: Mi campo */}
            {vista === 'inicio' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>
                    Bienvenido, {usuario?.nombre}
                  </h1>
                  <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
                    Resumen de tu campo asignado
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  {[
                    { label: 'Campos asignados', value: campos.length, color: '#1B5E20' },
                    { label: 'Cultivos activos', value: cultivos.filter(c => c.estado === 'activo').length, color: '#1565C0' },
                    { label: 'Alertas sin leer', value: alertas.length, color: alertas.length > 0 ? '#E65100' : '#1B5E20' },
                  ].map(s => (
                    <div key={s.label} style={{
                      background: 'white', borderRadius: '12px', padding: '20px 24px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${s.color}`
                    }}>
                      <p style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
                        {s.label}
                      </p>
                      <p style={{ fontSize: '30px', fontWeight: '700', color: s.color, lineHeight: 1 }}>{s.value}</p>
                    </div>
                  ))}
                </div>

                {/* Lista de campos */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E' }}>Mis campos</h2>
                  </div>
                  {campos.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#9E9E9E' }}>
                      <Icon name="map" size={36} color="#E0E0E0" />
                      <p style={{ marginTop: '12px' }}>No tienes campos asignados aún</p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F8F9FA' }}>
                          {['Campo', 'Región', 'Zona', 'Hectáreas', 'Estado'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {campos.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                            <td style={{ padding: '14px 16px', fontWeight: '500' }}>{c.nombre}</td>
                            <td style={{ padding: '14px 16px', color: '#757575' }}>{c.region}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                {c.zona}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>{c.hectareas} ha</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                Activo
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Cultivos */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
                    <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E' }}>Cultivos bajo mi cuidado</h2>
                  </div>
                  {cultivos.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '40px', color: '#9E9E9E' }}>No hay cultivos registrados</p>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F8F9FA' }}>
                          {['Cultivo', 'Variedad', 'Fecha siembra', 'Temporada', 'Estado'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cultivos.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                            <td style={{ padding: '14px 16px', fontWeight: '500' }}>{c.tipo_planta}</td>
                            <td style={{ padding: '14px 16px', color: '#757575' }}>{c.variedad || '—'}</td>
                            <td style={{ padding: '14px 16px', color: '#757575' }}>{c.fecha_siembra}</td>
                            <td style={{ padding: '14px 16px' }}>{c.temporada}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                {c.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Vista: Clima */}
            {vista === 'clima' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Clima del campo</h1>
                  <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>Condiciones meteorológicas actuales</p>
                </div>
                {clima ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {[
                      { label: 'Temperatura', value: `${clima.temperatura}°C`, sub: `Máx ${clima.temperatura_max}°C · Mín ${clima.temperatura_min}°C`, color: '#E64A19' },
                      { label: 'Humedad', value: `${clima.humedad}%`, sub: 'Humedad relativa', color: '#1565C0' },
                      { label: 'Viento', value: `${clima.viento} m/s`, sub: 'Velocidad del viento', color: '#6A1B9A' },
                      { label: 'Condición', value: clima.descripcion, sub: `Ciudad: ${clima.ciudad}`, color: '#1B5E20' },
                    ].map(s => (
                      <div key={s.label} style={{
                        background: 'white', borderRadius: '12px', padding: '24px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${s.color}`
                      }}>
                        <p style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
                          {s.label}
                        </p>
                        <p style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '12px', color: '#BDBDBD', marginTop: '6px' }}>{s.sub}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'white', borderRadius: '12px', padding: '80px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <Icon name="cloud" size={40} color="#E0E0E0" />
                    <p style={{ color: '#9E9E9E', marginTop: '16px' }}>No hay datos climáticos disponibles</p>
                  </div>
                )}
              </div>
            )}

            {/* Vista: Historial de registros */}
            {vista === 'historial' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Mis registros de campo</h1>
                  <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
                    Historial de diagnósticos y observaciones registradas
                  </p>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  {historial.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px', color: '#9E9E9E' }}>
                      <Icon name="ai" size={40} color="#E0E0E0" />
                      <p style={{ marginTop: '16px', fontSize: '15px' }}>No hay registros aún</p>
                      <p style={{ fontSize: '13px', color: '#BDBDBD', marginTop: '6px' }}>
                        Los registros aparecerán aquí cuando uses la app móvil en campo
                      </p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#F8F9FA' }}>
                          {['Fecha', 'Tipo de problema', 'Confianza', 'Diagnóstico', 'Recomendación'].map(h => (
                            <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map(r => {
                          const c = colorTipo[r.tipo_problema] || colorTipo.otro
                          return (
                            <tr key={r.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9E9E9E' }}>
                                {new Date(r.fecha).toLocaleString('es-PE')}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                                  {c.label}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: '600', color: c.color }}>
                                {r.confianza_pct}%
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', maxWidth: '200px', color: '#424242' }}>
                                {r.diagnostico_ia}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', maxWidth: '200px', color: '#757575' }}>
                                {r.recomendacion}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* Vista: Alertas */}
            {vista === 'alertas' && (
              <div>
                <div style={{ marginBottom: '24px' }}>
                  <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Mis alertas</h1>
                  <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
                    Alertas de clima, cosecha y plagas de tus campos
                  </p>
                </div>
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  {alertas.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px' }}>
                      <Icon name="check" size={40} color="#4CAF50" />
                      <p style={{ color: '#9E9E9E', marginTop: '16px', fontSize: '15px' }}>Sin alertas pendientes</p>
                    </div>
                  ) : (
                    <div style={{ padding: '16px' }}>
                      {alertas.map(a => (
                        <div key={a.id} style={{
                          padding: '14px', borderRadius: '8px', marginBottom: '8px',
                          background: a.nivel === 'critico' ? '#FFEBEE' : a.nivel === 'advertencia' ? '#FFFDE7' : '#E3F2FD',
                          borderLeft: `3px solid ${a.nivel === 'critico' ? '#C62828' : a.nivel === 'advertencia' ? '#F9A825' : '#1565C0'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '500' }}>{a.descripcion}</p>
                              <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '4px' }}>{a.tipo}</p>
                            </div>
                            <span style={{
                              background: a.nivel === 'critico' ? '#C62828' : a.nivel === 'advertencia' ? '#F9A825' : '#1565C0',
                              color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap'
                            }}>
                              {a.nivel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}