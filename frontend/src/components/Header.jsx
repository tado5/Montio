import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import UserMenu from './UserMenu'
import NotificationBell from './NotificationBell'

const Header = ({ title, subtitle, showSearch = false, onMenuToggle, isMobileMenuOpen = false }) => {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-elevated/80 border-b border-primary/20 shadow-sm">
      <div className="px-4 md:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile menu + Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Mobile menu toggle */}
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 hover:bg-primary-50 dark:hover:bg-primary-800/50 rounded-xl transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-primary" />
              ) : (
                <Menu className="w-5 h-5 text-primary" />
              )}
            </button>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-display font-bold text-primary truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-tertiary font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Center: Search (optional) */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-accent-500 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Hľadať..."
                  className="w-full pl-10 pr-4 py-1.5 bg-[rgb(var(--color-bg-secondary))] border border-primary/20 focus:border-accent-500 rounded-xl text-sm text-primary placeholder:text-tertiary transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <div className="hidden sm:block h-6 w-px bg-primary/20" />
            <UserMenu />
          </div>
        </div>

        {/* Mobile search */}
        {showSearch && (
          <div className="md:hidden mt-2">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary group-focus-within:text-accent-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať..."
                className="w-full pl-10 pr-4 py-1.5 bg-[rgb(var(--color-bg-secondary))] border border-primary/20 focus:border-accent-500 rounded-xl text-sm text-primary placeholder:text-tertiary transition-all duration-200"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
