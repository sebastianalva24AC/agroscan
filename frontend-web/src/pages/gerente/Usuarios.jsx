import { useState, useEffect } from 'react'
import { authService, camposService } from '../../services/api'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'

export default function Usuarios() {
  const [modal, setModal] = useState(null)
  const [campos, setCampos] = useState([])
  const [guardando, setGuardando] = useState(false)
  const [formTecnico, setFormTecnico] = useState({ nombre: '', email: '', password: '', empresa_id: '' })

  useEffect(() => {
    camposService.listar().then(r => setCampos(r.data)).catch(console.error)
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    setFormTecnico(f => ({ ...f, empresa_id: usuario.empresa_id || '' }))
  }, [])

  const crearTecnico = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await authService.crearTecnico(formTecnico)
      alert(`Técnico ${formTecnico.nombre} creado exitosamente. Credenciales enviadas a ${formTecnico.email}`)
      setModal(null)
      setFormTecnico({ nombre: '', email: '', password: '', empresa_id: formTecnico.empresa_id })
    } catch {
      alert('Error al crear el técnico. El email puede estar en uso.')
    } finally {
      setGuardando(false)
    }
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

      {/* Tarjetas de roles */}
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
              <strong>Invitación:</strong> El gerente ingresa su email y recibe un enlace
            </p>
          </div>
          <button onClick={() => setModal('comprador')} style={{
            width: '100%', padding: '10px', background: '#E3F2FD', color: '#1565C0',
            border: '1.5px solid #BBDEFB', borderRadius: '8px', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600'
          }}>
            Invitar comprador
          </button>
        </div>
      </div>

      {/* Info adicional */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#1A1A2E' }}>
          Flujo de acceso al sistema
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { paso: '1', titulo: 'Gerente se registra', desc: 'Crea su cuenta y empresa desde la web. Es el administrador principal.', color: '#1B5E20' },
            { paso: '2', titulo: 'Crea cuenta del técnico', desc: 'Desde esta sección, el gerente crea las credenciales del técnico agrónomo.', color: '#E65100' },
            { paso: '3', titulo: 'Técnico inicia sesión', desc: 'Usa las credenciales en la app móvil para trabajar en el campo.', color: '#1565C0' },
          ].map(item => (
            <div key={item.paso} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: item.color, color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', flexShrink: 0
              }}>
                {item.paso}
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{item.titulo}</p>
                <p style={{ fontSize: '13px', color: '#757575', marginTop: '4px', lineHeight: '1.5' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal crear técnico */}
      {modal === 'tecnico' && (
        <Modal titulo="Crear técnico agrónomo" onClose={() => setModal(null)}>
          <form onSubmit={crearTecnico}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                Nombre completo
              </label>
              <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                placeholder="Ej: Luis Torres García"
                value={formTecnico.nombre} onChange={e => setFormTecnico({ ...formTecnico, nombre: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                Email
              </label>
              <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                type="email" placeholder="tecnico@empresa.com"
                value={formTecnico.email} onChange={e => setFormTecnico({ ...formTecnico, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                Contraseña temporal
              </label>
              <input style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                type="password" placeholder="Mínimo 8 caracteres"
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

      {/* Modal invitar comprador */}
      {modal === 'comprador' && (
        <Modal titulo="Invitar comprador extranjero" onClose={() => setModal(null)}>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Icon name="users" size={48} color="#E0E0E0" />
            <p style={{ color: '#9E9E9E', marginTop: '16px', fontSize: '14px' }}>
              La funcionalidad de invitación por email estará disponible próximamente.
            </p>
            <p style={{ color: '#BDBDBD', fontSize: '13px', marginTop: '8px' }}>
              Por ahora el comprador puede ver los certificados QR sin necesidad de cuenta.
            </p>
            <button onClick={() => setModal(null)} style={{
              marginTop: '20px', background: '#1B5E20', color: 'white', border: 'none',
              borderRadius: '8px', padding: '10px 24px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
            }}>Entendido</button>
          </div>
        </Modal>
      )}
    </div>
  )
}