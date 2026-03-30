import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { AlertTriangle, X } from 'lucide-react'
import axios from 'axios'

const DeactivateCompanyModal = ({ isOpen, onClose, company, onSuccess }) => {
  const toast = useToast()
  const [confirmName, setConfirmName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeactivate = async () => {
    if (confirmName !== company.name) {
      toast.error('Názov firmy sa nezhoduje!')
      return
    }

    setLoading(true)

    try {
      await axios.put(`/api/companies/${company.id}/deactivate`, {
        companyName: confirmName
      })

      toast.success('Firma bola úspešne deaktivovaná.')
      if (onSuccess) onSuccess()
      handleClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chyba pri deaktivácii firmy')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmName('')
    onClose()
  }

  if (!isOpen || !company) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-elevated rounded-2xl shadow-xl max-w-lg w-full border-4 border-red-500 dark:border-red-600 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-white" />
              <h2 className="text-xl md:text-2xl font-display font-bold text-white">Deaktivovať firmu</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Warning */}
          <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 rounded-xl p-4 mb-6">
            <p className="text-red-900 dark:text-red-300 font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              POZOR: Toto je nebezpečná operácia!
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
          <div className="card p-4 mb-6">
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
                <p className="font-bold text-primary">{company.name}</p>
                <p className="text-xs font-mono text-tertiary">ID: {company.id.substring(0, 8)}...</p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-secondary mb-2">
              Na potvrdenie napíšte presný názov firmy:
            </label>
            <div className="card p-3 mb-3">
              <p className="text-sm font-mono font-bold text-primary">
                {company.name}
              </p>
            </div>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              className="input"
              placeholder="Napíšte názov firmy"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline flex-1"
            >
              Zrušiť
            </button>
            <button
              onClick={handleDeactivate}
              disabled={loading || confirmName !== company.name}
              className="btn flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              {loading ? 'Deaktivujem...' : 'Deaktivovať firmu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeactivateCompanyModal
