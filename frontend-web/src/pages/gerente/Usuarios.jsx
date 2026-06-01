import { useState, useEffect } from 'react'
import { authService, camposService } from '../../services/api'
import api from '../../services/api'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'

// ─── LISTA DE TÉCNICOS ────────────────────────────────────────
function ListaTecnicos() {
  const [tecnicos, setTecnicos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/api/auth/tecnicos')
      .then(r => setTecnicos(r.data.tecnicos || []))
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [])

  const estaEnLinea = (ultimaActividad) => {
    if (!ultimaActividad) return false
    const diff = new Date() - new Date(ultimaActividad)
    return diff < 15 * 60 * 1000
  }

  if (cargando) return null

  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginTop: '24px' }}>
      <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#1A1A2E' }}>
        Técnicos registrados
      </h2>
      {tecnicos.length === 0 ? (
        <p style={{ color: '#9E9E9E', fontSize: '13px' }}>No hay técnicos registrados aún</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA' }}>
              {['Nombre', 'Email', 'Estado', 'Última actividad'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tecnicos.map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                <td style={{ padding: '14px 16px', fontWeight: '500' }}>{t.nombre}</td>
                <td style={{ padding: '14px 16px', color: '#757575' }}>{t.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: estaEnLinea(t.ultima_actividad) ? '#E8F5E9' : '#F5F5F5',
                    color: estaEnLinea(t.ultima_actividad) ? '#1B5E20' : '#9E9E9E',
                    padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: estaEnLinea(t.ultima_actividad) ? '#4CAF50' : '#BDBDBD'
                    }} />
                    {estaEnLinea(t.ultima_actividad) ? 'En línea' : 'Desconectado'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9E9E9E' }}>
                  {t.ultima_actividad
                    ? new Date(t.ultima_actividad).toLocaleString('es-PE')
                    : 'Sin actividad registrada'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── GESTIÓN DE USUARIOS ──────────────────────────────────────
export default function Usuarios() {
  const [modal, setModal] = useState(null)
  const [campos, setCampos] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [formTecnico, setFormTecnico] = useState({
    nombre: '', email: '', password: '', empresa_id: ''
  })
  const [formComprador, setFormComprador] = useState({
    nombre: '', email: '', pais: '', empresa_compradora: '', empresa_id: ''
  })

  useEffect(() => {
    camposService.listar().then(r => setCampos(r.data)).catch(console.error)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    const eid = usuario.empresa_id || ''
    setFormTecnico(f => ({ ...f, empresa_id: eid }))
    setFormComprador(f => ({ ...f, empresa_id: eid }))
  }, [])

  const crearTecnico = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await authService.crearTecnico(formTecnico)
      setResultado({
        tipo: 'tecnico',
        email: formTecnico.email,
        password: formTecnico.password,
        nombre: formTecnico.nombre
      })
      setModal('resultado_tecnico')
      setFormTecnico({ nombre: '', email: '', password: '', empresa_id: formTecnico.empresa_id })
    } catch {
      alert('Error al crear el técnico. El email puede estar en uso.')
    } finally {
      setGuardando(false)
    }
  }

  const invitarComprador = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const res = await authService.invitarComprador(formComprador)
      setResultado(res.data)
      setModal('resultado_comprador')
      setFormComprador({ nombre: '', email: '', pais: '', empresa_compradora: '', empresa_id: formComprador.empresa_id })
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al registrar el comprador')
    } finally {
      setGuardando(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E0E0E0', borderRadius: '8px',
    fontSize: '14px', outline: 'none'
  }
  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: '500', marginBottom: '6px', color: '#424242'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Gestión de Usuarios</h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Administra técnicos agrónomos y compradores extranjeros de tu empresa
          </p>
        </div>
        <button onClick={() => setModal('tecnico')} style={{
          background: '#1B5E20', color: 'white', border: 'none',
          borderRadius: '8px', padding: '10px 20px', cursor: 'pointer',
          fontSize: '14px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <Icon name="plus" size={16} color="white" /> Crear técnico
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: '4px solid #1B5E20' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E' }}>Técnicos agrónomos</h2>
              <p style={{ fontSize: '13px', color: '#9E9E9E', marginTop: '4px' }}>
                Usan la app móvil para registrar observaciones en campo
              </p>
            </div>
            <Icon name="plant" size={24} color="#1B5E20" />
          </div>
          <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#424242', lineHeight: '1.6' }}>
              <strong>Acceso:</strong> App móvil (principal) + Web (secundario)<br />
              <strong>Funciones:</strong> Fotografiar plantas, registrar observaciones con GPS, ver alertas del campo asignado<br />
              <strong>Creación:</strong> El gerente crea su cuenta y le asigna el campo
            </p>
          </div>
          <button onClick={() => setModal('tecnico')} style={{
            width: '100%', padding: '10px', background: '#E8F5E9', color: '#1B5E20',
            border: '1.5px solid #C8E6C9', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600'
          }}>
            Crear nuevo técnico
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: '4px solid #1565C0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1A1A2E' }}>Compradores extranjeros</h2>
              <p style={{ fontSize: '13px', color: '#9E9E9E', marginTop: '4px' }}>
                Consultan la trazabilidad y certificados QR desde su país
              </p>
            </div>
            <Icon name="users" size={24} color="#1565C0" />
          </div>
          <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '14px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', color: '#424242', lineHeight: '1.6' }}>
              <strong>Acceso:</strong> Solo plataforma web<br />
              <strong>Funciones:</strong> Ver estado de campos del proveedor, consultar certificados QR, revisar historial de lotes<br />
              <strong>Registro:</strong> El gerente ingresa sus datos y el sistema genera sus credenciales
            </p>
          </div>
          <button onClick={() => setModal('comprador')} style={{
            width: '100%', padding: '10px', background: '#E3F2FD', color: '#1565C0',
            border: '1.5px solid #BBDEFB', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600'
          }}>
            Registrar comprador
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#1A1A2E' }}>
          Flujo de acceso al sistema
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { paso: '1', titulo: 'Gerente se registra', desc: 'Crea su cuenta y empresa desde la web. Es el administrador principal.', color: '#1B5E20' },
            { paso: '2', titulo: 'Crea cuenta del técnico', desc: 'Desde esta sección crea las credenciales. El técnico las usa en la app móvil.', color: '#E65100' },
            { paso: '3', titulo: 'Registra al comprador', desc: 'Ingresa los datos del comprador y le comparte las credenciales generadas.', color: '#1565C0' },
          ].map(item => (
            <div key={item.paso} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: item.color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', flexShrink: 0
              }}>{item.paso}</div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{item.titulo}</p>
                <p style={{ fontSize: '13px', color: '#757575', marginTop: '4px', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de técnicos registrados */}
      <ListaTecnicos />

      {/* Modal crear técnico */}
      {modal === 'tecnico' && (
        <Modal titulo="Crear técnico agrónomo" onClose={() => setModal(null)}>
          <form onSubmit={crearTecnico}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nombre completo</label>
              <input style={inputStyle} placeholder="Ej: Luis Torres García"
                value={formTecnico.nombre} onChange={e => setFormTecnico({ ...formTecnico, nombre: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" placeholder="tecnico@empresa.com"
                value={formTecnico.email} onChange={e => setFormTecnico({ ...formTecnico, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Contraseña temporal</label>
              <input style={inputStyle} type="password" placeholder="Mínimo 8 caracteres"
                value={formTecnico.password} onChange={e => setFormTecnico({ ...formTecnico, password: e.target.value })} required minLength={8} />
              <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '4px' }}>
                El técnico usará estas credenciales para ingresar a la app móvil
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModal(null)} style={{
                background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>Cancelar</button>
              <button type="submit" disabled={guardando} style={{
                background: '#1B5E20', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>{guardando ? 'Creando...' : 'Crear técnico'}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal registrar comprador */}
      {modal === 'comprador' && (
        <Modal titulo="Registrar comprador extranjero" onClose={() => setModal(null)}>
          <form onSubmit={invitarComprador}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Nombre completo</label>
              <input style={inputStyle} placeholder="Ej: Johan Van Der Berg"
                value={formComprador.nombre} onChange={e => setFormComprador({ ...formComprador, nombre: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" placeholder="comprador@empresa.com"
                value={formComprador.email} onChange={e => setFormComprador({ ...formComprador, email: e.target.value })} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>País</label>
                <input style={inputStyle} placeholder="Países Bajos"
                  value={formComprador.pais} onChange={e => setFormComprador({ ...formComprador, pais: e.target.value })} required />
              </div>
              <div>
                <label style={labelStyle}>Empresa compradora</label>
                <input style={inputStyle} placeholder="Dutch Fresh Imports"
                  value={formComprador.empresa_compradora} onChange={e => setFormComprador({ ...formComprador, empresa_compradora: e.target.value })} required />
              </div>
            </div>
            <div style={{ background: '#E3F2FD', borderRadius: '8px', padding: '12px', marginBottom: '24px' }}>
              <p style={{ fontSize: '13px', color: '#1565C0' }}>
                El sistema generará automáticamente las credenciales de acceso para el comprador.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModal(null)} style={{
                background: 'white', color: '#1565C0', border: '1.5px solid #1565C0',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>Cancelar</button>
              <button type="submit" disabled={guardando} style={{
                background: '#1565C0', color: 'white', border: 'none',
                borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
              }}>{guardando ? 'Registrando...' : 'Registrar comprador'}</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'resultado_tecnico' && resultado && (
        <Modal titulo="Técnico creado exitosamente" onClose={() => setModal(null)}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Icon name="check" size={40} color="#1B5E20" />
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1B5E20', marginTop: '8px' }}>
              {resultado.nombre} ha sido registrado
            </p>
          </div>
          <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
              Credenciales para la app móvil
            </p>
            <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Email:</strong> {resultado.email}</p>
            <p style={{ fontSize: '14px' }}><strong>Contraseña:</strong> {resultado.password}</p>
          </div>
          <div style={{ background: '#FFF8E1', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#F57F17' }}>
              Comparte estas credenciales con el técnico para que pueda ingresar a la app móvil.
            </p>
          </div>
          <button onClick={() => setModal(null)} style={{
            width: '100%', padding: '12px', background: '#1B5E20',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px', fontWeight: '600'
          }}>Entendido</button>
        </Modal>
      )}

      {modal === 'resultado_comprador' && resultado && (
        <Modal titulo="Comprador registrado exitosamente" onClose={() => setModal(null)}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <Icon name="check" size={40} color="#1565C0" />
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#1565C0', marginTop: '8px' }}>
              {resultado.mensaje}
            </p>
          </div>
          <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
              Credenciales para el portal web
            </p>
            <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Email:</strong> {resultado.email}</p>
            <p style={{ fontSize: '14px', marginBottom: '4px' }}><strong>Contraseña temporal:</strong> {resultado.password_temporal}</p>
            <p style={{ fontSize: '14px' }}><strong>Portal:</strong> http://localhost:5173/login</p>
          </div>
          <div style={{ background: '#E3F2FD', borderRadius: '8px', padding: '12px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#1565C0' }}>{resultado.instrucciones}</p>
          </div>
          <button onClick={() => setModal(null)} style={{
            width: '100%', padding: '12px', background: '#1565C0',
            color: 'white', border: 'none', borderRadius: '8px',
            cursor: 'pointer', fontSize: '14px', fontWeight: '600'
          }}>Entendido</button>
        </Modal>
      )}
    </div>
  )
}