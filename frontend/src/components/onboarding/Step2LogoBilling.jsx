import { useState } from 'react'
import axios from 'axios'

export default function Step2LogoBilling({ data, updateData, nextStep, prevStep, inviteToken }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [logoFile, setLogoFile] = useState(data.logo || null)
  const [logoPreview, setLogoPreview] = useState(data.logoPreview || null)

  const [billingData, setBillingData] = useState(data.billingData || {
    iban: '',
    swift: '',
    variableSymbol: 'VS-{YYYY}-{###}',
    invoiceDueDays: 14,
    invoiceNote: ''
  })

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo musí byť menšie ako 2MB')
        return
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        setError('Logo musí byť JPG, PNG alebo SVG')
        return
      }

      setLogoFile(file)
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBillingChange = (e) => {
    const { name, value } = e.target
    setBillingData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('inviteToken', inviteToken)
      formData.append('billingData', JSON.stringify(billingData))

      if (logoFile) {
        formData.append('logo', logoFile)
      }

      const response = await axios.post('/api/onboarding/step2', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update parent state
      updateData({
        logo: logoFile,
        logoPreview: logoPreview,
        logoUrl: response.data.logoUrl,
        billingData
      })

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
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Logo a fakturačné údaje</h2>
      <p className="text-gray-600 mb-6">Nahrajte logo firmy a zadajte fakturačné informácie</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo firmy (voliteľné)
          </label>

          <div className="flex items-center space-x-4">
            {/* Preview */}
            {logoPreview && (
              <div className="w-24 h-24 border-2 border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}

            {/* Upload button */}
            <div className="flex-1">
              <label className="cursor-pointer inline-block">
                <div className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition-colors text-center">
                  <span className="text-orange-600 font-medium">📁 Vybrať súbor</span>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG alebo SVG (max 2MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* IBAN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            IBAN (voliteľné)
          </label>
          <input
            type="text"
            name="iban"
            value={billingData.iban}
            onChange={handleBillingChange}
            placeholder="SK1234567890"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* SWIFT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SWIFT (voliteľné)
          </label>
          <input
            type="text"
            name="swift"
            value={billingData.swift}
            onChange={handleBillingChange}
            placeholder="SWIFT123"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Variabilný symbol pattern */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Variabilný symbol (pattern)
          </label>
          <input
            type="text"
            name="variableSymbol"
            value={billingData.variableSymbol}
            onChange={handleBillingChange}
            placeholder="VS-{YYYY}-{###}"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {'{YYYY}'} = rok, {'{###}'} = číslo faktúry
          </p>
        </div>

        {/* Invoice due days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Splatnosť faktúr (dni)
          </label>
          <input
            type="number"
            name="invoiceDueDays"
            value={billingData.invoiceDueDays}
            onChange={handleBillingChange}
            min="1"
            max="90"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Invoice note */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poznámka na faktúre (voliteľné)
          </label>
          <textarea
            name="invoiceNote"
            value={billingData.invoiceNote}
            onChange={handleBillingChange}
            placeholder="Ďakujeme za Váš nákup"
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
          >
            ← Späť
          </button>
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
