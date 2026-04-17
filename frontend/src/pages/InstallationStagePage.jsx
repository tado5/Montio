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
  Image as ImageIcon,
  AlertCircle,
  Wrench,
  Save
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'
import SignatureCanvas from 'react-signature-canvas'

const InstallationStagePage = () => {
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

  const [beforePhotos, setBeforePhotos] = useState([])
  const [checklist, setChecklist] = useState([])
  const [afterPhotos, setAfterPhotos] = useState([])
  const [notes, setNotes] = useState('')
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

      // Check if installation stage already exists
      const stages = response.data.stages || []
      const installationStage = stages.find(s => s.stage === 'installation')

      if (installationStage) {
        setIsEditMode(true)
        setExistingStage(installationStage)

        const installationData = installationStage.checklist_data
        if (installationData.checklist) setChecklist(installationData.checklist)
        if (installationData.notes) setNotes(installationData.notes)

        if (installationStage.photos && installationStage.photos.length > 0) {
          const before = installationStage.photos.filter(p => p.type === 'before').map(p => ({
            name: p.name, dataUrl: p.data || p.dataUrl
          }))
          const after = installationStage.photos.filter(p => p.type === 'after').map(p => ({
            name: p.name, dataUrl: p.data || p.dataUrl
          }))
          setBeforePhotos(before)
          setAfterPhotos(after)
        }

        if (installationStage.signature_data) setSignatureData(installationStage.signature_data)
      }

      // Initialize checklist from order type if not loaded
      if (!installationStage || !installationStage.checklist_data?.checklist) {
        if (orderData.default_checklist) {
          const items = Array.isArray(orderData.default_checklist) ? orderData.default_checklist : []
          const checklistItems = items.map(item => {
            if (typeof item === 'string') return { item, checked: false }
            if (item.item) return { item: item.item, checked: false, required: item.required || false }
            return null
          }).filter(Boolean)
          setChecklist(checklistItems)
        }
      }
    } catch (err) {
      console.error('❌ [InstallationStage] Fetch error:', err)
      toast.error('Nepodarilo sa načítať zákazku.')
      navigate(`/company/orders/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChecklistToggle = (index) => {
    setChecklist(prev => prev.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    ))
  }

  const handlePhotoUpload = (e, type) => {
    const files = Array.from(e.target.files)

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Súbor ${file.name} je príliš veľký (max 5MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        const photo = {
          name: file.name,
          dataUrl: event.target.result,
          file
        }

        if (type === 'before') {
          setBeforePhotos(prev => [...prev, photo])
        } else {
          setAfterPhotos(prev => [...prev, photo])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoRemove = (index, type) => {
    if (type === 'before') {
      setBeforePhotos(prev => prev.filter((_, i) => i !== index))
    } else {
      setAfterPhotos(prev => prev.filter((_, i) => i !== index))
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

    if (beforePhotos.length === 0) {
      newErrors.beforePhotos = 'Pridajte aspoň 1 fotku pred montážou'
    }

    const uncompletedRequired = checklist.filter(item => item.required && !item.checked)
    if (uncompletedRequired.length > 0) {
      newErrors.checklist = 'Dokončte všetky povinné položky checklistu'
    }

    if (afterPhotos.length === 0) {
      newErrors.afterPhotos = 'Pridajte aspoň 1 fotku po montáži'
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

      const installationData = {
        checklist,
        notes
      }

      // Combine photos with type labels
      const allPhotos = [
        ...beforePhotos.map(p => ({ name: p.name, data: p.dataUrl, type: 'before' })),
        ...afterPhotos.map(p => ({ name: p.name, data: p.dataUrl, type: 'after' }))
      ]

      if (isEditMode) {
        await api.put(`/api/orders/${id}/stage/${existingStage.id}`, {
          checklist_data: installationData,
          photos: allPhotos,
          signature_data: signatureData
        })
        toast.success('Montáž aktualizovaná.')
      } else {
        await api.post(`/api/orders/${id}/stage`, {
          stage: 'installation',
          checklist_data: installationData,
          photos: allPhotos,
          signature_data: signatureData
        })
        toast.success('Montáž dokončená.')
      }

      navigate(`/company/orders/${id}`)
    } catch (err) {
      console.error('❌ [InstallationStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa uložiť montáž.')
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
              🔧 {isEditMode ? 'Upraviť' : 'Vykonať'} montáž
            </h1>
            <p className="text-secondary text-sm md:text-base">
              {order?.order_number} - {order?.client_name}
            </p>
            {isEditMode && (
              <div className="mt-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg inline-flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                Upravujete existujúcu montáž
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Before Photos */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-blue-500" />
                📷 Fotky PRED montážou ({beforePhotos.length})
                <span className="text-red-500 text-sm">*</span>
              </h2>

              <label className="btn bg-blue-500 hover:bg-blue-600 text-white w-full flex items-center justify-center gap-2 cursor-pointer mb-4 py-6 text-lg">
                <Upload className="w-6 h-6" />
                📸 Odfotiť PRED
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e, 'before')}
                  className="hidden"
                />
              </label>

              {errors.beforePhotos && (
                <p className="text-red-500 text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.beforePhotos}
                </p>
              )}

              {beforePhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {beforePhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="w-full h-40 md:h-48 object-cover rounded-lg border-2 border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index, 'before')}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <span className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                        PRED
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-tertiary mt-3">
                Odfotografujte stav pred začatím montáže - miesto inštalácie, staré zariadenia, prípadné problémy.
              </p>
            </div>

            {/* Checklist */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <CheckSquare className="w-6 h-6 text-accent-500" />
                Kontrolný zoznam montáže
              </h2>

              {checklist.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-secondary">Žiadny checklist pre tento typ montáže.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checklist.map((item, index) => (
                    <label
                      key={index}
                      className={`
                        flex items-start gap-3 p-4 rounded-lg cursor-pointer
                        transition-all duration-200 active:scale-98
                        ${item.checked
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                          : 'bg-secondary/10 border-2 border-transparent hover:border-primary'
                        }
                      `}
                    >
                      <div className="flex items-center h-6 flex-shrink-0">
                        {item.checked ? (
                          <CheckSquare
                            className="w-7 h-7 text-emerald-600 dark:text-emerald-400"
                            onClick={() => handleChecklistToggle(index)}
                          />
                        ) : (
                          <Square
                            className="w-7 h-7 text-tertiary"
                            onClick={() => handleChecklistToggle(index)}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-base ${item.checked ? 'text-secondary line-through' : 'text-primary font-medium'}`}>
                          {item.item}
                        </span>
                        {item.required && (
                          <span className="ml-2 text-xs text-red-500 font-semibold">* povinné</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {errors.checklist && (
                <p className="text-red-500 text-sm mt-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.checklist}
                </p>
              )}
            </div>

            {/* After Photos */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-emerald-500" />
                📷 Fotky PO montáži ({afterPhotos.length})
                <span className="text-red-500 text-sm">*</span>
              </h2>

              <label className="btn bg-emerald-500 hover:bg-emerald-600 text-white w-full flex items-center justify-center gap-2 cursor-pointer mb-4 py-6 text-lg">
                <Upload className="w-6 h-6" />
                📸 Odfotiť PO
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e, 'after')}
                  className="hidden"
                />
              </label>

              {errors.afterPhotos && (
                <p className="text-red-500 text-sm mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.afterPhotos}
                </p>
              )}

              {afterPhotos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {afterPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="w-full h-40 md:h-48 object-cover rounded-lg border-2 border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index, 'after')}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <span className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                        PO
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Poznámky z montáže
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Priebeh montáže, problémy, odchýlky od plánu, dodatočné práce..."
                  className="input min-h-[120px]"
                  rows="5"
                />
              </div>

              <p className="text-xs text-tertiary mt-3">
                Odfotografujte dokončenú montáž - nainštalované zariadenie zo všetkých strán, detaily pripojení.
              </p>
            </div>

            {/* Signature */}
            <div className="card p-6">
              <h2 className="text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                <PenTool className="w-6 h-6 text-accent-500" />
                Podpis klienta <span className="text-red-500 text-sm">*</span>
              </h2>

              <p className="text-sm text-secondary mb-4">
                Svojim podpisom klient potvrdzuje, že montáž bola vykonaná v súlade s dohodnutými podmienkami a zariadenie bolo odovzdané funkčné.
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
              className="btn bg-emerald-500 hover:bg-emerald-600 text-white w-full flex items-center justify-center gap-2 py-4 text-lg"
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
                  {isEditMode ? 'Uložiť zmeny' : 'Dokončiť montáž'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </CompanyAdminLayout>
  )
}

export default InstallationStagePage
