import { useState, useEffect } from 'react'
import { camposService } from '../../services/api'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function SelectorUbicacion({ onSeleccionar, posicion }) {
  const [lugarInfo, setLugarInfo] = useState(null)
  const [buscando, setBuscando] = useState(false)

  const buscarLugar = async (lat, lng) => {
    setBuscando(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      setLugarInfo({
        nombre: [data.address?.county, data.address?.state, data.address?.country].filter(Boolean).join(', '),
        esPeru: data.address?.country_code?.toUpperCase() === 'PE'
      })
    } catch {
      setLugarInfo({ nombre: 'Ubicación seleccionada', esPeru: true })
    } finally {
      setBuscando(false)
    }
  }

  useMapEvents({
    click(e) {
      const lat = e.latlng.lat.toFixed(6)
      const lng = e.latlng.lng.toFixed(6)
      onSeleccionar(lat, lng)
      buscarLugar(lat, lng)
    }
  })

  if (!posicion) return null

  return (
    <Marker position={[parseFloat(posicion.lat), parseFloat(posicion.lng)]}>
      <Popup>
        <div style={{ fontSize: '12px', lineHeight: '1.5', maxWidth: '160px' }}>
          {buscando ? (
            <span style={{ color: '#9E9E9E' }}>Identificando...</span>
          ) : lugarInfo ? (
            <>
              <span style={{ color: lugarInfo.esPeru ? '#1B5E20' : '#C62828', fontWeight: '600', display: 'block', marginBottom: '3px' }}>
                {lugarInfo.esPeru ? '📍 ' : '⚠️ '}{lugarInfo.nombre}
              </span>
              <span style={{ color: '#757575' }}>{posicion.lat}, {posicion.lng}</span>
              {!lugarInfo.esPeru && (
                <span style={{ color: '#C62828', display: 'block', marginTop: '3px', fontSize: '11px' }}>
                  Fuera del área de cobertura principal
                </span>
              )}
            </>
          ) : null}
        </div>
      </Popup>
    </Marker>
  )
}

