import { useState } from 'react'
import { api } from '../../utils/apiClient'
import { Upload, CreditCard, Hash, Calendar, FileText, AlertCircle, ArrowLeft } from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function Step2LogoBilling({ data, updateData, nextStep, prevStep, inviteToken }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

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

      const response = await api.post('/api/onboarding/step2', formData, {
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

      toast.success('Údaje uložené')

      // Go to next step
      nextStep()
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Chyba pri ukladaní'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-2">Logo a fakturačné údaje</h2>
      <p className="text-secondary mb-6">Nahrajte logo firmy a zadajte fakturačné informácie</p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            Logo firmy (voliteľné)
          </label>

          <div className="flex items-center gap-4">
            {/* Preview */}
            {logoPreview && (
              <div className="w-24 h-24 border-2 border-primary rounded-lg overflow-hidden flex items-center justify-center bg-elevated shadow-soft">
                <img src={logoPreview} alt="Logo preview" className="max-w-full max-h-full object-contain" />
              </div>
            )}

            {/* Upload button */}
            <div className="flex-1">
              <label className="cursor-pointer block">
                <div className="card-interactive p-6 border-2 border-dashed border-primary text-center">
                  <Upload className="w-8 h-8 text-accent-500 mx-auto mb-2" />
                  <span className="text-accent-500 font-medium block">Vybrať súbor</span>
                  <p className="text-xs text-tertiary mt-1">JPG, PNG alebo SVG (max 2MB)</p>
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
          <label className="block text-sm font-medium text-secondary mb-1">
            IBAN (voliteľné)
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              name="iban"
              value={billingData.iban}
              onChange={handleBillingChange}
              placeholder="SK1234567890"
              className="input pl-10"
            />
          </div>
        </div>

        {/* SWIFT */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            SWIFT (voliteľné)
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              name="swift"
              value={billingData.swift}
              onChange={handleBillingChange}
              placeholder="SWIFT123"
              className="input pl-10"
            />
          </div>
        </div>

        {/* Variabilný symbol pattern */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Variabilný symbol (pattern)
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="text"
              name="variableSymbol"
              value={billingData.variableSymbol}
              onChange={handleBillingChange}
              placeholder="VS-{YYYY}-{###}"
              className="input pl-10"
            />
          </div>
          <p className="text-xs text-tertiary mt-1">
            {'{YYYY}'} = rok, {'{###}'} = číslo faktúry
          </p>
        </div>

        {/* Invoice due days */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Splatnosť faktúr (dni)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
            <input
              type="number"
              name="invoiceDueDays"
              value={billingData.invoiceDueDays}
              onChange={handleBillingChange}
              min="1"
              max="90"
              className="input pl-10"
            />
          </div>
        </div>

        {/* Invoice note */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">
            Poznámka na faktúre (voliteľné)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-tertiary" />
            <textarea
              name="invoiceNote"
              value={billingData.invoiceNote}
              onChange={handleBillingChange}
              placeholder="Ďakujeme za Váš nákup"
              rows="2"
              className="input pl-10"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={prevStep}
            className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Späť
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Ukladám...' : 'Ďalej →'}
          </button>
        </div>
      </form>
    </div>
  )
}
