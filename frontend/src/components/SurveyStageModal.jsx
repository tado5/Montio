import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import {
  X,
  Save,
  Upload,
  Trash2,
  CheckSquare,
  Square,
  AlertCircle
} from 'lucide-react'
import { api } from '../utils/apiClient'

const SurveyStageModal = ({ orderId, orderType, onClose, onSuccess }) => {
  const toast = useToast()

  const [submitting, setSubmitting] = useState(false)
  const [checklist, setChecklist] = useState([])
  const [photos, setPhotos] = useState([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    // Initialize checklist from order type
    if (orderType?.default_checklist) {
      const items = Array.isArray(orderType.default_checklist)
        ? orderType.default_checklist
        : []

      const checklistItems = items.map(item => {
        // Handle both string and object formats
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

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check required items
    const uncompletedRequired = checklist.filter(item => item.required && !item.checked)
    if (uncompletedRequired.length > 0) {
      toast.error('Vyplňte všetky povinné položky checklistu.')
      return
    }

    try {
      setSubmitting(true)

      // Prepare checklist data
      const checklistData = {
        items: checklist,
        notes
      }

      // Prepare photos (convert to base64)
      const photoData = photos.map(photo => ({
        name: photo.name,
        data: photo.dataUrl
      }))

      // Submit stage
      await api.post(`/api/orders/${orderId}/stage`, {
        stage: 'survey',
        checklist_data: checklistData,
        photos: photoData
      })

      console.log('✅ [SurveyStage] Survey completed')
      toast.success('Obhliadka dokončená.')
      onSuccess()
    } catch (err) {
      console.error('❌ [SurveyStage] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa uložiť obhliadku.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-elevated rounded-2xl shadow-xl max-w-3xl w-full my-8 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary">
          <div>
            <h2 className="text-2xl font-display font-bold text-primary">Obhliadka</h2>
            <p className="text-sm text-tertiary mt-1">Dokumentácia obhliadky montáže</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2"
            disabled={submitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
            {/* Checklist */}
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-accent-500" />
                Kontrolný zoznam
              </h3>

              {checklist.length === 0 ? (
                <div className="card p-4 text-center">
                  <p className="text-secondary text-sm">
                    Žiadny checklist pre tento typ montáže.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {checklist.map((item, index) => (
                    <label
                      key={index}
                      className={`
                        flex items-start gap-3 p-3 rounded-lg cursor-pointer
                        transition-all duration-200
                        ${item.checked
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500'
                          : 'bg-secondary/10 border-2 border-transparent hover:border-primary'
                        }
                      `}
                    >
                      <div className="flex items-center h-6">
                        {item.checked ? (
                          <CheckSquare
                            className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                            onClick={() => handleChecklistToggle(index)}
                          />
                        ) : (
                          <Square
                            className="w-5 h-5 text-tertiary"
                            onClick={() => handleChecklistToggle(index)}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm ${item.checked ? 'text-secondary line-through' : 'text-primary font-medium'}`}>
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
            </div>

            {/* Photos */}
            <div>
              <h3 className="text-lg font-display font-bold text-primary mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent-500" />
                Fotografie ({photos.length})
              </h3>

              {/* Upload Button */}
              <label className="btn btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer mb-4">
                <Upload className="w-4 h-4" />
                Nahrať fotky
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={submitting}
                />
              </label>

              {/* Photo Grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        className="w-full h-32 object-cover rounded-lg border-2 border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handlePhotoRemove(index)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-tertiary mt-1 truncate">{photo.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Poznámky z obhliadky
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Poznámky, zistenia, požiadavky klienta..."
                className="input min-h-[100px]"
                rows="4"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-primary">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={submitting}
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Ukladám...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Dokončiť obhliadku
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SurveyStageModal
