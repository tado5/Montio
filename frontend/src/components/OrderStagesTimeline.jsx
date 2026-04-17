import { useState } from 'react'
import {
  CheckCircle,
  FileText,
  Wrench,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar
} from 'lucide-react'

const OrderStagesTimeline = ({ stages }) => {
  const [expandedStage, setExpandedStage] = useState(null)

  if (!stages || stages.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-secondary text-sm">Zatiaľ neboli dokončené žiadne etapy.</p>
      </div>
    )
  }

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'survey':
        return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
      case 'quote':
        return { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' }
      case 'installation':
        return { icon: Wrench, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' }
      case 'completion':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' }
      default:
        return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' }
    }
  }

  const getStageName = (stage) => {
    switch (stage) {
      case 'survey': return '📋 Obhliadka'
      case 'quote': return '💰 Cenová ponuka'
      case 'installation': return '🔧 Montáž'
      case 'completion': return '✅ Dokončenie'
      default: return stage
    }
  }

  const toggleStage = (stageId) => {
    setExpandedStage(expandedStage === stageId ? null : stageId)
  }

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const { icon: Icon, color, bg } = getStageIcon(stage.stage)
        const isExpanded = expandedStage === stage.id
        const photos = stage.photos || []
        const checklistData = stage.checklist_data || {}

        return (
          <div key={stage.id} className="card overflow-hidden">
            {/* Stage Header - Clickable */}
            <button
              onClick={() => toggleStage(stage.id)}
              className="w-full p-4 flex items-center gap-3 hover:bg-secondary/5 transition-colors"
            >
              {/* Timeline dot */}
              <div className="relative flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                {index < stages.length - 1 && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-primary"></div>
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-display font-bold text-primary text-sm sm:text-base">
                    {getStageName(stage.stage)}
                  </h4>
                  {photos.length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-secondary/10 rounded-full flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {photos.length}
                    </span>
                  )}
                </div>
                <p className="text-xs text-tertiary flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(stage.completed_at).toLocaleString('sk-SK', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Expand Icon */}
              <div className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-tertiary" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-tertiary" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-4 border-t border-primary">
                {/* Survey Stage Content */}
                {stage.stage === 'survey' && checklistData.items && (
                  <div className="pt-4">
                    <h5 className="text-sm font-semibold text-secondary mb-2">Checklist:</h5>
                    <div className="space-y-1">
                      {checklistData.items.map((item, idx) => (
                        <div key={idx} className="text-sm text-secondary flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>{item.item}</span>
                        </div>
                      ))}
                    </div>
                    {checklistData.notes && (
                      <div className="mt-3">
                        <h5 className="text-sm font-semibold text-secondary mb-1">Poznámky:</h5>
                        <p className="text-sm text-secondary">{checklistData.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Quote Stage Content */}
                {stage.stage === 'quote' && (
                  <div className="pt-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {checklistData.materials_cost && (
                        <div>
                          <p className="text-xs text-tertiary">Materiál:</p>
                          <p className="text-sm font-semibold text-secondary">
                            {parseFloat(checklistData.materials_cost).toFixed(2)} €
                          </p>
                        </div>
                      )}
                      {checklistData.labor_cost && (
                        <div>
                          <p className="text-xs text-tertiary">Práca:</p>
                          <p className="text-sm font-semibold text-secondary">
                            {parseFloat(checklistData.labor_cost).toFixed(2)} €
                          </p>
                        </div>
                      )}
                      {checklistData.vat_amount !== undefined && (
                        <div>
                          <p className="text-xs text-tertiary">DPH ({checklistData.vat_rate}%):</p>
                          <p className="text-sm font-semibold text-secondary">
                            {parseFloat(checklistData.vat_amount).toFixed(2)} €
                          </p>
                        </div>
                      )}
                      {checklistData.total_price && (
                        <div>
                          <p className="text-xs text-tertiary">Celkom:</p>
                          <p className="text-base font-bold text-accent-600 dark:text-accent-400">
                            {parseFloat(checklistData.total_price).toFixed(2)} €
                          </p>
                        </div>
                      )}
                    </div>
                    {checklistData.notes && (
                      <div>
                        <h5 className="text-sm font-semibold text-secondary mb-1">Poznámky:</h5>
                        <p className="text-sm text-secondary">{checklistData.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Installation Stage Content */}
                {stage.stage === 'installation' && (
                  <div className="pt-4">
                    {checklistData.checklist && checklistData.checklist.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-semibold text-secondary mb-2">Checklist montáže:</h5>
                        <div className="space-y-1">
                          {checklistData.checklist.map((item, idx) => (
                            <div key={idx} className="text-sm text-secondary flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              <span>{item.item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {checklistData.notes && (
                      <div>
                        <h5 className="text-sm font-semibold text-secondary mb-1">Poznámky:</h5>
                        <p className="text-sm text-secondary">{checklistData.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Completion Stage Content */}
                {stage.stage === 'completion' && (
                  <div className="pt-4 space-y-3">
                    {checklistData.client_satisfaction && (
                      <div>
                        <p className="text-xs text-tertiary mb-1">Spokojnosť klienta:</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(rating => (
                            <Star
                              key={rating}
                              className={`w-5 h-5 ${
                                rating <= checklistData.client_satisfaction
                                  ? 'text-amber-500 fill-current'
                                  : 'text-gray-300 dark:text-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {checklistData.warranty_info && (
                      <div>
                        <h5 className="text-sm font-semibold text-secondary mb-1">Záruka:</h5>
                        <p className="text-sm text-secondary">{checklistData.warranty_info}</p>
                      </div>
                    )}
                    {checklistData.final_notes && (
                      <div>
                        <h5 className="text-sm font-semibold text-secondary mb-1">Poznámky:</h5>
                        <p className="text-sm text-secondary">{checklistData.final_notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Photos Grid */}
                {photos.length > 0 && (
                  <div className="pt-4">
                    <h5 className="text-sm font-semibold text-secondary mb-2">
                      Fotografie ({photos.length}):
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo.data || photo.dataUrl}
                            alt={photo.name || `Photo ${idx + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg border-2 border-primary cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => window.open(photo.data || photo.dataUrl, '_blank')}
                          />
                          {photo.type && (
                            <span className={`absolute top-1 left-1 px-2 py-0.5 text-xs font-bold rounded ${
                              photo.type === 'before'
                                ? 'bg-blue-500 text-white'
                                : 'bg-emerald-500 text-white'
                            }`}>
                              {photo.type === 'before' ? 'PRED' : 'PO'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signature */}
                {stage.signature_data && (
                  <div className="pt-4">
                    <h5 className="text-sm font-semibold text-secondary mb-2">Podpis klienta:</h5>
                    <div className="border-2 border-primary rounded-lg p-2 bg-white dark:bg-slate-900 inline-block">
                      <img
                        src={stage.signature_data}
                        alt="Signature"
                        className="h-20 max-w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default OrderStagesTimeline
