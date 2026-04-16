import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Eye,
  Mail,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react'
import { api } from '../utils/apiClient'
import SuperAdminLayout from '../components/SuperAdminLayout'
import CreateCompanyModal from '../components/CreateCompanyModal'
import KPICard from '../components/KPICard'

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/api/auth/companies')
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

      // Handle date sorting for created_at
      if (sortField === 'created_at') {
        aVal = aVal ? new Date(aVal).getTime() : 0
        bVal = bVal ? new Date(bVal).getTime() : 0
      } else if (typeof aVal === 'string') {
        // Convert to lowercase for string comparison
        aVal = aVal.toLowerCase()
        bVal = typeof bVal === 'string' ? bVal.toLowerCase() : bVal
      }

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
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
  }

  // Calculate stats
  const stats = {
    total: companies.length,
    active: companies.filter(c => c.status === 'active').length,
    pending: companies.filter(c => c.status === 'pending').length,
    inactive: companies.filter(c => c.status === 'inactive').length
  }

  return (
    <SuperAdminLayout
      title="SYSTEM CONTROL"
      subtitle="Managing all company operations"
      showSearch={false}
    >
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              {[...Array(4)].map((_, i) => (
                <KPICard key={i} loading={true} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div onClick={() => setStatusFilter('all')} className="cursor-pointer">
                <KPICard
                  title="Celkom firiem"
                  value={stats.total}
                  subtitle="Všetky registrované"
                  icon={Building2}
                  color="info"
                />
              </div>
              <div onClick={() => setStatusFilter('active')} className="cursor-pointer">
                <KPICard
                  title="Aktívne firmy"
                  value={stats.active}
                  subtitle="Plne funkčné"
                  icon={CheckCircle2}
                  color="success"
                />
              </div>
              <div onClick={() => setStatusFilter('pending')} className="cursor-pointer">
                <KPICard
                  title="Čakajúce firmy"
                  value={stats.pending}
                  subtitle="Na aktiváciu"
                  icon={Clock}
                  color="warning"
                />
              </div>
              <div onClick={() => setStatusFilter('inactive')} className="cursor-pointer">
                <KPICard
                  title="Neaktívne firmy"
                  value={stats.inactive}
                  subtitle="Deaktivované"
                  icon={XCircle}
                  color="error"
                />
              </div>
            </div>
          )}

        <div className="mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-primary">Firmy v systéme</h2>
              <p className="text-sm text-tertiary font-medium mt-1">
                Zobrazených: {filteredCompanies.length} z {stats.total} firiem
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto items-stretch">
              {/* Search */}
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary" />
                <input
                  type="text"
                  placeholder="Hľadať firmu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-10 pr-4 py-2.5 bg-elevated border border-primary/20 focus:border-accent-500 rounded-xl text-sm text-primary placeholder:text-tertiary transition-all duration-200"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tertiary pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-elevated border border-primary/20 focus:border-accent-500 rounded-xl text-sm text-primary transition-all duration-200 cursor-pointer"
                >
                  <option value="all">Všetky stavy</option>
                  <option value="active">Aktívne</option>
                  <option value="pending">Čakajúce</option>
                  <option value="inactive">Neaktívne</option>
                </select>
              </div>

              {/* Add Company Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap flex items-center justify-center gap-2 text-sm border-2 border-orange-400/30"
              >
                <Mail className="w-4 h-4" />
                <span>Pozvať firmu</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-xl p-4 mb-4 text-center">
              <p className="text-sm text-red-700 dark:text-red-300 font-semibold">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-accent-200 dark:border-accent-700 border-t-accent-600 dark:border-t-accent-400"></div>
              <p className="mt-3 text-sm text-secondary font-medium">Načítavanie...</p>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-sm backdrop-blur-sm">
              {filteredCompanies.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-accent rounded-xl flex items-center justify-center">
                    {searchQuery || statusFilter !== 'all' ? (
                      <Search className="w-6 h-6 text-white" />
                    ) : (
                      <Building2 className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <p className="text-sm text-secondary font-medium">
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
                      className="mt-3 text-sm text-accent-500 hover:text-accent-600 font-semibold hover:underline"
                    >
                      Vymazať filtre
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table - hidden on mobile */}
                  <div className="hidden md:block">
                    <table className="min-w-full divide-y divide-slate-700/50">
                      <thead className="bg-slate-800/50">
                        <tr>
                          <th
                            onClick={() => handleSort('name')}
                            className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors duration-200"
                          >
                            <div className="flex items-center gap-1.5">
                              Názov
                              <span className="text-accent-500">{getSortIcon('name')}</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wide w-40">
                            DIČ
                          </th>
                          <th
                            onClick={() => handleSort('created_at')}
                            className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors duration-200 w-48"
                          >
                            <div className="flex items-center gap-1.5">
                              Vytvorené
                              <span className="text-accent-500">{getSortIcon('created_at')}</span>
                            </div>
                          </th>
                          <th
                            onClick={() => handleSort('status')}
                            className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wide cursor-pointer hover:bg-slate-700/50 transition-colors duration-200 w-44"
                          >
                            <div className="flex items-center gap-1.5">
                              Status
                              <span className="text-accent-500">{getSortIcon('status')}</span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-secondary uppercase tracking-wide w-40">
                            Akcie
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-900/30 divide-y divide-slate-700/30">
                        {filteredCompanies.map((company, index) => (
                          <tr
                            key={company.public_id || company.id}
                            className="hover:bg-slate-800/50 transition-all duration-200 group"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3 min-w-0">
                                {company.logo_url && company.status === 'active' ? (
                                  <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="w-8 h-8 rounded-lg object-contain bg-white shadow-sm group-hover:shadow-md transition-all duration-200 flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm group-hover:shadow-md transition-all duration-200 flex-shrink-0">
                                    {company.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <span className="text-sm font-semibold text-primary group-hover:text-accent-500 transition-colors duration-200 truncate">
                                  {company.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                              {company.dic || '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">
                              {company.created_at ? new Date(company.created_at).toLocaleDateString('sk-SK', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                              }) : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                company.status === 'active'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : company.status === 'inactive'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              }`}>
                                {company.status === 'active' && 'Aktívna'}
                                {company.status === 'pending' && 'Čakajúca'}
                                {company.status === 'inactive' && 'Neaktívna'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button
                                onClick={() => navigate(`/superadmin/company/${company.public_id}`)}
                                className="px-3 py-1.5 bg-gradient-accent text-white text-sm font-semibold rounded-xl hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Detail</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards - visible only on mobile */}
                  <div className="md:hidden p-3 space-y-3">
                    {filteredCompanies.map((company, index) => (
                      <div
                        key={company.public_id || company.id}
                        onClick={() => navigate(`/superadmin/company/${company.public_id}`)}
                        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800/50 transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-sm"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
                            {company.logo_url && company.status === 'active' ? (
                              <img
                                src={company.logo_url}
                                alt={company.name}
                                className="w-12 h-12 rounded-xl object-contain bg-white shadow-sm flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm flex-shrink-0">
                                {company.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h3 className="text-base font-bold text-white truncate">{company.name}</h3>
                              <p className="text-xs text-slate-400 mt-0.5 truncate">DIČ: {company.dic || '-'}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                            company.status === 'active'
                              ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30'
                              : company.status === 'inactive'
                              ? 'bg-red-900/30 text-red-400 border border-red-500/30'
                              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {company.status === 'active' && 'Aktívna'}
                            {company.status === 'pending' && 'Čakajúca'}
                            {company.status === 'inactive' && 'Neaktívna'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-700/50">
                          <span>
                            {company.created_at ? new Date(company.created_at).toLocaleDateString('sk-SK', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit'
                            }) : '-'}
                          </span>
                          <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
                            <span>Otvoriť</span>
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

      {/* Create Company Modal */}
      <CreateCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
    </SuperAdminLayout>
  )
}

export default SuperAdminDashboard
