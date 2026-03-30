import { Heart, ExternalLink, Shield, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import tsdigitalLogo from '../assets/tsdigital-logo.svg'
import versionData from '../../../version.json'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { label: 'Pomoc', path: '/help', external: false },
    { label: 'Dokumentácia', path: '/docs', external: false },
    { label: 'Kontakt', path: '/contact', external: false },
  ]

  return (
    <footer className="mt-auto border-t border-primary/20 bg-[rgb(var(--color-bg-secondary))]/50 backdrop-blur-sm">
      <div className="px-4 md:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Left: Branding */}
          <div className="flex items-center gap-2">
            <img
              src={tsdigitalLogo}
              alt="TSDigital"
              className="w-4 h-4 opacity-80"
            />
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-tertiary">Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              <span className="text-tertiary">by</span>
              <span className="font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                TSDigital
              </span>
            </div>
            <span className="text-xs text-tertiary/60 hidden sm:inline ml-2">© {currentYear}</span>
          </div>

          {/* Center: Quick Links */}
          <div className="hidden md:flex items-center gap-1">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="px-2.5 py-1 text-xs font-medium text-secondary hover:text-accent-500 hover:bg-primary-50/50 dark:hover:bg-primary-800/30 rounded-xl transition-all duration-200 flex items-center gap-1 group"
              >
                {link.label}
                {link.external && (
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            ))}
          </div>

          {/* Right: Status & Version */}
          <div className="flex items-center gap-1.5">
            {/* System Status */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 h-6">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 hidden sm:inline leading-none">
                System OK
              </span>
            </div>

            {/* Version Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-200/50 dark:border-blue-800/50 h-6">
              <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium text-blue-700 dark:text-blue-400 leading-none">
                v{versionData.version}
              </span>
            </div>

            {/* Build Number - Desktop only */}
            <div className="hidden lg:flex items-center gap-1 px-2 py-1 bg-[rgb(var(--color-bg-elevated))] rounded-full border border-primary/20 h-6">
              <Shield className="w-3 h-3 text-tertiary" />
              <span className="text-xs font-medium text-tertiary leading-none">
                #{versionData.buildNumber}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: Copyright */}
        <div className="sm:hidden text-center mt-2 pt-2 border-t border-primary/20">
          <span className="text-xs text-tertiary/60">© {currentYear} MONTIO</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
