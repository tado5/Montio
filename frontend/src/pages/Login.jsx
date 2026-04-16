import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Wrench, Lock, Mail } from 'lucide-react'
import PasswordChangeModal from '../components/PasswordChangeModal'
import tsdigitalLogo from '../assets/tsdigital-logo.svg'

const Login = () => {
  const [email, setEmail] = useState(() => {
    // Load saved email from localStorage if "Remember Me" was checked
    return localStorage.getItem('montio_remember_email') || ''
  })
  const [password, setPassword] = useState(() => {
    // Load saved password from localStorage if "Remember Me" was checked
    return localStorage.getItem('montio_remember_password') || ''
  })
  const [rememberMe, setRememberMe] = useState(() => {
    // Check if user had "Remember Me" enabled
    return localStorage.getItem('montio_remember_me') === 'true'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwordChangeData, setPasswordChangeData] = useState({ employeeId: null, token: null })

  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  // Check if running on localhost (development mode)
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Save credentials if "Remember Me" is checked
    if (rememberMe) {
      localStorage.setItem('montio_remember_me', 'true')
      localStorage.setItem('montio_remember_email', email)
      localStorage.setItem('montio_remember_password', password)
    } else {
      // Clear saved credentials if unchecked
      localStorage.removeItem('montio_remember_me')
      localStorage.removeItem('montio_remember_email')
      localStorage.removeItem('montio_remember_password')
    }

    const result = await login(email, password)

    if (result.success) {
      toast.success('Úspešné prihlásenie!')
      navigate('/')
    } else if (result.requirePasswordChange) {
      setPasswordChangeData({
        employeeId: result.employee_id,
        token: result.token
      })
      setShowPasswordChange(true)
      setLoading(false)
    } else {
      setError(result.message || 'Nesprávny email alebo heslo')
      toast.error(result.message || 'Nesprávny email alebo heslo', { duration: 5000 })
      setLoading(false)
    }
  }

  const handlePasswordChangeSuccess = (message) => {
    setShowPasswordChange(false)
    setError('')
    setEmail('')
    setPassword('')
    toast.success(message + ' Môžete sa prihlásiť.')
  }

  const handlePasswordChangeCancel = () => {
    setShowPasswordChange(false)
    setPasswordChangeData({ employeeId: null, token: null })
    setLoading(false)
  }

  // Quick login for development
  const quickLogin = async (userEmail, userPassword) => {
    setEmail(userEmail)
    setPassword(userPassword)
    setError('')
    setLoading(true)

    const result = await login(userEmail, userPassword)

    if (result.success) {
      toast.success('Prihlásenie úspešné!')
      navigate('/')
    } else {
      setError(result.message || 'Nesprávny email alebo heslo')
      toast.error(result.message || 'Nesprávny email alebo heslo', { duration: 5000 })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 dark:from-primary-950 dark:via-primary-900 dark:to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}/>
      </div>

      {/* Orange accent gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-pulse"/>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}/>

      {/* Login card */}
      <div className="relative bg-elevated border-2 border-primary rounded-2xl shadow-strong p-8 md:p-10 w-full max-w-md backdrop-blur-sm animate-scale-in">
        {/* Logo and heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-accent rounded-2xl mb-6 shadow-medium">
            <Wrench className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary mb-2 tracking-tight">
            MONTIO
          </h1>
          <p className="text-secondary font-medium">Systém pre montážne firmy</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl mb-6 animate-slide-down">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-primary font-semibold mb-2 text-sm">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('') // Clear error when user starts typing
                }}
                className="input pl-11"
                placeholder="vas@email.sk"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-primary font-semibold mb-2 text-sm">
              Heslo
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('') // Clear error when user starts typing
                }}
                className="input pl-11"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Remember Me checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-accent-500 bg-elevated border-primary rounded focus:ring-2 focus:ring-accent-500 cursor-pointer"
            />
            <label
              htmlFor="rememberMe"
              className="text-sm text-secondary font-medium cursor-pointer select-none"
            >
              Zapamätať si ma
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3.5 text-base font-semibold"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Prihlasovanie...
              </span>
            ) : (
              'Prihlásiť sa'
            )}
          </button>
        </form>

        {/* Development Quick Login */}
        {isDev && (
          <div className="mt-6 pt-6 border-t-2 border-primary">
            <p className="text-xs text-tertiary text-center mb-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2">
              <Wrench className="w-3 h-3"/>
              Development Mode
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('admin@montio.sk', 'admin123')}
                disabled={loading}
                className="btn btn-ghost text-xs py-2"
              >
                👑 Super Admin
              </button>
              <button
                onClick={() => quickLogin('company@montio.sk', 'company123')}
                disabled={loading}
                className="btn btn-ghost text-xs py-2"
              >
                🏢 Company
              </button>
              <button
                onClick={() => quickLogin('employee@montio.sk', 'employee123')}
                disabled={loading}
                className="btn btn-ghost text-xs py-2"
              >
                👷 Employee
              </button>
              <button
                onClick={() => quickLogin('123Mont@test.sk', 'asdf1234')}
                disabled={loading}
                className="btn btn-ghost text-xs py-2"
              >
                🏭 Test Montáže
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-primary">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-secondary">Created with</span>
            <span className="text-red-500 animate-pulse">❤️</span>
            <span className="text-secondary">by</span>
            <img src={tsdigitalLogo} alt="TSDigital" className="w-6 h-6" />
            <span className="font-bold bg-gradient-to-r from-brand-orange to-brand-red bg-clip-text text-transparent">
              TSDigital
            </span>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <PasswordChangeModal
          employeeId={passwordChangeData.employeeId}
          token={passwordChangeData.token}
          onSuccess={handlePasswordChangeSuccess}
          onCancel={handlePasswordChangeCancel}
        />
      )}
    </div>
  )
}

export default Login
