import { useState } from 'react';
import axios from 'axios';
import { buildApiUrl } from '../config/api';

const PasswordChangeModal = ({ employeeId, token, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Všetky polia sú povinné.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Nové heslo musí mať aspoň 6 znakov.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Nové heslá sa nezhodujú.');
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
      onSuccess(response.data.message);

    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data?.message || 'Nepodarilo sa zmeniť heslo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
            Zmena hesla
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Musíte zmeniť predvolené heslo pri prvom prihlásení.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-sm text-red-800 dark:text-red-300 font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Aktuálne heslo *
            </label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
              placeholder="Zadajte aktuálne heslo"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Nové heslo *
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
              placeholder="Zadajte nové heslo (min. 6 znakov)"
              disabled={loading}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
              Potvrďte nové heslo *
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-orange-500 dark:focus:border-orange-400 focus:outline-none"
              placeholder="Potvrďte nové heslo"
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Menímsa heslo...
                </span>
              ) : (
                'Zmeniť heslo'
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zrušiť
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Po zmene hesla váš účet bude čakať na schválenie administrátorom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
