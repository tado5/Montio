import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import {
  Building2,
  Users,
  ClipboardList,
  FileText,
  DollarSign,
  X,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Clock,
  Package,
  Globe
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'
import NotificationBell from '../components/NotificationBell'
import DeactivateCompanyModal from '../components/DeactivateCompanyModal'
import Footer from '../components/Footer'

const CompanyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchCompanyDetail()
  }, [id])

  const fetchCompanyDetail = async () => {
    try {
      const response = await axios.get(`/api/companies/${id}`)
      setData(response.data)
      setLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri načítavaní detailu firmy')
      setLoading(false)
    }
  }

  const handleActivate = async () => {
    setActionLoading(true)
    try {
      await axios.put(`/api/companies/${id}/activate`)
      await fetchCompanyDetail()
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri aktivácii firmy')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeactivateSuccess = () => {
    fetchCompanyDetail()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('sk-SK')
  }

  const getActionBadge = (action) => {
    const colors = {
      'user.login': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      'user.logout': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      'company.create': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'company.update': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      'order.create': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200',
      'order.complete': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      'invoice.create': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
      'invoice.paid': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    }
    return colors[action] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-primary">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-accent-500 animate-spin mx-auto mb-4" />
            <p className="text-secondary font-medium">Načítavanie...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="px-6 py-3 flex justify-between items-center">
              <button
                onClick={() => navigate('/superadmin')}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold inline-flex items-center gap-2 transition-all duration-200 group"
              >
                <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
                Späť
              </button>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <UserMenu />
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">
            <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl font-semibold">
              {error}
            </div>
          </main>
        </div>
      </div>
    )
  }

  const { company, users, logs, stats } = data

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-6 py-2">
            <button
              onClick={() => navigate('/superadmin')}
              className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-semibold text-xs mb-2 inline-flex items-center gap-2 transition-all duration-200 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-200">←</span>
              Späť na zoznam firiem
            </button>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-10 h-10 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {company.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-black text-gray-900 dark:text-white">{company.name}</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Detail firmy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {company.status === 'active' && (
                  <button
                    onClick={() => setIsDeactivateModalOpen(true)}
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    ❌ Deaktivovať
                  </button>
                )}
                {company.status === 'inactive' && (
                  <button
                    onClick={handleActivate}
                    disabled={actionLoading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    ✓ Aktivovať
                  </button>
                )}
                <UserMenu />
              </div>
            </div>
          </div>
        </header>

      {/* Main Container with Sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-2xl">
            <div className="text-blue-100 text-sm font-semibold mb-2 uppercase tracking-wide">👥 Používatelia</div>
            <div className="text-4xl font-black text-white">{stats.users}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-2xl">
            <div className="text-orange-100 text-sm font-semibold mb-2 uppercase tracking-wide">🔧 Typy montáží</div>
            <div className="text-4xl font-black text-white">{stats.order_types}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-2xl">
            <div className="text-orange-100 text-sm font-semibold mb-2 uppercase tracking-wide">📝 Zákazky</div>
            <div className="text-4xl font-black text-white">{stats.orders}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 hover:shadow-2xl">
            <div className="text-orange-100 text-sm font-semibold mb-2 uppercase tracking-wide">💰 Faktúry</div>
            <div className="text-4xl font-black text-white">{stats.invoices}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                🏢 Informácie o firme
              </h2>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">ID</dt>
                  <dd className="mt-1 text-xs font-mono text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-2 rounded break-all">
                    {company.id}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                  <dd className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      company.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : company.status === 'inactive'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {company.status === 'active' && '✓ Aktívna'}
                      {company.status === 'pending' && '⏳ Pending'}
                      {company.status === 'inactive' && '❌ Neaktívna'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">IČO</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{company.ico || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">DIČ</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{company.dic || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Adresa</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">{company.address || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Vytvorené</dt>
                  <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200">
                    {company.created_at ? formatDate(company.created_at) : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Invite Token</dt>
                  <dd className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {company.invite_token || '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                👥 Používatelia
                <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full">
                  {users.length}
                </span>
              </h2>
            </div>
            <div className="p-6">
              {users.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Žiadni používatelia</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {users.map((user) => (
                    <li key={user.id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-4 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200 transform hover:scale-[1.02]">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-700">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                              alt="Avatar"
                              className="w-full h-full"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                              {user.first_name && user.last_name
                                ? `${user.first_name} ${user.last_name}`
                                : user.email}
                            </div>
                            {user.first_name && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{user.email}</div>
                            )}
                            {user.phone && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">📞 {user.phone}</div>
                            )}
                            {user.position && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold mt-1">
                                💼 {user.position}
                              </div>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${
                          user.role === 'companyadmin'
                            ? 'bg-gradient-to-r from-purple-400 to-purple-600 text-white'
                            : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                        }`}>
                          {user.role === 'companyadmin' ? '👑 Admin' : '👷 Employee'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Activity Logs - Timeline */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              📋 Activity Log
              <span className="text-sm font-bold bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full">
                {logs.length}
              </span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-medium">História akcií v systéme</p>
          </div>
          <div className="p-6">
            {logs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">Žiadne záznamy</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, index) => (
                  <div
                    key={log.id}
                    className="relative pl-8 pb-4 border-l-4 border-gray-200 dark:border-gray-700 last:border-0 hover:border-orange-300 dark:hover:border-purple-600 transition-all duration-200 group"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute left-[-10px] top-0 w-5 h-5 rounded-full shadow-lg ${getActionBadge(log.action)} flex items-center justify-center group-hover:scale-125 transition-transform duration-200`}>
                      <div className="w-2 h-2 bg-white dark:bg-gray-800 rounded-full"></div>
                    </div>

                    {/* Log content */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 group-hover:from-blue-50 group-hover:to-purple-50 dark:group-hover:from-blue-900/30 dark:group-hover:to-purple-900/30 rounded-xl p-4 transition-all duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md bg-white dark:bg-gray-700">
                            <img
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(log.user_email)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                              alt="Avatar"
                              className="w-full h-full"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-gray-100">{log.user_email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">
                              {log.user_role}
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full shadow-sm ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 font-semibold">🕐</span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{formatDate(log.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 font-semibold">📦</span>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {log.entity_type}
                            {log.entity_id && <span className="text-gray-500 dark:text-gray-400"> #{log.entity_id}</span>}
                          </span>
                        </div>
                        {log.ip_address && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 font-semibold">🌐</span>
                            <span className="text-gray-700 dark:text-gray-300 font-mono text-xs font-bold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                              {log.ip_address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />

      {/* Deactivate Modal */}
      <DeactivateCompanyModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        company={data?.company}
        onSuccess={handleDeactivateSuccess}
      />
    </div>
  )
}

export default CompanyDetail
