import { createContext, useState, useContext, useEffect } from 'react'
import { api } from '../utils/apiClient'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useAuth()
  const [theme, setTheme] = useState(() => {
    // Initialize from localStorage or user preference
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser)
        return parsedUser.theme || 'dark'
      }
      return localStorage.getItem('theme') || 'dark'
    }
    return 'dark'
  })

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Load theme when user logs in (only once)
  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme)
    }
  }, [user?.id]) // Only depend on user ID, not the whole user object

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    // Save to localStorage for non-authenticated users
    localStorage.setItem('theme', newTheme)

    // Save to database if user is logged in
    if (user) {
      try {
        await api.put('/api/auth/theme', { theme: newTheme })

        // Update user in AuthContext and localStorage
        if (updateUser) {
          updateUser({ theme: newTheme })
        }
      } catch (error) {
        console.error('Failed to save theme:', error)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
