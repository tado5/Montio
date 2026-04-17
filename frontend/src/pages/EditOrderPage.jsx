import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'

const EditOrderPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    assigned_employee_id: '',
    scheduled_date: '',
    status: '',
    total_price: '',
    notes: ''
  })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [orderRes, employeesRes] = await Promise.all([
        api.get(`/api/orders/${id}`),
        api.get('/api/employees')
      ])

      console.log('📦 [EditOrder] Order loaded:', orderRes.data)
      console.log('👥 [EditOrder] Employees loaded:', employeesRes.data)

      const order = orderRes.data.order
      setFormData({
        client_name: order.client_name || '',
        client_email: order.client_email || '',
        client_phone: order.client_phone || '',
        client_address: order.client_address || '',
        assigned_employee_id: order.assigned_employee_id || '',
        scheduled_date: order.scheduled_date || '',
        status: order.status || 'survey',
        total_price: order.total_price || '',
        notes: order.notes || ''
      })

      setEmployees(employeesRes.data.employees.filter(e => e.status === 'active'))
    } catch (err) {
      console.error('❌ [EditOrder] Fetch error:', err)
      toast.error('Nepodarilo sa načítať údaje.')
      navigate('/company/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.client_name || formData.client_name.trim().length < 3) {
      newErrors.client_name = 'Meno klienta musí mať min 3 znaky'
    }

    if (formData.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Neplatný email formát'
    }

    if (formData.client_phone && !/^\+?[0-9\s\-\(\)]{9,20}$/.test(formData.client_phone)) {
      newErrors.client_phone = 'Neplatný telefón formát'
    }

    if (formData.total_price && (isNaN(formData.total_price) || parseFloat(formData.total_price) < 0)) {
      newErrors.total_price = 'Neplatná cena'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error('Opravte chyby vo formulári.')
      return
    }

    try {
      setSubmitting(true)

      const updateData = {
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim() || null,
        client_phone: formData.client_phone.trim() || null,
        client_address: formData.client_address.trim() || null,
        assigned_employee_id: formData.assigned_employee_id ? parseInt(formData.assigned_employee_id) : null,
        scheduled_date: formData.scheduled_date || null,
        status: formData.status,
        total_price: formData.total_price ? parseFloat(formData.total_price) : null,
        notes: formData.notes.trim() || null
      }

      await api.put(`/api/orders/${id}`, updateData)
      console.log('✅ [EditOrder] Order updated')
      toast.success('Zákazka bola aktualizovaná.')
      navigate(`/company/orders/${id}`)
    } catch (err) {
      console.error('❌ [EditOrder] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa aktualizovať zákazku.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <CompanyAdminLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-200 dark:border-accent-700 border-t-accent-600 dark:border-t-accent-400"></div>
        </div>
      </CompanyAdminLayout>
    )
  }

  return (
    <CompanyAdminLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/company/orders/${id}`)}
            className="btn btn-ghost p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">Upraviť zákazku</h1>
            <p className="text-sm text-tertiary mt-1">Úprava údajov zákazky</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-accent-500" />
              Údaje klienta
            </h2>

            <div className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Meno / Názov firmy <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="text"
                    name="client_name"
                    value={formData.client_name}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.client_name ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.client_name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.client_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="email"
                    name="client_email"
                    value={formData.client_email}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.client_email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.client_email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.client_email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Telefón</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="tel"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.client_phone ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.client_phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.client_phone}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Adresa montáže</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-tertiary" />
                  <textarea
                    name="client_address"
                    value={formData.client_address}
                    onChange={handleChange}
                    className="input pl-10 min-h-[80px]"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Assignment & Schedule */}
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent-500" />
              Priradenie a plánovanie
            </h2>

            <div className="space-y-4">
              {/* Assigned Employee */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Priradený technik</label>
                <select
                  name="assigned_employee_id"
                  value={formData.assigned_employee_id}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Nepriradené</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Plánovaný dátum</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="survey">Obhliadka</option>
                  <option value="quote">Cenová ponuka</option>
                  <option value="assigned">Priradené</option>
                  <option value="in_progress">Prebieha</option>
                  <option value="completed">Dokončené</option>
                  <option value="cancelled">Zrušené</option>
                </select>
              </div>

              {/* Total Price */}
              <div>
                <label className="block text-sm font-semibold text-secondary mb-2">Celková cena</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="number"
                    step="0.01"
                    name="total_price"
                    value={formData.total_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`input pl-10 ${errors.total_price ? 'border-red-500' : ''}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-tertiary text-sm">€</span>
                </div>
                {errors.total_price && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.total_price}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-500" />
              Poznámky
            </h2>

            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Interné poznámky k zákazke..."
              className="input min-h-[120px]"
              rows="5"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(`/company/orders/${id}`)}
              className="btn btn-outline"
              disabled={submitting}
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="btn btn-primary flex items-center justify-center gap-2"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Ukladám...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Uložiť zmeny
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </CompanyAdminLayout>
  )
}

export default EditOrderPage
