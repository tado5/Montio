import { useState, useRef } from 'react'
import { Camera, Upload, Trash2, X, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

const AvatarUpload = ({ currentAvatar, email, onAvatarUpdate, onClose }) => {
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef(null)

  const hasCustomAvatar = currentAvatar && currentAvatar.startsWith('/uploads')
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}&backgroundColor=f97316,ea580c,fb923c`

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Prosím vyberte obrázok.')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Súbor je príliš veľký. Maximálna veľkosť je 5MB.')
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const token = localStorage.getItem('token')
      const response = await axios.put('/api/auth/avatar', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      onAvatarUpdate(response.data.avatarUrl)
      setPreview(null)
      setSelectedFile(null)
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert(error.response?.data?.message || 'Chyba pri nahrávaní avatara')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Naozaj chcete vymazať svoj avatar?')) return

    try {
      setDeleting(true)
      const token = localStorage.getItem('token')
      await axios.delete('/api/auth/avatar', {
        headers: { Authorization: `Bearer ${token}` }
      })

      onAvatarUpdate(null)
    } catch (error) {
      console.error('Avatar delete error:', error)
      alert(error.response?.data?.message || 'Chyba pri mazaní avatara')
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/80 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Archivo Black', sans-serif" }}>
              AVATAR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Current/Preview Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700 mb-4">
              <img
                src={preview || (hasCustomAvatar ? currentAvatar : defaultAvatar)}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>

            {hasCustomAvatar && (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 mb-2">
                <CheckCircle2 className="w-3 h-3" />
                Custom avatar
              </span>
            )}

            {!hasCustomAvatar && !preview && (
              <span className="text-xs font-mono text-slate-500">
                Default DiceBear avatar
              </span>
            )}

            {preview && (
              <span className="text-xs font-mono text-orange-400 animate-pulse">
                Preview - Click upload to save
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Upload Button */}
            {!preview && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm font-mono font-bold text-orange-400 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upload New Avatar
              </button>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Preview Actions */}
            {preview && (
              <>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-sm font-mono font-bold text-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Upload
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={uploading}
                  className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-mono font-bold text-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}

            {/* Delete Avatar */}
            {hasCustomAvatar && !preview && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-sm font-mono font-bold text-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove Avatar
                  </>
                )}
              </button>
            )}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="text-xs font-mono text-slate-400 space-y-1">
              <div>• Supported: JPG, PNG, WebP</div>
              <div>• Max size: 5MB</div>
              <div>• Recommended: Square image (256x256px)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarUpload
