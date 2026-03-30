import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Edit2,
  Save,
  X,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Layout from '../components/Layout'
import ReadOnlyBanner from '../components/ReadOnlyBanner'
import axios from 'axios'

const ProfilePage = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
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
    } catch (err) {
      console.error('Fetch profile error:', err)
      toast.error('Nepodarilo sa načítať profil.')
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

      toast.success('Profil bol aktualizovaný.')
      setIsEditMode(false)
      fetchProfile()
    } catch (err) {
      console.error('Update profile error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa aktualizovať profil.')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Nové heslá sa nezhodujú.')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Nové heslo musí mať aspoň 6 znakov.')
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

      toast.success('Heslo bolo zmenené.')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
    } catch (err) {
      console.error('Change password error:', err)
      toast.error(err.response?.data?.message || 'Nepodarilo sa zmeniť heslo.')
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
    <Layout
      title="Môj profil"
      subtitle="Spravujte svoje osobné údaje"
      showSearch={false}
    >
      {/* Read-Only Banner for Inactive Users */}
      <ReadOnlyBanner />

      {/* Page Content */}
      {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-200 dark:border-accent-700 border-t-accent-600 dark:border-t-accent-400"></div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Profile Header Card with Avatar */}
              <div className="card p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="relative flex-shrink-0">
                    <img
                      src={getAvatarUrl(profile?.email)}
                      alt="Avatar"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-2xl shadow-medium border-4 border-[rgb(var(--color-bg-elevated))]"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-gradient-accent rounded-full px-3 py-1 shadow-soft">
                      <span className="text-white text-xs font-bold">{getRoleName(profile?.role)}</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-primary mb-2">
                      {profile?.name || 'Používateľ'}
                    </h2>
                    <p className="text-base md:text-lg text-secondary mb-3 flex items-center justify-center md:justify-start gap-2">
                      <Mail className="w-5 h-5" />
                      {profile?.email}
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {profile?.company_name && (
                        <span className="badge badge-info inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {profile.company_name}
                        </span>
                      )}
                      {profile?.position && (
                        <span className="badge badge-neutral inline-flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {profile.position}
                        </span>
                      )}
                      {profile?.phone && (
                        <span className="badge badge-success inline-flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {profile.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isEditMode && !isChangingPassword && (
                    <button
                      onClick={() => !user?.isReadOnly && setIsEditMode(true)}
                      disabled={user?.isReadOnly}
                      className={`btn flex items-center gap-2 whitespace-nowrap ${
                        user?.isReadOnly
                          ? 'opacity-50 cursor-not-allowed'
                          : 'btn-secondary'
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                      Upraviť profil
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Profile Form */}
              {isEditMode && (
                <div className="card p-6 animate-slide-down">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl md:text-2xl font-display font-bold text-primary">Upraviť údaje</h3>
                    <button
                      onClick={() => {
                        setIsEditMode(false)
                        setProfileForm({
                          name: profile?.name || '',
                          email: profile?.email || '',
                          phone: profile?.phone || ''
                        })
                      }}
                      className="btn btn-ghost p-2"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Meno a priezvisko *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                          <input
                            type="text"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="input pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                          <input
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="input pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-secondary mb-2">
                          Telefón
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                          <input
                            type="tel"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            placeholder="+421..."
                            className="input pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      Uložiť zmeny
                    </button>
                  </form>
                </div>
              )}

              {/* Change Password Section */}
              {!isEditMode && (
                <div className="card p-6">
                  {!isChangingPassword ? (
                    <div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-display font-bold text-primary">Zabezpečenie</h3>
                          <p className="text-sm text-secondary mt-1">
                            Spravujte svoje prístupové heslo
                          </p>
                        </div>
                        <button
                          onClick={() => !user?.isReadOnly && setIsChangingPassword(true)}
                          disabled={user?.isReadOnly}
                          className={`btn flex items-center gap-2 ${
                            user?.isReadOnly
                              ? 'opacity-50 cursor-not-allowed'
                              : 'btn-primary'
                          }`}
                        >
                          <Lock className="w-4 h-4" />
                          Zmeniť heslo
                        </button>
                      </div>
                      <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Heslo je zabezpečené
                          </p>
                          <p className="text-xs text-tertiary">
                            Naposledy zmenené: {new Date(profile?.created_at).toLocaleDateString('sk-SK')}
                          </p>
                        </div>
                      </div>

                      {user?.isReadOnly && (
                        <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 mt-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-amber-900 dark:text-amber-300">READ-ONLY režim</p>
                            <p className="text-xs text-amber-800 dark:text-amber-400">
                              Váš účet je deaktivovaný. Nemôžete upravovať profil ani meniť heslo.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-slide-down">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl md:text-2xl font-display font-bold text-primary">Zmeniť heslo</h3>
                        <button
                          onClick={() => {
                            setIsChangingPassword(false)
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            })
                          }}
                          className="btn btn-ghost p-2"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handlePasswordSubmit}>
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">
                              Aktuálne heslo *
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                              <input
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                className="input pl-10"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">
                              Nové heslo *
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                              <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                className="input pl-10"
                                minLength="6"
                                required
                              />
                            </div>
                            <p className="text-xs text-tertiary mt-1">Minimálne 6 znakov</p>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-secondary mb-2">
                              Potvrdiť nové heslo *
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiary" />
                              <input
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                className="input pl-10"
                                minLength="6"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary w-full flex items-center justify-center gap-2"
                        >
                          <Lock className="w-5 h-5" />
                          Zmeniť heslo
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
    </Layout>
  )
}

export default ProfilePage
