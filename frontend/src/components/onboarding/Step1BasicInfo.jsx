import { useState } from 'react'
import axios from 'axios'

export default function Step1BasicInfo({ data, updateData, nextStep, inviteToken, email }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

      // Go to next step
      nextStep()
    } catch (err) {
      setError(err.response?.data?.error || 'Chyba pri ukladaní')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Základné údaje firmy</h2>
      <p className="text-gray-600 mb-6">Zadajte základné informácie o Vašej firme</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Názov firmy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Názov firmy <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="napr. Montáže SK s.r.o."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* IČO */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IČO <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="ico"
            value={formState.ico}
            onChange={handleChange}
            placeholder="12345678"
            maxLength="8"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">8 číslic</p>
        </div>

        {/* DIČ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            DIČ (voliteľné)
          </label>
          <input
            type="text"
            name="dic"
            value={formState.dic}
            onChange={handleChange}
            placeholder="2023456789"
            maxLength="10"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">10 číslic</p>
        </div>

        {/* Adresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresa <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            value={formState.address}
            onChange={handleChange}
            placeholder="Hlavná 123, 81101 Bratislava"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

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
          <p className="text-xs text-gray-500 mt-1">Email sa používa na prihlásenie</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ukladám...' : 'Ďalej →'}
          </button>
        </div>
      </form>
    </div>
  )
}
