import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'
import OrderActivityTimeline from '../components/OrderActivityTimeline'

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [order, setOrder] = useState(null)
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchOrderDetail()
  }, [id])

  const fetchOrderDetail = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/orders/${id}`)
      console.log('📦 [OrderDetail] Loaded:', response.data)
      setOrder(response.data.order)
      setActivityLogs(response.data.activity_logs || [])
    } catch (err) {
      console.error('❌ [OrderDetail] Fetch error:', err)
      toast.error('Nepodarilo sa načítať zákazku.')
      navigate('/company/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await api.delete(`/api/orders/${id}`)
      toast.success('Zákazka bola vymazaná.')
      navigate('/company/orders')
    } catch (err) {
      console.error('❌ [OrderDetail] Delete error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa vymazať zákazku.')
      setDeleting(false)
    }
  }


  const getStatusBadge = (status) => {
    const statusMap = {
      survey: { label: 'Obhliadka', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', icon: Clock },
      quote: { label: 'Cenová ponuka', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', icon: FileText },
      assigned: { label: 'Priradené', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300', icon: User },
      in_progress: { label: 'Prebieha', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', icon: Wrench },
      completed: { label: 'Dokončené', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300', icon: CheckCircle },
      cancelled: { label: 'Zrušené', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', icon: AlertCircle }
    }
    const badge = statusMap[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: Clock }
    const Icon = badge.icon
    return (
      <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${badge.color} flex items-center gap-2`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    )
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

  if (!order) {
    return null
  }

  return (
    <CompanyAdminLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="space-y-4 mb-6">
          {/* Back button and title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/company/orders')}
              className="btn btn-ghost p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl md:text-3xl font-display font-bold text-primary truncate">
                  {order.order_number}
                </h1>
                {order.status === 'assigned' && (
                  <span className="px-3 py-1 bg-green-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                    ✓ Schválené klientom
                  </span>
                )}
              </div>
              <p className="text-xs md:text-sm text-tertiary">{order.order_type_name}</p>
            </div>
          </div>

          {/* Status and actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="sm:flex-1">
              {getStatusBadge(order.status)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/company/orders/${id}/edit`)}
                className="btn btn-secondary flex-1 sm:flex-initial flex items-center justify-center gap-2 text-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span className="hidden sm:inline">Upraviť</span>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn bg-red-500 hover:bg-red-600 text-white flex-1 sm:flex-initial flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Vymazať</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Client Info */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent-500" />
                Údaje klienta
              </h2>

              <div className="space-y-3">
                {order.client_is_company && (
                  <>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-tertiary mt-0.5" />
                      <div>
                        <p className="text-xs text-tertiary">Názov firmy</p>
                        <p className="text-sm font-semibold text-secondary">{order.client_company_name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pl-8">
                      {order.client_ico && (
                        <div>
                          <p className="text-xs text-tertiary">IČO</p>
                          <p className="text-sm font-medium text-secondary">{order.client_ico}</p>
                        </div>
                      )}
                      {order.client_dic && (
                        <div>
                          <p className="text-xs text-tertiary">DIČ</p>
                          <p className="text-sm font-medium text-secondary">{order.client_dic}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-tertiary mt-0.5" />
                  <div>
                    <p className="text-xs text-tertiary">{order.client_is_company ? 'Kontaktná osoba' : 'Meno klienta'}</p>
                    <p className="text-sm font-medium text-secondary">{order.client_name}</p>
                  </div>
                </div>

                {order.client_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-tertiary mt-0.5" />
                    <div>
                      <p className="text-xs text-tertiary">Email</p>
                      <p className="text-sm font-medium text-secondary">{order.client_email}</p>
                    </div>
                  </div>
                )}

                {order.client_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-tertiary mt-0.5" />
                    <div>
                      <p className="text-xs text-tertiary">Telefón</p>
                      <p className="text-sm font-medium text-secondary">{order.client_phone}</p>
                    </div>
                  </div>
                )}

                {order.client_address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-tertiary mt-0.5" />
                    <div>
                      <p className="text-xs text-tertiary">Adresa montáže</p>
                      <p className="text-sm font-medium text-secondary whitespace-pre-line">
                        {order.client_address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {order.notes && (
              <div className="card p-4 md:p-6">
                <h2 className="text-base md:text-lg font-display font-bold text-primary mb-3 md:mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-accent-500" />
                  Poznámky
                </h2>
                <p className="text-sm text-secondary whitespace-pre-line">{order.notes}</p>
              </div>
            )}

            {/* Activity Timeline */}
            <div className="card p-4 md:p-6">
              <h2 className="text-base md:text-lg font-display font-bold text-primary mb-3 md:mb-4">História zákazky</h2>
              <OrderActivityTimeline logs={activityLogs} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Order Info */}
            <div className="card p-4 md:p-6">
              <h2 className="text-base md:text-lg font-display font-bold text-primary mb-3 md:mb-4">Informácie</h2>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-tertiary">Číslo zákazky</p>
                  <p className="font-mono font-bold text-secondary">{order.order_number}</p>
                </div>

                <div>
                  <p className="text-tertiary">Typ montáže</p>
                  <p className="font-medium text-secondary">{order.order_type_name}</p>
                </div>

                {order.scheduled_date && (
                  <div>
                    <p className="text-tertiary">Plánovaný dátum</p>
                    <p className="font-medium text-secondary">
                      {new Date(order.scheduled_date).toLocaleDateString('sk-SK', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {order.employee_first_name && (
                  <div>
                    <p className="text-tertiary">Priradený technik</p>
                    <p className="font-medium text-secondary">
                      {order.employee_first_name} {order.employee_last_name}
                    </p>
                    {order.employee_phone && (
                      <p className="text-xs text-tertiary mt-1">{order.employee_phone}</p>
                    )}
                  </div>
                )}

                {order.total_price && (
                  <div>
                    <p className="text-tertiary">Celková cena</p>
                    <p className="font-bold text-lg text-accent-600 dark:text-accent-400">
                      {parseFloat(order.total_price).toFixed(2)} €
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-tertiary">Vytvorené</p>
                  <p className="font-medium text-secondary">
                    {new Date(order.created_at).toLocaleDateString('sk-SK')}
                  </p>
                </div>
              </div>
            </div>

            {/* Stages Progress */}
            <div className="card p-4 md:p-6">
              <h2 className="text-base md:text-lg font-display font-bold text-primary mb-3 md:mb-4">Etapy zákazky</h2>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-secondary">Postup</span>
                  <span className="text-xs font-bold text-accent-600 dark:text-accent-400">
                    {activityLogs.filter(l => l.action === 'order.stage_complete').length}/4 dokončené
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-accent-500 to-accent-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(activityLogs.filter(l => l.action === 'order.stage_complete').length / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {/* Survey Stage */}
                {(() => {
                  const surveyStage = activityLogs.find(l => l.action === 'order.stage_complete' && l.details?.stage === 'survey')
                  return (
                    <div className={`card p-3 ${surveyStage ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500' : 'bg-secondary/10'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📋</span>
                          <div>
                            <p className="font-semibold text-sm text-primary">Obhliadka</p>
                            {surveyStage && (
                              <p className="text-xs text-tertiary">
                                {new Date(surveyStage.created_at).toLocaleDateString('sk-SK')}
                              </p>
                            )}
                          </div>
                        </div>
                        {surveyStage ? (
                          <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                            ✓ Hotovo
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
                            Čaká
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/company/orders/${id}/survey`)}
                        className={`btn w-full text-xs ${surveyStage ? 'btn-secondary' : 'btn-primary'}`}
                      >
                        {surveyStage ? 'Upraviť' : 'Vykonať obhliadku'}
                      </button>
                    </div>
                  )
                })()}

                {/* Quote Stage */}
                {(() => {
                  const quoteStage = activityLogs.find(l => l.action === 'order.stage_complete' && l.details?.stage === 'quote')
                  const canAccessQuote = activityLogs.find(l => l.action === 'order.stage_complete' && l.details?.stage === 'survey')
                  return (
                    <div className={`card p-3 ${quoteStage ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500' : canAccessQuote ? 'bg-secondary/10' : 'bg-gray-100 dark:bg-gray-800 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💰</span>
                          <div>
                            <p className="font-semibold text-sm text-primary">Cenová ponuka</p>
                            {quoteStage && (
                              <p className="text-xs text-tertiary">
                                {parseFloat(order.total_price || 0).toFixed(2)} €
                              </p>
                            )}
                          </div>
                        </div>
                        {quoteStage ? (
                          <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                            ✓ Hotovo
                          </span>
                        ) : canAccessQuote ? (
                          <span className="px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
                            Čaká
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-400 dark:bg-gray-600 text-white text-xs font-bold rounded">
                            🔒 Zamknuté
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/company/orders/${id}/quote`)}
                          disabled={!canAccessQuote}
                          className={`btn flex-1 text-xs ${quoteStage ? 'btn-secondary' : 'btn-primary'} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {quoteStage ? 'Upraviť' : 'Vytvoriť ponuku'}
                        </button>
                        {quoteStage && order.quote_link && (
                          <button
                            onClick={() => {
                              const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin
                              const link = `${baseUrl}/quote/${order.quote_link}`
                              navigator.clipboard.writeText(link)
                              toast.success('Link skopírovaný!')
                            }}
                            className="btn btn-secondary text-xs px-3"
                            title="Kopírovať link pre klienta"
                          >
                            🔗
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Installation Stage */}
                {(() => {
                  const installationStage = activityLogs.find(l => l.action === 'order.stage_complete' && l.details?.stage === 'installation')
                  const canAccessInstallation = activityLogs.find(l => l.action === 'order.stage_complete' && l.details?.stage === 'quote')
                  return (
                    <div className={`card p-3 ${installationStage ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500' : canAccessInstallation ? 'bg-secondary/10' : 'bg-gray-100 dark:bg-gray-800 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🔧</span>
                          <div>
                            <p className="font-semibold text-sm text-primary">Montáž</p>
                            {order.scheduled_date && (
                              <p className="text-xs text-tertiary">
                                {new Date(order.scheduled_date).toLocaleDateString('sk-SK')}
                              </p>
                            )}
                          </div>
                        </div>
                        {installationStage ? (
                          <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                            ✓ Hotovo
                          </span>
                        ) : canAccessInstallation ? (
                          <span className="px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
                            Čaká
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-400 dark:bg-gray-600 text-white text-xs font-bold rounded">
                            🔒 Zamknuté
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/company/orders/${id}/installation`)}
                        disabled={!canAccessInstallation}
                        className={`btn w-full text-xs ${installationStage ? 'btn-secondary' : 'btn-primary'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {installationStage ? 'Upraviť' : 'Vykonať montáž'}
                      </button>
                    </div>
                  )
                })()}

                {/* Completion Stage */}
                {(() => {
                  const completionStage = activityLogs.find(l => l.action === 'order.stage_complete' && l.details?.stage === 'completion')
                  const canAccessCompletion = activityLogs.find(l => l.action === 'order.stage_complete' && l.details?.stage === 'installation')
                  return (
                    <div className={`card p-3 ${completionStage ? 'bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500' : canAccessCompletion ? 'bg-secondary/10' : 'bg-gray-100 dark:bg-gray-800 opacity-60'}`}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">✅</span>
                          <div>
                            <p className="font-semibold text-sm text-primary">Dokončenie</p>
                            {completionStage && (
                              <p className="text-xs text-tertiary">
                                {new Date(completionStage.completed_at).toLocaleDateString('sk-SK')}
                              </p>
                            )}
                          </div>
                        </div>
                        {completionStage ? (
                          <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded">
                            ✓ Hotovo
                          </span>
                        ) : canAccessCompletion ? (
                          <span className="px-2 py-1 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded">
                            Čaká
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-400 dark:bg-gray-600 text-white text-xs font-bold rounded">
                            🔒 Zamknuté
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/company/orders/${id}/completion`)}
                        disabled={!canAccessCompletion}
                        className={`btn w-full text-xs ${completionStage ? 'btn-secondary' : 'bg-green-500 hover:bg-green-600 text-white'} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {completionStage ? 'Upraviť' : 'Dokončiť zákazku'}
                      </button>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-elevated rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display font-bold text-primary mb-2">
                    Vymazať zákazku?
                  </h3>
                  <p className="text-secondary text-sm">
                    Naozaj chcete vymazať zákazku "<strong>{order.order_number}</strong>"?
                    Táto akcia je nevratná.
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn btn-outline flex-1"
                  disabled={deleting}
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleDelete}
                  className="btn flex-1 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Mažem...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Vymazať
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CompanyAdminLayout>
  )
}

export default OrderDetailPage
