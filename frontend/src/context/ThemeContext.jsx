import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth()
  const [theme, setTheme] = useState('light')

  // Load theme from user preferences or localStorage
  useEffect(() => {
    if (user?.theme) {
      setTheme(user.theme)
      if (user.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      const savedTheme = localStorage.getItem('theme') || 'light'
      setTheme(savedTheme)
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [user])

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Save to localStorage for non-authenticated users
    localStorage.setItem('theme', newTheme)

    // Save to database if user is logged in
    if (user) {
      try {
        await axios.put('/api/auth/theme', { theme: newTheme })

        // Update user in localStorage
        const savedUser = JSON.parse(localStorage.getItem('user'))
        if (savedUser) {
          savedUser.theme = newTheme
          localStorage.setItem('user', JSON.stringify(savedUser))
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
