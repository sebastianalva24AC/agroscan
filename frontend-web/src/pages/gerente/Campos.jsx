import { useState, useEffect } from 'react'
import { camposService } from '../../services/api'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'

export default function Campos() {
  const [campos, setCampos] = useState([])
  const [modal, setModal] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [form, setForm] = useState({
    nombre: '', latitud: '', longitud: '',
    hectareas: '', region: '', zona: 'costa'
  })

  const cargar = () => {
    camposService.listar()
      .then(r => setCampos(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await camposService.crear(form)
      setModal(false)
      setForm({ nombre: '', latitud: '', longitud: '', hectareas: '', region: '', zona: 'costa' })
      cargar()
    } catch {
      alert('Error al crear el campo')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Campos</h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Gestiona los campos agrícolas de tu empresa
          </p>
        </div>
        <button onClick={() => setModal(true)} style={{
          background: '#1B5E20', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Icon name="plus" size={16} color="white" /> Nuevo campo
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#9E9E9E' }}>Cargando campos...</p>
        ) : campos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Icon name="map" size={40} color="#E0E0E0" />
            <p style={{ color: '#9E9E9E', marginTop: '16px', fontSize: '15px' }}>No hay campos registrados</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {['Nombre del campo', 'Región', 'Zona', 'Hectáreas', 'Coordenadas', 'Estado'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {h}
                  </th>
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
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: '#9E9E9E', fontFamily: 'monospace' }}>
                    {c.latitud}, {c.longitud}
                  </td>
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

      {modal && (
        <Modal titulo="Registrar nuevo campo" onClose={() => setModal(false)}>
          <form onSubmit={guardar}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                Nombre del campo
              </label>
              <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                placeholder="Ej: Fundo La Esperanza"
                value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Latitud</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="-8.1120" type="number" step="any"
                  value={form.latitud} onChange={e => setForm({ ...form, latitud: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Longitud</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="-79.0280" type="number" step="any"
                  value={form.longitud} onChange={e => setForm({ ...form, longitud: e.target.value })} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Hectáreas</label>
                <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="150.5" type="number" step="any"
                  value={form.hectareas} onChange={e => setForm({ ...form, hectareas: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Zona</label>
                <select style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })}>
                  <option value="costa">Costa</option>
                  <option value="sierra">Sierra</option>
                  <option value="selva">Selva</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>Región</label>
              <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                placeholder="Ej: La Libertad"
                value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModal(false)} style={{
                background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>
                Cancelar
              </button>
              <button type="submit" disabled={guardando} style={{
                background: '#1B5E20', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>
                {guardando ? 'Guardando...' : 'Registrar campo'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}