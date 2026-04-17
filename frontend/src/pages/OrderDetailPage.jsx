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

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [order, setOrder] = useState(null)
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
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/company/orders')}
              className="btn btn-ghost p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">
                {order.order_number}
              </h1>
              <p className="text-sm text-tertiary mt-1">{order.order_type_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            <button
              onClick={() => navigate(`/company/orders/${id}/edit`)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Upraviť
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Vymazať
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-accent-500" />
                Údaje klienta
              </h2>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-tertiary mt-0.5" />
                  <div>
                    <p className="text-xs text-tertiary">Meno / Názov</p>
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
              <div className="card p-6">
                <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-500" />
                  Poznámky
                </h2>
                <p className="text-sm text-secondary whitespace-pre-line">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Info */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-bold text-primary mb-4">Informácie</h2>

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

            {/* Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-display font-bold text-primary mb-4">Akcie</h2>

              <div className="space-y-2">
                <button className="btn btn-primary w-full">
                  Obhliadka
                </button>
                <button className="btn btn-secondary w-full" disabled>
                  Cenová ponuka
                </button>
                <button className="btn btn-secondary w-full" disabled>
                  Montáž
                </button>
                <button className="btn btn-secondary w-full" disabled>
                  Dokončenie
                </button>
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