const ZONAS_AGRICOLAS = {
  'La Libertad': { lat: -7.8960, lng: -78.8120, zoom: 10, desc: 'Valle Virú, Chicama, Chao - Arándanos, espárragos, palta' },
  'Ica': { lat: -14.0755, lng: -75.7280, zoom: 10, desc: 'Valle Ica, Chincha - Uva, espárrago, palta' },
  'Piura': { lat: -5.1945, lng: -80.6328, zoom: 10, desc: 'Valle Chira, San Lorenzo - Mango, uva, limón' },
  'Lambayeque': { lat: -6.7011, lng: -79.9070, zoom: 10, desc: 'Valle Chancay, Zaña - Arándano, palta' },
  'Ancash': { lat: -9.5299, lng: -77.5280, zoom: 10, desc: 'Valle Santa, Nepeña - Espárrago, palta' },
  'Lima': { lat: -12.0464, lng: -76.9270, zoom: 10, desc: 'Valle Cañete, Huaral - Manzana, melocotón' },
  'Arequipa': { lat: -16.4090, lng: -71.5375, zoom: 10, desc: 'Valle Majes, Siguas - Páprika, ajo, cebolla' },
  'Junin': { lat: -11.9964, lng: -75.2592, zoom: 10, desc: 'Valle Chanchamayo - Café, cacao, piña' },
  'Cajamarca': { lat: -7.1638, lng: -78.5001, zoom: 10, desc: 'Valle Cajamarca - Café, papa, maíz' },
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#424242' }
const inputStyle = { width: '100%', padding: '10px 14px', border: '1.5px solid #E0E0E0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }

export default function Campos() {
  const [campos, setCampos] = useState([])
  const [modal, setModal] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [posicionMapa, setPosicionMapa] = useState(null)
  const [regionSel, setRegionSel] = useState('La Libertad')
  const [pasoActual, setPasoActual] = useState(1)
  const [form, setForm] = useState({
    nombre: '', latitud: '', longitud: '',
    hectareas: '', region: 'La Libertad', zona: 'costa',
    tipo_suelo: '', ph_suelo: '', topografia: '',
    nivel_nitrogeno: '', nivel_fosforo: '', nivel_potasio: '',
    plan_manejo: ''
  })

  const cargar = () => {
    camposService.listar()
      .then(r => setCampos(r.data))
      .catch(console.error)
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const handleRegionChange = (region) => {
    setRegionSel(region)
    setForm({ ...form, region })
    setPosicionMapa(null)
  }

  const handleSeleccionMapa = (lat, lng) => {
    setPosicionMapa({ lat, lng })
    setForm({ ...form, latitud: lat, longitud: lng })
  }

  const centroMapa = ZONAS_AGRICOLAS[regionSel] || ZONAS_AGRICOLAS['La Libertad']

  const cerrarModal = () => {
    setModal(false)
    setPosicionMapa(null)
    setPasoActual(1)
    setForm({
      nombre: '', latitud: '', longitud: '',
      hectareas: '', region: 'La Libertad', zona: 'costa',
      tipo_suelo: '', ph_suelo: '', topografia: '',
      nivel_nitrogeno: '', nivel_fosforo: '', nivel_potasio: '',
      plan_manejo: ''
    })
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (!form.latitud || !form.longitud) {
      alert('Por favor selecciona la ubicación del campo en el mapa')
      return
    }
    setGuardando(true)
    try {
      await camposService.crear(form)
      cerrarModal()
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

      {/* Tabla de campos */}
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
                {['Nombre del campo', 'Región', 'Zona', 'Hectáreas', 'Tipo de suelo', 'NPK', 'Coordenadas GPS', 'Estado'].map(h => (
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
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: '#757575' }}>
                    {c.tipo_suelo || '—'}
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px' }}>
                    {c.nivel_nitrogeno || c.nivel_fosforo || c.nivel_potasio ? (
                      <span style={{ fontSize: '11px', color: '#424242' }}>
                        N:{c.nivel_nitrogeno || '—'} P:{c.nivel_fosforo || '—'} K:{c.nivel_potasio || '—'}
                      </span>
                    ) : '—'}
                  </td>
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

      {/* Modal registro de campo */}
      {modal && (
        <Modal titulo="Registrar nuevo campo" onClose={cerrarModal} ancho="720px">

          {/* Indicador de pasos */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            {[
              { n: 1, label: 'Datos básicos' },
              { n: 2, label: 'Ubicación GPS' },
              { n: 3, label: 'Línea base del campo' },
            ].map(paso => (
              <div key={paso.n} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  height: '4px', borderRadius: '2px', marginBottom: '6px',
                  background: pasoActual >= paso.n ? '#1B5E20' : '#E0E0E0',
                  transition: 'background 0.3s'
                }} />
                <span style={{ fontSize: '11px', color: pasoActual >= paso.n ? '#1B5E20' : '#9E9E9E', fontWeight: pasoActual === paso.n ? '600' : '400' }}>
                  {paso.n}. {paso.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={guardar}>

            {/* PASO 1 — Datos básicos */}
            {pasoActual === 1 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Nombre del campo</label>
                    <input style={inputStyle} placeholder="Ej: Fundo La Esperanza"
                      value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                  </div>
                  <div>
                    <label style={labelStyle}>Hectáreas</label>
                    <input style={inputStyle} placeholder="150.5" type="number" step="any"
                      value={form.hectareas} onChange={e => setForm({ ...form, hectareas: e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Región</label>
                    <select style={inputStyle} value={form.region} onChange={e => handleRegionChange(e.target.value)}>
                      {Object.keys(ZONAS_AGRICOLAS).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Zona</label>
                    <select style={inputStyle} value={form.zona} onChange={e => setForm({ ...form, zona: e.target.value })}>
                      <option value="costa">Costa</option>
                      <option value="sierra">Sierra</option>
                      <option value="selva">Selva</option>
                    </select>
                  </div>
                </div>
                <div style={{ background: '#F1F8E9', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#1B5E20' }}>
                    <strong>Zona {regionSel}:</strong> {ZONAS_AGRICOLAS[regionSel]?.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setPasoActual(2)}
                    disabled={!form.nombre || !form.hectareas}
                    style={{
                      background: !form.nombre || !form.hectareas ? '#E0E0E0' : '#1B5E20',
                      color: !form.nombre || !form.hectareas ? '#9E9E9E' : 'white',
                      border: 'none', borderRadius: '8px', padding: '10px 24px',
                      cursor: !form.nombre || !form.hectareas ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: '600'
                    }}>
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 2 — Ubicación GPS */}
            {pasoActual === 2 && (
              <div>
                <label style={{ ...labelStyle, marginBottom: '8px' }}>
                  Ubicación del campo — Haz clic en el mapa para marcar la ubicación exacta
                </label>
                <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1.5px solid #E0E0E0', marginBottom: '12px' }}>
                  <MapContainer
                    center={[centroMapa.lat, centroMapa.lng]}
                    zoom={centroMapa.zoom}
                    style={{ height: '280px', width: '100%' }}
                    key={regionSel}
                  >
                    <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Imagery © Esri" />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.3} />
                    <SelectorUbicacion onSeleccionar={handleSeleccionMapa} posicion={posicionMapa} />
                  </MapContainer>
                </div>
                {posicionMapa ? (
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ flex: 1, background: '#E8F5E9', borderRadius: '6px', padding: '8px 12px' }}>
                      <p style={{ fontSize: '11px', color: '#757575', marginBottom: '2px' }}>LATITUD</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B5E20', fontFamily: 'monospace' }}>{posicionMapa.lat}</p>
                    </div>
                    <div style={{ flex: 1, background: '#E8F5E9', borderRadius: '6px', padding: '8px 12px' }}>
                      <p style={{ fontSize: '11px', color: '#757575', marginBottom: '2px' }}>LONGITUD</p>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B5E20', fontFamily: 'monospace' }}>{posicionMapa.lng}</p>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#9E9E9E', textAlign: 'center', marginBottom: '20px' }}>
                    Haz clic sobre la imagen satelital para marcar la ubicación exacta del campo
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setPasoActual(1)} style={{
                    background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                    borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                  }}>← Anterior</button>
                  <button type="button" onClick={() => setPasoActual(3)}
                    disabled={!posicionMapa}
                    style={{
                      background: !posicionMapa ? '#E0E0E0' : '#1B5E20',
                      color: !posicionMapa ? '#9E9E9E' : 'white',
                      border: 'none', borderRadius: '8px', padding: '10px 24px',
                      cursor: !posicionMapa ? 'not-allowed' : 'pointer',
                      fontSize: '14px', fontWeight: '600'
                    }}>
                    Siguiente →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3 — Línea base del campo */}
            {pasoActual === 3 && (
              <div>
                <div style={{ background: '#E3F2FD', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', color: '#1565C0', fontWeight: '600', marginBottom: '4px' }}>
                    📋 Línea base agronómica del campo
                  </p>
                  <p style={{ fontSize: '12px', color: '#1565C0' }}>
                    Esta información permite al sistema contextualizar mejor los diagnósticos IA y diferenciar entre deficiencias nutricionales y enfermedades. Es opcional pero mejora la precisión del monitoreo.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={labelStyle}>Tipo de suelo</label>
                    <select style={inputStyle} value={form.tipo_suelo} onChange={e => setForm({ ...form, tipo_suelo: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      <option value="Franco">Franco</option>
                      <option value="Franco arenoso">Franco arenoso</option>
                      <option value="Franco arcilloso">Franco arcilloso</option>
                      <option value="Arcilloso">Arcilloso</option>
                      <option value="Arenoso">Arenoso</option>
                      <option value="Limoso">Limoso</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>pH del suelo</label>
                    <input style={inputStyle} type="number" step="0.1" min="1" max="14"
                      placeholder="Ej: 6.5"
                      value={form.ph_suelo} onChange={e => setForm({ ...form, ph_suelo: e.target.value })} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>Topografía</label>
                  <select style={inputStyle} value={form.topografia} onChange={e => setForm({ ...form, topografia: e.target.value })}>
                    <option value="">Seleccionar...</option>
                    <option value="Plana">Plana (pendiente 0-2%)</option>
                    <option value="Ligeramente ondulada">Ligeramente ondulada (2-5%)</option>
                    <option value="Ondulada">Ondulada (5-15%)</option>
                    <option value="Quebrada">Quebrada (más de 15%)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#424242', marginBottom: '10px' }}>
                    Niveles de macronutrientes NPK
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {[
                      { key: 'nivel_nitrogeno', label: 'Nitrógeno (N)', color: '#1B5E20' },
                      { key: 'nivel_fosforo', label: 'Fósforo (P)', color: '#E65100' },
                      { key: 'nivel_potasio', label: 'Potasio (K)', color: '#1565C0' },
                    ].map(npk => (
                      <div key={npk.key}>
                        <label style={{ ...labelStyle, color: npk.color }}>{npk.label}</label>
                        <select style={inputStyle} value={form[npk.key]} onChange={e => setForm({ ...form, [npk.key]: e.target.value })}>
                          <option value="">Seleccionar...</option>
                          <option value="Bajo">Bajo</option>
                          <option value="Medio">Medio</option>
                          <option value="Alto">Alto</option>
                          <option value="Óptimo">Óptimo</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: '11px', color: '#9E9E9E', marginTop: '6px' }}>
                    Basado en análisis de suelo previo. Ayuda a diferenciar deficiencias nutricionales de enfermedades en el diagnóstico IA.
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Plan de manejo agronómico (opcional)</label>
                  <textarea style={{ ...inputStyle, height: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                    placeholder="Ej: Riego por goteo cada 3 días, fertilización NPK mensual, aplicación preventiva de fungicida cada 15 días..."
                    value={form.plan_manejo} onChange={e => setForm({ ...form, plan_manejo: e.target.value })} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <button type="button" onClick={() => setPasoActual(2)} style={{
                    background: 'white', color: '#1B5E20', border: '1.5px solid #1B5E20',
                    borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                  }}>← Anterior</button>
                  <button type="submit" disabled={guardando} style={{
                    background: guardando ? '#E0E0E0' : '#1B5E20',
                    color: guardando ? '#9E9E9E' : 'white',
                    border: 'none', borderRadius: '8px', padding: '10px 24px',
                    cursor: guardando ? 'not-allowed' : 'pointer',
                    fontSize: '14px', fontWeight: '600'
                  }}>
                    {guardando ? 'Registrando...' : '✓ Registrar campo'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}
    </div>
  )
}