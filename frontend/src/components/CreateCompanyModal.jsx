import { useState } from 'react'
import axios from 'axios'

const CreateCompanyModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/api/companies', { email })
      setSuccess(response.data)
      setEmail('')
      if (onSuccess) onSuccess(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri odosielaní pozvánky')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (success?.invite?.invite_link) {
      navigator.clipboard.writeText(success.invite.invite_link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyToken = () => {
    if (success?.invite?.invite_token) {
      navigator.clipboard.writeText(success.invite.invite_token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setSuccess(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-white">📧 Pozvať novú firmu</h2>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {!success ? (
            // Invite Form
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl font-semibold">
                  {error}
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold mb-4">
                  ℹ️ Zadajte email majiteľa firmy. Dostane registračný link, cez ktorý si vyplní všetky údaje o firme.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                  Email majiteľa firmy *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-lg"
                  placeholder="majitel@firma.sk"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                  Na tento email príde pozvánka s registračným linkom
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all duration-200"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                  {loading ? 'Odosielam...' : '📧 Poslať pozvánku'}
                </button>
              </div>
            </form>
          ) : (
            // Success State
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Pozvánka odoslaná!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-semibold">
                  {success.invite.email}
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
                <div className="flex gap-3">
                  <div className="text-3xl">📧</div>
                  <div>
                    <p className="text-sm text-green-900 dark:text-green-300 font-bold mb-2">
                      Email bol odoslaný na adresu majiteľa firmy
                    </p>
                    <p className="text-xs text-green-800 dark:text-green-400">
                      Majiteľ dostane registračný link, cez ktorý si vyplní všetky údaje o firme.
                      Po dokončení registrácie bude firma aktivovaná.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Invite Link - for backup */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border-2 border-blue-200 dark:border-blue-800">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2">
                    🔗 Registračný link (záloha)
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Ak email nepríde, môžete poslať tento link manuálne:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={success.invite.invite_link}
                      readOnly
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 dark:text-gray-200 border-2 border-gray-200 dark:border-gray-600 rounded-lg text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-bold transition-all duration-200 whitespace-nowrap"
                    >
                      {copied ? '✓ OK' : '📋'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                ✓ Hotovo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateCompanyModal
