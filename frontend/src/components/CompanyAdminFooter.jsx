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

      <div className="px-4 md:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left: Branding + Made with love */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Branding */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-mono text-slate-400 tracking-wider">OPERATIONS</span>
            </div>

            {/* Made with love */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-slate-500">Made with</span>
              <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" />
              <span className="text-slate-500">by</span>
              <span className="font-black bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent tracking-wide">
                TSDigital
              </span>
              <span className="text-slate-600 hidden sm:inline">© {currentYear}</span>
            </div>
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

          {/* Right: Version + Build */}
          <div className="flex items-center gap-2">
            {/* Version Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-blue-500/60 leading-none uppercase tracking-wider">Version</span>
                <span className="text-xs font-mono text-blue-300 leading-none font-bold">
                  v{versionData.version}
                </span>
              </div>
            </div>

            {/* Build Number */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-600 leading-none uppercase tracking-wider">Build</span>
                <span className="text-xs font-mono text-slate-400 leading-none font-bold">
                  #{versionData.buildNumber}
                </span>
              </div>
            </div>

            {/* System Status Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg backdrop-blur-sm">
              <div className="relative flex items-center justify-center">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <div className="absolute w-2 h-2 bg-cyan-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-xs font-mono text-cyan-400 font-bold hidden sm:inline">
                ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: Copyright */}
        <div className="sm:hidden text-center mt-3 pt-3 border-t border-blue-500/10">
          <span className="text-xs text-slate-600 font-mono">© {currentYear} MONTIO OPS</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
    </footer>
  )
}

export default CompanyAdminFooter
