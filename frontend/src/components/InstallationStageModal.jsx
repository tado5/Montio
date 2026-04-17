import { useState, useRef, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import {
  X,
  Save,
  Upload,
  Trash2,
  CheckSquare,
  Square,
  PenTool,
  RotateCcw,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react'
import { api } from '../utils/apiClient'
import SignatureCanvas from 'react-signature-canvas'

const InstallationStageModal = ({ orderId, orderType, onClose, onSuccess }) => {
  const toast = useToast()
  const signatureRef = useRef(null)

  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [checklist, setChecklist] = useState([])
  const [beforePhotos, setBeforePhotos] = useState([])
  const [afterPhotos, setAfterPhotos] = useState([])
  const [notes, setNotes] = useState('')
  const [signatureData, setSignatureData] = useState(null)

  useEffect(() => {
    // Initialize checklist from order type
    if (orderType?.default_checklist) {
      const items = Array.isArray(orderType.default_checklist)
        ? orderType.default_checklist
        : []

      const checklistItems = items.map(item => {
        if (typeof item === 'string') {
          return { item, checked: false }
        } else if (item.item) {
          return { item: item.item, checked: false, required: item.required || false }
        }
        return null
      }).filter(Boolean)

      setChecklist(checklistItems)
    }
  }, [orderType])

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

    // Check required checklist items
    const uncompletedRequired = checklist.filter(item => item.required && !item.checked)
    if (uncompletedRequired.length > 0) {
      newErrors.checklist = 'Vyplňte všetky povinné položky checklistu'
    }

    if (beforePhotos.length === 0) {
      newErrors.beforePhotos = 'Pridajte aspoň 1 fotku pred montážou'
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
        checklist: checklist,
        notes
      }

      // Combine photos
      const allPhotos = [
        ...beforePhotos.map(p => ({ ...p, type: 'before', data: p.dataUrl })),
        ...afterPhotos.map(p => ({ ...p, type: 'after', data: p.dataUrl }))
      ]

      // Submit stage
      await api.post(`/api/orders/${orderId}/stage`, {
        stage: 'installation',
        checklist_data: installationData,
        photos: allPhotos,
        signature_data: signatureData
      })

      console.log('✅ [InstallationStage] Installation completed')
      toast.success('Montáž dokončená.')
      onSuccess()
    } catch (err) {
      console.error('❌ [InstallationStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa uložiť montáž.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 overflow-y-auto">
      <div className="bg-elevated rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-4xl sm:my-8 max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-slide-up sm:animate-scale-in">
        {/* Header - Sticky */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-primary bg-elevated sticky top-0 z-10">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-display font-bold text-primary truncate">Montáž</h2>
            <p className="text-xs sm:text-sm text-tertiary mt-1">Dokumentácia realizácie montáže</p>
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
            {/* Before Photos */}
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                📷 Fotky PRED montážou ({beforePhotos.length})
                <span className="text-red-500 text-sm">*</span>
              </h3>

              <label className="btn btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer mb-3 py-4 text-base">
                <Upload className="w-5 h-5" />
                📸 Odfotiť PRED
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e, 'before')}
                  className="hidden"
                  disabled={submitting}
                />
              </label>

              {errors.beforePhotos && (
                <p className="text-red-500 text-xs mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.beforePhotos}
                </p>
              )}

              {beforePhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {beforePhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index, 'before')}
                        className="absolute top-1 right-1 p-2 bg-red-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="absolute top-1 left-1 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
                        PRED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checklist */}
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-accent-500" />
                Kontrolný zoznam montáže
              </h3>

              {checklist.length === 0 ? (
                <div className="card p-4 text-center">
                  <p className="text-secondary text-sm">Žiadny checklist.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {checklist.map((item, index) => (
                    <label
                      key={index}
                      className={`
                        flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg cursor-pointer
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
                            className="w-6 h-6 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400"
                            onClick={() => handleChecklistToggle(index)}
                          />
                        ) : (
                          <Square
                            className="w-6 h-6 sm:w-5 sm:h-5 text-tertiary"
                            onClick={() => handleChecklistToggle(index)}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm sm:text-base ${item.checked ? 'text-secondary line-through' : 'text-primary font-medium'}`}>
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
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.checklist}
                </p>
              )}
            </div>

            {/* After Photos */}
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                📷 Fotky PO montáži ({afterPhotos.length})
                <span className="text-red-500 text-sm">*</span>
              </h3>

              <label className="btn bg-emerald-500 hover:bg-emerald-600 text-white w-full flex items-center justify-center gap-2 cursor-pointer mb-3 py-4 text-base">
                <Upload className="w-5 h-5" />
                📸 Odfotiť PO
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={(e) => handlePhotoUpload(e, 'after')}
                  className="hidden"
                  disabled={submitting}
                />
              </label>

              {errors.afterPhotos && (
                <p className="text-red-500 text-xs mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.afterPhotos}
                </p>
              )}

              {afterPhotos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {afterPhotos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index, 'after')}
                        className="absolute top-1 right-1 p-2 bg-red-500 text-white rounded-lg shadow-lg active:scale-95 transition-transform"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <span className="absolute top-1 left-1 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                        PO
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Poznámky z montáže
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Priebeh montáže, problémy, odchýlky od plánu..."
                className="input min-h-[100px]"
                rows="4"
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
                  🔧 Dokončiť montáž
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default InstallationStageModal
