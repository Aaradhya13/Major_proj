const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8001/api'
const tokenStorageKey = 'neurovision-access-token'

export function getAccessToken() {
  return window.localStorage.getItem(tokenStorageKey)
}

export function clearAccessToken() {
  window.localStorage.removeItem(tokenStorageKey)
}

async function request(path, options = {}) {
  const token = getAccessToken()
  const isMultipart = options.body instanceof FormData
  const requestHeaders = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  if (!isMultipart) {
    requestHeaders['Content-Type'] = 'application/json'
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const error = new Error(errorBody.detail ?? 'The request could not be completed.')
    error.status = response.status
    throw error
  }
  if (response.status === 204) return null
  return response.json()
}

export const authApi = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  profile: () => request('/settings/profile'),
  updateProfile: (profile) => request('/settings/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  changePassword: (passwords) => request('/settings/password', { method: 'PUT', body: JSON.stringify(passwords) }),
  predictAnalysis: (file, { patientId, patientName, clinicalNotes }) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patient_id', patientId)
    formData.append('patient_name', patientName)
    if (clinicalNotes) formData.append('clinical_notes', clinicalNotes)
    return request('/analysis/predict', { method: 'POST', body: formData })
  },
  getAnalyses: () => request('/analysis'),
  getAnalysis: (analysisId) => request(`/analysis/${analysisId}`),
  getAnalysisReview: (analysisId) => request(`/analysis/${analysisId}/review`),
  createAnalysisReview: (analysisId, review) => request(`/analysis/${analysisId}/review`, {
    method: 'POST',
    body: JSON.stringify(review),
  }),
  updateAnalysisReview: (analysisId, review) => request(`/analysis/${analysisId}/review`, {
    method: 'PUT',
    body: JSON.stringify(review),
  }),
  getPatientAnalyses: (patientId) => request(`/analysis/patient/${patientId}`),
  getPatients: () => request('/patients'),
  getPatient: (patientId) => request(`/patients/${patientId}`),
  createPatient: (patient) => request('/patients', { method: 'POST', body: JSON.stringify(patient) }),
  getAnalysisReviews: () => request('/analysis/reviews'),
  getAnalysisImageBlob: (analysisId) => getAnalysisImageBlob(analysisId),
  getAnalysisImageUrl: (analysisId) => getAnalysisImageUrl(analysisId),
  getDashboardStats: () => request('/dashboard/stats'),
}

export const getAnalysisReview = (analysisId) => authApi.getAnalysisReview(analysisId)
export const getAnalysisReviews = () => authApi.getAnalysisReviews()
export const createAnalysisReview = (analysisId, review) => authApi.createAnalysisReview(analysisId, review)
export const updateAnalysisReview = (analysisId, review) => authApi.updateAnalysisReview(analysisId, review)

export async function getAnalysisImageBlob(analysisId) {
  const token = getAccessToken()
  const headers = token ? { Authorization: `Bearer ${token}` } : {}
  const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/image`, {
    headers,
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const error = new Error(errorBody.detail ?? 'Unable to load MRI scan.')
    error.status = response.status
    throw error
  }
  return response.blob()
}

export function getAnalysisImageUrl(analysisId) {
  const token = getAccessToken()
  return `${API_BASE_URL}/analysis/${analysisId}/image${token ? `?token=${encodeURIComponent(token)}` : ''}`
}
