import { Heart, Shield, Zap, CheckSquare, Calendar, Camera } from 'lucide-react'
import versionData from '../../../version.json'

const EmployeeFooter = () => {
  const currentYear = new Date().getFullYear()

  const metrics = [
    { icon: CheckSquare, label: 'Tasks', value: '3', color: 'emerald' },
    { icon: Calendar, label: 'Today', value: '2', color: 'green' },
    { icon: Camera, label: 'Photos', value: '12', color: 'teal' },
  ]

  return (
    <footer className="mt-auto border-t border-emerald-500/20 bg-gradient-to-r from-slate-950/95 via-slate-900/95 to-slate-950/95 backdrop-blur-xl shadow-lg shadow-emerald-500/5">
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

      <div className="px-3 md:px-5 lg:px-6 py-0.5 md:py-2 lg:py-2.5">
        <div className="flex flex-row items-center justify-between gap-2 md:gap-4">
          {/* Left: Branding + Made with love */}
          <div className="flex items-center gap-1 text-[9px] md:text-xs font-mono">
            {/* Desktop: Full branding */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/50 border border-slate-700/50 rounded-lg backdrop-blur-sm mr-2">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-mono text-slate-400 tracking-wider">FIELD OPS</span>
            </div>

            {/* Mobile: Ultra compact */}
            <Heart className="w-2 h-2 md:w-3 md:h-3 text-red-500 fill-red-500" />
            <span className="text-slate-500 hidden md:inline">Made with by</span>
            <span className="font-bold text-emerald-400 md:font-black md:bg-gradient-to-r md:from-emerald-400 md:to-green-600 md:bg-clip-text md:text-transparent">
              TSDigital
            </span>
            <span className="text-slate-600 hidden md:inline ml-1">© {currentYear}</span>
          </div>

          {/* Center: Employee Metrics - Desktop only */}
          <div className="hidden xl:flex items-center gap-1.5">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              const colorMap = {
                emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
                green: 'text-green-400 bg-green-500/10 border-green-500/30',
                teal: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
              }
              return (
                <div
                  key={index}
                  className={`flex items-center gap-1.5 px-2.5 py-1 ${colorMap[metric.color]} border rounded-lg backdrop-blur-sm`}
                >
                  <Icon className="w-3 h-3" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-slate-500 leading-none uppercase tracking-wider">
                      {metric.label}
                    </span>
                    <span className="text-[11px] font-mono font-bold leading-none">
                      {metric.value}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right: Version + Build */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile: Plain text version */}
            <span className="md:hidden text-[9px] font-mono text-emerald-400">
              v{versionData.version}
            </span>

            {/* Desktop: Full badges */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg backdrop-blur-sm">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-300 font-bold">
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
            <span className="md:hidden text-[9px] font-mono text-green-400">●</span>

            {/* Desktop: Full status */}
            <div className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-green-500/10 border border-green-500/30 rounded-lg backdrop-blur-sm">
              <div className="relative flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <div className="absolute w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-[11px] font-mono text-green-400 font-bold">
                READY
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: Copyright (removed - too much space) */}
      </div>

      {/* Bottom accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
    </footer>
  )
}

export default EmployeeFooter
