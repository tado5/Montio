import { Search, Menu, X, Wrench, Zap } from 'lucide-react'
import { useState } from 'react'
import UserMenu from './UserMenu'
import NotificationBell from './NotificationBell'

const EmployeeHeader = ({ title, subtitle, showSearch = false, onMenuToggle, isMobileMenuOpen = false }) => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 border-b border-emerald-500/20 shadow-lg shadow-emerald-500/5">
      {/* Top accent line with gradient */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

      <div className="px-3 md:px-5 lg:px-6 py-1.5 md:py-1.5 lg:py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile menu + Title + Field Badge */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 hover:bg-emerald-500/10 rounded-lg transition-all border border-emerald-500/0 hover:border-emerald-500/30"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 text-emerald-400" />
              ) : (
                <Menu className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Field Badge */}
            <div className="flex-1 min-w-0 flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg backdrop-blur-sm">
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] text-emerald-300 tracking-wider">FIELD</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base md:text-lg lg:text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 animate-pulse truncate" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                    {title}
                  </h1>
                  <div className="hidden sm:flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-emerald-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
                {subtitle && (
                  <p className="text-xs text-slate-400 font-mono tracking-wide truncate mt-0.5">
                    {'> '}{subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Center: Search (optional) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-emerald-500/20 focus:border-emerald-500/60 rounded-lg text-sm text-white placeholder:text-slate-500 font-mono transition-all duration-200 focus:shadow-lg focus:shadow-emerald-500/10"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-800/50 border border-slate-700/50 rounded">⌘K</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Right: Stats + Notifications + User */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Today's Tasks Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 border border-slate-700/50 rounded-lg">
              <Zap className="w-3 h-3 text-green-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-500 leading-none">TODAY</span>
                <span className="text-[11px] font-mono text-green-400 leading-none font-bold">3</span>
              </div>
            </div>

            <NotificationBell />
            <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent" />
            <UserMenu />
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div className="md:hidden mt-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-emerald-500/20 focus:border-emerald-500/60 rounded-lg text-sm text-white placeholder:text-slate-500 font-mono transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default EmployeeHeader
