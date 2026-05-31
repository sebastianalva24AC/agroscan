import { useState, useEffect } from 'react'
import { camposService, climaService } from '../../services/api'
import Icon from '../../components/Icon'

export default function Clima() {
  const [campos, setCampos] = useState([])
  const [campoSel, setCampoSel] = useState(null)
  const [clima, setClima] = useState(null)
  const [pronostico, setPronostico] = useState([])
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    camposService.listar().then(r => {
      setCampos(r.data)
      if (r.data.length > 0) setCampoSel(r.data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!campoSel) return
    setCargando(true)
    Promise.all([climaService.actual(campoSel), climaService.pronostico(campoSel)])
      .then(([rc, rp]) => {
        setClima(rc.data.clima)
        setPronostico(rp.data.pronostico_7_dias?.slice(0, 8) || [])
      })
      .catch(console.error)
      .finally(() => setCargando(false))
  }, [campoSel])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Monitoreo Climático</h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Condiciones meteorológicas en tiempo real
          </p>
        </div>
        <select
          style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #E0E0E0', fontSize: '14px', outline: 'none', cursor: 'pointer', minWidth: '200px' }}
          value={campoSel || ''}
          onChange={e => setCampoSel(e.target.value)}
        >
          {campos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {cargando ? (
        <p style={{ textAlign: 'center', padding: '60px', color: '#9E9E9E' }}>Obteniendo datos del clima...</p>
      ) : clima ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Temperatura', value: `${clima.temperatura}°C`, sub: `Máx ${clima.temperatura_max}°C · Mín ${clima.temperatura_min}°C`, color: '#E64A19' },
              { label: 'Humedad', value: `${clima.humedad}%`, sub: 'Humedad relativa del aire', color: '#1565C0' },
              { label: 'Viento', value: `${clima.viento} m/s`, sub: 'Velocidad del viento', color: '#6A1B9A' },
              { label: 'Condición', value: clima.descripcion, sub: `Ciudad: ${clima.ciudad}`, color: '#1B5E20' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'white', borderRadius: '12px', padding: '20px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${s.color}`
              }}>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {s.label}
                </p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '12px', color: '#BDBDBD', marginTop: '6px' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {pronostico.length > 0 && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0F0F0' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E' }}>Pronóstico próximas horas</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F8F9FA' }}>
                    {['Fecha y hora', 'Temperatura', 'Humedad', 'Precipitación', 'Condición'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pronostico.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '500', fontSize: '13px' }}>{p.fecha}</td>
                      <td style={{ padding: '14px 16px', color: '#E64A19', fontWeight: '600' }}>{p.temperatura}°C</td>
                      <td style={{ padding: '14px 16px' }}>{p.humedad}%</td>
                      <td style={{ padding: '14px 16px' }}>{p.precipitacion} mm</td>
                      <td style={{ padding: '14px 16px', color: '#757575' }}>{p.descripcion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '80px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <Icon name="cloud" size={40} color="#E0E0E0" />
          <p style={{ color: '#9E9E9E', marginTop: '16px' }}>Selecciona un campo para ver el clima</p>
        </div>
      )}
    </div>
  )
}