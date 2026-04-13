const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      {Icon && (
        <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon className="w-10 h-10 text-slate-600" />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
          {title}
        </h3>
      )}

      {description && (
        <p className="text-sm font-mono text-slate-500 mb-6 max-w-md mx-auto">
          {description}
        </p>
      )}

      {action && action}
    </div>
  )
}

export default EmptyState
