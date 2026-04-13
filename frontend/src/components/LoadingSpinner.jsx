const LoadingSpinner = ({ size = 'md', color = 'orange', text }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }

  const colors = {
    orange: 'border-orange-500',
    blue: 'border-blue-500',
    emerald: 'border-emerald-500',
    cyan: 'border-cyan-500'
  }

  const borderColor = colors[color] || colors.orange

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizes[size]} border-4 border-slate-700 border-t-transparent ${borderColor} rounded-full animate-spin`}></div>
      {text && (
        <p className="mt-4 text-slate-400 font-mono text-sm animate-pulse">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner
