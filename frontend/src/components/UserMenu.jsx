import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleColor = () => {
    // TSDigital brand gradient for all users
    return 'from-orange-400 to-red-500'
  }

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'superadmin':
        return '👑 Super Admin'
      case 'companyadmin':
        return '🏢 Company Admin'
      case 'employee':
        return '👷 Employee'
      default:
        return 'User'
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl p-2 transition-all duration-200 group"
      >
        <div className="text-right hidden md:block">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{getRoleLabel()}</p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
            {user.email}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-200 transform group-hover:scale-110 bg-white dark:bg-gray-700">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
            alt="Avatar"
            className="w-full h-full"
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 py-2 z-50 animate-fade-in">
          {/* User Info */}
          <div className="px-4 py-3 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-700">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                  alt="Avatar"
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  {getRoleLabel()}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/')
              }}
              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-900/30 dark:hover:to-red-900/30 transition-all duration-200 flex items-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">🏠</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                Dashboard
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/profile')
              }}
              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-900/30 dark:hover:to-red-900/30 transition-all duration-200 flex items-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">👤</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                Profil
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                // Navigate to settings (coming soon)
              }}
              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-900/30 dark:hover:to-red-900/30 transition-all duration-200 flex items-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">⚙️</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                Nastavenia
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleTheme()
              }}
              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-900/30 dark:hover:to-red-900/30 transition-all duration-200 flex items-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">
                {theme === 'light' ? '🌙' : '☀️'}
              </span>
              <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-900/30 transition-all duration-200 flex items-center gap-3 group"
            >
              <span className="text-xl group-hover:scale-110 transition-transform duration-200">🚪</span>
              <span className="font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
                Odhlásiť sa
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
