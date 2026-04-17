import {
  User,
  Clock,
  FileText,
  Wrench,
  CheckCircle,
  PenTool,
  Edit,
  Trash2,
  Calendar as CalendarIcon,
  DollarSign,
  Image as ImageIcon,
  ThumbsUp
} from 'lucide-react'

const OrderActivityTimeline = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-secondary text-sm">Zatiaľ nebola vykonaná žiadna aktivita.</p>
      </div>
    )
  }

  const getActionIcon = (action) => {
    switch (action) {
      case 'order.create':
        return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
      case 'order.stage_complete':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' }
      case 'order.stage_update':
        return { icon: Edit, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' }
      case 'order.update':
        return { icon: Edit, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' }
      case 'order.delete':
        return { icon: Trash2, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' }
      case 'order.client_signature':
        return { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' }
      default:
        return { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' }
    }
  }

  const getActionLabel = (action, details) => {
    switch (action) {
      case 'order.create':
        return 'Vytvorená zákazka'
      case 'order.stage_complete':
        return `Dokončená etapa: ${getStageName(details?.stage)}`
      case 'order.stage_update':
        return `Upravená etapa: ${getStageName(details?.stage)}`
      case 'order.update':
        return 'Aktualizované údaje'
      case 'order.delete':
        return 'Zákazka vymazaná'
      case 'order.client_signature':
        return '✅ Zákazka schválená klientom'
      default:
        return action
    }
  }

  const getStageName = (stage) => {
    switch (stage) {
      case 'survey': return 'Obhliadka'
      case 'quote': return 'Cenová ponuka'
      case 'installation': return 'Montáž'
      case 'completion': return 'Dokončenie'
      default: return stage
    }
  }

  const getDetailsInfo = (action, details) => {
    if (!details) return null

    const items = []

    switch (action) {
      case 'order.create':
        if (details.order_number) items.push({ icon: FileText, text: details.order_number })
        break

      case 'order.stage_complete':
        // Survey
        if (details.stage === 'survey') {
          if (details.photos_count > 0) {
            items.push({ icon: ImageIcon, text: `${details.photos_count} fotiek` })
          }
          if (details.has_notes) {
            items.push({ icon: FileText, text: 'Poznámky z obhliadky' })
          }
          if (details.signed_by) {
            items.push({ icon: PenTool, text: `Podpis: ${details.signed_by}` })
          }
        }
        // Quote
        else if (details.stage === 'quote') {
          if (details.total_price) {
            items.push({ icon: DollarSign, text: `Cena: ${parseFloat(details.total_price).toFixed(2)} €` })
          }
          if (details.scheduled_date) {
            items.push({
              icon: CalendarIcon,
              text: `Dátum: ${new Date(details.scheduled_date).toLocaleDateString('sk-SK')}`
            })
          }
          if (details.signed_by) {
            items.push({ icon: PenTool, text: `Podpis: ${details.signed_by}` })
          }
        }
        // Installation
        else if (details.stage === 'installation') {
          if (details.photos_before || details.photos_after) {
            items.push({
              icon: ImageIcon,
              text: `Fotky: ${details.photos_before || 0} pred, ${details.photos_after || 0} po`
            })
          }
          if (details.signed_by) {
            items.push({ icon: PenTool, text: `Podpis: ${details.signed_by}` })
          }
        }
        // Completion
        else if (details.stage === 'completion') {
          if (details.satisfaction) {
            const stars = '⭐'.repeat(details.satisfaction);
            items.push({ icon: CheckCircle, text: `Spokojnosť: ${stars}` })
          }
          if (details.signed_by) {
            items.push({ icon: PenTool, text: `Podpis: ${details.signed_by}` })
          }
        }
        break

      case 'order.stage_update':
        if (details.changes) {
          items.push({ icon: Edit, text: details.changes })
        }
        break

      case 'order.update':
        if (details.updated_fields && Array.isArray(details.updated_fields)) {
          const fieldNames = details.updated_fields.map(field => {
            switch (field) {
              case 'total_price': return 'cena'
              case 'scheduled_date': return 'dátum'
              case 'assigned_employee_id': return 'technik'
              case 'status': return 'stav'
              case 'notes': return 'poznámky'
              default: return field
            }
          }).join(', ')
          items.push({ icon: Edit, text: `Upravené: ${fieldNames}` })
        }
        break

      case 'order.client_signature':
        if (details.signed_at) {
          items.push({
            icon: CheckCircle,
            text: `Schválené ${new Date(details.signed_at).toLocaleString('sk-SK', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`
          })
        }
        break
    }

    return items
  }

  return (
    <div className="space-y-2">
      {logs.map((log, index) => {
        const { icon: Icon, color, bg } = getActionIcon(log.action)
        const details = log.details || {}
        const detailsInfo = getDetailsInfo(log.action, details)

        return (
          <div key={log.id} className="card p-3">
            <div className="flex items-start gap-3">
              {/* Timeline dot */}
              <div className="relative flex-shrink-0">
                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                {index < logs.length - 1 && (
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-300 dark:bg-gray-700"></div>
                )}
              </div>

              {/* Activity Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-primary text-sm mb-1">
                  {getActionLabel(log.action, details)}
                </h4>

                {/* Timeline entries */}
                <div className="space-y-1.5 text-xs">
                  {/* User + Time */}
                  <div className="flex items-center gap-2 text-secondary">
                    <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="font-medium">{log.user_name}</span>
                    <Clock className="w-3 h-3 text-tertiary flex-shrink-0" />
                    <span className="text-tertiary">
                      {new Date(log.created_at).toLocaleString('sk-SK', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Details */}
                  {detailsInfo && detailsInfo.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-secondary">
                      <item.icon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default OrderActivityTimeline
