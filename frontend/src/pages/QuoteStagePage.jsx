import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import {
  ArrowLeft,
  Euro,
  PenTool,
  RotateCcw,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  Calendar,
  Link as LinkIcon
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'
import SignatureCanvas from 'react-signature-canvas'

const QuoteStagePage = () => {
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
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [quoteLink, setQuoteLink] = useState('')

  const [materials, setMaterials] = useState([
    { name: '', description: '', price: '' }
  ])
  const [laborItems, setLaborItems] = useState([
    { name: '', description: '', price: '' }
  ])
  const [scheduledDate, setScheduledDate] = useState('')
  const [notes, setNotes] = useState('')
  const [signatureData, setSignatureData] = useState(null)

  const VAT_RATE = 20

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/orders/${id}`)
      setOrder(response.data.order)

      // Check if quote stage already exists
      const stages = response.data.stages || []
      const quoteStage = stages.find(s => s.stage === 'quote')

      if (quoteStage) {
        setIsEditMode(true)
        setExistingStage(quoteStage)

        // Load existing data
        const quoteData = quoteStage.checklist_data

        if (quoteData.materials && quoteData.materials.length > 0) {
          setMaterials(quoteData.materials)
        }
        if (quoteData.labor && quoteData.labor.length > 0) {
          setLaborItems(quoteData.labor)
        }
        if (quoteData.scheduled_date) {
          setScheduledDate(quoteData.scheduled_date)
        }
        if (quoteData.notes) {
          setNotes(quoteData.notes)
        }
        if (quoteStage.signature_data) {
          setSignatureData(quoteStage.signature_data)
        }

      }
    } catch (err) {
      console.error('❌ [QuoteStage] Fetch error:', err)
      toast.error('Nepodarilo sa načítať zákazku.')
      navigate(`/company/orders/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const materialsCost = materials.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    const laborCost = laborItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
    const subtotal = materialsCost + laborCost
    const vatAmount = subtotal * (VAT_RATE / 100)
    const total = subtotal + vatAmount

    return {
      materialsCost,
      laborCost,
      subtotal,
      vatAmount,
      total
    }
  }

  const addMaterial = () => {
    setMaterials([...materials, { name: '', description: '', price: '' }])
  }

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const updateMaterial = (index, field, value) => {
    const updated = [...materials]
    updated[index][field] = value
    setMaterials(updated)
  }

  const addLaborItem = () => {
    setLaborItems([...laborItems, { name: '', description: '', price: '' }])
  }

  const removeLaborItem = (index) => {
    setLaborItems(laborItems.filter((_, i) => i !== index))
  }

  const updateLaborItem = (index, field, value) => {
    const updated = [...laborItems]
    updated[index][field] = value
    setLaborItems(updated)
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

    const validMaterials = materials.filter(m => m.name.trim() && m.price)
    const validLabor = laborItems.filter(l => l.name.trim() && l.price)

    if (validMaterials.length === 0 && validLabor.length === 0) {
      newErrors.items = 'Pridajte aspoň jednu položku materiálu alebo práce'
    }

    if (!scheduledDate) {
      newErrors.scheduledDate = 'Vyberte dátum montáže'
    }

    if (!signatureData) {
      newErrors.signature = 'Váš podpis je povinný'
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

      const validMaterials = materials.filter(m => m.name.trim() && m.price)
      const validLabor = laborItems.filter(l => l.name.trim() && l.price)

      const totals = calculateTotals()

      const quoteData = {
        materials: validMaterials,
        labor: validLabor,
        vat_rate: VAT_RATE,
        vat_amount: totals.vatAmount,
        total_price: totals.total,
        scheduled_date: scheduledDate,
        notes
      }

      if (isEditMode) {
        // Update existing stage
        await api.put(`/api/orders/${id}/stage/${existingStage.id}`, {
          checklist_data: quoteData,
          signature_data: signatureData
        })
        toast.success('Cenová ponuka aktualizovaná.')
      } else {
        // Create new stage
        await api.post(`/api/orders/${id}/stage`, {
          stage: 'quote',
          checklist_data: quoteData,
          signature_data: signatureData
        })
      }

      // Update order with scheduled date and total price (backend generates quote_link)
      const updateResponse = await api.put(`/api/orders/${id}`, {
        total_price: totals.total,
        scheduled_date: scheduledDate
      })

      if (!isEditMode) {
        // Get quote_link from response or fetch order (only for new quotes)
        let quoteLinkToken = updateResponse.data.quote_link

        if (!quoteLinkToken) {
          // Fallback: fetch order to get quote_link
          const orderResponse = await api.get(`/api/orders/${id}`)
          quoteLinkToken = orderResponse.data.order.quote_link
        }


        // Show link modal
        // Use env variable if set, otherwise use current origin (works on dev and prod)
        const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
        const fullLink = `${baseUrl}/quote/${quoteLinkToken}`
        setQuoteLink(fullLink)
        setShowLinkModal(true)
      } else {
        // Edit mode - just go back
        navigate(`/company/orders/${id}`)
      }
    } catch (err) {
      console.error('❌ [QuoteStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa uložiť ponuku.')
    } finally {
      setSubmitting(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(quoteLink)
    toast.success('Link skopírovaný do schránky!')
  }

  const handleCloseLinkModal = () => {
    setShowLinkModal(false)
    navigate(`/company/orders/${id}`)
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

  const totals = calculateTotals()

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
              💰 {isEditMode ? 'Upraviť' : 'Vytvoriť'} cenovú ponuku
            </h1>
            <p className="text-secondary text-sm md:text-base">
              {order?.order_number} - {order?.client_name}
            </p>
            {isEditMode && (
              <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg inline-flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Upravujete existujúcu ponuku
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Materials */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
                  <Euro className="w-6 h-6 text-accent-500" />
                  Materiál
                </h2>
                <button
                  type="button"
                  onClick={addMaterial}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Pridať
                </button>
              </div>

              <div className="space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="card p-4 bg-secondary/5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <input
                            type="text"
                            value={material.name}
                            onChange={(e) => updateMaterial(index, 'name', e.target.value)}
                            placeholder="Názov materiálu (napr. Hlavná jednotka, Potrubie, Kábel...)"
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={material.description}
                            onChange={(e) => updateMaterial(index, 'description', e.target.value)}
                            placeholder="Popis (napr. Model, typ, rozmery, množstvo...)"
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={material.price}
                            onChange={(e) => updateMaterial(index, 'price', e.target.value)}
                            placeholder="Cena (€)"
                            step="0.01"
                            min="0"
                            className="input text-sm"
                          />
                        </div>
                      </div>
                      {materials.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMaterial(index)}
                          className="btn btn-ghost p-2 text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Labor */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-bold text-primary flex items-center gap-2">
                  <Euro className="w-6 h-6 text-accent-500" />
                  Práca
                </h2>
                <button
                  type="button"
                  onClick={addLaborItem}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Pridať
                </button>
              </div>

              <div className="space-y-3">
                {laborItems.map((item, index) => (
                  <div key={index} className="card p-4 bg-secondary/5">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateLaborItem(index, 'name', e.target.value)}
                            placeholder="Názov práce (napr. Montáž, Inštalácia, Servis...)"
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateLaborItem(index, 'description', e.target.value)}
                            placeholder="Popis práce (napr. Inštalácia, prepojenie, testovanie, nastavenie...)"
                            className="input text-sm"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateLaborItem(index, 'price', e.target.value)}
                            placeholder="Cena (€)"
                            step="0.01"
                            min="0"
                            className="input text-sm"
                          />
                        </div>
                      </div>
                      {laborItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLaborItem(index)}
                          className="btn btn-ghost p-2 text-red-500"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errors.items && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.items}
                </p>
              )}
            </div>

            {/* Price Summary */}
            <div className="card p-6 bg-accent-50 dark:bg-accent-900/20 border-2 border-accent-500">
              <h3 className="text-lg font-bold text-accent-900 dark:text-accent-100 mb-4">
                Súhrn:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Materiál:</span>
                  <span className="font-semibold text-primary">
                    {totals.materialsCost.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Práca:</span>
                  <span className="font-semibold text-primary">
                    {totals.laborCost.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between border-t border-accent-300 dark:border-accent-700 pt-2">
                  <span className="text-secondary">DPH ({VAT_RATE}%):</span>
                  <span className="font-semibold text-primary">
                    {totals.vatAmount.toFixed(2)} €
                  </span>
                </div>
                <div className="flex justify-between border-t-2 border-accent-500 pt-2">
                  <span className="text-lg font-bold text-accent-900 dark:text-accent-100">
                    CELKOM:
                  </span>
                  <span className="text-xl font-bold text-accent-600 dark:text-accent-400">
                    {totals.total.toFixed(2)} €
                  </span>
                </div>
              </div>
            </div>

            {/* Scheduled Date */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-accent-500" />
                Plánovaný dátum montáže <span className="text-red-500 text-sm">*</span>
              </h2>

              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => {
                  setScheduledDate(e.target.value)
                  if (errors.scheduledDate) {
                    setErrors(prev => ({ ...prev, scheduledDate: '' }))
                  }
                }}
                className={`input text-base ${errors.scheduledDate ? 'border-red-500' : ''}`}
              />

              {errors.scheduledDate && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.scheduledDate}
                </p>
              )}

              <p className="text-xs text-tertiary mt-2">
                Tento dátum sa zobrazí v kalendári a klient ho uvidí v ponuke.
              </p>
            </div>

            {/* Notes */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4">
                Poznámky k ponuke
              </h2>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Podmienky platby, platnosť ponuky, dodatočné informácie..."
                className="input min-h-[100px]"
                rows="4"
              />
            </div>

            {/* Signature */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <PenTool className="w-6 h-6 text-accent-500" />
                Váš podpis <span className="text-red-500 text-sm">*</span>
              </h2>

              <p className="text-sm text-secondary mb-4">
                Podpíšte cenovú ponuku. Klient dostane link na zhliadnutie a podpísanie ponuky.
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
              className="btn btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Vytváram ponuku...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Uložiť zmeny' : 'Vytvoriť ponuku a získať link'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elevated rounded-2xl shadow-xl max-w-2xl w-full p-6 animate-scale-in">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <LinkIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-primary mb-2">
                  Cenová ponuka vytvorená! 🎉
                </h3>
                <p className="text-secondary text-sm">
                  Pošlite tento link klientovi na email alebo SMS. Klient si ponuku prehliadne a podpíše.
                </p>
              </div>
            </div>

            <div className="card p-4 bg-secondary/10 mb-4">
              <p className="text-xs text-tertiary mb-2">Link pre klienta:</p>
              <p className="text-sm font-mono text-primary break-all">{quoteLink}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyLink}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <LinkIcon className="w-4 h-4" />
                Kopírovať link
              </button>
              <button
                onClick={handleCloseLinkModal}
                className="btn btn-primary flex-1"
              >
                Zavrieť
              </button>
            </div>
          </div>
        </div>
      )}
    </CompanyAdminLayout>
  )
}

export default QuoteStagePage
