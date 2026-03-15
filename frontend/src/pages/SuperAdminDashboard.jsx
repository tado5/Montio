import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'
import CreateCompanyModal from '../components/CreateCompanyModal'

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('id')
  const [sortDirection, setSortDirection] = useState('asc')

  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/auth/companies')
      setCompanies(response.data)
      setFilteredCompanies(response.data)
      setLoading(false)
    } catch (err) {
      setError('Chyba pri načítavaní firiem')
      setLoading(false)
    }
  }

  const handleCompanyCreated = (data) => {
    // Refresh companies list
    fetchCompanies()
  }

  // Filter and sort companies
  useEffect(() => {
    let filtered = companies

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ico?.includes(searchQuery) ||
        company.dic?.includes(searchQuery)
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter)
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortField]
      let bVal = b[sortField]

      // Handle null/undefined values
      if (!aVal) aVal = ''
      if (!bVal) bVal = ''

      // Convert to lowercase for string comparison
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredCompanies(sorted)
  }, [searchQuery, statusFilter, companies, sortField, sortDirection])

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // New field, default to ascending
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field) => {
    if (sortField !== field) return '⇅'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  // Calculate stats
  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    pending: companies.filter(c => c.status === 'pending').length,
    inactive: companies.filter(c => c.status === 'inactive').length
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Spravujte všetky firmy v systéme</p>
            </div>
            <UserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setStatusFilter('all')}>
              <div className="text-blue-100 text-sm font-semibold mb-2 uppercase tracking-wide">Celkom firiem</div>
              <div className="text-4xl font-black text-white mb-2">{stats.total}</div>
              <div className="text-blue-100 text-xs">Všetky registrované</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setStatusFilter('active')}>
              <div className="text-green-100 text-sm font-semibold mb-2 uppercase tracking-wide">✓ Aktívne</div>
              <div className="text-4xl font-black text-white mb-2">{stats.active}</div>
              <div className="text-green-100 text-xs">Plne funkčné firmy</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setStatusFilter('pending')}>
              <div className="text-yellow-100 text-sm font-semibold mb-2 uppercase tracking-wide">⏳ Pending</div>
              <div className="text-4xl font-black text-white mb-2">{stats.pending}</div>
              <div className="text-yellow-100 text-xs">Čakajú na aktiváciu</div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setStatusFilter('inactive')}>
              <div className="text-red-100 text-sm font-semibold mb-2 uppercase tracking-wide">❌ Neaktívne</div>
              <div className="text-4xl font-black text-white mb-2">{stats.inactive}</div>
              <div className="text-red-100 text-xs">Deaktivované</div>
            </div>
          </div>

        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Firmy v systéme</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Zobrazených: {filteredCompanies.length} z {stats.total} firiem
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 lg:w-64">
                <input
                  type="text"
                  placeholder="Hľadať firmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <span className="absolute left-3 top-3 text-gray-400">🔍</span>
              </div>

              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 font-semibold"
              >
                <option value="all">Všetky stavy</option>
                <option value="active">✓ Aktívne</option>
                <option value="pending">⏳ Pending</option>
                <option value="inactive">❌ Neaktívne</option>
              </select>

              {/* Add Company Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
              >
                📧 Pozvať firmu
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 dark:border-purple-700 border-t-purple-600 dark:border-t-purple-400"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Načítavanie...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {filteredCompanies.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">
                    {searchQuery || statusFilter !== 'all' ? '🔍' : '🏢'}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    {searchQuery || statusFilter !== 'all'
                      ? 'Žiadne výsledky pre zadané kritériá'
                      : 'Žiadne firmy v systéme'}
                  </p>
                  {(searchQuery || statusFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('all')
                      }}
                      className="mt-4 text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                    >
                      Vymazať filtre
                    </button>
                  )}
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    <tr>
                      <th
                        onClick={() => handleSort('id')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          ID
                          <span className="text-purple-500">{getSortIcon('id')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('name')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          Názov
                          <span className="text-purple-500">{getSortIcon('name')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('ico')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          IČO
                          <span className="text-purple-500">{getSortIcon('ico')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('dic')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          DIČ
                          <span className="text-purple-500">{getSortIcon('dic')}</span>
                        </div>
                      </th>
                      <th
                        onClick={() => handleSort('status')}
                        className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-2">
                          Status
                          <span className="text-purple-500">{getSortIcon('status')}</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                        Akcie
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredCompanies.map((company, index) => (
                      <tr
                        key={company.id}
                        className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-all duration-200 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:from-purple-100 group-hover:to-pink-100 dark:group-hover:from-purple-800 dark:group-hover:to-pink-800 rounded-lg font-bold text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-200 text-sm transition-all duration-200">
                            {company.id}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {company.logo_url && company.status === 'active' ? (
                              <img
                                src={company.logo_url}
                                alt={company.name}
                                className="w-10 h-10 rounded-lg object-cover shadow-md group-hover:shadow-lg transition-all duration-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-md group-hover:shadow-lg transition-all duration-200">
                                {company.name.charAt(0)}
                              </div>
                            )}
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors duration-200">
                              {company.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {company.ico || '-'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {company.dic || '-'}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full shadow-sm ${
                            company.status === 'active'
                              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                              : company.status === 'inactive'
                              ? 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
                          }`}>
                            {company.status === 'active' && '✓ Aktívna'}
                            {company.status === 'pending' && '⏳ Pending'}
                            {company.status === 'inactive' && '❌ Neaktívna'}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/superadmin/company/${company.id}`)}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 flex items-center gap-2"
                          >
                            <span>👁️</span>
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
    </div>
    </div>
  )
}

export default SuperAdminDashboard
