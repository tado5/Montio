import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, API_URL } from '../utils/apiClient'
import {
  Building2,
  Users,
  FileText,
  Receipt,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Activity,
  Globe,
  Loader2,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  AlertCircle,
  Trash2
} from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import DeactivateCompanyModal from '../components/DeactivateCompanyModal'
import DeleteCompanyModal from '../components/DeleteCompanyModal'
import KPICard from '../components/KPICard'

const CompanyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Pagination state
  const [logsPage, setLogsPage] = useState(1)
  const [logsLoading, setLogsLoading] = useState(false)

  useEffect(() => {
    fetchCompanyDetail()
  }, [id])

  const fetchCompanyDetail = async () => {
    try {
      const response = await api.get(`/api/companies/${id}`)
      console.log('🏢 [CompanyDetail] Data loaded:', response.data)
      console.log('🖼️ [CompanyDetail] Logo URL:', response.data.company?.logo_url)
      setData(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri načítavaní detailu firmy')
      setLoading(false)
    }
  }

  const loadMoreLogs = async () => {
    if (logsLoading || !data?.logsPagination?.hasMore) return

    setLogsLoading(true)
    try {
      const nextPage = logsPage + 1
      const response = await api.get(`/api/companies/${id}/logs?page=${nextPage}&limit=10`)

      setData(prev => ({
        ...prev,
        logs: [...prev.logs, ...response.data.logs],
        logsPagination: {
          total: response.data.pagination.total,
          loaded: prev.logs.length + response.data.logs.length,
          hasMore: response.data.pagination.page < response.data.pagination.pages
        }
      }))
      setLogsPage(nextPage)
    } catch (err) {
      console.error('Error loading more logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  const handleActivate = async () => {
    setActionLoading(true)
    try {
      await api.put(`/api/companies/${id}/activate`)
      await fetchCompanyDetail()
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri aktivácii firmy')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteSuccess = () => {
    // Redirect back to list after successful deletion
    navigate('/superadmin')
  }

  const handleDeactivateSuccess = () => {
    fetchCompanyDetail()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('sk-SK')
  }

  const getActionColor = (action) => {
    const colors = {
      'user.login': 'blue',
      'user.logout': 'slate',
      'company.create': 'emerald',
      'company.update': 'orange',
      'company.invite': 'orange',
      'company.activate': 'emerald',
      'company.deactivate': 'red',
      'company.delete': 'red',
      'order.create': 'orange',
      'order.complete': 'emerald',
      'invoice.create': 'purple',
      'invoice.paid': 'emerald',
    }
    return colors[action] || 'slate'
  }

  if (loading) {
    return (
      <SuperAdminLayout
        title="LOADING..."
        subtitle="Fetching company data"
        showSearch={false}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-mono text-sm">Loading company details...</p>
          </div>
        </div>
      </SuperAdminLayout>
    )
  }

  if (error) {
    return (
      <SuperAdminLayout
        title="ERROR"
        subtitle="Failed to load data"
        showSearch={false}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center max-w-md backdrop-blur-sm">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 font-mono text-sm mb-4">{error}</p>
            <button
              onClick={() => navigate('/superadmin')}
              className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 rounded-lg text-orange-400 font-mono text-sm transition-all"
            >
              ← Back to list
            </button>
          </div>
        </div>
      </SuperAdminLayout>
    )
  }

  const { company, users, logs, stats } = data

  return (
    <SuperAdminLayout
      title="COMPANY DETAIL"
      subtitle={`Inspecting ${company.name}`}
      showSearch={false}
    >
      {/* Back Button & Actions Bar */}
      <div className="flex items-center justify-between mb-6 animate-slide-down">
        <button
          onClick={() => navigate('/superadmin')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-lg transition-all text-sm font-mono text-slate-300 hover:text-white group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to list</span>
        </button>

        <div className="flex items-center gap-3">
          {company.status === 'pending' && (
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all text-sm font-mono font-bold text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Vymazať
            </button>
          )}
          {company.status === 'active' && (
            <button
              onClick={() => setIsDeactivateModalOpen(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all text-sm font-mono font-bold text-red-400 hover:text-red-300 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Deactivate
            </button>
          )}
          {company.status === 'inactive' && (
            <>
              <button
                onClick={handleActivate}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg transition-all text-sm font-mono font-bold text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                Activate
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-lg transition-all text-sm font-mono font-bold text-red-400 hover:text-red-300 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Vymazať
              </button>
            </>
          )}
        </div>
      </div>

      {/* Company Header Card */}
      <div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-4 md:p-6 mb-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 md:gap-4">
          {company.logo_url ? (
            <img
              src={`${API_URL.replace('/api', '')}${company.logo_url}`}
              alt={company.name}
              className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-contain bg-white shadow-lg shadow-orange-500/20 border border-orange-500/30 flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-lg shadow-orange-500/30 border border-orange-400/30 flex-shrink-0">
              {company.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0 overflow-hidden">
            <h1 className="text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 mb-1 truncate" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              {company.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-mono font-bold rounded-lg border whitespace-nowrap ${
                company.status === 'active'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : company.status === 'inactive'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
              }`}>
                {company.status === 'active' && '● ACTIVE'}
                {company.status === 'pending' && '○ PENDING'}
                {company.status === 'inactive' && '✕ INACTIVE'}
              </span>
              <span className="text-[10px] md:text-xs font-mono text-slate-500 truncate">
                ID: {company.public_id || company.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" style={{ animation: 'slideUp 0.4s ease-out 0.2s both' }}>
        <KPICard
          title="Users"
          value={stats.users}
          subtitle="Registered accounts"
          icon={Users}
          color="info"
        />
        <KPICard
          title="Order Types"
          value={stats.order_types}
          subtitle="Installation configs"
          icon={FileText}
          color="warning"
        />
        <KPICard
          title="Orders"
          value={stats.orders}
          subtitle="Total projects"
          icon={TrendingUp}
          color="success"
        />
        <KPICard
          title="Invoices"
          value={stats.invoices}
          subtitle="Generated docs"
          icon={Receipt}
          color="error"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Company Info */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                COMPANY INFO
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* ICO */}
            <div className="flex items-start gap-3">
              <Hash className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">IČO</div>
                <div className="text-sm font-mono text-white">{company.ico || '—'}</div>
              </div>
            </div>

            {/* DIC */}
            <div className="flex items-start gap-3">
              <Hash className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">DIČ</div>
                <div className="text-sm font-mono text-white">{company.dic || '—'}</div>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Address</div>
                <div className="text-sm font-mono text-white">{company.address || '—'}</div>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Created</div>
                <div className="text-sm font-mono text-white">
                  {company.created_at ? formatDate(company.created_at) : '—'}
                </div>
              </div>
            </div>

            {/* Invite Token */}
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-slate-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">Invite Token</div>
                <div className="text-xs font-mono text-orange-400 bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700/50 break-all">
                  {company.invite_token || '—'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                <h2 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                  USERS
                </h2>
              </div>
              <span className="px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs font-mono font-bold text-orange-400">
                {users.length}
              </span>
            </div>
          </div>
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 font-mono text-sm">No users found</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {users.map((userItem, index) => (
                  <li
                    key={userItem.id}
                    className="bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-lg p-4 transition-all duration-200 group"
                    style={{ animation: `slideInRight 0.3s ease-out ${index * 0.05}s both` }}
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 overflow-hidden">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md bg-slate-700 flex-shrink-0">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userItem.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                            alt="Avatar"
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="font-bold text-white text-sm truncate">
                            {userItem.first_name && userItem.last_name
                              ? `${userItem.first_name} ${userItem.last_name}`
                              : userItem.email}
                          </div>
                          <div className="text-xs font-mono text-slate-400 truncate break-all">
                            {userItem.email}
                          </div>
                          {userItem.position && (
                            <div className="text-xs font-mono text-slate-500 mt-1 truncate">
                              {userItem.position}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-[10px] font-mono font-bold rounded border flex-shrink-0 whitespace-nowrap ${
                        userItem.role === 'companyadmin'
                          ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      }`}>
                        {userItem.role === 'companyadmin' ? 'ADMIN' : 'EMP'}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                Activity Log
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {data?.logsPagination?.loaded || 0} / {data?.logsPagination?.total || 0}
            </span>
          </div>
        </div>
        <div className="p-4">
          {logs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 text-slate-700 mx-auto mb-2" />
              <p className="text-slate-600 text-xs">No activity</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {logs.map((log) => {
                  const color = getActionColor(log.action)
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 py-2 px-3 bg-slate-800/20 hover:bg-slate-800/40 rounded-lg border border-slate-800/50 hover:border-slate-700/50 transition-all duration-150"
                    >
                      {/* Color indicator */}
                      <div className={`w-1 h-8 rounded-full bg-${color}-500/50 flex-shrink-0`}></div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-xs font-mono font-bold text-${color}-400`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">•</span>
                          <span className="text-[10px] font-mono text-slate-500 truncate">
                            {log.user_email}
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-600">
                          {formatDate(log.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Load More Button */}
              {data?.logsPagination?.hasMore && (
                <button
                  onClick={loadMoreLogs}
                  disabled={logsLoading}
                  className="w-full mt-3 py-2 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/50 hover:border-orange-500/30 rounded-lg text-xs font-mono text-slate-400 hover:text-orange-400 transition-all duration-200 disabled:opacity-50"
                >
                  {logsLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    `Load More (${data.logsPagination.total - data.logsPagination.loaded} remaining)`
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Deactivate Modal */}
      <DeactivateCompanyModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        company={company}
        onSuccess={handleDeactivateSuccess}
      />

      {/* Delete Modal */}
      <DeleteCompanyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        company={company}
        onSuccess={handleDeleteSuccess}
      />
    </SuperAdminLayout>
  )
}

export default CompanyDetail
