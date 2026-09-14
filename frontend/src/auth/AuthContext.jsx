import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, setApiToken, setUnauthorizedHandler } from '../services/mockApi'

// Holds the auth token in React state (never localStorage). The token is the
// source of truth here; the service module keeps a mirror of it (via
// setApiToken) purely so its arg-free calls can attach the Authorization
// header. On any 401 / authentication_failed we clear the token and redirect.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const navigate = useNavigate()

  // Keep the service module's outbound token in sync with React state.
  useEffect(() => {
    setApiToken(token)
  }, [token])

  // Register the shared 401 handler: drop the token and bounce to /login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null)
      navigate('/login', { replace: true })
    })
    return () => setUnauthorizedHandler(null)
  }, [navigate])

  const login = useCallback(async (username, password, opts) => {
    const t = await apiLogin(username, password, opts)
    setToken(t)
    return t
  }, [])

  const logout = useCallback(() => {
    setToken(null)
  }, [])

  const value = { token, isAuthenticated: !!token, login, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
