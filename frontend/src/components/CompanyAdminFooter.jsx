import { Heart, Shield, Zap, TrendingUp, Users, FileText } from 'lucide-react'
import versionData from '../../../version.json'

const CompanyAdminFooter = () => {
  const currentYear = new Date().getFullYear()

  const metrics = [
    { icon: TrendingUp, label: 'Orders', value: '8', color: 'cyan' },
    { icon: Users, label: 'Team', value: '12', color: 'blue' },
    { icon: FileText, label: 'Invoices', value: '24', color: 'purple' },
  ]

  return (
    <footer className="mt-auto border-t border-blue-500/20 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl shadow-lg shadow-blue-500/5">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

      <div className="px-3 md:px-5 lg:px-6 py-0.5 md:py-2 lg:py-2.5">
        <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
          {/* Left: Made with love - ultra compact on mobile */}
          <div className="flex items-center gap-1 text-[9px] md:text-xs font-mono">
            {/* Desktop: Full branding */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm mr-2">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-[11px] font-mono text-slate-400 tracking-wider">OPERATIONS</span>
            </div>

            {/* Mobile: Ultra compact */}
            <Heart className="w-2 h-2 md:w-3 md:h-3 text-red-500 fill-red-500" />
            <span className="text-slate-500 hidden md:inline">Made with by</span>
            <span className="font-bold text-cyan-400 md:font-black md:bg-gradient-to-r md:from-blue-400 md:to-cyan-600 md:bg-clip-text md:text-transparent">
              TSDigital
            </span>
            <span className="text-slate-600 hidden md:inline ml-1">© {currentYear}</span>
          </div>

          {/* Center: Company Metrics - Desktop only */}
          <div className="hidden xl:flex items-center gap-2">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              const colorMap = {
                cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
                blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
                purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
              }
              return (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1.5 ${colorMap[metric.color]} border rounded-lg backdrop-blur-sm`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 leading-none uppercase tracking-wider">
                      {metric.label}
                    </span>
                    <span className="text-xs font-mono font-bold leading-none">
                      {metric.value}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Version + Status (ultra minimal on mobile) */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile: Plain text version */}
            <span className="md:hidden text-[9px] font-mono text-blue-400">
              v{versionData.version}
            </span>

            {/* Desktop: Full badges */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-[11px] font-mono text-blue-300 font-bold">
                v{versionData.version}
              </span>
            </div>

            {/* Build Number - desktop only */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-600 leading-none uppercase tracking-wider">Build</span>
                <span className="text-[11px] font-mono text-slate-400 leading-none font-bold">
                  #{versionData.buildNumber}
                </span>
              </div>
            </div>

            {/* Status - minimal on mobile */}
            <span className="md:hidden text-[9px] font-mono text-cyan-400">●</span>

            {/* Desktop: Full status */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
              <div className="relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
                <div className="absolute w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: Copyright (removed - too much space) */}
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
    </footer>
  )
}

export default CompanyAdminFooter
