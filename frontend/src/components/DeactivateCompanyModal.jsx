import { useState } from 'react'
import axios from 'axios'

const DeactivateCompanyModal = ({ isOpen, onClose, company, onSuccess }) => {
  const [confirmName, setConfirmName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDeactivate = async () => {
    if (confirmName !== company.name) {
      setError('Názov firmy sa nezhoduje!')
      return
    }

    setError('')
    setLoading(true)

    try {
      await axios.put(`/api/companies/${company.id}/deactivate`, {
        companyName: confirmName
      })

      if (onSuccess) onSuccess()
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri deaktivácii firmy')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmName('')
    setError('')
    onClose()
  }

  if (!isOpen || !company) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border-4 border-red-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">⚠️ Deaktivovať firmu</h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Warning */}
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-900 dark:text-red-300 font-bold mb-2">
              🚨 POZOR: Toto je nebezpečná operácia!
            </p>
            <p className="text-red-800 dark:text-red-400 text-sm">
              Deaktivovaním firmy:
            </p>
            <ul className="text-red-800 dark:text-red-400 text-sm list-disc ml-5 mt-2 space-y-1">
              <li>Všetci používatelia stratia prístup</li>
              <li>Dáta zostanú uložené, ale neprístupné</li>
              <li>Firmu môžete neskôr aktivovať</li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{company.name}</p>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400">ID: {company.id.substring(0, 8)}...</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl font-semibold mb-4">
              {error}
            </div>
          )}

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
              Na potvrdenie napíšte presný názov firmy:
            </label>
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3">
              <p className="text-sm font-mono font-bold text-gray-900 dark:text-gray-100">
                {company.name}
              </p>
            </div>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              placeholder="Napíšte názov firmy"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold py-3 px-4 rounded-xl transition-all duration-200"
            >
              Zrušiť
            </button>
            <button
              onClick={handleDeactivate}
              disabled={loading || confirmName !== company.name}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              {loading ? 'Deaktivujem...' : '⚠️ Deaktivovať firmu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeactivateCompanyModal
