import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AppInfo from './AppInfo'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)

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
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-900 border-r-2 border-gray-200 dark:border-gray-800 h-full shadow-xl transition-all duration-300 relative flex flex-col`}>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-b-2 border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-3 py-2'} gap-2 bg-gradient-to-r from-amber-500 to-red-600 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95`}
          title={isCollapsed ? 'Rozbaliť menu' : 'Zbaliť menu'}
        >
          {isCollapsed ? (
            <span className="text-xl">☰</span>
          ) : (
            <>
              <span className="text-sm flex items-center gap-2">
                <span className="text-base">☰</span>
                <span>Menu</span>
              </span>
              <span className="text-base">←</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`${isCollapsed ? 'p-2' : 'p-4'} flex-1 overflow-y-auto`}>
        <ul className="space-y-1">
          {items.map((item, index) => (
            <li key={index}>
              <button
                onClick={() => !item.disabled && navigate(item.path)}
                disabled={item.disabled}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'} rounded-lg font-semibold transition-all duration-200 group relative ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                    : item.disabled
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-900/30 dark:hover:to-red-900/30 hover:text-orange-600 dark:hover:text-orange-400'
                }`}
                title={isCollapsed ? item.label : ''}
              >
                <span className={`${isCollapsed ? 'text-xl' : 'text-2xl'} transition-transform duration-200 ${
                  !item.disabled && 'group-hover:scale-110'
                }`}>
                  {item.icon}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">
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

      {/* Footer with AppInfo */}
      <div className="mt-auto p-2 border-t-2 border-gray-200 dark:border-gray-800">
        {/* AppInfo - always rendered but button conditionally shown */}
        {!isCollapsed ? (
          <AppInfo isOpen={isInfoOpen} onOpenChange={setIsInfoOpen} />
        ) : (
          <>
            <button
              onClick={() => setIsInfoOpen(true)}
              className="w-full flex items-center justify-center p-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-900/30 dark:hover:to-red-900/30 rounded-lg transition-all duration-200"
              title="O aplikácii"
            >
              <span className="text-lg">ℹ️</span>
            </button>
            <AppInfo showButton={false} isOpen={isInfoOpen} onOpenChange={setIsInfoOpen} />
          </>
        )}
      </div>
    </div>
  )
}

export default Sidebar
