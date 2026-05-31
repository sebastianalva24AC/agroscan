import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email, password) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    return axios.post(`${API_URL}/api/auth/login`, formData)
  },
  registroEmpresa: (datos) => api.post('/api/auth/registro-empresa', null, { params: datos }),
  crearTecnico: (datos) => api.post('/api/auth/crear-tecnico', null, { params: datos })
}

export const camposService = {
  listar: () => api.get('/api/campos/'),
  crear: (datos) => api.post('/api/campos/', null, { params: datos }),
  obtener: (id) => api.get(`/api/campos/${id}`),
  actualizar: (id, datos) => api.put(`/api/campos/${id}`, null, { params: datos })
}

export const cultivosService = {
  listar: () => api.get('/api/cultivos/'),
  crear: (datos) => api.post('/api/cultivos/', null, { params: datos }),
  obtener: (id) => api.get(`/api/cultivos/${id}`),
  prediccionCosecha: (id) => api.get(`/api/cultivos/${id}/prediccion-cosecha`)
}

export const climaService = {
  actual: (campoId) => api.get(`/api/clima/${campoId}/actual`),
  pronostico: (campoId) => api.get(`/api/clima/${campoId}/pronostico`),
  historial: (campoId) => api.get(`/api/clima/${campoId}/historial`)
}

export const alertasService = {
  listar: () => api.get('/api/alertas/'),
  noLeidas: () => api.get('/api/alertas/no-leidas'),
  resolver: (id, accion) => api.put(`/api/alertas/${id}/resolver`, null, { params: { accion_tomada: accion } })
}

export const diagnosticoService = {
  analizar: (cultivoId, foto, observacion, latitud, longitud) => {
    const formData = new FormData()
    formData.append('foto', foto)
    if (observacion) formData.append('observacion', observacion)
    if (latitud) formData.append('latitud', latitud)
    if (longitud) formData.append('longitud', longitud)
    return api.post(`/api/diagnostico/${cultivoId}/analizar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  historial: (cultivoId) => api.get(`/api/diagnostico/${cultivoId}/historial`)
}

export const lotesService = {
  listar: () => api.get('/api/lotes/'),
  crear: (datos) => api.post('/api/lotes/', null, { params: datos }),
  certificar: (loteId) => api.post(`/api/lotes/${loteId}/certificar`),
  verCertificado: (loteId) => api.get(`/api/lotes/${loteId}/certificado`)
}

export const certificadosService = {
  listar: () => api.get('/api/certificados/'),
  verificar: (codigo) => api.get(`/api/certificados/${codigo}`)
}

export default api