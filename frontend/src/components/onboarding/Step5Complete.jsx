import { useState } from 'react'
import { api } from '../../utils/apiClient'
import { CheckCircle, Lock, User, Mail, AlertCircle, Loader2, Sparkles, Building2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function Step5Complete({ data, inviteToken, email }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const toast = useToast()

  const [formState, setFormState] = useState({
    password: '',
    passwordConfirm: '',
    firstName: '',
    lastName: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (!formState.password || formState.password.length < 8) {
      setError('Heslo musí mať min 8 znakov')
      setLoading(false)
      return
    }

    if (formState.password !== formState.passwordConfirm) {
      setError('Heslá sa nezhodujú')
      setLoading(false)
      return
    }

    if (!formState.firstName || !formState.lastName) {
      setError('Zadajte meno a priezvisko')
      setLoading(false)
      return
    }

    try {
      const response = await api.post('/api/onboarding/complete', {
        inviteToken,
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName
      })

      setSuccess(true)
      toast.success('Registrácia dokončená!')

      // Auto-login - save token and user
      const { user, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Token is automatically managed by apiClient interceptor

      // Redirect after 3 seconds (full page reload to load user into context)
      setTimeout(() => {
        window.location.href = '/company'
      }, 3000)
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Chyba pri dokončení registrácie'
      setError(errorMsg)
      toast.error(errorMsg)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-2">Vitajte v MONTIO!</h2>
        <p className="text-secondary mb-6">
          Vaša firma bola úspešne aktivovaná
        </p>
        <div className="card p-4 max-w-md mx-auto mb-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">
                <strong>Email:</strong> {email}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">
                <strong>Firma:</strong> {data.name}
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-400">
                <strong>Rola:</strong> Company Admin
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-tertiary">
          <Loader2 className="w-4 h-4 animate-spin text-accent-500" />
          <span>Presmerovávam na dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-2">Dokončenie registrácie</h2>
      <p className="text-secondary mb-6">Vytvorte heslo a zadajte Vaše meno</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="email"
              value={email}
              disabled
              className="input pl-10 opacity-60 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Meno */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Meno <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
              <input
                type="text"
                name="firstName"
                value={formState.firstName}
                onChange={handleChange}
                placeholder="Ján"
                className="input pl-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">
              Priezvisko <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
              <input
                type="text"
                name="lastName"
                value={formState.lastName}
                onChange={handleChange}
                placeholder="Novák"
                className="input pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Heslo */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Heslo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              placeholder="Minimálne 8 znakov"
              className="input pl-10"
              required
            />
          </div>
          <p className="text-xs text-tertiary mt-1">Min 8 znakov</p>
        </div>

        {/* Potvrdenie hesla */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Potvrdenie hesla <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="password"
              name="passwordConfirm"
              value={formState.passwordConfirm}
              onChange={handleChange}
              placeholder="Zadajte heslo znova"
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* Info box */}
        <div className="card p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              Po dokončení budete automaticky prihlásený do Company Admin Dashboard.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-8 py-3 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                Dokončujem...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Dokončiť a prihlásiť sa
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
