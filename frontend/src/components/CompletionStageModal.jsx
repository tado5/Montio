import { useState, useRef } from 'react'
import { useToast } from '../context/ToastContext'
import {
  X,
  Save,
  PenTool,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react'
import { api } from '../utils/apiClient'
import SignatureCanvas from 'react-signature-canvas'

const CompletionStageModal = ({ orderId, onClose, onSuccess }) => {
  const toast = useToast()
  const signatureRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    client_satisfaction: 5,
    warranty_info: '',
    final_notes: ''
  })

  const [signatureData, setSignatureData] = useState(null)

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

      const completionData = {
        client_satisfaction: parseInt(formData.client_satisfaction),
        warranty_info: formData.warranty_info,
        final_notes: formData.final_notes,
        completed_at: new Date().toISOString()
      }

      // Submit completion stage
      await api.post(`/api/orders/${orderId}/stage`, {
        stage: 'completion',
        checklist_data: completionData,
        signature_data: signatureData
      })

      console.log('✅ [CompletionStage] Order completed')
      toast.success('Zákazka dokončená! 🎉')
      onSuccess()
    } catch (err) {
      console.error('❌ [CompletionStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa dokončiť zákazku.')
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
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary truncate flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Dokončenie zákazky
            </h2>
            <p className="text-xs sm:text-sm text-tertiary mt-1">Finálne potvrdenie a odovzdanie</p>
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
            {/* Client Satisfaction */}
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                Spokojnosť klienta
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-4">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, client_satisfaction: rating }))}
                      className={`
                        transition-all duration-200 active:scale-95
                        ${rating <= formData.client_satisfaction
                          ? 'text-amber-500'
                          : 'text-gray-300 dark:text-gray-700'
                        }
                      `}
                    >
                      <Star
                        className={`w-10 h-10 sm:w-12 sm:h-12 ${
                          rating <= formData.client_satisfaction ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-secondary">
                  {formData.client_satisfaction === 5 && '⭐ Výborné!'}
                  {formData.client_satisfaction === 4 && '👍 Veľmi dobré'}
                  {formData.client_satisfaction === 3 && '😊 Dobré'}
                  {formData.client_satisfaction === 2 && '😐 Priemerné'}
                  {formData.client_satisfaction === 1 && '😞 Potrebuje zlepšenie'}
                </p>
              </div>
            </div>

            {/* Warranty Info */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Záručné informácie
              </label>
              <textarea
                name="warranty_info"
                value={formData.warranty_info}
                onChange={handleChange}
                placeholder="Záručná doba, podmienky záruky, servisné informácie..."
                className="input min-h-[100px]"
                rows="4"
              />
            </div>

            {/* Final Notes */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Záverečné poznámky
              </label>
              <textarea
                name="final_notes"
                value={formData.final_notes}
                onChange={handleChange}
                placeholder="Dodatočné poznámky, odporúčania pre klienta, ďalší postup..."
                className="input min-h-[100px]"
                rows="4"
              />
            </div>

            {/* Info Box */}
            <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-green-900 dark:text-green-300 font-semibold mb-1">
                    Potvrdenie dokončenia
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Po potvrdení bude zákazka označená ako dokončená a bude možné generovať faktúru.
                  </p>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500" />
                Potvrdenie klienta <span className="text-red-500 text-sm">*</span>
              </h3>

              <div className="space-y-2">
                <p className="text-xs text-tertiary mb-2">
                  Svojim podpisom potvrdzujem, že práce boli vykonané v súlade s dohodnutými podmienkami
                  a som spokojný s realizáciou.
                </p>
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
              className="btn bg-green-500 hover:bg-green-600 text-white w-full sm:flex-1 flex items-center justify-center gap-2 py-3 sm:py-2 text-base sm:text-sm"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 sm:h-4 sm:w-4 border-2 border-white border-t-transparent"></div>
                  Dokončujem...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                  ✅ Dokončiť zákazku
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompletionStageModal
