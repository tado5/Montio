import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

  // Fetch notifications
  const fetchNotifications = async (newOffset = 0) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3001/api/notifications?filter=${filter}&limit=${pagination.limit}&offset=${newOffset}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setNotifications(response.data.notifications);
      setPagination({
        total: response.data.total,
        limit: response.data.limit,
        offset: response.data.offset
      });
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications(0);
    }
  }, [user, filter]);

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await axios.put(
        `http://localhost:3001/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1, read_at: new Date().toISOString() } : n))
      );
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // Mark as unread
  const markAsUnread = async (id) => {
    try {
      await axios.put(
        `http://localhost:3001/api/notifications/${id}/unread`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 0, read_at: null } : n))
      );
    } catch (error) {
      console.error('Mark as unread error:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        'http://localhost:3001/api/notifications/mark-all-read',
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      fetchNotifications(pagination.offset);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!confirm('Naozaj chcete vymazať túto notifikáciu?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setNotifications(prev => prev.filter(n => n.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      console.error('Delete notification error:', error);
    }
  };

  // Delete all read
  const deleteAllRead = async () => {
    if (!confirm('Naozaj chcete vymazať všetky prečítané notifikácie?')) return;

    try {
      const response = await axios.delete(
        'http://localhost:3001/api/notifications/delete-all-read',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      alert(`Vymazané ${response.data.deletedCount} notifikácií.`);
      fetchNotifications(0);
    } catch (error) {
      console.error('Delete all read error:', error);
    }
  };

  // Format timestamp
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'employee_created':
        return '👤';
      case 'password_changed':
        return '🔐';
      case 'employee_approved':
        return '✅';
      case 'employee_deactivated':
        return '🚫';
      case 'employee_reactivated':
        return '🔄';
      case 'order_created':
        return '📦';
      case 'order_completed':
        return '🎉';
      default:
        return '🔔';
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text mb-2">
            Notifikácie
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Všetky vaše notifikácie na jednom mieste
          </p>
        </div>

        {/* Filter & Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Všetky ({pagination.total})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'unread'
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Neprečítané
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'read'
                    ? 'bg-gradient-to-r from-orange-400 to-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Prečítané
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              >
                Označiť všetko
              </button>
              <button
                onClick={deleteAllRead}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                Vymazať prečítané
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Žiadne notifikácie</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-5 transition-all hover:shadow-xl ${
                  !notification.is_read ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-4xl">{getNotificationIcon(notification.type)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {formatDate(notification.created_at)}
                          {notification.is_read && notification.read_at && (
                            <span className="ml-2">
                              • Prečítané {formatDate(notification.read_at)}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!notification.is_read ? (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Označiť ako prečítané"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Označiť ako neprečítané"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Vymazať"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Strana {currentPage} z {totalPages} (Celkom: {pagination.total})
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotifications(Math.max(0, pagination.offset - pagination.limit))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Predchádzajúca
              </button>
              <button
                onClick={() => fetchNotifications(pagination.offset + pagination.limit)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Ďalšia
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
