import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import {
  ArrowLeft,
  Star,
  PenTool,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Shield,
  Save
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'
import SignatureCanvas from 'react-signature-canvas'

const CompletionStagePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const signatureRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [existingStage, setExistingStage] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    client_satisfaction: 5,
    warranty_info: '',
    final_notes: ''
  })
  const [signatureData, setSignatureData] = useState(null)

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/orders/${id}`)
      setOrder(response.data.order)

      // Check if completion stage already exists
      const stages = response.data.stages || []
      const completionStage = stages.find(s => s.stage === 'completion')

      if (completionStage) {
        setIsEditMode(true)
        setExistingStage(completionStage)

        const completionData = completionStage.checklist_data
        if (completionData) {
          setFormData({
            client_satisfaction: completionData.client_satisfaction || 5,
            warranty_info: completionData.warranty_info || '',
            final_notes: completionData.final_notes || ''
          })
        }
        if (completionStage.signature_data) {
          setSignatureData(completionStage.signature_data)
        }

      }
    } catch (err) {
      console.error('❌ [CompletionStage] Fetch error:', err)
      toast.error('Nepodarilo sa načítať zákazku.')
      navigate(`/company/orders/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
      toast.error('Podpis klienta je povinný.')
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

      if (isEditMode) {
        await api.put(`/api/orders/${id}/stage/${existingStage.id}`, {
          checklist_data: completionData,
          signature_data: signatureData
        })
        toast.success('Dokončenie aktualizované.')
      } else {
        await api.post(`/api/orders/${id}/stage`, {
          stage: 'completion',
          checklist_data: completionData,
          signature_data: signatureData
        })
        toast.success('Zákazka dokončená! 🎉')
      }

      navigate(`/company/orders/${id}`)
    } catch (err) {
      console.error('❌ [CompletionStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa dokončiť zákazku.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <CompanyAdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-200 dark:border-accent-700 border-t-accent-600 dark:border-t-accent-400"></div>
        </div>
      </CompanyAdminLayout>
    )
  }

  return (
    <CompanyAdminLayout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(`/company/orders/${id}`)}
              className="btn btn-ghost p-2 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary mb-2">
              ✅ {isEditMode ? 'Upraviť' : ''} Dokončenie zákazky
            </h1>
            <p className="text-secondary text-sm md:text-base">
              {order?.order_number} - {order?.client_name}
            </p>
            {isEditMode && (
              <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg inline-flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Upravujete existujúce dokončenie
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Satisfaction */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-amber-500" />
                Spokojnosť klienta
              </h2>

              <p className="text-sm text-secondary mb-6">
                Ako hodnotíte celkovú realizáciu montáže?
              </p>

              <div className="flex items-center justify-center gap-3 py-8">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, client_satisfaction: rating }))}
                    className={`
                      transition-all duration-200 active:scale-95 hover:scale-110
                      ${rating <= formData.client_satisfaction
                        ? 'text-amber-500'
                        : 'text-gray-300 dark:text-gray-700'
                      }
                    `}
                  >
                    <Star
                      className={`w-14 h-14 md:w-16 md:h-16 ${
                        rating <= formData.client_satisfaction ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-primary mb-2">
                  {formData.client_satisfaction === 5 && '⭐ Výborné!'}
                  {formData.client_satisfaction === 4 && '👍 Veľmi dobré'}
                  {formData.client_satisfaction === 3 && '😊 Dobré'}
                  {formData.client_satisfaction === 2 && '😐 Priemerné'}
                  {formData.client_satisfaction === 1 && '😞 Potrebuje zlepšenie'}
                </p>
                <p className="text-sm text-tertiary">
                  {formData.client_satisfaction === 5 && 'Ďakujeme za vynikajúce hodnotenie!'}
                  {formData.client_satisfaction === 4 && 'Ďakujeme za pozitívne hodnotenie!'}
                  {formData.client_satisfaction === 3 && 'Ďakujeme za hodnotenie'}
                  {formData.client_satisfaction === 2 && 'Čo môžeme zlepšiť?'}
                  {formData.client_satisfaction === 1 && 'Ospravedlňujeme sa. Čo sa pokazilo?'}
                </p>
              </div>
            </div>

            {/* Warranty Info */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-accent-500" />
                Záručné informácie
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Záruka a servis
                  </label>
                  <textarea
                    name="warranty_info"
                    value={formData.warranty_info}
                    onChange={handleChange}
                    placeholder="Záručná doba, podmienky záruky, servisné informácie, kontakt na servis..."
                    className="input min-h-[150px] text-base"
                    rows="6"
                  />
                  <p className="text-xs text-tertiary mt-2">
                    Napíšte záručné podmienky, dĺžku záruky a servisné kontakty.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Záverečné poznámky
                  </label>
                  <textarea
                    name="final_notes"
                    value={formData.final_notes}
                    onChange={handleChange}
                    placeholder="Odporúčania pre klienta, údržba, ďalší postup..."
                    className="input min-h-[120px] text-base"
                    rows="5"
                  />
                  <p className="text-xs text-tertiary mt-2">
                    Doplňujúce informácie a odporúčania pre klienta.
                  </p>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <PenTool className="w-6 h-6 text-accent-500" />
                Finálne potvrdenie <span className="text-red-500 text-sm">*</span>
              </h2>

              <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-green-900 dark:text-green-300 font-semibold mb-2">
                      Potvrdenie dokončenia
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-400">
                      Svojim podpisom klient potvrdzuje, že:
                    </p>
                    <ul className="text-xs text-green-700 dark:text-green-400 list-disc list-inside mt-2 space-y-1">
                      <li>Montáž bola vykonaná v súlade s dohodnutými podmienkami</li>
                      <li>Zariadenie funguje správne a bolo odovzdané funkčné</li>
                      <li>Obdržal záručné a servisné informácie</li>
                      <li>Je spokojný s realizáciou</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-sm text-secondary mb-4">
                Podpis klienta:
              </p>

              <div className={`border-2 rounded-lg overflow-hidden mb-3 ${errors.signature ? 'border-red-500' : 'border-primary'}`}>
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: 'w-full h-48 md:h-56 bg-white touch-none',
                    style: { touchAction: 'none' }
                  }}
                  onEnd={handleSignatureEnd}
                />
              </div>

              <button
                type="button"
                onClick={clearSignature}
                className="btn btn-secondary w-full flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Vymazať podpis
              </button>

              {errors.signature && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.signature}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn bg-green-500 hover:bg-green-600 text-white w-full flex items-center justify-center gap-2 py-4 text-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Dokončujem...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Uložiť zmeny' : '✅ Dokončiť zákazku'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </CompanyAdminLayout>
  )
}

export default CompletionStagePage
