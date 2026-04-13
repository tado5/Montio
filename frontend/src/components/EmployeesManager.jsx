import { useState, useEffect } from 'react'
import { useToast } from '../context/ToastContext'
import {
  UserPlus,
  Search,
  Edit2,
  UserX,
  RefreshCw,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  CheckCircle2,
  X,
  Save,
  Lock
} from 'lucide-react'
import { api } from '../utils/apiClient'

const EmployeesManager = () => {
  const toast = useToast()
  const [employees, setEmployees] = useState([])
  const [jobPositions, setJobPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    position: '',
    phone: ''
  })

  useEffect(() => {
    fetchEmployees()
    fetchJobPositions()
  }, [])

  const fetchJobPositions = async () => {
    try {
      const response = await api.get('/api/job-positions')
      setJobPositions(response.data.positions)
    } catch (err) {
      console.error('Fetch job positions error:', err)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/employees')
      setEmployees(response.data.employees)
    } catch (err) {
      console.error('Fetch employees error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa načítať zamestnancov.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({ name: '', email: '', password: '', position: '', phone: '' })
    setShowCreateModal(true)
  }

  const handleEdit = (employee) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '', // Don't pre-fill password
      position: employee.position,
      phone: employee.phone || '',
      status: employee.status
    })
    setShowEditModal(true)
  }

  const handleDelete = (employee) => {
    setSelectedEmployee(employee)
    setShowDeleteModal(true)
  }

  const handleApprove = async (employee) => {
    if (!confirm(`Naozaj chcete schváliť zamestnanca ${employee.name}?`)) {
      return
    }

    try {
      await api.put(`/api/employees/${employee.id}/approve`, {})
      fetchEmployees()
    } catch (err) {
      console.error('Approve employee error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa schváliť zamestnanca.')
    }
  }

  const handleReactivate = async (employee) => {
    if (!confirm(`Naozaj chcete reaktivovať zamestnanca ${employee.name}?`)) {
      return
    }

    try {
      await api.put(`/api/employees/${employee.id}/reactivate`, {})
      fetchEmployees()
      toast.success('Zamestnanec bol reaktivovaný.')
    } catch (err) {
      console.error('Reactivate employee error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa reaktivovať zamestnanca.')
    }
  }

  const handleHardDelete = async (employee) => {
    const confirmMsg = `⚠️ POZOR! Toto je TRVALÉ VYMAZANIE.\n\nZamestnanec: ${employee.name}\nEmail: ${employee.email}\n\nTáto akcia je NEVRATNÁ!\n\nNaozaj chcete natrvalo vymazať tohto zamestnanca?`

    if (!confirm(confirmMsg)) {
      return
    }

    // Double confirmation
    if (!confirm('Potvrďte znova: Naozaj NATRVALO vymazať?')) {
      return
    }

    try {
      await api.delete(`/api/employees/${employee.id}/permanent`)
      fetchEmployees()
      toast.success('Zamestnanec bol natrvalo vymazaný.')
    } catch (err) {
      console.error('Hard delete employee error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa vymazať zamestnanca.')
    }
  }

  const handleResendCredentials = async (employee) => {
    if (!confirm(`Naozaj chcete znovu poslať prihlasovacie údaje pre ${employee.name} na email ${employee.email}?`)) {
      return
    }

    try {
      const response = await api.post(`/api/employees/${employee.id}/resend-credentials`, {})
      toast.success(response.data.message + ' - Email: ' + response.data.email)
    } catch (err) {
      console.error('Resend credentials error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa znovu poslať prihlasovacie údaje.')
    }
  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/api/employees', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        position: formData.position,
        phone: formData.phone || null
      })

      setShowCreateModal(false)
      fetchEmployees()
    } catch (err) {
      console.error('Create employee error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa vytvoriť zamestnanca.')
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/api/employees/${selectedEmployee.id}`, {
        name: formData.name,
        email: formData.email,
        position: formData.position,
        phone: formData.phone || null,
        status: formData.status
      })

      setShowEditModal(false)
      fetchEmployees()
    } catch (err) {
      console.error('Update employee error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa aktualizovať zamestnanca.')
    }
  }

  const handleSubmitDelete = async () => {
    try {
      await api.delete(`/api/employees/${selectedEmployee.id}`)

      setShowDeleteModal(false)
      fetchEmployees()
    } catch (err) {
      console.error('Delete employee error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa deaktivovať zamestnanca.')
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'created': 'Vytvorený',
      'pending_approval': 'Čaká na schválenie',
      'active': 'Aktívny',
      'inactive': 'Neaktívny',
      'deleted': 'Vymazaný'
    }
    return statusMap[status] || status
  }

  const getStatusBadgeClass = (status) => {
    const classMap = {
      'created': 'badge-warning',
      'pending_approval': 'badge-info',
      'active': 'badge-success',
      'inactive': 'badge-neutral',
      'deleted': 'badge-error'
    }
    return classMap[status] || 'badge-neutral'
  }

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary">Zamestnanci</h2>
          <p className="text-sm text-tertiary mt-1">Správa tímu a prístupov</p>
        </div>
        <button
          onClick={handleCreate}
          className="btn btn-primary flex items-center gap-2 whitespace-nowrap"
        >
          <UserPlus className="w-5 h-5" />
          Pridať zamestnanca
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
          <input
            type="text"
            placeholder="Hľadať podľa mena, emailu alebo pozície..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-full md:w-auto"
          >
            <option value="all">Všetci</option>
            <option value="created">Vytvorení</option>
            <option value="pending_approval">Čakajúci na schválenie</option>
            <option value="active">Aktívni</option>
            <option value="inactive">Neaktívni</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-200 dark:border-accent-700 border-t-accent-600 dark:border-t-accent-400"></div>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="card border-2 border-dashed border-primary p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-accent rounded-2xl flex items-center justify-center">
            <Search className="w-8 h-8 text-white" />
          </div>
          <p className="text-secondary font-medium">
            {searchTerm || statusFilter !== 'all'
              ? 'Žiadni zamestnanci nezodpovedajú filtru.'
              : 'Zatiaľ nemáte žiadnych zamestnancov. Vytvorte prvého kliknutím na tlačidlo "Pridať zamestnanca".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="card-interactive p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-primary mb-1">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-secondary mb-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    {employee.position}
                  </p>
                  <p className="text-xs text-tertiary font-mono flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {employee.email}
                  </p>
                  {employee.phone && (
                    <p className="text-xs text-tertiary mt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {employee.phone}
                    </p>
                  )}
                </div>
                <span className={`badge ${getStatusBadgeClass(employee.status)}`}>
                  {getStatusText(employee.status)}
                </span>
              </div>

              <div className="border-t border-primary pt-3 mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-secondary">Celkom zákaziek:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{employee.total_orders}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-secondary">Dokončené:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{employee.completed_orders}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {/* Status: created - waiting for first login */}
                {employee.status === 'created' && (
                  <>
                    <button
                      onClick={() => handleResendCredentials(employee)}
                      className="btn btn-secondary w-full flex items-center justify-center gap-2 text-sm"
                    >
                      <Mail className="w-4 h-4" />
                      Poslať prihlasovacie údaje
                    </button>
                    <div className="text-center text-xs text-tertiary py-1">
                      Čaká na prvé prihlásenie
                    </div>
                  </>
                )}

                {/* Status: pending_approval - waiting for admin approval */}
                {employee.status === 'pending_approval' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(employee)}
                      className="btn flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-sm flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Schváliť
                    </button>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="btn btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Upraviť
                    </button>
                  </div>
                )}

                {/* Status: active - fully functional */}
                {employee.status === 'active' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="btn btn-secondary flex-1 text-sm flex items-center justify-center gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      Upraviť
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="btn flex-1 bg-red-500 hover:bg-red-600 text-white text-sm flex items-center justify-center gap-1"
                    >
                      <UserX className="w-4 h-4" />
                      Deaktivovať
                    </button>
                  </div>
                )}

                {/* Status: inactive - deactivated */}
                {employee.status === 'inactive' && (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleReactivate(employee)}
                      className="btn w-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reaktivovať
                    </button>
                    {employee.total_orders === 0 && (
                      <button
                        onClick={() => handleHardDelete(employee)}
                        className="btn w-full bg-red-700 hover:bg-red-800 text-white text-sm flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Vymazať natrvalo
                      </button>
                    )}
                    {employee.total_orders > 0 && (
                      <div className="text-center text-xs text-tertiary py-1">
                        Má {employee.total_orders} zákaziek - nemožno vymazať
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elevated rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-primary">Nový zamestnanec</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCreate}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Meno a priezvisko *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Heslo *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    minLength="6"
                    required
                  />
                  <p className="text-xs text-tertiary mt-1">Minimálne 6 znakov</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Pozícia *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Vyber pozíciu...</option>
                    {jobPositions.map((position) => (
                      <option key={position.id} value={position.name}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Telefón
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+421..."
                    className="input"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Vytvoriť
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elevated rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl md:text-2xl font-display font-bold text-primary">
                Upraviť zamestnanca
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="btn btn-ghost p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Meno a priezvisko *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Pozícia *
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Vyber pozíciu...</option>
                    {jobPositions.map((position) => (
                      <option key={position.id} value={position.name}>
                        {position.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Telefón
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                  >
                    <option value="active">Aktívny</option>
                    <option value="inactive">Neaktívny</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Uložiť zmeny
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elevated rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-display font-bold text-primary mb-2">
                  Deaktivovať zamestnanca?
                </h3>
                <p className="text-secondary text-sm">
                  Naozaj chcete deaktivovať zamestnanca "<strong>{selectedEmployee.name}</strong>"?
                  Zamestnanec nebude môcť pristupovať do systému, ale jeho údaje zostanú zachované.
                </p>
              </div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-900 dark:text-amber-300 font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Zamestnanec má {selectedEmployee.total_orders} zákaziek.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-outline flex-1"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSubmitDelete}
                className="btn flex-1 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
              >
                <UserX className="w-4 h-4" />
                Deaktivovať
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeesManager
