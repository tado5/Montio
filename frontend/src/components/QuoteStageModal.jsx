import { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import {
  X,
  Save,
  DollarSign,
  Percent,
  FileText,
  PenTool,
  RotateCcw,
  AlertCircle
} from 'lucide-react'
import { api } from '../utils/apiClient'
import SignatureCanvas from 'react-signature-canvas'

const QuoteStageModal = ({ orderId, onClose, onSuccess }) => {
  const toast = useToast()
  const signatureRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    materials_cost: '',
    labor_cost: '',
    vat_rate: '20',
    notes: ''
  })

  const [totalPrice, setTotalPrice] = useState(0)
  const [vatAmount, setVatAmount] = useState(0)
  const [signatureData, setSignatureData] = useState(null)

  useEffect(() => {
    calculateTotal()
  }, [formData.materials_cost, formData.labor_cost, formData.vat_rate])

  const calculateTotal = () => {
    const materials = parseFloat(formData.materials_cost) || 0
    const labor = parseFloat(formData.labor_cost) || 0
    const vatRate = parseFloat(formData.vat_rate) || 0

    const subtotal = materials + labor
    const vat = subtotal * (vatRate / 100)
    const total = subtotal + vat

    setVatAmount(vat)
    setTotalPrice(total)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
    setSignatureData(null)
  }

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const dataUrl = signatureRef.current.toDataURL()
      setSignatureData(dataUrl)
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.materials_cost || parseFloat(formData.materials_cost) < 0) {
      newErrors.materials_cost = 'Zadajte cenu materiálu'
    }

    if (!formData.labor_cost || parseFloat(formData.labor_cost) < 0) {
      newErrors.labor_cost = 'Zadajte cenu práce'
    }

    if (!signatureData) {
      newErrors.signature = 'Podpis klienta je povinný'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Vyplňte všetky povinné polia.')
      return
    }

    try {
      setSubmitting(true)

      const quoteData = {
        materials_cost: parseFloat(formData.materials_cost),
        labor_cost: parseFloat(formData.labor_cost),
        vat_rate: parseFloat(formData.vat_rate),
        vat_amount: vatAmount,
        total_price: totalPrice,
        notes: formData.notes
      }

      // Submit stage
      await api.post(`/api/orders/${orderId}/stage`, {
        stage: 'quote',
        checklist_data: quoteData,
        signature_data: signatureData
      })

      // Update order total price
      await api.put(`/api/orders/${orderId}`, {
        total_price: totalPrice
      })

      console.log('✅ [QuoteStage] Quote completed')
      toast.success('Cenová ponuka dokončená.')
      onSuccess()
    } catch (err) {
      console.error('❌ [QuoteStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa uložiť cenovú ponuku.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 overflow-y-auto">
      <div className="bg-elevated rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-3xl sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-primary bg-elevated sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary truncate">Cenová ponuka</h2>
            <p className="text-xs sm:text-sm text-tertiary mt-1">Kalkulácia ceny a podpis klienta</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2 ml-2 flex-shrink-0"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
            {/* Price Calculation */}
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500" />
                Kalkulácia ceny
              </h3>

              <div className="space-y-3">
                {/* Materials Cost */}
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Materiál <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      name="materials_cost"
                      value={formData.materials_cost}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`input pr-12 text-lg ${errors.materials_cost ? 'border-red-500' : ''}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary font-semibold">€</span>
                  </div>
                  {errors.materials_cost && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.materials_cost}
                    </p>
                  )}
                </div>

                {/* Labor Cost */}
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Práca <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      name="labor_cost"
                      value={formData.labor_cost}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`input pr-12 text-lg ${errors.labor_cost ? 'border-red-500' : ''}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary font-semibold">€</span>
                  </div>
                  {errors.labor_cost && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.labor_cost}
                    </p>
                  )}
                </div>

                {/* VAT Rate */}
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    DPH
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                    <select
                      name="vat_rate"
                      value={formData.vat_rate}
                      onChange={handleChange}
                      className="input pl-10"
                    >
                      <option value="0">0% (oslobodené)</option>
                      <option value="10">10% (znížená)</option>
                      <option value="20">20% (základná)</option>
                    </select>
                  </div>
                </div>

                {/* Summary */}
                <div className="card p-4 bg-accent-500/10 border-2 border-accent-500">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary">Medziúčet:</span>
                      <span className="font-semibold text-secondary">
                        {((parseFloat(formData.materials_cost) || 0) + (parseFloat(formData.labor_cost) || 0)).toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">DPH ({formData.vat_rate}%):</span>
                      <span className="font-semibold text-secondary">{vatAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-accent-500/30">
                      <span className="font-bold text-primary text-lg">SPOLU:</span>
                      <span className="font-bold text-accent-600 dark:text-accent-400 text-xl">
                        {totalPrice.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Poznámky k cenovej ponuke
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Popis prác, materiálov, podmienky..."
                className="input min-h-[80px]"
                rows="3"
              />
            </div>

            {/* Signature */}
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500" />
                Podpis klienta <span className="text-red-500 text-sm">*</span>
              </h3>

              <div className="space-y-2">
                <div className={`border-2 rounded-lg overflow-hidden ${errors.signature ? 'border-red-500' : 'border-primary'}`}>
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'w-full h-40 sm:h-48 bg-white dark:bg-slate-900 touch-none',
                      style: { touchAction: 'none' }
                    }}
                    onEnd={handleSignatureEnd}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Vymazať podpis
                </button>
                {errors.signature && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.signature}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-4 sm:p-6 border-t border-primary bg-elevated sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline w-full sm:flex-1 py-3 sm:py-2"
              disabled={submitting}
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="btn btn-primary w-full sm:flex-1 flex items-center justify-center gap-2 py-3 sm:py-2 text-base sm:text-sm"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                  Ukladám...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 sm:w-4 sm:h-4" />
                  💰 Dokončiť ponuku
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuoteStageModal
