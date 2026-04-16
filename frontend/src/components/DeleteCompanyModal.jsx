import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { api } from '../utils/apiClient'

const DeleteCompanyModal = ({ isOpen, onClose, company, onSuccess }) => {
  const toast = useToast()
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Musíte napísať "DELETE" pre potvrdenie!')
      return
    }

    setLoading(true)

    try {
      await api.delete(`/api/companies/${company.id}`)
      toast.success('Firma bola trvalo vymazaná.')
      if (onSuccess) onSuccess()
      handleClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chyba pri vymazávaní firmy')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  if (!isOpen || !company) return null

  const isConfirmValid = confirmText === 'DELETE'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border-4 border-red-500 animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-white">
                TRVALO vymazať firmu
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Danger Warning */}
          <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-5 mb-5 backdrop-blur-sm">
            <p className="text-red-400 font-bold text-lg mb-3 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              ⚠️ NEBEZPEČNÁ OPERÁCIA - NEVRATNÁ!
            </p>
            <p className="text-red-300 text-sm font-semibold mb-3">
              Táto akcia je PERMANENTNÁ a NEVRATNÁ!
            </p>
            <p className="text-slate-300 text-sm mb-2">
              Vymazaním firmy:
            </p>
            <ul className="text-slate-300 text-sm space-y-1.5 ml-5">
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Firma bude <strong className="text-red-400">TRVALO VYMAZANÁ</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Invitation token bude <strong className="text-red-400">ZRUŠENÝ</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Všetky súvisiace dáta budú <strong className="text-red-400">VYMAZANÉ</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span>Registračný link prestane fungovať (404)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 font-bold">✕</span>
                <span className="font-bold text-red-400">NIE JE MOŽNÉ VRÁTIŤ SPÄŤ!</span>
              </li>
            </ul>
          </div>

          {/* Company Info */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 mb-5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-12 h-12 rounded-lg object-cover border-2 border-red-500/30"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold text-slate-100 text-lg">{company.name}</p>
                <p className="text-xs font-mono text-slate-400">
                  Status: <span className={`font-bold ${
                    company.status === 'pending' ? 'text-orange-400' :
                    company.status === 'inactive' ? 'text-red-400' :
                    'text-emerald-400'
                  }`}>
                    {company.status?.toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-slate-300 mb-2">
              Pre potvrdenie napíšte presne: <span className="text-red-400 font-mono">DELETE</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Napíšte DELETE"
              className="w-full px-4 py-3 bg-slate-800/50 border-2 border-slate-700/50 focus:border-red-500/50 rounded-xl text-slate-100 placeholder-slate-500 transition-all duration-200 font-mono text-center text-lg font-bold"
              disabled={loading}
              autoComplete="off"
              spellCheck={false}
            />
            {confirmText && confirmText !== 'DELETE' && (
              <p className="text-red-400 text-xs mt-2 font-semibold">
                ⚠️ Musíte napísať presne "DELETE" (veľké písmená)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 text-slate-300 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              Zrušiť
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || !isConfirmValid}
              className={`
                flex-1 px-4 py-3 font-bold rounded-xl transition-all duration-200
                flex items-center justify-center gap-2
                ${isConfirmValid && !loading
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40'
                  : 'bg-slate-800/50 border border-slate-700/50 text-slate-600 cursor-not-allowed'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Vymazávam...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  VYMAZAŤ TRVALO
                </>
              )}
            </button>
          </div>

          {/* Extra Warning */}
          <p className="text-center text-xs text-slate-500 mt-4 font-semibold">
            Táto akcia je NEVRATNÁ a NEMOŽNO ju vrátiť späť!
          </p>
        </div>
      </div>
    </div>
  )
}

export default DeleteCompanyModal
