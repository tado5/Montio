import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Wrench,
  AlertCircle
} from 'lucide-react'
import { api } from '../utils/apiClient'
import CompanyAdminLayout from '../components/CompanyAdminLayout'

const CreateOrderPage = () => {
  const navigate = useNavigate()
  const toast = useToast()

  const [orderTypes, setOrderTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    order_type_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    notes: ''
  })

  useEffect(() => {
    fetchOrderTypes()
  }, [])

  const fetchOrderTypes = async () => {
    try {
      const response = await api.get('/api/order-types')
      console.log('📦 [CreateOrder] Order types loaded:', response.data)
      setOrderTypes(response.data.orderTypes)
    } catch (err) {
      console.error('❌ [CreateOrder] Fetch error:', err)
      toast.error('Nepodarilo sa načítať typy montáží.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.order_type_id) {
      newErrors.order_type_id = 'Vyberte typ montáže'
    }

    if (!formData.client_name || formData.client_name.trim().length < 3) {
      newErrors.client_name = 'Meno klienta musí mať min 3 znaky'
    }

    if (formData.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Neplatný email formát'
    }

    if (formData.client_phone && !/^\+?[0-9\s\-\(\)]{9,20}$/.test(formData.client_phone)) {
      newErrors.client_phone = 'Neplatný telefón formát'
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

      const response = await api.post('/api/orders', {
        order_type_id: parseInt(formData.order_type_id),
        client_name: formData.client_name.trim(),
        client_email: formData.client_email.trim() || null,
        client_phone: formData.client_phone.trim() || null,
        client_address: formData.client_address.trim() || null,
        notes: formData.notes.trim() || null
      })

      console.log('✅ [CreateOrder] Order created:', response.data)
      toast.success('Zákazka bola vytvorená.')

      // Redirect to order detail
      navigate(`/company/orders/${response.data.order.id}`)
    } catch (err) {
      console.error('❌ [CreateOrder] Submit error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa vytvoriť zákazku.')
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
            onClick={() => navigate('/company/orders')}
            className="btn btn-ghost p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-primary">Nová zákazka</h1>
            <p className="text-sm text-tertiary mt-1">Vytvorte novú zákazku pre klienta</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Type */}
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent-500" />
              Typ montáže
            </h2>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Typ montáže <span className="text-red-500">*</span>
              </label>
              <select
                name="order_type_id"
                value={formData.order_type_id}
                onChange={handleChange}
                className={`input ${errors.order_type_id ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Vyberte typ montáže</option>
                {orderTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.order_type_id && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.order_type_id}
                </p>
              )}
            </div>
          </div>

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
                    placeholder="Ján Novák / Firma s.r.o."
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
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="email"
                    name="client_email"
                    value={formData.client_email}
                    onChange={handleChange}
                    placeholder="jan.novak@email.sk"
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
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Telefón
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                  <input
                    type="tel"
                    name="client_phone"
                    value={formData.client_phone}
                    onChange={handleChange}
                    placeholder="+421 900 123 456"
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
                <label className="block text-sm font-semibold text-secondary mb-2">
                  Adresa montáže
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-tertiary" />
                  <textarea
                    name="client_address"
                    value={formData.client_address}
                    onChange={handleChange}
                    placeholder="Ulica 123, 811 01 Bratislava"
                    className="input pl-10 min-h-[80px]"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <h2 className="text-lg font-display font-bold text-primary mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-500" />
              Poznámky
            </h2>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Interné poznámky
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Poznámky k zákazke (viditeľné len pre zamestnancov)..."
                className="input min-h-[120px]"
                rows="5"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/company/orders')}
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
                  Vytvárám...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Vytvoriť zákazku
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </CompanyAdminLayout>
  )
}

export default CreateOrderPage
