import { useState, useEffect } from 'react'
import { Info, X, Sparkles } from 'lucide-react'
import tsdigitalLogo from '../assets/tsdigital-logo.svg'
import versionData from '../../../version.json'

const AppInfo = ({ showButton = true, isOpen: externalIsOpen, onOpenChange }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false)

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen
  const setIsOpen = onOpenChange || setInternalIsOpen

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, setIsOpen])

  return (
    <>
      {/* App Info Button */}
      {showButton && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
          title="O aplikácii"
        >
          <Info className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="text-sm font-medium">
            O aplikácii
          </span>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-elevated rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-accent px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-6 h-6 text-white" />
                  <h3 className="text-xl font-display font-bold text-white">O aplikácii</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* App Name */}
              <div className="text-center">
                <h2 className="text-2xl font-display font-bold text-primary mb-1">
                  {versionData.name}
                </h2>
                <p className="text-sm text-secondary">
                  {versionData.description}
                </p>
              </div>

              {/* Version Info */}
              <div className="bg-[rgb(var(--color-bg-secondary))] border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-tertiary font-medium">Verzia</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      v{versionData.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-tertiary font-medium">Build</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                      #{versionData.buildNumber}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <p className="text-xs text-tertiary font-medium">Dátum vydania</p>
                  <p className="text-sm font-semibold text-secondary">
                    {new Date(versionData.buildDate).toLocaleDateString('sk-SK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Creator Info */}
              <div className="bg-[rgb(var(--color-bg-secondary))] rounded-xl p-4">
                <p className="text-xs text-tertiary font-medium mb-2 text-center">
                  Created with ❤️ by
                </p>
                <div className="flex items-center justify-center gap-3">
                  <img
                    src={tsdigitalLogo}
                    alt="TSDigital"
                    className="w-12 h-12"
                  />
                  <div>
                    <p className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      TSDigital
                    </p>
                    <p className="text-xs text-tertiary">
                      Digital Solutions
                    </p>
                  </div>
                </div>
              </div>

              {/* Latest Changes */}
              <div className="bg-[rgb(var(--color-bg-secondary))] border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Novinky v tejto verzii</span>
                </p>
                <ul className="space-y-1">
                  {versionData.changelog[versionData.version].changes.map((change, index) => (
                    <li key={index} className="text-xs text-secondary flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-primary/20">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-gradient-accent text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Zavrieť
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AppInfo
