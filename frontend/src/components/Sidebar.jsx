import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = {
    superadmin: [
      { icon: '🏢', label: 'Firmy', path: '/superadmin' },
      { icon: '📊', label: 'Analytika', path: '/superadmin/analytics', disabled: true },
      { icon: '👥', label: 'Používatelia', path: '/superadmin/users', disabled: true },
      { icon: '⚙️', label: 'Nastavenia', path: '/superadmin/settings', disabled: true },
    ],
    companyadmin: [
      { icon: '🏠', label: 'Dashboard', path: '/company' },
      { icon: '📅', label: 'Kalendár', path: '/company/calendar', disabled: true },
      { icon: '📝', label: 'Zákazky', path: '/company/orders', disabled: true },
      { icon: '👥', label: 'Zamestnanci', path: '/company/employees', disabled: true },
      { icon: '💰', label: 'Faktúry', path: '/company/invoices', disabled: true },
      { icon: '🔧', label: 'Typy montáží', path: '/company/order-types', disabled: true },
      { icon: '⚙️', label: 'Nastavenia', path: '/company/settings', disabled: true },
    ],
    employee: [
      { icon: '🏠', label: 'Dashboard', path: '/employee' },
      { icon: '📅', label: 'Môj kalendár', path: '/employee/calendar', disabled: true },
      { icon: '✅', label: 'Moje úlohy', path: '/employee/tasks', disabled: true },
      { icon: '📸', label: 'Fotky', path: '/employee/photos', disabled: true },
      { icon: '🏖️', label: 'Voľno', path: '/employee/time-off', disabled: true },
    ]
  }

  const items = menuItems[user?.role] || []

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-800 min-h-screen shadow-xl transition-all duration-300 relative flex flex-col`}>

      {/* Logo */}
      <div className="p-6 border-b-2 border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-white text-2xl font-bold">M</span>
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-2xl font-black bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 text-transparent bg-clip-text whitespace-nowrap">
                MONTIO
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide whitespace-nowrap">
                {user?.role === 'superadmin' && '👑 Super Admin'}
                {user?.role === 'companyadmin' && '🏢 Company'}
                {user?.role === 'employee' && '👷 Employee'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => !item.disabled && navigate(item.path)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 group relative ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : item.disabled
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 hover:text-purple-700 dark:hover:text-purple-400'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.label : ''}
              >
                <span className={`text-2xl transition-transform duration-200 ${
                  !item.disabled && 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">
                      {item.label}
                    </span>
                    {item.disabled && (
                      <span className="text-xs bg-gray-200 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full">
                        Soon
                      </span>
                    )}
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with Toggle Button */}
      <div className="mt-auto p-4 border-t-2 border-gray-200 dark:border-gray-800">
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
          title={isCollapsed ? 'Rozbaliť menu' : 'Zbaliť menu'}
        >
          <span className="text-xl">
            {isCollapsed ? '→' : '←'}
          </span>
          {!isCollapsed && (
            <span className="text-sm">
              Zbaliť menu
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
