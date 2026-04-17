import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'

const OrdersPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter

      const response = await api.get('/api/orders', { params })
      console.log('📦 [Orders] Loaded:', response.data)
      setOrders(response.data.orders)
    } catch (err) {
      console.error('❌ [Orders] Fetch error:', err)
      toast.error('Nepodarilo sa načítať zákazky.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      survey: { label: 'Obhliadka', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
      quote: { label: 'Cenová ponuka', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
      assigned: { label: 'Čaká na priradenie', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
      in_progress: { label: 'V montáži', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
      completed: { label: 'Dokončené', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
      cancelled: { label: 'Zrušené', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' }
    }
    const badge = statusMap[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' }
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.client_name.toLowerCase().includes(query) ||
      order.client_email?.toLowerCase().includes(query)
    )
  })

  return (
    <CompanyAdminLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">Zákazky</h1>
            <p className="text-sm text-tertiary mt-1">Správa zákaziek a montáží</p>
          </div>
          <button
            onClick={() => navigate('/company/orders/new')}
            className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nová zákazka
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
              <input
                type="text"
                placeholder="Hľadať zákazku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input pl-10 w-full"
                >
                  <option value="all">Všetky statusy</option>
                  <option value="survey">Obhliadka</option>
                  <option value="quote">Cenová ponuka</option>
                  <option value="assigned">Priradené</option>
                  <option value="in_progress">Prebieha</option>
                  <option value="completed">Dokončené</option>
                  <option value="cancelled">Zrušené</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-200 dark:border-accent-700 border-t-accent-600 dark:border-t-accent-400"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card border-2 border-dashed border-primary p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <p className="text-secondary font-medium mb-4">
              {orders.length === 0
                ? 'Zatiaľ nemáte žiadne zákazky. Vytvorte prvú zákazku.'
                : 'Žiadne zákazky podľa zadaného filtra.'}
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => navigate('/company/orders/new')}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Vytvoriť zákazku
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="card-interactive p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-lg text-primary">
                        {order.order_type_name}
                      </h3>
                      {order.status === 'assigned' && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          ✓ Schválené
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-tertiary font-mono">{order.order_number}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                {/* Client Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-secondary">
                    <User className="w-4 h-4 text-tertiary" />
                    <span className="font-medium">{order.client_name}</span>
                  </div>
                  {order.client_phone && (
                    <div className="flex items-center gap-2 text-secondary">
                      <Phone className="w-4 h-4 text-tertiary" />
                      <span>{order.client_phone}</span>
                    </div>
                  )}
                  {order.client_email && (
                    <div className="flex items-center gap-2 text-secondary">
                      <Mail className="w-4 h-4 text-tertiary" />
                      <span>{order.client_email}</span>
                    </div>
                  )}
                  {order.scheduled_date && (
                    <div className="flex items-center gap-2 text-secondary">
                      <Calendar className="w-4 h-4 text-tertiary" />
                      <span>{new Date(order.scheduled_date).toLocaleDateString('sk-SK')}</span>
                    </div>
                  )}
                </div>

                {/* Employee */}
                {order.employee_first_name && (
                  <div className="mb-4 p-2 bg-secondary/10 rounded-lg text-sm">
                    <span className="text-tertiary">Technik: </span>
                    <span className="font-medium text-secondary">
                      {order.employee_first_name} {order.employee_last_name}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/company/orders/${order.id}`)}
                    className="btn btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Detail
                  </button>
                  <button
                    onClick={() => navigate(`/company/orders/${order.id}/edit`)}
                    className="btn btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Upraviť
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CompanyAdminLayout>
  )
}

export default OrdersPage
