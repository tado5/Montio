import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  Briefcase,
  Clock,
  MapPin,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import EmployeeLayout from '../components/EmployeeLayout'
import ReadOnlyBanner from '../components/ReadOnlyBanner'
import axios from 'axios'

const EmployeeDashboard = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/dashboard/employee', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDashboardData(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error('Nepodarilo sa načítať dashboard')
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    const date = new Date(dateString)
    return date.toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      assigned: { label: 'Priradené', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      in_progress: { label: 'Prebieha', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
      completed: { label: 'Dokončené', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      cancelled: { label: 'Zrušené', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
    }
    const badge = badges[status] || badges.assigned
    return (
      <span className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <EmployeeLayout
        title="FIELD PORTAL"
        subtitle="Loading your dashboard"
        showSearch={false}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-mono text-sm">Loading dashboard...</p>
          </div>
        </div>
      </EmployeeLayout>
    )
  }

  const stats = dashboardData?.stats || {}

  return (
    <EmployeeLayout
      title="FIELD PORTAL"
      subtitle="Your tasks and schedule"
      showSearch={false}
    >
      <ReadOnlyBanner />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Assigned Orders */}
        <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-6 backdrop-blur-sm animate-slide-down hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/30">
              <Briefcase className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {stats.assignedOrders || 0}
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Priradené zákazky</div>
        </div>

        {/* Completed This Month */}
        <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm animate-slide-down hover:border-blue-500/60 transition-all" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/30">
              <CheckSquare className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {stats.completedThisMonth || 0}
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Tento mesiac</div>
        </div>

        {/* Total Completed */}
        <div className="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-6 backdrop-blur-sm animate-slide-down hover:border-cyan-500/60 transition-all" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/30">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {stats.totalCompleted || 0}
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Celkom dokončených</div>
        </div>

        {/* Upcoming Orders */}
        <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-6 backdrop-blur-sm animate-slide-down hover:border-orange-500/60 transition-all" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center border border-orange-500/30">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>
          <div className="text-4xl font-black text-white mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {stats.upcomingOrders || 0}
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Nasledujúcich 7 dní</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Orders */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up">
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                PRIRADENÉ ÚLOHY
              </h3>
            </div>
          </div>

          <div className="p-6">
            {dashboardData?.assignedOrders?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.assignedOrders.map((order, index) => (
                  <div
                    key={order.id}
                    className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-emerald-500/30 transition-all cursor-pointer group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-mono font-bold text-white mb-1">{order.order_number}</div>
                        <div className="text-xs font-mono text-slate-400 mb-2">{order.client_name}</div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {order.order_type_name && (
                      <div className="text-xs font-mono text-emerald-400 mb-2 flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        {order.order_type_name}
                      </div>
                    )}

                    {order.scheduled_date && (
                      <div className="text-xs font-mono text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(order.scheduled_date)}
                      </div>
                    )}

                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-xs font-mono text-emerald-400 flex items-center gap-1 hover:text-emerald-300">
                        View Details
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckSquare className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-mono text-slate-500">Žiadne priradené úlohy</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                NEDÁVNA AKTIVITA
              </h3>
            </div>
          </div>

          <div className="p-6">
            {dashboardData?.recentActivity?.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.map((order, index) => (
                  <div
                    key={order.id}
                    className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:border-blue-500/30 transition-all"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="text-sm font-mono font-bold text-white mb-1">{order.order_number}</div>
                        <div className="text-xs font-mono text-slate-400">{order.client_name}</div>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    {order.order_type_name && (
                      <div className="text-xs font-mono text-blue-400 mb-1">{order.order_type_name}</div>
                    )}

                    <div className="text-xs font-mono text-slate-500">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-sm font-mono text-slate-500">Žiadna aktivita</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-mono font-bold text-blue-400 mb-2">Informácia pre zamestnancov</h4>
            <p className="text-xs font-mono text-slate-400">
              Zákazky wizard (FÁZA 5) zatiaľ nie je implementovaný, takže nemáte ešte priradené reálne úlohy.
              Po implementácii FÁZY 5 tu uvidíte všetky svoje priradené montáže s detailnými informáciami.
            </p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default EmployeeDashboard
