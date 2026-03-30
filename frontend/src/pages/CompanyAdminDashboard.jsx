import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  FileText,
  Euro,
  Users,
  Receipt,
  Plus,
  Calendar,
  Wrench,
  TrendingUp
} from 'lucide-react'
import CompanyAdminLayout from '../components/CompanyAdminLayout'
import KPICard from '../components/KPICard'
import axios from 'axios'

const CompanyAdminDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data.stats)
      setError(null)
    } catch (err) {
      console.error('Fetch stats error:', err)
      setError('Nepodarilo sa načítať štatistiky.')
      toast.error('Nepodarilo sa načítať štatistiky')
    } finally {
      setLoading(false)
    }
  }

  const quickActions = [
    {
      label: 'Nová zákazka',
      icon: Plus,
      color: 'from-blue-500 to-cyan-500',
      onClick: () => toast.info('Zákazky - Coming Soon'),
      disabled: true
    },
    {
      label: 'Pridať zamestnanca',
      icon: Users,
      color: 'from-accent-500 to-accent-600',
      onClick: () => navigate('/company/employees')
    },
    {
      label: 'Vytvoriť faktúru',
      icon: Receipt,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => toast.info('Fakturácia - Coming Soon'),
      disabled: true
    }
  ]

  return (
    <CompanyAdminLayout
      title="OPERATIONS HUB"
      subtitle="Company performance overview"
      showSearch={false}
    >
      {/* Page Content */}
      {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <KPICard key={i} loading={true} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 text-center animate-slide-down">
              <p className="text-red-700 dark:text-red-300 font-semibold">{error}</p>
            </div>
          ) : stats ? (
            <>
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <KPICard
                  title="Celkom zákaziek"
                  value={stats.orders.total}
                  subtitle={`${stats.orders.active} aktívnych`}
                  icon={FileText}
                  color="info"
                />
                <KPICard
                  title="Príjem tento mesiac"
                  value={`${stats.revenue.this_month.toFixed(0)}€`}
                  subtitle={`Celkom: ${stats.revenue.total.toFixed(0)}€`}
                  icon={Euro}
                  color="success"
                  trend="up"
                  trendValue="+12%"
                />
                <KPICard
                  title="Aktívni zamestnanci"
                  value={stats.employees.active}
                  subtitle="Spravovať tím"
                  icon={Users}
                  color="primary"
                />
                <KPICard
                  title="Nezaplatené faktúry"
                  value={stats.invoices.pending}
                  subtitle="Fakturácia"
                  icon={Receipt}
                  color="warning"
                />
              </div>

              {/* Order Details Card */}
              <div className="card p-6 mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-display font-bold text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent-500" />
                  Prehľad zákaziek
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-secondary font-medium mb-1">Aktívne</p>
                    <p className="text-2xl md:text-3xl font-display font-bold text-blue-600 dark:text-blue-400">
                      {stats.orders.active}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-secondary font-medium mb-1">Dokončené</p>
                    <p className="text-2xl md:text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400">
                      {stats.orders.completed}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                    <p className="text-sm text-secondary font-medium mb-1">Zrušené</p>
                    <p className="text-2xl md:text-3xl font-display font-bold text-red-600 dark:text-red-400">
                      {stats.orders.cancelled}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-6 mb-6 md:mb-8">
                <h2 className="text-lg md:text-xl font-display font-bold text-primary mb-4">Rýchle akcie</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      disabled={action.disabled}
                      className={`
                        flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-white
                        bg-gradient-to-r ${action.color}
                        transition-all duration-200
                        ${action.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:shadow-medium hover:scale-[1.02] active:scale-[0.98]'
                        }
                      `}
                    >
                      <action.icon className="w-5 h-5" />
                      <span className="text-sm md:text-base">{action.label}</span>
                      {action.disabled && (
                        <span className="ml-auto badge bg-white/20 text-white text-xs">Soon</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="card p-6 border-2 border-dashed border-accent-500/30">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-primary mb-1">Kalendár</h3>
                      <span className="badge badge-success">Implementované</span>
                    </div>
                  </div>
                  <p className="text-sm text-secondary">
                    Plánovanie a správa zákaziek v kalendárnom pohľade s FullCalendar integráciou.
                  </p>
                </div>

                <div className="card p-6 border-2 border-dashed border-accent-500/30">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-lg text-primary mb-1">Typy montáží</h3>
                      <span className="badge badge-success">Implementované</span>
                    </div>
                  </div>
                  <p className="text-sm text-secondary">
                    Správa typov montáží a ich checklistov. Aktuálne máte {stats.order_types} typov.
                  </p>
                </div>
              </div>
            </>
          ) : null}
    </CompanyAdminLayout>
  )
}

export default CompanyAdminDashboard
