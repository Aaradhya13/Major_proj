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
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    throw new Error(errorBody.detail ?? 'The request could not be completed.')
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
}