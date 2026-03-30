import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'
import {
  LayoutDashboard,
  User,
  Settings,
  Sun,
  Moon,
  LogOut,
  Crown,
  Building2,
  Wrench
} from 'lucide-react'

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const toast = useToast()
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
    toast.success('Odhlásenie úspešné')
    navigate('/login')
  }

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'superadmin':
        return Crown
      case 'companyadmin':
        return Building2
      case 'employee':
        return Wrench
      default:
        return User
    }
  }

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'superadmin':
        return 'Super Admin'
      case 'companyadmin':
        return 'Company Admin'
      case 'employee':
        return 'Employee'
      default:
        return 'User'
    }
  }

  if (!user) return null

  const RoleIcon = getRoleIcon()

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-primary-50 dark:hover:bg-primary-800 rounded-xl px-3 py-2 transition-all duration-200 group"
      >
        <div className="text-right hidden lg:block">
          <div className="flex items-center gap-2 justify-end">
            <RoleIcon className="w-3.5 h-3.5 text-accent-500" />
            <p className="text-xs text-tertiary font-medium">{getRoleLabel()}</p>
          </div>
          <p className="text-sm font-bold text-primary truncate max-w-[150px]">
            {user.email}
          </p>
        </div>
        <div className="w-11 h-11 rounded-xl overflow-hidden shadow-soft group-hover:shadow-medium transition-all duration-200 transform group-hover:scale-105 ring-2 ring-accent-500/20 group-hover:ring-accent-500">
          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=f97316,ea580c,fb923c`}
            alt="Avatar"
            className="w-full h-full"
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-72 bg-elevated border-2 border-primary rounded-2xl shadow-strong py-2 z-50 animate-slide-down">
          {/* User Info */}
          <div className="px-4 py-3 border-b-2 border-primary">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden shadow-medium ring-2 ring-accent-500/30">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=f97316,ea580c,fb923c`}
                  alt="Avatar"
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RoleIcon className="w-3.5 h-3.5 text-accent-500" />
                  <p className="text-xs text-secondary font-semibold">
                    {getRoleLabel()}
                  </p>
                </div>
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
              className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-800 transition-all duration-200 flex items-center gap-3 group"
            >
              <LayoutDashboard className="w-5 h-5 text-secondary group-hover:text-accent-500 transition-colors" />
              <span className="font-semibold text-secondary group-hover:text-accent-500 transition-colors">
                Dashboard
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                navigate('/profile')
              }}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-800 transition-all duration-200 flex items-center gap-3 group"
            >
              <User className="w-5 h-5 text-secondary group-hover:text-accent-500 transition-colors" />
              <span className="font-semibold text-secondary group-hover:text-accent-500 transition-colors">
                Profil
              </span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false)
                // Navigate to settings (coming soon)
              }}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-800 transition-all duration-200 flex items-center gap-3 group opacity-50 cursor-not-allowed"
              disabled
            >
              <Settings className="w-5 h-5 text-secondary" />
              <span className="font-semibold text-secondary">
                Nastavenia
              </span>
              <span className="ml-auto badge badge-neutral text-xs">Soon</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleTheme()
                toast.info(`Prepnuté na ${theme === 'light' ? 'tmavý' : 'svetlý'} režim`)
              }}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 dark:hover:bg-primary-800 transition-all duration-200 flex items-center gap-3 group"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-secondary group-hover:text-accent-500 transition-colors" />
              ) : (
                <Sun className="w-5 h-5 text-secondary group-hover:text-accent-500 transition-colors" />
              )}
              <span className="font-semibold text-secondary group-hover:text-accent-500 transition-colors">
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
          </div>

          {/* Logout */}
          <div className="border-t-2 border-primary pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center gap-3 group"
            >
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors" />
              <span className="font-bold text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors">
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
