import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import {
  ArrowLeft,
  CheckSquare,
  Square,
  Upload,
  Trash2,
  PenTool,
  RotateCcw,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Save
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'
import SignatureCanvas from 'react-signature-canvas'

const SurveyStagePage = () => {
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

  const [notes, setNotes] = useState('')
  const [photos, setPhotos] = useState([])
  const [signatureData, setSignatureData] = useState(null)

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/orders/${id}`)
      const orderData = response.data.order
      setOrder(orderData)

      // Check if survey stage already exists
      const stages = response.data.stages || []
      const surveyStage = stages.find(s => s.stage === 'survey')

      if (surveyStage) {
        setIsEditMode(true)
        setExistingStage(surveyStage)

        // Load existing data
        const surveyData = surveyStage.checklist_data
        if (surveyData.notes) {
          setNotes(surveyData.notes)
        }
        if (surveyStage.photos && surveyStage.photos.length > 0) {
          setPhotos(surveyStage.photos.map(p => ({
            name: p.name,
            dataUrl: p.data || p.dataUrl
          })))
        }
        if (surveyStage.signature_data) {
          setSignatureData(surveyStage.signature_data)
        }

      }
    } catch (err) {
      console.error('❌ [SurveyStage] Fetch error:', err)
      toast.error('Nepodarilo sa načítať zákazku.')
      navigate(`/company/orders/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Súbor ${file.name} je príliš veľký (max 5MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotos(prev => [...prev, {
          name: file.name,
          dataUrl: event.target.result,
          file
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoRemove = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
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

    if (!notes.trim()) {
      newErrors.notes = 'Poznámky sú povinné'
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

      const surveyData = {
        notes
      }

      const photosWithData = photos.length > 0 ? photos.map(p => ({
        name: p.name,
        data: p.dataUrl
      })) : []

      if (isEditMode) {
        // Update existing stage
        await api.put(`/api/orders/${id}/stage/${existingStage.id}`, {
          checklist_data: surveyData,
          photos: photosWithData,
          signature_data: signatureData
        })
        toast.success('Obhliadka aktualizovaná.')
      } else {
        // Create new stage
        await api.post(`/api/orders/${id}/stage`, {
          stage: 'survey',
          checklist_data: surveyData,
          photos: photosWithData,
          signature_data: signatureData
        })
        toast.success('Obhliadka dokončená.')
      }

      navigate(`/company/orders/${id}`)
    } catch (err) {
      console.error('❌ [SurveyStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa uložiť obhliadku.')
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
              📋 {isEditMode ? 'Upraviť' : 'Vykonať'} obhliadku
            </h1>
            <p className="text-secondary text-sm md:text-base">
              {order?.order_number} - {order?.client_name}
            </p>
            {isEditMode && (
              <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg inline-flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Upravujete existujúcu obhliadku
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notes */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-accent-500" />
                Poznámky z obhliadky <span className="text-red-500 text-sm">*</span>
              </h2>

              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                  if (errors.notes) {
                    setErrors(prev => ({ ...prev, notes: '' }))
                  }
                }}
                placeholder="Podrobný popis situácie, stav miesta, požiadavky klienta, potrebné úpravy, prístup, merania..."
                className={`input min-h-[200px] text-base ${errors.notes ? 'border-red-500' : ''}`}
                rows="8"
              />

              {errors.notes && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.notes}
                </p>
              )}

              <p className="text-xs text-tertiary mt-2">
                Napíšte dôležité zistenia z obhliadky (stav miesta, potrebné úpravy, prístup, merania, atď.)
              </p>
            </div>

            {/* Photos */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-accent-500" />
                Fotky z obhliadky ({photos.length})
              </h2>

              <label className="btn btn-primary w-full flex items-center justify-center gap-2 cursor-pointer mb-4 py-6 text-lg">
                <Upload className="w-6 h-6" />
                📸 Pridať fotky
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="w-full h-40 md:h-48 object-cover rounded-lg border-2 border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-tertiary mt-3">
                Fotky z obhliadky nie sú povinné, ale pomôžu pri tvorbe ponuky a dokumentácii.
              </p>
            </div>

            {/* Signature */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <PenTool className="w-6 h-6 text-accent-500" />
                Podpis klienta <span className="text-red-500 text-sm">*</span>
              </h2>

              <p className="text-sm text-secondary mb-4">
                Svojim podpisom klient potvrdzuje, že obhliadka bola vykonaná a zistenia sú správne.
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
                  Ukladám...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditMode ? 'Uložiť zmeny' : 'Dokončiť obhliadku'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </CompanyAdminLayout>
  )
}

export default SurveyStagePage
