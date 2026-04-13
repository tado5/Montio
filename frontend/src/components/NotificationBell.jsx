import { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext'
import { Bell, Check, Inbox } from 'lucide-react'
import { api } from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast()
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Fetch unread count error:', error);
    }
  };

  // Fetch recent notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/notifications?limit=5');
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mark as read
  const markAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`, {});

      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: 1 } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put('/api/notifications/mark-all-read', {});

      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  // Poll for unread count every 30 seconds
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
    }
  }, [isOpen, user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Format time ago
  const timeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const seconds = Math.floor((now - past) / 1000);

    if (seconds < 60) return 'Práve teraz';
    if (seconds < 3600) return `Pred ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Pred ${Math.floor(seconds / 3600)} hod`;
    if (seconds < 604800) return `Pred ${Math.floor(seconds / 86400)} dňami`;
    return past.toLocaleDateString('sk-SK');
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

  if (!user) return null;

  const handleBellClick = () => {
    // On mobile, navigate directly to notifications page
    if (window.innerWidth < 768) {
      navigate('/notifications');
    } else {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className={`relative p-1 md:p-2 transition-all duration-200 rounded-lg ${
          unreadCount > 0
            ? 'text-accent-500 hover:text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20'
            : 'text-secondary hover:text-primary hover:bg-primary-50 dark:hover:bg-primary-800'
        }`}
      >
        <Bell className={`w-4 h-4 md:w-5 md:h-5 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />

        {/* Badge with pulse animation */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center">
            {/* Pulse ring */}
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-75 animate-ping"></span>
            {/* Badge */}
            <span className="relative inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-gradient-accent rounded-full shadow-strong min-w-[20px]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-elevated rounded-2xl shadow-strong border-2 border-primary z-50 animate-scale-in overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-primary bg-[rgb(var(--color-bg-secondary))]">
            <h3 className="text-lg font-display font-bold text-primary flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent-500" />
              Notifikácie
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-gradient-accent text-white text-xs font-bold rounded-full shadow-soft">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg font-semibold transition-all duration-200 border border-blue-200 dark:border-blue-800 hover:shadow-soft"
              >
                <Check className="w-3.5 h-3.5" />
                Označiť všetko
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent-200 dark:border-accent-700 border-t-accent-500"></div>
                <p className="text-sm text-tertiary mt-3 font-medium">Načítavam...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-2xl flex items-center justify-center">
                  <Inbox className="w-8 h-8 text-accent-600 dark:text-accent-400" />
                </div>
                <p className="text-sm font-semibold text-primary">Žiadne notifikácie</p>
                <p className="text-xs text-tertiary mt-1">Budete upozornení na nové udalosti</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`px-5 py-4 border-b border-primary hover:bg-primary-50 dark:hover:bg-primary-800 cursor-pointer transition-all duration-200 ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary line-clamp-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-secondary mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-tertiary mt-2 font-medium">
                        {timeAgo(notification.created_at)}
                      </p>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1 flex-shrink-0 animate-pulse shadow-lg shadow-blue-500/50"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-4 border-t-2 border-primary bg-[rgb(var(--color-bg-secondary))]">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
                className="w-full py-2.5 text-center text-sm bg-gradient-accent text-white hover:opacity-90 rounded-lg font-semibold transition-all duration-200 shadow-soft hover:shadow-medium active:scale-95"
              >
                Zobraziť všetky notifikácie
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
