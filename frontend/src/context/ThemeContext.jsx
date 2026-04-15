import { createContext, useContext, useEffect } from 'react'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // ALWAYS use dark mode - light mode is disabled
  const theme = 'dark'

  // Apply dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  // Toggle function disabled - always returns dark
  const toggleTheme = () => {
    // Dark mode only - toggle disabled
    console.log('Theme toggle is disabled - dark mode only')
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
