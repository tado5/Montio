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
  AlertCircle,
  Camera,
  Crown,
  Wrench,
  Key,
  Eye,
  EyeOff
} from 'lucide-react'
import DynamicLayout from '../components/DynamicLayout'
import ReadOnlyBanner from '../components/ReadOnlyBanner'
import AvatarUpload from '../components/AvatarUpload'
import { api } from '../utils/apiClient'

const ProfilePage = () => {
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      const response = await api.get('/api/auth/profile')

      const profileData = response.data.profile
      setProfile(profileData)
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || ''
      })
      setLoading(false)
    } catch (err) {
      console.error('Fetch profile error:', err)
      toast.error(err.userMessage || 'Nepodarilo sa načítať profil')
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    try {
      await api.put('/api/auth/profile', profileForm)
      toast.success('Profil úspešne aktualizovaný')
      setIsEditMode(false)
      fetchProfile()
    } catch (err) {
      toast.error(err.userMessage || 'Chyba pri aktualizácii profilu')
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Nové heslá sa nezhodujú')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Nové heslo musí mať minimálne 6 znakov')
      return
    }

    try {
      await api.put('/api/auth/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      toast.success('Heslo úspešne zmenené')
      setIsChangingPassword(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.userMessage || 'Chyba pri zmene hesla')
    }
  }

  const handleAvatarUpdate = (newAvatarUrl) => {
    setProfile({ ...profile, avatar_url: newAvatarUrl })
    setShowAvatarModal(false)
    toast.success(newAvatarUrl ? 'Avatar aktualizovaný' : 'Avatar vymazaný')
    // Update user in AuthContext and localStorage
    if (user) {
      const updatedUser = { ...user, avatar_url: newAvatarUrl }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const getRoleColor = () => {
    switch (user?.role) {
      case 'superadmin':
        return 'from-orange-500 to-red-600'
      case 'companyadmin':
        return 'from-blue-500 to-cyan-600'
      case 'employee':
        return 'from-emerald-500 to-green-600'
      default:
        return 'from-slate-500 to-slate-600'
    }
  }

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'superadmin':
        return Crown
      case 'companyadmin':
        return Building2
      case 'employee':
        return Wrench
      default:
        return User
    }
  }

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'superadmin':
        return 'SUPER ADMINISTRATOR'
      case 'companyadmin':
        return 'COMPANY ADMINISTRATOR'
      case 'employee':
        return 'FIELD TECHNICIAN'
      default:
        return 'USER'
    }
  }

  if (loading) {
    return (
      <DynamicLayout
        title="USER PROFILE"
        subtitle="Loading account data"
        showSearch={false}
      >
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-mono text-sm">Loading profile...</p>
          </div>
        </div>
      </DynamicLayout>
    )
  }

  const RoleIcon = getRoleIcon()

  return (
    <DynamicLayout
      title="USER PROFILE"
      subtitle="Manage your account settings"
      showSearch={false}
    >
      <ReadOnlyBanner />

      {/* Profile Header Card */}
      <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-8 mb-6 backdrop-blur-sm animate-slide-down relative overflow-hidden">
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-r ${getRoleColor()} opacity-5`}></div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
            <div className={`w-32 h-32 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 group-hover:border-orange-500 transition-all duration-300`}>
              <img
                src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.email)}&backgroundColor=f97316,ea580c,fb923c`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Camera overlay */}
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            {/* Click to change hint */}
            <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-orange-500/80 border border-orange-400 rounded-lg group-hover:scale-110 transition-transform">
              <span className="text-[10px] font-mono text-white uppercase tracking-wider font-bold">Click</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                {profile.name || profile.email}
              </h2>
              <div className={`px-3 py-1 bg-gradient-to-r ${getRoleColor()} rounded-lg border border-white/20 shadow-lg`}>
                <RoleIcon className="w-4 h-4 text-white inline" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
              <span className={`px-3 py-1 bg-gradient-to-r ${getRoleColor()} bg-opacity-10 rounded-lg border border-current text-xs font-mono font-bold uppercase tracking-wider`}>
                {getRoleLabel()}
              </span>
              {profile.company_name && (
                <span className="text-sm font-mono text-slate-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {profile.company_name}
                </span>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-sm font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Edit Button */}
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-orange-500/30 rounded-lg transition-all text-sm font-mono font-bold text-slate-300 hover:text-white flex items-center gap-2 group"
            >
              <Edit2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                  PERSONAL INFO
                </h3>
              </div>
              {isEditMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-xs font-mono font-bold text-red-400 transition-all flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-mono font-bold text-emerald-400 transition-all flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {isEditMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm transition-all"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm transition-all"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm transition-all"
                    placeholder="+421 XXX XXX XXX"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Full Name</div>
                  <div className="text-sm font-mono text-white px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                    {profile.name || '—'}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Email Address</div>
                  <div className="text-sm font-mono text-white px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                    {profile.email}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Phone Number</div>
                  <div className="text-sm font-mono text-white px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                    {profile.phone || '—'}
                  </div>
                </div>

                {profile.position && (
                  <div>
                    <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Position</div>
                    <div className="text-sm font-mono text-white px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                      {profile.position}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
                  SECURITY
                </h3>
              </div>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="px-3 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-xs font-mono font-bold text-orange-400 transition-all flex items-center gap-1"
                >
                  <Key className="w-3 h-3" />
                  Change Password
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isChangingPassword ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm transition-all"
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm transition-all"
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 focus:border-orange-500/60 rounded-lg text-white font-mono text-sm transition-all"
                      placeholder="Confirm new password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="flex-1 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-mono font-bold text-red-400 transition-all flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm font-mono font-bold text-emerald-400 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Update
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
                  <div>
                    <div className="text-sm font-mono text-white mb-1">Password</div>
                    <div className="text-xs font-mono text-slate-500">••••••••••••</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-mono text-blue-400 font-bold mb-1">Security Tip</div>
                      <div className="text-xs font-mono text-slate-400">
                        Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Info */}
      <div className="mt-6 bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
            ACCOUNT DETAILS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Account ID</div>
            <div className="text-sm font-mono text-white break-all">{profile.id}</div>
          </div>

          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Status</div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${profile.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm font-mono text-white uppercase">{profile.status || 'Active'}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Role</div>
            <div className="text-sm font-mono text-white uppercase">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <AvatarUpload
          currentAvatar={profile.avatar_url}
          email={profile.email}
          onAvatarUpdate={handleAvatarUpdate}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </DynamicLayout>
  )
}

export default ProfilePage
