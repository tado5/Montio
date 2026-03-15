import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  // Check if running on localhost (development mode)
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      // Redirect to root, which will redirect to appropriate dashboard based on role
      navigate('/')
    } else {
      setError(result.message)
    }

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
      // Redirect to root, which will redirect to appropriate dashboard based on role
      navigate('/')
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 animate-gradient transition-colors duration-300">
      <div className="absolute inset-0 bg-black/10 dark:bg-black/30"></div>
      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 hover:scale-[1.01]">
        <div className="text-center mb-8">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">
            <h1 className="text-5xl font-black mb-2 tracking-tight">MONTIO</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Prihlásenie do systému</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600"
              placeholder="vas@email.sk"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              Heslo
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-700 dark:text-white hover:bg-white dark:hover:bg-gray-600"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
          >
            {loading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
          </button>
        </form>

        {/* Development Quick Login */}
        {isDev && (
          <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4 font-bold uppercase tracking-wide">
              🔧 Development Mode
            </p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('admin@montio.sk', 'admin123')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                👑 Super Admin
              </button>
              <button
                onClick={() => quickLogin('company@montio.sk', 'company123')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                🏢 Company Admin
              </button>
              <button
                onClick={() => quickLogin('employee@montio.sk', 'employee123')}
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              >
                👷 Employee
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4 font-medium">
              Len na localhost
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
