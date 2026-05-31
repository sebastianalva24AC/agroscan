import { useState, useEffect } from 'react'
import { camposService, cultivosService } from '../../services/api'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'

export default function Cultivos() {
  const [cultivos, setCultivos] = useState([])
  const [campos, setCampos] = useState([])
  const [modal, setModal] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    tipo_planta: '', variedad: '', fecha_siembra: '', campo_id: '', temporada: ''
  })

  const cargar = async () => {
    const [rc, rcu] = await Promise.all([camposService.listar(), cultivosService.listar()])
    setCampos(rc.data)
    setCultivos(rcu.data)
    setCargando(false)
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await cultivosService.crear(form)
      setModal(false)
      setForm({ tipo_planta: '', variedad: '', fecha_siembra: '', campo_id: '', temporada: '' })
      cargar()
    } catch {
      alert('Error al registrar el cultivo')
    } finally {
      setGuardando(false)
    }
  }

  const TIPOS = ['Arandano', 'Palta', 'Esparrago', 'Uva', 'Mango', 'Platano', 'Mandarina', 'Limon']

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Cultivos</h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Seguimiento del ciclo de vida de tus cultivos
          </p>
        </div>
        <button onClick={() => setModal(true)} style={{
          background: '#1B5E20', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Icon name="plus" size={16} color="white" /> Nuevo cultivo
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#9E9E9E' }}>Cargando cultivos...</p>
        ) : cultivos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Icon name="plant" size={40} color="#E0E0E0" />
            <p style={{ color: '#9E9E9E', marginTop: '16px', fontSize: '15px' }}>No hay cultivos registrados</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {['Cultivo', 'Variedad', 'Campo', 'Fecha siembra', 'Temporada', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cultivos.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                  <td style={{ padding: '14px 16px', fontWeight: '500' }}>{c.tipo_planta}</td>
                  <td style={{ padding: '14px 16px', color: '#757575' }}>{c.variedad || '—'}</td>
                  <td style={{ padding: '14px 16px' }}>{campos.find(f => f.id === c.campo_id)?.nombre || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#757575' }}>{c.fecha_siembra}</td>
                  <td style={{ padding: '14px 16px' }}>{c.temporada}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: c.estado === 'activo' ? '#E8F5E9' : '#E3F2FD',
                      color: c.estado === 'activo' ? '#1B5E20' : '#1565C0',
                      padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                    }}>
                      {c.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal titulo="Registrar nuevo cultivo" onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                  Tipo de planta
                </label>
                <select style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  value={form.tipo_planta} onChange={e => setForm({ ...form, tipo_planta: e.target.value })} required>
                  <option value="">Seleccionar</option>
                  {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                  Variedad
                </label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="Ej: Biloxi, Hass..."
                  value={form.variedad} onChange={e => setForm({ ...form, variedad: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                  Fecha de siembra
                </label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  type="date" value={form.fecha_siembra} onChange={e => setForm({ ...form, fecha_siembra: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                  Temporada
                </label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="Ej: 2025-A" value={form.temporada} onChange={e => setForm({ ...form, temporada: e.target.value })} required />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                Campo
              </label>
              <select style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                value={form.campo_id} onChange={e => setForm({ ...form, campo_id: e.target.value })} required>
                <option value="">Seleccionar campo</option>
                {campos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModal(false)} style={{
                background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>Cancelar</button>
              <button type="submit" disabled={guardando} style={{
                background: '#1B5E20', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>{guardando ? 'Guardando...' : 'Registrar cultivo'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}