import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Building2,
  BarChart3,
  Users,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  Terminal,
  Cpu,
  Shield
} from 'lucide-react'
import AppInfo from './AppInfo'

const SuperAdminSidebar = ({ isMobileMenuOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isInfoOpen, setIsInfoOpen] = useState(false)

  const menuItems = [
    { Icon: Building2, label: 'Firmy', path: '/superadmin', description: 'Správa firiem' },
    { Icon: BarChart3, label: 'Analytika', path: '/superadmin/analytics', disabled: true, description: 'Štatistiky systému' },
    { Icon: Users, label: 'Používatelia', path: '/superadmin/users', disabled: true, description: 'User management' },
    { Icon: Settings, label: 'Nastavenia', path: '/superadmin/settings', disabled: true, description: 'Konfigurácia' },
  ]

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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative left-0 z-40
          ${isCollapsed ? 'w-16' : 'w-64'}
          bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950
          flex flex-col
          transition-all duration-300 ease-in-out
          border-r border-orange-500/20
          ${isMobileMenuOpen ? 'translate-x-0 top-[60px] h-[calc(100vh-60px)]' : '-translate-x-full lg:translate-x-0 lg:top-0 lg:h-screen'}
        `}
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(251, 146, 60, 0.1) 1px, transparent 0),
            linear-gradient(to bottom, #020617, #0f172a, #020617)
          `,
          backgroundSize: '24px 24px, 100% 100%',
          backgroundPosition: '0 0, 0 0'
        }}
      >
        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 pointer-events-none"></div>

        {/* Logo Section - Hidden on mobile */}
        <div className="hidden lg:block relative px-3 py-2.5 border-b border-orange-500/20">
          {isCollapsed ? (
            <div className="w-10 h-10 mx-auto bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 border border-orange-400/30">
              <Terminal className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Main Logo */}
              <div className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg shadow-orange-500/30 border border-orange-400/30">
                <Terminal className="w-4 h-4 text-white" />
                <span className="text-base font-black text-white tracking-wider" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                  MONTIO
                </span>
              </div>

              {/* System Badge */}
              <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-slate-900/50 border border-orange-500/20 rounded-lg backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5 text-orange-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-slate-500 leading-none uppercase tracking-wider">System</span>
                  <span className="text-[11px] font-mono text-orange-300 leading-none font-bold">Administrator</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto p-3">
          <ul className="space-y-1.5">
            {menuItems.map((item, index) => {
              const Icon = item.Icon
              const active = isActive(item.path)
              return (
                <li
                  key={index}
                  style={{
                    animation: `slideInRight 0.3s ease-out ${index * 0.05}s both`
                  }}
                >
                  <button
                    onClick={() => handleNavigation(item.path, item.disabled)}
                    disabled={item.disabled}
                    className={`
                      w-full flex items-center gap-2 rounded-xl font-bold text-[13px] px-3 py-2.5
                      transition-all duration-300 group relative overflow-hidden
                      ${isCollapsed ? 'justify-center' : ''}
                      ${
                        active
                          ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 border border-orange-400/50'
                          : item.disabled
                          ? 'text-slate-600 cursor-not-allowed'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50 hover:border-orange-500/30 border border-transparent'
                      }
                    `}
                    title={isCollapsed ? item.label : item.description}
                  >
                    {/* Background effect on hover */}
                    {!active && !item.disabled && (
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    )}

                    <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0 relative z-10 ${active ? 'drop-shadow-lg' : ''}`} />

                    {!isCollapsed && (
                      <>
                        <div className="flex-1 text-left relative z-10">
                          <div className="font-bold tracking-wide">{item.label}</div>
                          <div className={`text-[9px] font-mono mt-0.5 ${active ? 'text-orange-100' : 'text-slate-500 group-hover:text-slate-400'}`}>
                            {item.description}
                          </div>
                        </div>
                        {item.disabled && (
                          <span className="relative z-10 text-[9px] px-1.5 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded font-mono text-slate-500">SOON</span>
                        )}
                      </>
                    )}

                    {/* Active indicator */}
                    {active && !isCollapsed && (
                      <div className="absolute right-2 w-1 h-6 bg-white rounded-full shadow-lg shadow-white/50"></div>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          {/* System Status Card - Only when expanded */}
          {!isCollapsed && (
            <div className="mt-4 p-3 bg-slate-900/50 border border-slate-700/50 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-1.5 mb-2">
                <Cpu className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">System Status</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-slate-500">Uptime</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">99.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-slate-500">Active</span>
                  <span className="text-[11px] font-mono text-orange-400 font-bold">24/7</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono text-slate-500">Load</span>
                  <div className="flex items-center gap-1">
                    <div className="w-14 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[12%] bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"></div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">12%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="relative p-2 lg:p-3 space-y-1 lg:space-y-1.5 border-t border-orange-500/20">
          {/* Help Button */}
          <button
            onClick={() => setIsInfoOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 lg:px-3 lg:py-2 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-lg transition-all text-[11px] lg:text-[13px] font-mono text-slate-300 hover:text-white"
            title="System Information"
          >
            <HelpCircle className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
            {!isCollapsed && <span className="hidden lg:inline">Help & Info</span>}
          </button>

          {/* Collapse Toggle - Hidden on mobile */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-1.5 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-lg transition-all text-[13px] font-mono font-bold text-orange-400 hover:text-orange-300"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <ChevronsRight className="w-3.5 h-3.5" /> : <ChevronsLeft className="w-3.5 h-3.5" />}
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* AppInfo modal */}
      <AppInfo showButton={false} isOpen={isInfoOpen} onOpenChange={setIsInfoOpen} />
    </>
  )
}

export default SuperAdminSidebar
