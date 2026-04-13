import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { Mail, Copy, Check, X, Send, Link as LinkIcon, Info } from 'lucide-react'
import axios from 'axios'

const CreateCompanyModal = ({ isOpen, onClose, onSuccess }) => {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await axios.post('/api/companies', { email })
      setSuccess(response.data)
      setEmail('')
      toast.success('Pozvánka bola úspešne odoslaná!')
      if (onSuccess) onSuccess(response.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Chyba pri odosielaní pozvánky')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (success?.invite?.invite_link) {
      navigator.clipboard.writeText(success.invite.invite_link)
      setCopied(true)
      toast.success('Link bol skopírovaný do schránky!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setEmail('')
    setSuccess(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-elevated rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-700 p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Mail className="w-7 h-7 text-white" />
              <h2 className="text-xl md:text-2xl font-display font-bold text-white">Pozvať novú firmu</h2>
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
          {!success ? (
            // Invite Form
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="card border-2 border-blue-200 dark:border-blue-800 p-6">
                <p className="text-sm text-secondary font-semibold flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Zadajte email majiteľa firmy. Dostane registračný link, cez ktorý si vyplní všetky údaje o firme.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Email majiteľa firmy *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input text-lg"
                  placeholder="majitel@firma.sk"
                  required
                />
                <p className="text-xs text-tertiary mt-2 font-medium">
                  Na tento email príde pozvánka s registračným linkom
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-outline flex-1"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Odosielam...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Poslať pozvánku
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            // Success State
            <div className="space-y-4">
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-display font-bold text-primary mb-2">
                  Pozvánka odoslaná!
                </h3>
                <p className="text-secondary font-semibold">
                  {success.invite.email}
                </p>
              </div>

              {/* Info Box */}
              <div className="card border-2 border-orange-200 dark:border-orange-800 p-6">
                <div className="flex gap-3">
                  <Mail className="w-8 h-8 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-secondary font-bold mb-2">
                      Email bol odoslaný na adresu majiteľa firmy
                    </p>
                    <p className="text-xs text-tertiary">
                      Majiteľ dostane registračný link, cez ktorý si vyplní všetky údaje o firme.
                      Po dokončení registrácie bude firma aktivovaná.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Invite Link - for backup */}
                <div className="card border-2 border-blue-200 dark:border-blue-800 p-4">
                  <label className="block text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Registračný link (záloha)
                  </label>
                  <p className="text-xs text-tertiary mb-2">Ak email nepríde, môžete poslať tento link manuálne:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={success.invite.invite_link}
                      readOnly
                      className="input flex-1 text-sm font-mono"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="btn bg-gradient-accent hover:opacity-90 text-white px-4 whitespace-nowrap"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Hotovo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateCompanyModal
