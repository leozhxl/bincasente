import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api('/me')
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api('/login', { method: 'POST', body: { email, password } })
    setToken(data.token)
    setUser(data.user)
  }

  async function signup(profile) {
    const data = await api('/register', { method: 'POST', body: profile })
    setToken(data.token)
    setUser(data.user)
  }

  async function updateProfile(updates) {
    const data = await api('/me', { method: 'PUT', body: updates })
    setUser(data.user)
  }

  async function deleteAccount() {
    await api('/me', { method: 'DELETE' })
    setToken(null)
    setUser(null)
  }

  async function logout() {
    setToken(null)
    setUser(null)
  }

  const value = { user, loading, login, signup, logout, updateProfile, deleteAccount }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
