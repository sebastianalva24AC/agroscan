import { useState, useEffect } from 'react'
import { cultivosService, lotesService, certificadosService } from '../../services/api'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'

export default function Trazabilidad() {
  const [lotes, setLotes] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [modal, setModal] = useState(false)
  const [modalCert, setModalCert] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    numero_lote: '', fecha_cosecha: '', volumen_kg: '',
    calidad: 'premium', destino_pais: '', empresa_compradora: '', cultivo_id: ''
  })

  const cargar = async () => {
    const [rl, rc] = await Promise.all([lotesService.listar(), cultivosService.listar()])
    setLotes(rl.data)
    setCultivos(rc.data)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await lotesService.crear(form)
      setModal(false)
      setForm({ numero_lote: '', fecha_cosecha: '', volumen_kg: '', calidad: 'premium', destino_pais: '', empresa_compradora: '', cultivo_id: '' })
      cargar()
    } catch {
      alert('Error al registrar el lote')
    } finally {
      setGuardando(false)
    }
  }

  const certificar = async (loteId) => {
    try {
      const res = await lotesService.certificar(loteId)
      alert(`Certificado QR generado exitosamente.\nCódigo: ${res.data.qr_codigo}`)
      cargar()
    } catch {
      alert('Error al generar el certificado')
    }
  }

  const verCertificado = async (loteId) => {
    try {
      const res = await lotesService.verCertificado(loteId)
      setModalCert(res.data)
    } catch {
      alert('No se encontró el certificado')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Trazabilidad y Certificados</h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Gestiona lotes cosechados y genera certificados QR para exportación
          </p>
        </div>
        <button onClick={() => setModal(true)} style={{
          background: '#1B5E20', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Icon name="plus" size={16} color="white" /> Registrar lote
        </button>
      </div>

      {/* Info sobre el proceso */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { paso: '1', titulo: 'Registrar lote', desc: 'Ingresa los datos del lote cosechado: volumen, calidad y destino de exportación.', color: '#1B5E20' },
          { paso: '2', titulo: 'Generar certificado QR', desc: 'El sistema genera un QR único con toda la trazabilidad del lote en formato PDF.', color: '#1565C0' },
          { paso: '3', titulo: 'Compartir con comprador', desc: 'El comprador escanea el QR y accede al historial completo del producto.', color: '#6A1B9A' },
        ].map(item => (
          <div key={item.paso} style={{
            background: 'white', borderRadius: '12px', padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            display: 'flex', gap: '14px', alignItems: 'flex-start'
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: item.color,
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', fontWeight: '700', flexShrink: 0
            }}>{item.paso}</div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{item.titulo}</p>
              <p style={{ fontSize: '13px', color: '#9E9E9E', marginTop: '4px', lineHeight: '1.5' }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de lotes */}
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
          <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E' }}>Lotes registrados</h2>
        </div>
        {cargando ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#9E9E9E' }}>Cargando lotes...</p>
        ) : lotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Icon name="qr" size={40} color="#E0E0E0" />
            <p style={{ color: '#9E9E9E', marginTop: '16px', fontSize: '15px' }}>No hay lotes registrados</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {['Número de lote', 'Cultivo', 'Fecha cosecha', 'Volumen', 'Calidad', 'Destino', 'Estado', 'Acciones'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lotes.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '600', fontFamily: 'monospace', fontSize: '13px', color: '#1B5E20' }}>
                    {l.numero_lote}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {cultivos.find(c => c.id === l.cultivo_id)?.tipo_planta || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', color: '#757575' }}>{l.fecha_cosecha}</td>
                  <td style={{ padding: '14px 16px', fontWeight: '500' }}>{l.volumen_kg} kg</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: '#E8F5E9', color: '#1B5E20', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {l.calidad}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#757575' }}>{l.destino_pais}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: l.estado === 'certificado' ? '#E8F5E9' : '#FFFDE7',
                      color: l.estado === 'certificado' ? '#1B5E20' : '#F57F17',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                    }}>
                      {l.estado === 'certificado' ? 'Certificado' : 'Pendiente'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {l.estado === 'pendiente' ? (
                        <button onClick={() => certificar(l.id)} style={{
                          background: '#1B5E20', color: 'white', border: 'none',
                          borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          <Icon name="qr" size={13} color="white" /> Generar QR
                        </button>
                      ) : (
                        <button onClick={() => verCertificado(l.id)} style={{
                          background: 'white', color: '#1565C0', border: '1.5px solid #1565C0',
                          borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '600',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          <Icon name="eye" size={13} color="#1565C0" /> Ver certificado
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal registrar lote */}
      {modal && (
        <Modal titulo="Registrar lote cosechado" onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Número de lote</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="LOTE-2025-002" value={form.numero_lote} onChange={e => setForm({ ...form, numero_lote: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Fecha de cosecha</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  type="date" value={form.fecha_cosecha} onChange={e => setForm({ ...form, fecha_cosecha: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Volumen (kg)</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  type="number" placeholder="5000" value={form.volumen_kg} onChange={e => setForm({ ...form, volumen_kg: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Calidad</label>
                <select style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  value={form.calidad} onChange={e => setForm({ ...form, calidad: e.target.value })}>
                  <option value="premium">Premium</option>
                  <option value="primera">Primera</option>
                  <option value="segunda">Segunda</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Cultivo</label>
              <select style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                value={form.cultivo_id} onChange={e => setForm({ ...form, cultivo_id: e.target.value })} required>
                <option value="">Seleccionar cultivo</option>
                {cultivos.map(c => <option key={c.id} value={c.id}>{c.tipo_planta} — {c.variedad}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>País destino</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="Países Bajos" value={form.destino_pais} onChange={e => setForm({ ...form, destino_pais: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Empresa compradora</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="Dutch Fresh Imports" value={form.empresa_compradora} onChange={e => setForm({ ...form, empresa_compradora: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModal(false)} style={{
                background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>Cancelar</button>
              <button type="submit" disabled={guardando} style={{
                background: '#1B5E20', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>{guardando ? 'Guardando...' : 'Registrar lote'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal ver certificado */}
      {modalCert && (
        <Modal titulo="Certificado de Trazabilidad" onClose={() => setModalCert(null)} ancho="560px">
          <div>
            <div style={{ background: '#F1F8E9', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
              <Icon name="check" size={32} color="#1B5E20" />
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#1B5E20', marginTop: '8px' }}>
                Certificado válido
              </p>
              <p style={{ fontSize: '12px', color: '#757575', marginTop: '4px' }}>
                Generado el {new Date(modalCert.fecha_generacion).toLocaleString('es-PE')}
              </p>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
                Código QR único
              </p>
              <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '13px', color: '#1565C0', wordBreak: 'break-all' }}>
                {modalCert.qr_codigo || 'N/A'}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '8px' }}>
                Ubicación del archivo PDF
              </p>
              <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#424242', wordBreak: 'break-all' }}>
                {modalCert.pdf_url || 'No disponible'}
              </div>
            </div>

            <div style={{ background: '#E3F2FD', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: '#1565C0', lineHeight: '1.5' }}>
                <strong>Para el comprador:</strong> Comparte el código QR con tu comprador extranjero. Al escanearlo accederá a la trazabilidad completa del lote incluyendo el historial climático, los diagnósticos de IA y los datos del campo de producción.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalCert(null)} style={{
                background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>Cerrar</button>
              <button onClick={() => window.open(`http://127.0.0.1:8000/api/certificados/${modalCert.qr_codigo}`)} style={{
                background: '#1B5E20', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <Icon name="eye" size={15} color="white" /> Verificar certificado
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}