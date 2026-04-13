import { AlertTriangle, RefreshCw } from 'lucide-react'

const ErrorState = ({ title = 'Chyba', message, onRetry }) => {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-red-500/10 border-2 border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
      </div>

      <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
        {title}
      </h3>

      <p className="text-sm font-mono text-slate-400 mb-6 max-w-md mx-auto">
        {message || 'Nastala neočakávaná chyba. Skúste to znova.'}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-mono font-bold text-red-400 transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Skúsiť znova
        </button>
      )}
    </div>
  )
}

export default ErrorState
