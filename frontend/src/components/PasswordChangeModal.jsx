import { useState } from 'react';
import { useToast } from '../context/ToastContext'
import { Lock, Save, X } from 'lucide-react'
import axios from 'axios';
import { buildApiUrl } from '../config/api';

const PasswordChangeModal = ({ employeeId, token, onSuccess, onCancel }) => {
  const toast = useToast()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Všetky polia sú povinné.');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('Nové heslo musí mať aspoň 6 znakov.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Nové heslá sa nezhodujú.');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        buildApiUrl(`api/employees/${employeeId}/change-password`),
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Success - call onSuccess callback
      toast.success(response.data.message);
      onSuccess(response.data.message);

    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.message || 'Nepodarilo sa zmeniť heslo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-elevated rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-primary mb-2">
            Zmena hesla
          </h2>
          <p className="text-sm text-secondary">
            Musíte zmeniť predvolené heslo pri prvom prihlásení.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Aktuálne heslo *
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="input"
                placeholder="Zadajte aktuálne heslo"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Nové heslo *
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="input"
                placeholder="Zadajte nové heslo (min. 6 znakov)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-secondary mb-2">
                Potvrďte nové heslo *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input"
                placeholder="Potvrďte nové heslo"
                disabled={loading}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Menímsa heslo...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Zmeniť heslo
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="btn btn-outline flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Zrušiť
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 pt-6 border-t border-primary">
          <p className="text-xs text-tertiary text-center">
            Po zmene hesla váš účet bude čakať na schválenie administrátorom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
