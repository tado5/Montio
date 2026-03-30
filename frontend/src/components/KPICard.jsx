import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = 'accent',
  loading = false
}) => {
  const colorClasses = {
    accent: 'from-accent-500 to-accent-600',
    primary: 'from-primary-700 to-primary-800',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
    error: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600',
  }

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return Minus
    return trend === 'up' ? TrendingUp : TrendingDown
  }

  const getTrendColor = () => {
    if (!trend || trend === 'neutral') return 'text-tertiary'
    return trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
  }

  const TrendIcon = getTrendIcon()

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-[rgb(var(--color-bg-secondary))] rounded w-1/2"/>
            <div className="h-8 bg-[rgb(var(--color-bg-secondary))] rounded w-3/4"/>
          </div>
          <div className="w-12 h-12 bg-[rgb(var(--color-bg-secondary))] rounded-xl"/>
        </div>
        <div className="h-3 bg-[rgb(var(--color-bg-secondary))] rounded w-1/3"/>
      </div>
    )
  }

  return (
    <div className="card-interactive group p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-secondary mb-2">
            {title}
          </h3>
          <p className="text-3xl font-display font-bold text-primary">
            {value}
          </p>
        </div>
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center
          bg-gradient-to-br ${colorClasses[color]}
          shadow-soft group-hover:shadow-medium transition-all duration-200
          group-hover:scale-110
        `}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {subtitle && (
          <p className="text-sm text-tertiary font-medium">
            {subtitle}
          </p>
        )}

        {trendValue && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-4 h-4" />
            <span className="text-sm font-bold">{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default KPICard
