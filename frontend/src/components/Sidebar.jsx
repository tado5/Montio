import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Building2,
  BarChart3,
  Users,
  Settings,
  LayoutDashboard,
  Calendar,
  Wrench,
  FileText,
  Receipt,
  Info,
  Camera,
  Briefcase,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle
} from 'lucide-react'
import tsdigitalLogo from '../assets/tsdigital-logo.svg'
import AppInfo from './AppInfo'

const Sidebar = ({ isMobileMenuOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const menuGroups = {
    superadmin: [
      {
        items: [
          { Icon: Building2, label: 'Firmy', path: '/superadmin' },
          { Icon: BarChart3, label: 'Analytika', path: '/superadmin/analytics', disabled: true },
          { Icon: Users, label: 'Používatelia', path: '/superadmin/users', disabled: true },
          { Icon: Settings, label: 'Nastavenia', path: '/superadmin/settings', disabled: true },
        ]
      }
    ],
    companyadmin: [
      {
        items: [
          { Icon: LayoutDashboard, label: 'Dashboard', path: '/company' },
          { Icon: Calendar, label: 'Kalendár', path: '/company/calendar' },
          { Icon: Wrench, label: 'Typy montáží', path: '/company/order-types' },
          { Icon: FileText, label: 'Zákazky', path: '/company/orders', disabled: true },
          { Icon: Users, label: 'Zamestnanci', path: '/company/employees' },
          { Icon: Receipt, label: 'Faktúry', path: '/company/invoices', disabled: true },
          { Icon: Settings, label: 'Nastavenia', path: '/company/settings', disabled: true },
        ]
      }
    ],
    employee: [
      {
        items: [
          { Icon: LayoutDashboard, label: 'Dashboard', path: '/employee' },
          { Icon: Calendar, label: 'Môj kalendár', path: '/employee/calendar', disabled: true },
          { Icon: FileText, label: 'Moje úlohy', path: '/employee/tasks', disabled: true },
          { Icon: Camera, label: 'Fotky', path: '/employee/photos', disabled: true },
          { Icon: Briefcase, label: 'Voľno', path: '/employee/time-off', disabled: true },
        ]
      }
    ]
  }

  const groups = menuGroups[user?.role] || []

  const isActive = (path) => location.pathname === path

  const handleNavigation = (path, disabled) => {
    if (!disabled) {
      navigate(path)
      if (onClose) onClose()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative top-0 left-0 h-screen z-40
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-elevated
          flex flex-col
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section - same height as header (py-2) */}
        <div className="px-4 md:px-6 lg:px-8 py-2 border-b border-primary/20 flex items-center justify-center">
          {isCollapsed ? (
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-md">
              <img src={tsdigitalLogo} alt="TSDigital" className="w-5 h-5" />
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white tracking-wide">MONTIO</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {groups.flatMap((group) =>
              group.items.map((item, index) => {
                const Icon = item.Icon
                const active = isActive(item.path)
                return (
                  <li key={index}>
                    <button
                      onClick={() => handleNavigation(item.path, item.disabled)}
                      disabled={item.disabled}
                      className={`
                        w-full flex items-center gap-3 rounded-xl font-medium text-sm px-3 py-2.5
                        transition-all duration-200 group relative
                        ${isCollapsed ? 'justify-center' : ''}
                        ${
                          active
                            ? 'bg-gradient-accent text-white shadow-lg'
                            : item.disabled
                            ? 'text-tertiary/40 cursor-not-allowed'
                            : 'text-secondary hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-800/50'
                        }
                      `}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{item.label}</span>
                          {item.disabled && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-tertiary/20 rounded">Soon</span>
                          )}
                        </>
                      )}
                      {active && !isCollapsed && (
                        <div className="absolute right-2 w-1 h-6 bg-white rounded-full" />
                      )}
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="p-3">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-50/50 dark:bg-primary-800/30 hover:bg-primary-100/50 dark:hover:bg-primary-700/30 rounded-xl transition-all text-sm font-medium text-primary"
            title={isCollapsed ? 'Rozbaliť' : 'Zbaliť'}
          >
            {isCollapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            {!isCollapsed && <span>Zbaliť</span>}
          </button>
        </div>

        {/* Bottom - Pomoc section - same height as footer (py-2.5) */}
        <div className="px-4 md:px-6 lg:px-8 py-2.5 border-t border-primary/20">
          <button
            onClick={() => setIsInfoOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-1 hover:bg-primary-50/50 dark:hover:bg-primary-800/30 rounded-xl transition-all text-sm text-secondary hover:text-primary"
            title="Informácie o systéme"
          >
            <HelpCircle className="w-4 h-4" />
            {!isCollapsed && <span>Pomoc</span>}
          </button>
        </div>

      </aside>

      {/* AppInfo modal rendered outside sidebar to appear centered on page */}
      <AppInfo showButton={false} isOpen={isInfoOpen} onOpenChange={setIsInfoOpen} />
    </>
  )
}

export default Sidebar
