import { useState, useEffect } from 'react'
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
          className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-red-50 dark:hover:from-blue-900/30 dark:hover:to-red-900/30 rounded-lg transition-all duration-200 group"
          title="O aplikácii"
        >
          <span className="text-base group-hover:scale-110 transition-transform duration-200">ℹ️</span>
          <span className="text-sm font-medium group-hover:text-orange-600 dark:group-hover:text-orange-400">
            O aplikácii
          </span>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">O aplikácii</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* App Name */}
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {versionData.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {versionData.description}
                </p>
              </div>

              {/* Version Info */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-4 border border-orange-200 dark:border-orange-800">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verzia</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      v{versionData.version}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Build</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">
                      #{versionData.buildNumber}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dátum vydania</p>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {new Date(versionData.buildDate).toLocaleDateString('sk-SK', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Creator Info */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2 text-center">
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
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Digital Solutions
                    </p>
                  </div>
                </div>
              </div>

              {/* Latest Changes */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mb-2 flex items-center gap-2">
                  <span>✨</span>
                  <span>Novinky v tejto verzii</span>
                </p>
                <ul className="space-y-1">
                  {versionData.changelog[versionData.version].changes.map((change, index) => (
                    <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
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
