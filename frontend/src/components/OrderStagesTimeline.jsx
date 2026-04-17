import {
  CheckCircle,
  FileText,
  Wrench,
  PenTool,
  User,
  Clock
} from 'lucide-react'

const OrderStagesTimeline = ({ stages }) => {
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

  return (
    <div className="space-y-2">
      {stages.map((stage, index) => {
        const { icon: Icon, color, bg } = getStageIcon(stage.stage)
        const photos = stage.photos || []
        const hasSignature = !!stage.signature_data
        const hasClientSignature = !!stage.client_signature_data

        return (
          <div key={stage.id} className="card p-3">
            <div className="flex items-start gap-3">
              {/* Timeline dot */}
              <div className="relative flex-shrink-0">
                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {index < stages.length - 1 && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-300 dark:bg-gray-700"></div>
                )}
              </div>

              {/* Stage Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-primary text-sm mb-1">
                  {getStageName(stage.stage)}
                </h4>

                {/* Timeline entries */}
                <div className="space-y-1.5 text-xs">
                  {/* Created */}
                  <div className="flex items-center gap-2 text-secondary">
                    <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">{stage.created_by || 'Neznámy'}</span>
                    <span className="text-tertiary">vytvoril</span>
                    <Clock className="w-3 h-3 text-tertiary flex-shrink-0" />
                    <span className="text-tertiary">
                      {new Date(stage.completed_at).toLocaleString('sk-SK', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Photos */}
                  {photos.length > 0 && (
                    <div className="flex items-center gap-2 text-secondary">
                      <FileText className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{photos.length} {photos.length === 1 ? 'fotka' : photos.length < 5 ? 'fotky' : 'fotiek'}</span>
                    </div>
                  )}

                  {/* Technician Signature */}
                  {hasSignature && (
                    <div className="flex items-center gap-2 text-secondary">
                      <PenTool className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span>Podpis technika</span>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                  )}

                  {/* Client Signature (for quote stage) */}
                  {hasClientSignature && (
                    <div className="flex items-center gap-2 text-secondary">
                      <PenTool className="w-3.5 h-3.5 text-accent-500 flex-shrink-0" />
                      <span>Podpis klienta</span>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {stage.client_signed_at && (
                        <>
                          <Clock className="w-3 h-3 text-tertiary flex-shrink-0 ml-1" />
                          <span className="text-tertiary">
                            {new Date(stage.client_signed_at).toLocaleString('sk-SK', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}


export default OrderStagesTimeline
