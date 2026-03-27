import { useState, useEffect } from 'react'
import axios from 'axios'

const EmployeesManager = () => {
  const [employees, setEmployees] = useState([])
  const [jobPositions, setJobPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/job-positions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setJobPositions(response.data.positions)
    } catch (err) {
      console.error('Fetch job positions error:', err)
    }
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmployees(response.data.employees)
      setError(null)
    } catch (err) {
      console.error('Fetch employees error:', err)
      setError('Nepodarilo sa načítať zamestnancov.')
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
      const token = localStorage.getItem('token')
      await axios.put(
        `/api/employees/${employee.id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchEmployees()
    } catch (err) {
      console.error('Approve employee error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa schváliť zamestnanca.')
    }
  }

  const handleReactivate = async (employee) => {
    if (!confirm(`Naozaj chcete reaktivovať zamestnanca ${employee.name}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `/api/employees/${employee.id}/reactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchEmployees()
      alert('Zamestnanec bol reaktivovaný.')
    } catch (err) {
      console.error('Reactivate employee error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa reaktivovať zamestnanca.')
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
      const token = localStorage.getItem('token')
      await axios.delete(
        `/api/employees/${employee.id}/permanent`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchEmployees()
      alert('Zamestnanec bol natrvalo vymazaný.')
    } catch (err) {
      console.error('Hard delete employee error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa vymazať zamestnanca.')
    }
  }

  const handleResendCredentials = async (employee) => {
    if (!confirm(`Naozaj chcete znovu poslať prihlasovacie údaje pre ${employee.name} na email ${employee.email}?`)) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `/api/employees/${employee.id}/resend-credentials`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert(response.data.message + '\nEmail: ' + response.data.email)
    } catch (err) {
      console.error('Resend credentials error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa znovu poslať prihlasovacie údaje.')
    }
  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      await axios.post(
        '/api/employees',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          position: formData.position,
          phone: formData.phone || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setShowCreateModal(false)
      fetchEmployees()
    } catch (err) {
      console.error('Create employee error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa vytvoriť zamestnanca.')
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')

      await axios.put(
        `/api/employees/${selectedEmployee.id}`,
        {
          name: formData.name,
          email: formData.email,
          position: formData.position,
          phone: formData.phone || null,
          status: formData.status
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setShowEditModal(false)
      fetchEmployees()
    } catch (err) {
      console.error('Update employee error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa aktualizovať zamestnanca.')
    }
  }

  const handleSubmitDelete = async () => {
    try {
      const token = localStorage.getItem('token')

      await axios.delete(
        `/api/employees/${selectedEmployee.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setShowDeleteModal(false)
      fetchEmployees()
    } catch (err) {
      console.error('Delete employee error:', err)
      alert(err.response?.data?.message || 'Nepodarilo sa deaktivovať zamestnanca.')
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

  const getStatusColor = (status) => {
    const colorMap = {
      'created': 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30',
      'pending_approval': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      'active': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      'inactive': 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30',
      'deleted': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
    }
    return colorMap[status] || 'text-gray-600 bg-gray-100'
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Zamestnanci</h2>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          + Pridať zamestnanca
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Hľadať podľa mena, emailu alebo pozície..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <p className="text-red-800 dark:text-red-300 font-semibold">{error}</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6 text-center">
          <p className="text-blue-800 dark:text-blue-300 font-semibold">
            {searchTerm || statusFilter !== 'all'
              ? 'Žiadni zamestnanci nezodpovedajú filtru.'
              : 'Zatiaľ nemáte žiadnych zamestnancov. Vytvorte prvého kliknutím na tlačidlo "+ Pridať zamestnanca".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                    {employee.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {employee.position}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {employee.email}
                  </p>
                  {employee.phone && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {employee.phone}
                    </p>
                  )}
                </div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(employee.status)}`}>
                  {getStatusText(employee.status)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Celkom zákaziek:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{employee.total_orders}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Dokončené:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{employee.completed_orders}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                {/* Status: created - waiting for first login */}
                {employee.status === 'created' && (
                  <>
                    <button
                      onClick={() => handleResendCredentials(employee)}
                      className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      📧 Poslať prihlasovacie údaje
                    </button>
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
                      Čaká na prvé prihlásenie
                    </div>
                  </>
                )}

                {/* Status: pending_approval - waiting for admin approval */}
                {employee.status === 'pending_approval' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(employee)}
                      className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      ✅ Schváliť
                    </button>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      ✏️ Upraviť
                    </button>
                  </div>
                )}

                {/* Status: active - fully functional */}
                {employee.status === 'active' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(employee)}
                      className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      ✏️ Upraviť
                    </button>
                    <button
                      onClick={() => handleDelete(employee)}
                      className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      🚫 Deaktivovať
                    </button>
                  </div>
                )}

                {/* Status: inactive - deactivated */}
                {employee.status === 'inactive' && (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleReactivate(employee)}
                      className="w-full px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors"
                    >
                      🔄 Reaktivovať
                    </button>
                    {employee.total_orders === 0 && (
                      <button
                        onClick={() => handleHardDelete(employee)}
                        className="w-full px-3 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        🗑️ Vymazať natrvalo
                      </button>
                    )}
                    {employee.total_orders > 0 && (
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-1">
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Nový zamestnanec</h3>

            <form onSubmit={handleSubmitCreate}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Meno a priezvisko *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Heslo *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  minLength="6"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Pozícia *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
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

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Telefón
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+421..."
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Upraviť zamestnanca
            </h3>

            <form onSubmit={handleSubmitEdit}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Meno a priezvisko *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Pozícia *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
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

              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Telefón
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                >
                  <option value="active">Aktívny</option>
                  <option value="inactive">Neaktívny</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
              Deaktivovať zamestnanca?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Naozaj chcete deaktivovať zamestnanca "<strong>{selectedEmployee.name}</strong>"?
              Zamestnanec nebude môcť pristupovať do systému, ale jeho údaje zostanú zachované.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 font-semibold">
                ⚠️ Zamestnanec má {selectedEmployee.total_orders} zákaziek.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSubmitDelete}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors"
              >
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
