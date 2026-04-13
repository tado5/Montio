import { useState, useEffect } from 'react'
import axios from 'axios'

// API URL configuration - use environment variable or detect from window.location
const API_BASE = import.meta.env.VITE_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : window.location.origin);
const API_URL = `${API_BASE}/api`

const CompanySettingsManager = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Company data
  const [company, setCompany] = useState(null)

  // Basic info form
  const [basicForm, setBasicForm] = useState({
    name: '',
    ico: '',
    dic: '',
    address: ''
  })

  // Billing form
  const [billingForm, setBillingForm] = useState({
    iban: '',
    swift: '',
    variable_symbol: '',
    due_days: '14'
  })

  // Financial form
  const [financialForm, setFinancialForm] = useState({
    vat_registered: false,
    vat_number: '',
    vat_rate: '20',
    margin_material: '0',
    margin_labor: '0',
    overhead_cost: '0'
  })

  // Contact form
  const [contactForm, setContactForm] = useState({
    phone: '',
    email: '',
    website: '',
    work_hours_weekday: '8:00 - 17:00',
    work_hours_weekend: '',
    weekend_work_enabled: false
  })

  // Invoice settings form
  const [invoiceForm, setInvoiceForm] = useState({
    footer_note: '',
    logo_position: 'left',
    language: 'sk',
    theme_color: '#3b82f6',
    invoice_email: ''
  })

  // Logo upload
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Active section
  const [activeSection, setActiveSection] = useState('basic')

  // Load company settings
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await axios.get(`${API_URL}/company/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      const { company } = res.data
      setCompany(company)

      // Set basic form
      setBasicForm({
        name: company.name || '',
        ico: company.ico || '',
        dic: company.dic || '',
        address: company.address || ''
      })

      // Set billing form
      if (company.billing) {
        setBillingForm({
          iban: company.billing.iban || '',
          swift: company.billing.swift || '',
          variable_symbol: company.billing.variable_symbol || '',
          due_days: company.billing.due_days?.toString() || '14'
        })
      }

      // Set financial form
      if (company.financial) {
        setFinancialForm({
          vat_registered: company.financial.vat_registered || false,
          vat_number: company.financial.vat_number || '',
          vat_rate: company.financial.vat_rate?.toString() || '20',
          margin_material: company.financial.margin_material?.toString() || '0',
          margin_labor: company.financial.margin_labor?.toString() || '0',
          overhead_cost: company.financial.overhead_cost?.toString() || '0'
        })
      }

      // Set contact form
      if (company.contact) {
        setContactForm({
          phone: company.contact.phone || '',
          email: company.contact.email || '',
          website: company.contact.website || '',
          work_hours_weekday: company.contact.work_hours_weekday || '8:00 - 17:00',
          work_hours_weekend: company.contact.work_hours_weekend || '',
          weekend_work_enabled: company.contact.weekend_work_enabled || false
        })
      }

      // Set invoice form
      if (company.invoice_settings) {
        setInvoiceForm({
          footer_note: company.invoice_settings.footer_note || '',
          logo_position: company.invoice_settings.logo_position || 'left',
          language: company.invoice_settings.language || 'sk',
          theme_color: company.invoice_settings.theme_color || '#3b82f6',
          invoice_email: company.invoice_settings.invoice_email || ''
        })
      }

      setLoading(false)
    } catch (err) {
      console.error('Load settings error:', err)
      setError('Chyba pri načítaní nastavení.')
      setLoading(false)
    }
  }

  // Save handlers
  const handleSaveBasic = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      const res = await axios.put(
        `${API_URL}/company/settings/basic`,
        basicForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess(res.data.message)
      await loadSettings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri ukladaní.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBilling = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      const res = await axios.put(
        `${API_URL}/company/settings/billing`,
        billingForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess(res.data.message)
      await loadSettings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri ukladaní.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFinancial = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      const res = await axios.put(
        `${API_URL}/company/settings/financial`,
        financialForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess(res.data.message)
      await loadSettings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri ukladaní.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContact = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      const res = await axios.put(
        `${API_URL}/company/settings/contact`,
        contactForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess(res.data.message)
      await loadSettings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri ukladaní.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveInvoice = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      const res = await axios.put(
        `${API_URL}/company/settings/invoice`,
        invoiceForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess(res.data.message)
      await loadSettings()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri ukladaní.')
    } finally {
      setSaving(false)
    }
  }

  // Logo handlers
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadLogo = async () => {
    if (!logoFile) return

    try {
      setUploadingLogo(true)
      setError('')
      setSuccess('')

      const formData = new FormData()
      formData.append('logo', logoFile)

      const token = localStorage.getItem('token')
      const res = await axios.put(
        `${API_URL}/company/settings/logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      setSuccess(res.data.message)
      await loadSettings()
      setLogoFile(null)
      setLogoPreview(null)

      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Chyba pri uploade loga.')
    } finally {
      setUploadingLogo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3 text-cyan-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
          <span className="font-mono text-sm uppercase tracking-wider">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-slideUp">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-green-400 font-mono text-sm">✓ {success}</p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-red-400 font-mono text-sm">✗ {error}</p>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700/50 pb-2">
        {[
          { id: 'basic', label: 'BASIC INFO', icon: '📋' },
          { id: 'logo', label: 'LOGO', icon: '🖼️' },
          { id: 'billing', label: 'BILLING', icon: '💳' },
          { id: 'financial', label: 'FINANCIAL', icon: '💰' },
          { id: 'contact', label: 'CONTACT', icon: '📞' },
          { id: 'invoice', label: 'INVOICES', icon: '📄' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all duration-300 rounded-t-lg ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-t-2 border-cyan-400 text-cyan-400'
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/30'
            }`}
          >
            <span className="mr-2">{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* SECTION 1: BASIC INFO */}
      {activeSection === 'basic' && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-lg p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-cyan-400 mb-4" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            ZÁKLADNÉ ÚDAJE
          </h2>

          <form onSubmit={handleSaveBasic} className="space-y-4">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                Názov firmy *
              </label>
              <input
                type="text"
                value={basicForm.name}
                onChange={(e) => setBasicForm({ ...basicForm, name: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="napr. Montáže s.r.o."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  IČO *
                </label>
                <input
                  type="text"
                  value={basicForm.ico}
                  onChange={(e) => setBasicForm({ ...basicForm, ico: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="12345678"
                  pattern="\d{8}"
                  required
                />
                <p className="text-xs text-slate-500 mt-1 font-mono">8 číslic</p>
              </div>

              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  DIČ
                </label>
                <input
                  type="text"
                  value={basicForm.dic}
                  onChange={(e) => setBasicForm({ ...basicForm, dic: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="1234567890"
                  pattern="\d{10}"
                />
                <p className="text-xs text-slate-500 mt-1 font-mono">10 číslic</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                Adresa *
              </label>
              <textarea
                value={basicForm.address}
                onChange={(e) => setBasicForm({ ...basicForm, address: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                rows="3"
                placeholder="napr. Hlavná 123, 010 01 Žilina"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-mono text-sm uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 2: LOGO */}
      {activeSection === 'logo' && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-lg p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-cyan-400 mb-4" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            COMPANY LOGO
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-3">
                Aktuálne logo
              </label>
              <div className="flex items-center space-x-6">
                {company?.logo_url ? (
                  <img
                    src={`${API_URL.replace('/api', '')}${company.logo_url}`}
                    alt="Company logo"
                    className="w-32 h-32 object-contain bg-white/5 rounded-lg border border-slate-700 p-2"
                  />
                ) : (
                  <div className="w-32 h-32 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-center">
                    <span className="text-4xl text-slate-600">🖼️</span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-slate-400 font-mono text-sm">
                    {company?.logo_url ? 'Logo je nahrané' : 'Žiadne logo'}
                  </p>
                  <p className="text-slate-500 font-mono text-xs mt-1">
                    Odporúčaná veľkosť: 200x200px
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-3">
                Nahrať nové logo
              </label>

              <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />

                {logoPreview ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="w-48 h-48 object-contain bg-white/5 rounded-lg border border-slate-700 p-2"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={handleUploadLogo}
                        disabled={uploadingLogo}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-mono text-sm uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                      >
                        {uploadingLogo ? 'UPLOADING...' : 'UPLOAD LOGO'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreview(null)
                        }}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 font-mono text-sm uppercase tracking-wider rounded-lg transition-colors"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="logo-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mb-4">
                      <span className="text-4xl">📁</span>
                    </div>
                    <p className="text-cyan-400 font-mono text-sm mb-1">Click to upload</p>
                    <p className="text-slate-500 font-mono text-xs">JPG, PNG, SVG (max 2MB)</p>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: BILLING */}
      {activeSection === 'billing' && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-lg p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-cyan-400 mb-4" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            FAKTURAČNÉ ÚDAJE
          </h2>

          <form onSubmit={handleSaveBilling} className="space-y-4">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                IBAN
              </label>
              <input
                type="text"
                value={billingForm.iban}
                onChange={(e) => setBillingForm({ ...billingForm, iban: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="SK31 1200 0000 1987 4263 7541"
              />
              <p className="text-xs text-slate-500 mt-1 font-mono">Formát: SK + 22 číslic</p>
            </div>

            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                SWIFT/BIC
              </label>
              <input
                type="text"
                value={billingForm.swift}
                onChange={(e) => setBillingForm({ ...billingForm, swift: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="TATRSKBX"
              />
              <p className="text-xs text-slate-500 mt-1 font-mono">8-11 znakov</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Variabilný symbol
                </label>
                <input
                  type="text"
                  value={billingForm.variable_symbol}
                  onChange={(e) => setBillingForm({ ...billingForm, variable_symbol: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="1234567890"
                  pattern="\d{1,10}"
                />
                <p className="text-xs text-slate-500 mt-1 font-mono">1-10 číslic</p>
              </div>

              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Splatnosť (dni)
                </label>
                <input
                  type="number"
                  value={billingForm.due_days}
                  onChange={(e) => setBillingForm({ ...billingForm, due_days: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="14"
                  min="1"
                  max="365"
                />
                <p className="text-xs text-slate-500 mt-1 font-mono">1-365 dní</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-mono text-sm uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 4: FINANCIAL */}
      {activeSection === 'financial' && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-lg p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-cyan-400 mb-4" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            FINANČNÉ NASTAVENIA
          </h2>

          <form onSubmit={handleSaveFinancial} className="space-y-4">
            {/* DPH Settings */}
            <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-900/30">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 font-mono uppercase">DPH Nastavenia</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="vat_registered"
                    checked={financialForm.vat_registered}
                    onChange={(e) => setFinancialForm({ ...financialForm, vat_registered: e.target.checked })}
                    className="w-5 h-5 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="vat_registered" className="text-slate-300 font-mono text-sm">
                    Firma je platiteľ DPH
                  </label>
                </div>

                {financialForm.vat_registered && (
                  <>
                    <div>
                      <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                        IČ DPH
                      </label>
                      <input
                        type="text"
                        value={financialForm.vat_number}
                        onChange={(e) => setFinancialForm({ ...financialForm, vat_number: e.target.value })}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="SK1234567890"
                      />
                      <p className="text-xs text-slate-500 mt-1 font-mono">Formát: SK + 10 číslic</p>
                    </div>

                    <div>
                      <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                        DPH sadzba (%)
                      </label>
                      <div className="space-y-3">
                        <select
                          value={['20', '10', '5', '0'].includes(financialForm.vat_rate) ? financialForm.vat_rate : 'custom'}
                          onChange={(e) => {
                            if (e.target.value === 'custom') {
                              // Resetni na prázdny string alebo nechaj aktuálnu hodnotu
                              setFinancialForm({ ...financialForm, vat_rate: '' })
                            } else {
                              setFinancialForm({ ...financialForm, vat_rate: e.target.value })
                            }
                          }}
                          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="20">20% (štandardná)</option>
                          <option value="10">10% (znížená)</option>
                          <option value="5">5% (super znížená)</option>
                          <option value="0">0% (oslobodené)</option>
                          <option value="custom">Vlastná sadzba</option>
                        </select>

                        {!['20', '10', '5', '0'].includes(financialForm.vat_rate) && (
                          <div>
                            <input
                              type="number"
                              value={financialForm.vat_rate}
                              onChange={(e) => setFinancialForm({ ...financialForm, vat_rate: e.target.value })}
                              className="w-full bg-slate-900/50 border border-cyan-600 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-400 transition-colors"
                              placeholder="Zadaj vlastnú sadzbu (napr. 15, 23.5)"
                              min="0"
                              max="100"
                              step="0.01"
                              autoFocus
                            />
                            <p className="text-xs text-cyan-400 mt-1 font-mono">💡 Vlastná DPH sadzba: 0-100% (môžeš použiť desatinné čísla)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Margins */}
            <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-900/30">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 font-mono uppercase">Default Marže</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Marža materiál (%)
                  </label>
                  <input
                    type="number"
                    value={financialForm.margin_material}
                    onChange={(e) => setFinancialForm({ ...financialForm, margin_material: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="30"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Marža práca (%)
                  </label>
                  <input
                    type="number"
                    value={financialForm.margin_labor}
                    onChange={(e) => setFinancialForm({ ...financialForm, margin_labor: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="40"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Režijné náklady (%)
                  </label>
                  <input
                    type="number"
                    value={financialForm.overhead_cost}
                    onChange={(e) => setFinancialForm({ ...financialForm, overhead_cost: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="15"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-mono text-sm uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 5: CONTACT */}
      {activeSection === 'contact' && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-lg p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-cyan-400 mb-4" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            KONTAKTNÉ ÚDAJE
          </h2>

          <form onSubmit={handleSaveContact} className="space-y-4">
            {/* Contact Info */}
            <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-900/30">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 font-mono uppercase">Kontakty</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Telefón
                  </label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="+421 901 234 567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="info@firma.sk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Web stránka
                  </label>
                  <input
                    type="text"
                    value={contactForm.website}
                    onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="https://firma.sk"
                  />
                </div>
              </div>
            </div>

            {/* Work Hours */}
            <div className="border border-slate-700/50 rounded-lg p-4 bg-slate-900/30">
              <h3 className="text-lg font-bold text-cyan-400 mb-4 font-mono uppercase">Pracovné hodiny</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                    Počas týždňa (Po-Pia)
                  </label>
                  <input
                    type="text"
                    value={contactForm.work_hours_weekday}
                    onChange={(e) => setContactForm({ ...contactForm, work_hours_weekday: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="8:00 - 17:00"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="weekend_work"
                    checked={contactForm.weekend_work_enabled}
                    onChange={(e) => setContactForm({ ...contactForm, weekend_work_enabled: e.target.checked })}
                    className="w-5 h-5 bg-slate-900 border-slate-700 rounded focus:ring-cyan-500"
                  />
                  <label htmlFor="weekend_work" className="text-slate-300 font-mono text-sm">
                    Pracujeme cez víkend
                  </label>
                </div>

                {contactForm.weekend_work_enabled && (
                  <div>
                    <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                      Víkendové hodiny (So-Ne)
                    </label>
                    <input
                      type="text"
                      value={contactForm.work_hours_weekend}
                      onChange={(e) => setContactForm({ ...contactForm, work_hours_weekend: e.target.value })}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="9:00 - 14:00"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-mono text-sm uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SECTION 6: INVOICE */}
      {activeSection === 'invoice' && (
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border border-slate-700/50 rounded-lg p-4 md:p-5 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-cyan-400 mb-4" style={{ fontFamily: 'Archivo Black, sans-serif' }}>
            NASTAVENIA FAKTÚR
          </h2>

          <form onSubmit={handleSaveInvoice} className="space-y-4">
            <div>
              <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                Poznámka pod čiarou
              </label>
              <textarea
                value={invoiceForm.footer_note}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, footer_note: e.target.value })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                rows="3"
                placeholder="Ďakujeme za váš nákup"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Pozícia loga
                </label>
                <select
                  value={invoiceForm.logo_position}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, logo_position: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="left">Vľavo</option>
                  <option value="center">V strede</option>
                  <option value="right">Vpravo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Jazyk faktúr
                </label>
                <select
                  value={invoiceForm.language}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, language: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="sk">Slovenčina</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Farba témy (hex)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={invoiceForm.theme_color}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, theme_color: e.target.value })}
                    className="w-16 h-12 bg-slate-900/50 border border-slate-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={invoiceForm.theme_color}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, theme_color: e.target.value })}
                    className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="#3b82f6"
                    pattern="#[0-9A-Fa-f]{6}"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono uppercase tracking-wider text-slate-400 mb-2">
                  Email pre faktúry
                </label>
                <input
                  type="email"
                  value={invoiceForm.invoice_email}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoice_email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="faktury@firma.sk"
                />
                <p className="text-xs text-slate-500 mt-1 font-mono">Ak je iný ako hlavný email</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-mono text-sm uppercase tracking-wider rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
              >
                {saving ? 'SAVING...' : 'SAVE CHANGES'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default CompanySettingsManager
