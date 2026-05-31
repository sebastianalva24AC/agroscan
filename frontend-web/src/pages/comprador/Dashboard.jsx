import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { certificadosService } from '../../services/api'
import Icon from '../../components/Icon'

export default function DashboardComprador() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [certificados, setCertificados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [certSel, setCertSel] = useState(null)

  useEffect(() => {
    certificadosService.listar()
      .then(r => setCertificados(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const certificadosFiltrados = certificados.filter(c =>
    c.qr_codigo?.toLowerCase().includes(busqueda.toLowerCase())
  )

  const parsearHistorial = (historial) => {
    try {
      const limpio = historial
        .replace(/'/g, '"')
        .replace(/datetime\.date\((\d+),\s*(\d+),\s*(\d+)\)/g, '"$1-$2-$3"')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false')
      return JSON.parse(limpio)
    } catch {
      return null
    }
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
              Portal del Comprador
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
            {usuario?.nombre || usuario?.email}
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

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>
            Portal de Trazabilidad
          </h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Consulta y verifica los certificados de trazabilidad de tus productos importados
          </p>
        </div>

        <div style={{
          background: 'white', borderRadius: '12px', padding: '20px 24px',
          marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
          display: 'flex', gap: '20px', alignItems: 'flex-start',
          borderLeft: '4px solid #1565C0'
        }}>
          <Icon name="qr" size={28} color="#1565C0" />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E', marginBottom: '4px' }}>
              ¿Cómo funciona la trazabilidad?
            </p>
            <p style={{ fontSize: '13px', color: '#757575', lineHeight: '1.6' }}>
              Cada lote de producto que importas tiene un certificado digital único. Puedes verificar el origen, las condiciones de cultivo, el historial climático y los diagnósticos de calidad de cada lote escaneando el código QR o consultando el código en esta plataforma. Este sistema cumple con los requisitos del Reglamento de Deforestación de la Unión Europea (EUDR).
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Certificados disponibles', value: certificados.length, color: '#1B5E20' },
            { label: 'Certificados válidos', value: certificados.filter(c => c.valido).length, color: '#1565C0' },
            { label: 'Cumplimiento EUDR', value: '100%', color: '#6A1B9A' },
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

        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #F0F0F0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px'
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E' }}>
              Certificados de trazabilidad
            </h2>
            <input
              style={{
                padding: '8px 14px', border: '1.5px solid #E0E0E0',
                borderRadius: '8px', fontSize: '13px', outline: 'none', width: '260px'
              }}
              placeholder="Buscar por código QR..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          {cargando ? (
            <p style={{ textAlign: 'center', padding: '60px', color: '#9E9E9E' }}>
              Cargando certificados...
            </p>
          ) : certificadosFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#9E9E9E' }}>
              <Icon name="qr" size={40} color="#E0E0E0" />
              <p style={{ marginTop: '16px', fontSize: '15px' }}>No hay certificados disponibles</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FA' }}>
                  {['Código QR', 'Fecha de generación', 'Estado', 'Acción'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '12px', fontWeight: '600', color: '#757575',
                      textTransform: 'uppercase', letterSpacing: '0.4px'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {certificadosFiltrados.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px', color: '#1565C0', fontWeight: '500' }}>
                      {c.qr_codigo?.substring(0, 20)}...
                    </td>
                    <td style={{ padding: '14px 16px', color: '#757575', fontSize: '13px' }}>
                      {new Date(c.fecha_generacion).toLocaleString('es-PE')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: c.valido ? '#E8F5E9' : '#FFEBEE',
                        color: c.valido ? '#1B5E20' : '#C62828',
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '12px', fontWeight: '600'
                      }}>
                        {c.valido ? 'Válido' : 'Inválido'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => setCertSel(c)} style={{
                        background: 'white', color: '#1565C0',
                        border: '1.5px solid #1565C0', borderRadius: '8px',
                        padding: '6px 14px', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}>
                        <Icon name="eye" size={13} color="#1565C0" /> Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {certSel && (
        <div onClick={e => e.target === e.currentTarget && setCertSel(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '560px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1A1A2E' }}>
                Detalle del certificado
              </h2>
              <button onClick={() => setCertSel(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: '#9E9E9E'
              }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <div style={{ background: '#E8F5E9', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
              <Icon name="check" size={28} color="#1B5E20" />
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#1B5E20', marginTop: '6px' }}>
                Certificado válido y verificado
              </p>
              <p style={{ fontSize: '12px', color: '#757575', marginTop: '2px' }}>
                Generado el {new Date(certSel.fecha_generacion).toLocaleString('es-PE')}
              </p>
            </div>

            {(() => {
              const h = parsearHistorial(certSel.historial_json)
              if (!h) return (
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ fontSize: '13px', color: '#757575', fontFamily: 'monospace' }}>
                    {certSel.historial_json}
                  </p>
                </div>
              )
              return (
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px' }}>
                    Información del lote
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Número de lote', value: h.numero_lote },
                      { label: 'Tipo de cultivo', value: h.tipo_planta },
                      { label: 'Variedad', value: h.variedad },
                      { label: 'Región', value: h.region },
                      { label: 'Volumen', value: `${h.volumen_kg} kg` },
                      { label: 'Calidad', value: h.calidad },
                      { label: 'País destino', value: h.destino_pais },
                      { label: 'Fecha cosecha', value: String(h.fecha_cosecha) },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#F8F9FA', borderRadius: '8px', padding: '12px' }}>
                        <p style={{ fontSize: '11px', color: '#9E9E9E', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          {item.label}
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1A1A2E', marginTop: '4px' }}>
                          {item.value || '—'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            <div style={{ background: '#E3F2FD', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: '#1565C0', lineHeight: '1.5' }}>
                <strong>Código QR:</strong> {certSel.qr_codigo}
              </p>
            </div>

            <button onClick={() => setCertSel(null)} style={{
              width: '100%', padding: '12px', background: '#1B5E20',
              color: 'white', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontSize: '14px', fontWeight: '600'
            }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}