import { useEffect, useState } from 'react'
import { authApi, clearAccessToken, getAccessToken } from '../services/api.js'
import { AuthContext } from './authContext.js'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(getAccessToken()))

  useEffect(() => {
    if (!getAccessToken()) return
    authApi.me().then(setUser).catch(clearAccessToken).finally(() => setIsLoading(false))
  }, [])

  async function login(credentials) {
    const result = await authApi.login(credentials)
    window.localStorage.setItem('neurovision-access-token', result.access_token)
    setUser(result.user)
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser: setUser }}>{children}</AuthContext.Provider>
}