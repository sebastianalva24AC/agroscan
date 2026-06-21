import { useState, useEffect } from 'react'
import { camposService, climaService } from '../../services/api'
import Icon from '../../components/Icon'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts'

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

  const datosGrafica = pronostico.map(p => ({
    hora: p.fecha?.split(' ')[1]?.slice(0, 5) || p.fecha,
    temperatura: p.temperatura,
    humedad: p.humedad,
    precipitacion: p.precipitacion
  }))

  const getColorHumedad = (h) => {
    if (h > 95) return '#C62828'
    if (h > 80) return '#F57F17'
    return '#1565C0'
  }

  const getColorTemp = (t) => {
    if (t > 32) return '#C62828'
    if (t > 28) return '#E64A19'
    return '#1B5E20'
  }

  return (
    <div>
      {/* Header */}
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
          {/* Tarjetas principales */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Temperatura', value: `${clima.temperatura}°C`, sub: `Máx ${clima.temperatura_max}°C · Mín ${clima.temperatura_min}°C`, color: getColorTemp(clima.temperatura), icon: '🌡️' },
              { label: 'Humedad', value: `${clima.humedad}%`, sub: clima.humedad > 95 ? '⚠️ Riesgo de botrytis' : 'Humedad relativa del aire', color: getColorHumedad(clima.humedad), icon: '💧' },
              { label: 'Viento', value: `${clima.viento} m/s`, sub: clima.viento > 15 ? '⚠️ Viento fuerte' : 'Velocidad del viento', color: clima.viento > 15 ? '#C62828' : '#6A1B9A', icon: '💨' },
              { label: 'Condición', value: clima.descripcion, sub: `📍 ${clima.ciudad}`, color: '#1B5E20', icon: '🌤️' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'white', borderRadius: '12px', padding: '20px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${s.color}`
              }}>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  {s.icon} {s.label}
                </p>
                <p style={{ fontSize: '22px', fontWeight: '700', color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: '12px', color: '#BDBDBD', marginTop: '6px' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Alertas de umbral */}
          {(clima.temperatura > 32 || clima.humedad > 95 || clima.viento > 15) && (
            <div style={{ background: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <div>
                <p style={{ fontWeight: '600', color: '#E65100', fontSize: '14px' }}>Condiciones de alerta detectadas</p>
                <p style={{ fontSize: '13px', color: '#BF360C', marginTop: '2px' }}>
                  {clima.temperatura > 32 && `Temperatura crítica: ${clima.temperatura}°C supera 32°C. `}
                  {clima.humedad > 95 && `Humedad excesiva: ${clima.humedad}% — riesgo de botrytis. `}
                  {clima.viento > 15 && `Viento fuerte: ${clima.viento} m/s supera 15 m/s.`}
                </p>
              </div>
            </div>
          )}

          {/* Gráficas Recharts */}
          {datosGrafica.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

              {/* Gráfica temperatura */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E', marginBottom: '4px' }}>
                  🌡️ Temperatura próximas horas
                </h2>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginBottom: '16px' }}>°C — Umbral crítico: 32°C</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={datosGrafica}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E64A19" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#E64A19" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#9E9E9E' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9E9E9E' }} domain={['auto', 'auto']} />
                    <Tooltip
                      formatter={(value) => [`${value}°C`, 'Temperatura']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="temperatura" stroke="#E64A19" strokeWidth={2} fill="url(#colorTemp)" dot={{ fill: '#E64A19', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfica humedad */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E', marginBottom: '4px' }}>
                  💧 Humedad próximas horas
                </h2>
                <p style={{ fontSize: '12px', color: '#9E9E9E', marginBottom: '16px' }}>% — Umbral crítico: 95%</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={datosGrafica}>
                    <defs>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1565C0" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#1565C0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                    <XAxis dataKey="hora" tick={{ fontSize: 11, fill: '#9E9E9E' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#9E9E9E' }} domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => [`${value}%`, 'Humedad']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="humedad" stroke="#1565C0" strokeWidth={2} fill="url(#colorHum)" dot={{ fill: '#1565C0', r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}

          {/* Tabla pronóstico */}
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
                      <td style={{ padding: '14px 16px', color: getColorTemp(p.temperatura), fontWeight: '600' }}>{p.temperatura}°C</td>
                      <td style={{ padding: '14px 16px', color: getColorHumedad(p.humedad), fontWeight: '600' }}>{p.humedad}%</td>
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