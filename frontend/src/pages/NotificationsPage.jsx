import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { buildApiUrl } from '../config/api';
import {
  Bell,
  CheckCircle,
  Mail,
  Trash2,
  User,
  Lock,
  UserCheck,
  UserX,
  RefreshCw,
  Package,
  PartyPopper,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import Layout from '../components/Layout';
import NotificationBell from '../components/NotificationBell';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0 });

  // Fetch notifications
  const fetchNotifications = async (newOffset = 0) => {
    setLoading(true);
    try {
      const response = await axios.get(
        buildApiUrl(`api/notifications?filter=${filter}&limit=${pagination.limit}&offset=${newOffset}`),
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
      addToast('Chyba pri načítavaní notifikácií', 'error');
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
        buildApiUrl(`api/notifications/${id}/read`),
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1, read_at: new Date().toISOString() } : n))
      );
      addToast('Označené ako prečítané', 'success');
    } catch (error) {
      console.error('Mark as read error:', error);
      addToast('Chyba pri označení', 'error');
    }
  };

  // Mark as unread
  const markAsUnread = async (id) => {
    try {
      await axios.put(
        buildApiUrl(`api/notifications/${id}/unread`),
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 0, read_at: null } : n))
      );
      addToast('Označené ako neprečítané', 'success');
    } catch (error) {
      console.error('Mark as unread error:', error);
      addToast('Chyba pri označení', 'error');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        buildApiUrl('api/notifications/mark-all-read'),
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      fetchNotifications(pagination.offset);
      addToast('Všetky notifikácie označené', 'success');
    } catch (error) {
      console.error('Mark all as read error:', error);
      addToast('Chyba pri označení', 'error');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    if (!confirm('Naozaj chcete vymazať túto notifikáciu?')) return;

    try {
      await axios.delete(buildApiUrl(`api/notifications/${id}`), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setNotifications(prev => prev.filter(n => n.id !== id));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      addToast('Notifikácia vymazaná', 'success');
    } catch (error) {
      console.error('Delete notification error:', error);
      addToast('Chyba pri mazaní', 'error');
    }
  };

  // Delete all read
  const deleteAllRead = async () => {
    if (!confirm('Naozaj chcete vymazať všetky prečítané notifikácie?')) return;

    try {
      const response = await axios.delete(
        buildApiUrl('api/notifications/delete-all-read'),
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      addToast(`Vymazaných ${response.data.deletedCount} notifikácií`, 'success');
      fetchNotifications(0);
    } catch (error) {
      console.error('Delete all read error:', error);
      addToast('Chyba pri mazaní', 'error');
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

  // Get notification icon component
  const getNotificationIcon = (type) => {
    const iconProps = { className: "w-6 h-6" };
    switch (type) {
      case 'employee_created':
        return <User {...iconProps} />;
      case 'password_changed':
        return <Lock {...iconProps} />;
      case 'employee_approved':
        return <UserCheck {...iconProps} />;
      case 'employee_deactivated':
        return <UserX {...iconProps} />;
      case 'employee_reactivated':
        return <RefreshCw {...iconProps} />;
      case 'order_created':
        return <Package {...iconProps} />;
      case 'order_completed':
        return <PartyPopper {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <Layout
      title="Notifikácie"
      subtitle="Všetky vaše notifikácie na jednom mieste"
      showSearch={false}
    >
      <div className="max-w-5xl mx-auto">

        {/* Filter & Actions */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Filter Tabs */}
            <div className="inline-flex bg-[rgb(var(--color-bg-secondary))] p-1 rounded-xl gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`
                  px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                  ${filter === 'all'
                    ? 'bg-gradient-accent text-white shadow-medium'
                    : 'text-secondary hover:text-primary hover:bg-[rgb(var(--color-bg-elevated))]'
                  }
                `}
              >
                Všetky
                {pagination.total > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === 'all'
                      ? 'bg-white/20'
                      : 'bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400'
                  }`}>
                    {pagination.total}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`
                  px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                  ${filter === 'unread'
                    ? 'bg-gradient-accent text-white shadow-medium'
                    : 'text-secondary hover:text-primary hover:bg-[rgb(var(--color-bg-elevated))]'
                  }
                `}
              >
                Neprečítané
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`
                  px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
                  ${filter === 'read'
                    ? 'bg-gradient-accent text-white shadow-medium'
                    : 'text-secondary hover:text-primary hover:bg-[rgb(var(--color-bg-elevated))]'
                  }
                `}
              >
                Prečítané
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotifications(pagination.offset)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-[rgb(var(--color-bg-secondary))] hover:bg-primary-100 dark:hover:bg-primary-800 text-primary rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-transparent hover:border-accent-500 hover:shadow-soft active:scale-95 disabled:opacity-50"
                title="Obnoviť"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Obnoviť</span>
              </button>
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-soft active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden lg:inline">Označiť všetko</span>
              </button>
              <button
                onClick={deleteAllRead}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-semibold text-sm transition-all duration-200 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-soft active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Vymazať prečítané</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-accent-500 animate-spin mb-4" />
            <p className="text-secondary font-medium">Načítavam notifikácie...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="card p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-2xl flex items-center justify-center">
              <Inbox className="w-10 h-10 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-primary mb-2">Žiadne notifikácie</h3>
            <p className="text-secondary">
              {filter === 'unread' && 'Nemáte žiadne neprečítané notifikácie'}
              {filter === 'read' && 'Nemáte žiadne prečítané notifikácie'}
              {filter === 'all' && 'Zatiaľ ste nedostali žiadne notifikácie'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`card p-5 transition-all ${
                  !notification.is_read ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    !notification.is_read
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-secondary/20 text-tertiary'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-primary">
                          {notification.title}
                        </h3>
                        <p className="text-secondary mt-1">
                          {notification.message}
                        </p>
                        <p className="text-sm text-tertiary mt-2">
                          {formatDate(notification.created_at)}
                          {notification.is_read && notification.read_at && (
                            <span className="ml-2">
                              • Prečítané {formatDate(notification.read_at)}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {!notification.is_read ? (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-all duration-200 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-soft active:scale-90"
                            title="Označiť ako prečítané"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="p-2.5 bg-[rgb(var(--color-bg-secondary))] hover:bg-primary-100 dark:hover:bg-primary-800 text-secondary hover:text-primary rounded-lg transition-all duration-200 border-2 border-transparent hover:border-accent-500 hover:shadow-soft active:scale-90"
                            title="Označiť ako neprečítané"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all duration-200 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 hover:shadow-soft active:scale-90"
                          title="Vymazať"
                        >
                          <Trash2 className="w-5 h-5" />
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
          <div className="flex items-center justify-between mt-6 card p-5 flex-wrap gap-4">
            <p className="text-sm font-semibold text-secondary">
              Strana {currentPage} z {totalPages}
              <span className="ml-2 px-2 py-1 rounded-lg bg-[rgb(var(--color-bg-secondary))] text-primary text-xs">
                {pagination.total} celkom
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchNotifications(Math.max(0, pagination.offset - pagination.limit))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-bg-secondary))] hover:bg-primary-100 dark:hover:bg-primary-800 text-primary rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[rgb(var(--color-bg-secondary))] border-2 border-transparent hover:border-accent-500 hover:shadow-soft active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Predchádzajúca</span>
              </button>
              <button
                onClick={() => fetchNotifications(pagination.offset + pagination.limit)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(var(--color-bg-secondary))] hover:bg-primary-100 dark:hover:bg-primary-800 text-primary rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[rgb(var(--color-bg-secondary))] border-2 border-transparent hover:border-accent-500 hover:shadow-soft active:scale-95"
              >
                <span className="hidden sm:inline">Ďalšia</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
          </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;
