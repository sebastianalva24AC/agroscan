import { useState, useEffect } from 'react'
import { camposService, cultivosService, alertasService, lotesService } from '../../services/api'
import Icon from '../../components/Icon'

export default function Reportes() {
  const [datos, setDatos] = useState({ campos: [], cultivos: [], alertas: [], lotes: [] })
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    Promise.all([
      camposService.listar(),
      cultivosService.listar(),
      alertasService.listar(),
      lotesService.listar()
    ]).then(([rc, rcu, ra, rl]) => {
      setDatos({
        campos: rc.data,
        cultivos: rcu.data,
        alertas: ra.data,
        lotes: rl.data
      })
    }).catch(console.error)
    .finally(() => setCargando(false))
  }, [])

  const exportarCSV = (tipo) => {
    setGenerando(true)
    try {
      let contenido = ''
      let nombre = ''

      if (tipo === 'campos') {
        nombre = 'reporte_campos.csv'
        contenido = 'ID,Nombre,Region,Zona,Hectareas,Latitud,Longitud,Estado\n'
        datos.campos.forEach(c => {
          contenido += `${c.id},${c.nombre},${c.region},${c.zona},${c.hectareas},${c.latitud},${c.longitud},Activo\n`
        })
      } else if (tipo === 'cultivos') {
        nombre = 'reporte_cultivos.csv'
        contenido = 'ID,Tipo Planta,Variedad,Fecha Siembra,Temporada,Estado,Campo ID\n'
        datos.cultivos.forEach(c => {
          contenido += `${c.id},${c.tipo_planta},${c.variedad || ''},${c.fecha_siembra},${c.temporada},${c.estado},${c.campo_id}\n`
        })
      } else if (tipo === 'alertas') {
        nombre = 'reporte_alertas.csv'
        contenido = 'ID,Tipo,Descripcion,Nivel,Fecha,Estado\n'
        datos.alertas.forEach(a => {
          contenido += `${a.id},${a.tipo},"${a.descripcion}",${a.nivel},${a.fecha},${a.resuelta ? 'Resuelta' : 'Pendiente'}\n`
        })
      } else if (tipo === 'lotes') {
        nombre = 'reporte_lotes.csv'
        contenido = 'ID,Numero Lote,Fecha Cosecha,Volumen KG,Calidad,Destino,Empresa Compradora,Estado\n'
        datos.lotes.forEach(l => {
          contenido += `${l.id},${l.numero_lote},${l.fecha_cosecha},${l.volumen_kg},${l.calidad},${l.destino_pais},${l.empresa_compradora},${l.estado}\n`
        })
      }

      const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = nombre
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Error al generar el reporte')
    } finally {
      setGenerando(false)
    }
  }

  const resumen = [
    { label: 'Campos registrados', value: datos.campos.length, color: '#1B5E20', icon: 'map' },
    { label: 'Cultivos activos', value: datos.cultivos.filter(c => c.estado === 'activo').length, color: '#2E7D32', icon: 'plant' },
    { label: 'Alertas totales', value: datos.alertas.length, color: '#E65100', icon: 'bell' },
    { label: 'Lotes certificados', value: datos.lotes.filter(l => l.estado === 'certificado').length, color: '#1565C0', icon: 'qr' },
  ]

  const reportes = [
    {
      tipo: 'campos', titulo: 'Reporte de Campos',
      desc: 'Exporta todos los campos con coordenadas GPS, región, zona y hectáreas.',
      total: datos.campos.length, unidad: 'campos', color: '#1B5E20', bg: '#E8F5E9'
    },
    {
      tipo: 'cultivos', titulo: 'Reporte de Cultivos',
      desc: 'Exporta el historial de cultivos con fechas de siembra, variedad y estado.',
      total: datos.cultivos.length, unidad: 'cultivos', color: '#1565C0', bg: '#E3F2FD'
    },
    {
      tipo: 'alertas', titulo: 'Reporte de Alertas',
      desc: 'Exporta todas las alertas generadas con nivel de criticidad y estado de resolución.',
      total: datos.alertas.length, unidad: 'alertas', color: '#E65100', bg: '#FFF3E0'
    },
    {
      tipo: 'lotes', titulo: 'Reporte de Trazabilidad',
      desc: 'Exporta los lotes cosechados con destino de exportación y estado de certificación.',
      total: datos.lotes.length, unidad: 'lotes', color: '#6A1B9A', bg: '#F3E5F5'
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1A1A2E' }}>Reportes</h1>
        <p style={{ fontSize: '14px', color: '#9E9E9E', marginTop: '4px' }}>
          Genera y exporta reportes detallados de tus operaciones agrícolas
        </p>
      </div>

      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {resumen.map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: '12px', padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${s.color}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '12px', color: '#9E9E9E', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                {s.label}
              </p>
              <Icon name={s.icon} size={18} color={s.color} />
            </div>
            <p style={{ fontSize: '32px', fontWeight: '700', color: s.color, lineHeight: 1 }}>
              {cargando ? '—' : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Reportes disponibles */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#1A1A2E', marginBottom: '20px' }}>
          Exportar reportes en formato CSV
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {reportes.map(r => (
            <div key={r.tipo} style={{
              border: '1.5px solid #F0F0F0', borderRadius: '12px', padding: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'border-color 0.2s'
            }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: r.bg, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon name="download" size={20} color={r.color} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A2E' }}>{r.titulo}</p>
                  <p style={{ fontSize: '12px', color: '#9E9E9E', marginTop: '4px', lineHeight: '1.4', maxWidth: '220px' }}>
                    {r.desc}
                  </p>
                  <p style={{ fontSize: '12px', color: r.color, fontWeight: '600', marginTop: '6px' }}>
                    {cargando ? '—' : `${r.total} ${r.unidad}`}
                  </p>
                </div>
              </div>
              <button onClick={() => exportarCSV(r.tipo)} disabled={generando || cargando} style={{
                background: r.color, color: 'white', border: 'none',
                borderRadius: '8px', padding: '9px 16px', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '6px',
                opacity: generando || cargando ? 0.6 : 1
              }}>
                <Icon name="download" size={14} color="white" />
                Exportar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info adicional */}
      <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '20px', border: '1px solid #E0E0E0' }}>
        <p style={{ fontSize: '13px', color: '#757575', lineHeight: '1.6' }}>
          <strong style={{ color: '#424242' }}>Nota:</strong> Los reportes se exportan en formato CSV compatible con Microsoft Excel, Google Sheets y cualquier software de análisis de datos. Para reportes más detallados con gráficas e historial climático, próximamente estará disponible la exportación en formato PDF.
        </p>
      </div>
    </div>
  )
}