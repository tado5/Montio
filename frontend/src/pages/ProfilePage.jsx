import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import UserMenu from '../components/UserMenu'
import NotificationBell from '../components/NotificationBell'
import ReadOnlyBanner from '../components/ReadOnlyBanner'
import Footer from '../components/Footer'
import axios from 'axios'

const ProfilePage = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })

      const profileData = response.data.profile
      setProfile(profileData)
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || ''
      })
      setError(null)
    } catch (err) {
      console.error('Fetch profile error:', err)
      setError('Nepodarilo sa načítať profil.')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        '/api/auth/profile',
        profileForm,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess('Profil bol aktualizovaný.')
      setIsEditMode(false)
      setTimeout(() => setSuccess(null), 3000)
      fetchProfile()
    } catch (err) {
      console.error('Update profile error:', err)
      setError(err.response?.data?.message || 'Nepodarilo sa aktualizovať profil.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Nové heslá sa nezhodujú.')
      setTimeout(() => setError(null), 3000)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Nové heslo musí mať aspoň 6 znakov.')
      setTimeout(() => setError(null), 3000)
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.put(
        '/api/auth/profile/password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccess('Heslo bolo zmenené.')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Change password error:', err)
      setError(err.response?.data?.message || 'Nepodarilo sa zmeniť heslo.')
      setTimeout(() => setError(null), 3000)
    }
  }

  const getRoleName = (role) => {
    const roleMap = {
      'superadmin': 'Super Admin',
      'companyadmin': 'Company Admin',
      'employee': 'Zamestnanec'
    }
    return roleMap[role] || role
  }

  const getAvatarUrl = (email) => {
    const seed = email || 'default'
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=f97316,ef4444&textColor=ffffff`
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="px-6 py-2 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white">Môj profil</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Spravujte svoje osobné údaje</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Read-Only Banner for Inactive Users */}
      <ReadOnlyBanner />

      {/* Main Container with Sidebar */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl p-4 animate-fade-in">
                  <p className="text-green-800 dark:text-green-300 font-semibold text-center flex items-center justify-center gap-2">
                    <span>✓</span> {success}
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 animate-fade-in">
                  <p className="text-red-800 dark:text-red-300 font-semibold text-center flex items-center justify-center gap-2">
                    <span>⚠</span> {error}
                  </p>
                </div>
              )}

              {/* Profile Header Card with Avatar */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-200"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src={getAvatarUrl(profile?.email)}
                        alt="Avatar"
                        className="w-32 h-32 rounded-2xl shadow-2xl border-4 border-white dark:border-gray-700"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full px-4 py-1">
                        <span className="text-white text-xs font-bold">{getRoleName(profile?.role)}</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                        {profile?.name || 'Používateľ'}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">{profile?.email}</p>

                      <div className="flex flex-wrap gap-2">
                        {profile?.company_name && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm font-bold rounded-full">
                            <span>🏢</span> {profile.company_name}
                          </span>
                        )}
                        {profile?.position && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 text-sm font-bold rounded-full">
                            <span>💼</span> {profile.position}
                          </span>
                        )}
                        {profile?.phone && (
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-bold rounded-full">
                            <span>📞</span> {profile.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isEditMode && !isChangingPassword && (
                      <button
                        onClick={() => !user?.isReadOnly && setIsEditMode(true)}
                        disabled={user?.isReadOnly}
                        className={`px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                          user?.isReadOnly
                            ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:scale-105'
                        }`}
                      >
                        ✏️ Upraviť profil
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Profile Form */}
              {isEditMode && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">Upraviť údaje</h3>
                    <button
                      onClick={() => {
                        setIsEditMode(false)
                        setProfileForm({
                          name: profile?.name || '',
                          email: profile?.email || '',
                          phone: profile?.phone || ''
                        })
                      }}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold"
                    >
                      ✕ Zrušiť
                    </button>
                  </div>

                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Meno a priezvisko *
                        </label>
                        <input
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                          Telefón
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+421..."
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      💾 Uložiť zmeny
                    </button>
                  </form>
                </div>
              )}

              {/* Change Password Section */}
              {!isEditMode && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  {!isChangingPassword ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white">Zabezpečenie</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Spravujte svoje prístupové heslo
                          </p>
                        </div>
                        <button
                          onClick={() => !user?.isReadOnly && setIsChangingPassword(true)}
                          disabled={user?.isReadOnly}
                          className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                            user?.isReadOnly
                              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-50'
                              : 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:shadow-lg transform hover:scale-105'
                          }`}
                        >
                          🔐 Zmeniť heslo
                        </button>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <span className="text-2xl">🛡️</span>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Heslo je zabezpečené</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Naposledy zmenené: {new Date(profile?.created_at).toLocaleDateString('sk-SK')}
                          </p>
                        </div>
                      </div>

                      {user?.isReadOnly && (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800 mt-4">
                          <span className="text-2xl">🔒</span>
                          <div>
                            <p className="text-sm font-bold text-yellow-900 dark:text-yellow-300">READ-ONLY režim</p>
                            <p className="text-xs text-yellow-800 dark:text-yellow-400">
                              Váš účet je deaktivovaný. Nemôžete upravovať profil ani meniť heslo.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-fade-in">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white">Zmeniť heslo</h3>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false)
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            })
                          }}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-bold"
                        >
                          ✕ Zrušiť
                        </button>
                      </div>

                      <form onSubmit={handlePasswordSubmit}>
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Aktuálne heslo *
                            </label>
                            <input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Nové heslo *
                            </label>
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                              minLength="6"
                              required
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimálne 6 znakov</p>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                              Potvrdiť nové heslo *
                            </label>
                            <input
                              type="password"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
                              minLength="6"
                              required
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full px-4 py-3 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          🔐 Zmeniť heslo
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default ProfilePage
