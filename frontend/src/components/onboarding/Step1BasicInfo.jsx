import { useState } from 'react'
import axios from 'axios'
import { Building2, Hash, MapPin, Mail, AlertCircle } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function Step1BasicInfo({ data, updateData, nextStep, inviteToken, email }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { addToast } = useToast()

  const [formState, setFormState] = useState({
    name: data.name || '',
    ico: data.ico || '',
    dic: data.dic || '',
    address: data.address || ''
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
    if (!formState.name || formState.name.length < 3) {
      setError('Názov musí mať min 3 znaky')
      setLoading(false)
      return
    }

    if (!formState.ico || !/^\d{8}$/.test(formState.ico)) {
      setError('IČO musí mať 8 číslic')
      setLoading(false)
      return
    }

    if (formState.dic && !/^\d{10}$/.test(formState.dic)) {
      setError('DIČ musí mať 10 číslic')
      setLoading(false)
      return
    }

    if (!formState.address || formState.address.length < 10) {
      setError('Adresa musí mať min 10 znakov')
      setLoading(false)
      return
    }

    try {
      await axios.post('/api/onboarding/step1', {
        inviteToken,
        ...formState
      })

      // Update parent state
      updateData(formState)

      addToast('Údaje uložené', 'success')

      // Go to next step
      nextStep()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Chyba pri ukladaní'
      setError(errorMsg)
      addToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-2">Základné údaje firmy</h2>
      <p className="text-secondary mb-6">Zadajte základné informácie o Vašej firme</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Názov firmy */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Názov firmy <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="napr. Montáže SK s.r.o."
              className="input pl-10"
              required
            />
          </div>
        </div>

        {/* IČO */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            IČO <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              name="ico"
              value={formState.ico}
              onChange={handleChange}
              placeholder="12345678"
              maxLength="8"
              className="input pl-10"
              required
            />
          </div>
          <p className="text-xs text-tertiary mt-1">8 číslic</p>
        </div>

        {/* DIČ */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            DIČ (voliteľné)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              name="dic"
              value={formState.dic}
              onChange={handleChange}
              placeholder="2023456789"
              maxLength="10"
              className="input pl-10"
            />
          </div>
          <p className="text-xs text-tertiary mt-1">10 číslic</p>
        </div>

        {/* Adresa */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Adresa <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-tertiary" />
            <textarea
              name="address"
              value={formState.address}
              onChange={handleChange}
              placeholder="Hlavná 123, 81101 Bratislava"
              rows="3"
              className="input pl-10"
              required
            />
          </div>
        </div>

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
          <p className="text-xs text-tertiary mt-1">Email sa používa na prihlásenie</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Ukladám...' : 'Ďalej'}
          </button>
        </div>
      </form>
    </div>
  )
}
