import { useState, useEffect } from 'react'
import { cultivosService, diagnosticoService } from '../../services/api'
import Icon from '../../components/Icon'

export default function DiagnosticoIA() {
  const [cultivos, setCultivos] = useState([])
  const [cultivoSel, setCultivoSel] = useState('')
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [observacion, setObservacion] = useState('')
  const [resultado, setResultado] = useState(null)
  const [historial, setHistorial] = useState([])
  const [analizando, setAnalizando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [vista, setVista] = useState('analizar')

  useEffect(() => {
    cultivosService.listar()
      .then(r => {
        setCultivos(r.data)
        if (r.data.length > 0) setCultivoSel(r.data[0].id)
      })
      .finally(() => setCargando(false))
  }, [])

  useEffect(() => {
    if (!cultivoSel) return
    diagnosticoService.historial(cultivoSel)
      .then(r => setHistorial(r.data.registros || []))
      .catch(() => setHistorial([]))
  }, [cultivoSel])

  const handleFoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file)
    setPreview(URL.createObjectURL(file))
    setResultado(null)
  }

  const analizar = async () => {
    if (!foto || !cultivoSel) return
    setAnalizando(true)
    try {
      const res = await diagnosticoService.analizar(cultivoSel, foto, observacion)
      setResultado(res.data.resultado)
      diagnosticoService.historial(cultivoSel).then(r => setHistorial(r.data.registros || []))
    } catch {
      alert('Error al analizar la imagen')
    } finally {
      setAnalizando(false)
    }
  }

  const colorTipo = {
    saludable: { bg: '#E8F5E9', color: '#1B5E20', label: 'Saludable' },
    enfermedad: { bg: '#FFF3E0', color: '#E65100', label: 'Enfermedad detectada' },
    plaga: { bg: '#FFEBEE', color: '#C62828', label: 'Plaga detectada' },
    estres_hidrico: { bg: '#E3F2FD', color: '#1565C0', label: 'Estrés hídrico' },
    deficiencia_nutricional: { bg: '#F3E5F5', color: '#6A1B9A', label: 'Deficiencia nutricional' },
    otro: { bg: '#F5F5F5', color: '#424242', label: 'Otro' },
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Análisis con IA</h1>
          <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
            Diagnóstico de cultivos mediante inteligencia artificial YOLOv8
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['analizar', 'historial'].map(v => (
            <button key={v} onClick={() => setVista(v)} style={{
              padding: '9px 18px', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '500', border: 'none',
              background: vista === v ? '#1B5E20' : 'white',
              color: vista === v ? 'white' : '#757575',
              boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
              {v === 'analizar' ? 'Nuevo análisis' : 'Historial'}
            </button>
          ))}
        </div>
      </div>

      {/* Selector de cultivo */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: '500', color: '#424242', whiteSpace: 'nowrap' }}>Cultivo a analizar:</label>
        <select style={{ flex: 1, padding: '9px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
          value={cultivoSel} onChange={e => setCultivoSel(e.target.value)}>
          {cultivos.map(c => <option key={c.id} value={c.id}>{c.tipo_planta} — {c.variedad}</option>)}
        </select>
      </div>

      {vista === 'analizar' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Panel izquierdo: subir foto */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#1A1A2E' }}>
              Fotografía del cultivo
            </h2>

            <label style={{
              display: 'block', border: '2px dashed #E0E0E0', borderRadius: '12px',
              padding: '32px', textAlign: 'center', cursor: 'pointer',
              transition: 'border-color 0.2s', marginBottom: '16px',
              background: preview ? 'transparent' : '#FAFAFA'
            }}>
              <input type="file" accept="image/*" onChange={handleFoto} style={{ display: 'none' }} />
              {preview ? (
                <img src={preview} alt="Vista previa" style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <div style={{ color: '#9E9E9E' }}>
                  <Icon name="download" size={36} color="#BDBDBD" />
                  <p style={{ fontSize: '14px', marginTop: '12px', fontWeight: '500' }}>Haz clic para subir una foto</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>JPG, PNG — máximo 10 MB</p>
                </div>
              )}
            </label>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }}>
                Observación adicional (opcional)
              </label>
              <textarea style={{
                width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0',
                borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical',
                minHeight: '80px', fontFamily: 'inherit'
              }}
                placeholder="Describe lo que observas en el cultivo..."
                value={observacion} onChange={e => setObservacion(e.target.value)}
              />
            </div>

            <button onClick={analizar} disabled={!foto || !cultivoSel || analizando} style={{
              width: '100%', padding: '12px', background: !foto || analizando ? '#E0E0E0' : '#1B5E20',
              color: !foto || analizando ? '#9E9E9E' : 'white', border: 'none',
              borderRadius: '8px', cursor: !foto || analizando ? 'not-allowed' : 'pointer',
              fontSize: '15px', fontWeight: '600', transition: 'all 0.2s'
            }}>
              {analizando ? 'Analizando con IA...' : 'Analizar con IA'}
            </button>
          </div>

          {/* Panel derecho: resultado */}
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: '#1A1A2E' }}>
              Resultado del diagnóstico
            </h2>

            {!resultado ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9E9E9E' }}>
                <Icon name="ai" size={48} color="#E0E0E0" />
                <p style={{ fontSize: '14px', marginTop: '16px' }}>
                  Sube una foto y haz clic en "Analizar con IA" para obtener el diagnóstico
                </p>
              </div>
            ) : (
              <div>
                {/* Badge del tipo */}
                <div style={{
                  background: colorTipo[resultado.tipo_problema]?.bg || '#F5F5F5',
                  borderRadius: '12px', padding: '20px', marginBottom: '20px',
                  display: 'flex', alignItems: 'center', gap: '16px'
                }}>
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '12px',
                    background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon name="ai" size={28} color={colorTipo[resultado.tipo_problema]?.color || '#424242'} />
                  </div>
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '700', color: colorTipo[resultado.tipo_problema]?.color }}>
                      {colorTipo[resultado.tipo_problema]?.label}
                    </p>
                    <p style={{ fontSize: '13px', color: '#757575', marginTop: '2px' }}>
                      Confianza: {resultado.confianza_pct}%
                    </p>
                  </div>
                </div>

                {/* Barra de confianza */}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '500', color: '#424242' }}>Nivel de confianza</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: colorTipo[resultado.tipo_problema]?.color }}>
                      {resultado.confianza_pct}%
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#F0F0F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: '4px',
                      background: colorTipo[resultado.tipo_problema]?.color,
                      width: `${resultado.confianza_pct}%`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>

                {/* Diagnóstico */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#9E9E9E', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                    Diagnóstico
                  </p>
                  <p style={{ fontSize: '14px', color: '#424242', lineHeight: '1.5' }}>{resultado.diagnostico}</p>
                </div>

                {/* Recomendación */}
                <div style={{ background: '#F8F9FA', borderRadius: '8px', padding: '14px', borderLeft: '3px solid #1B5E20' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#1B5E20', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                    Recomendación
                  </p>
                  <p style={{ fontSize: '14px', color: '#424242', lineHeight: '1.5' }}>{resultado.recomendacion}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Historial */
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          {historial.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px', color: '#9E9E9E' }}>
              <Icon name="ai" size={40} color="#E0E0E0" />
              <p style={{ marginTop: '16px', fontSize: '15px' }}>No hay diagnósticos registrados para este cultivo</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FA' }}>
                  {['Fecha', 'Tipo de problema', 'Confianza', 'Diagnóstico', 'Recomendación'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#757575', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {h}
                    </th>
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
      )}
    </div>
  )
}