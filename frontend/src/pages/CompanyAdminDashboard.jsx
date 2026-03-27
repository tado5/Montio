import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'
import NotificationBell from '../components/NotificationBell'
import Footer from '../components/Footer'
import axios from 'axios'

const CompanyAdminDashboard = () => {
  const { user } = useAuth()
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-6 py-2 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white">Company Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Prehľad vašej firmy</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Container with Sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {/* KPI Cards */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
              <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
            </div>
          ) : stats ? (
            <>
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Orders Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">📦</div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.orders.total}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Celkom zákaziek</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Aktívne:</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{stats.orders.active}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Dokončené:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">{stats.orders.completed}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Zrušené:</span>
                        <span className="font-bold text-red-600 dark:text-red-400">{stats.orders.cancelled}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">💰</div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                          {stats.revenue.this_month.toFixed(0)}€
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Tento mesiac</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Celkové príjmy:</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {stats.revenue.total.toFixed(0)}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Employees Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">👷</div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.employees.active}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Aktívni zamestnanci</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Spravujte svoj tím v sekcii Zamestnanci
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invoices Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity duration-200"></div>
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">📄</div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.invoices.pending}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">Nezaplatené faktúry</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Spravujte faktúry v sekcii Fakturácia
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-8">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Rýchle akcie</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    <span>📝</span>
                    <span>Nová zákazka</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    <span>👤</span>
                    <span>Pridať zamestnanca</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    <span>💰</span>
                    <span>Vytvoriť faktúru</span>
                  </button>
                </div>
              </div>

              {/* Coming Soon Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-dashed border-orange-300 dark:border-orange-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">📅</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Kalendár</h3>
                      <span className="inline-block bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        FÁZA 4 - In Progress
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Plánovanie a správa zákaziek v kalendárnom pohľade s FullCalendar integráciou.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border-2 border-dashed border-orange-300 dark:border-orange-700">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="text-3xl">🔧</div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Typy montáží</h3>
                      <span className="inline-block bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        FÁZA 4 - In Progress
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Správa typov montáží a ich checklistov. Aktuálne máte {stats.order_types} typov.
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default CompanyAdminDashboard
