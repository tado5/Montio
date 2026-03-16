import { useState } from 'react'
import axios from 'axios'

export default function Step5Complete({ data, inviteToken, email }) {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

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
      const response = await axios.post('/api/onboarding/complete', {
        inviteToken,
        password: formState.password,
        firstName: formState.firstName,
        lastName: formState.lastName
      })

      setSuccess(true)

      // Auto-login - save token and user
      const { user, token } = response.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      // Set axios authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      // Redirect after 3 seconds (full page reload to load user into context)
      setTimeout(() => {
        window.location.href = '/company'
      }, 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Chyba pri dokončení registrácie')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Vitajte v MONTIO!</h2>
        <p className="text-gray-600 mb-6">
          Vaša firma bola úspešne aktivovaná
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto mb-6">
          <p className="text-sm text-green-700">
            <strong>Email:</strong> {email}
          </p>
          <p className="text-sm text-green-700">
            <strong>Firma:</strong> {data.name}
          </p>
          <p className="text-sm text-green-700 mt-2">
            <strong>Rola:</strong> Company Admin
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
          <span>Presmerovávam na dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Dokončenie registrácie</h2>
      <p className="text-gray-600 mb-6">Vytvorte heslo a zadajte Vaše meno</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (readonly) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Meno */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meno <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formState.firstName}
              onChange={handleChange}
              placeholder="Ján"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priezvisko <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formState.lastName}
              onChange={handleChange}
              placeholder="Novák"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Heslo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heslo <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formState.password}
            onChange={handleChange}
            placeholder="Minimálne 8 znakov"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Min 8 znakov</p>
        </div>

        {/* Potvrdenie hesla */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Potvrdenie hesla <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="passwordConfirm"
            value={formState.passwordConfirm}
            onChange={handleChange}
            placeholder="Zadajte heslo znova"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Info box */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>💡 Tip:</strong> Po dokončení budete automaticky prihlásený do Company Admin Dashboard.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? 'Dokončujem...' : '✓ Dokončiť a prihlásiť sa'}
          </button>
        </div>
      </form>
    </div>
  )
}
