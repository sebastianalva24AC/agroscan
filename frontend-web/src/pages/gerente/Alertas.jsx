import { useState, useEffect } from 'react'
import { alertasService } from '../../services/api'
import Icon from '../../components/Icon'

export default function Alertas() {
  const [alertas, setAlertas] = useState([])
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    alertasService.listar()
      .then(r => setAlertas(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const resolver = async (id) => {
    const accion = prompt('¿Qué acción tomaste para resolver esta alerta?')
    if (!accion) return
    try {
      await alertasService.resolver(id, accion)
      cargar()
    } catch {
      alert('Error al resolver la alerta')
    }
  }

  const nivelColor = {
    critico: { bg: '#FFEBEE', border: '#C62828', badge: '#C62828' },
    advertencia: { bg: '#FFFDE7', border: '#F9A825', badge: '#F57F17' },
    info: { bg: '#E3F2FD', border: '#1565C0', badge: '#1565C0' }
  }

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Alertas del Sistema</h1>
        <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
          Monitorea y gestiona las alertas generadas automáticamente
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        {cargando ? (
          <p style={{ textAlign: 'center', padding: '60px', color: '#9E9E9E' }}>Cargando alertas...</p>
        ) : alertas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <Icon name="check" size={40} color="#4CAF50" />
            <p style={{ color: '#9E9E9E', marginTop: '16px', fontSize: '15px' }}>No hay alertas registradas</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8F9FA' }}>
                {['Tipo', 'Descripción', 'Nivel', 'Fecha', 'Estado', 'Acción'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alertas.map(a => {
                const colors = nivelColor[a.nivel] || nivelColor.info
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#E3F2FD', color: '#1565C0', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {a.tipo}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', maxWidth: '300px' }}>{a.descripcion}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: colors.bg, color: colors.badge, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {a.nivel}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#9E9E9E' }}>
                      {new Date(a.fecha).toLocaleString('es-PE')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        background: a.resuelta ? '#E8F5E9' : a.leida ? '#FFFDE7' : '#FFEBEE',
                        color: a.resuelta ? '#1B5E20' : a.leida ? '#F57F17' : '#C62828',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {a.resuelta ? 'Resuelta' : a.leida ? 'Leída' : 'Nueva'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {!a.resuelta && (
                        <button onClick={() => resolver(a.id)} style={{
                          background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                          borderRadius: '8px', padding: '6px 14px', cursor: 'pointer',
                          fontSize: '12px', fontWeight: '600'
                        }}>
                          Resolver
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}