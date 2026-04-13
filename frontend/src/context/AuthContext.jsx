import { createContext, useState, useContext, useEffect } from 'react'
import { api } from '../utils/apiClient'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
      // Token is automatically added by apiClient interceptor
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password })
      const { token, user, requirePasswordChange, employee_id, message } = response.data

      // If password change is required, return special flag
      if (requirePasswordChange) {
        return {
          success: false,
          requirePasswordChange: true,
          employee_id,
          token,
          message: message || 'Musíte zmeniť heslo.'
        }
      }

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      // Token is automatically added by apiClient interceptor
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.userMessage || 'Chyba pri prihlásení'
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Token removal is handled automatically by apiClient on 401
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      return updatedUser
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
