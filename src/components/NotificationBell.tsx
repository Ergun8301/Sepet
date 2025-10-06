import React, { useState, useEffect } from 'react';
import { Bell, Check, ShoppingCart, Star, AlertCircle, TrendingUp, Package } from 'lucide-react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { markNotificationAsRead, markAllNotificationsAsRead, Notification } from '../api/notifications';
import { useAuth } from '../hooks/useAuth';

export const NotificationBell = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, refetch } = useRealtimeNotifications(user?.id || null);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);

  useEffect(() => {
    if (notifications.length > 0 && !notifications[0].is_read) {
      const latestNotif = notifications[0];
      setToast(latestNotif);

      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    refetch();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    refetch();
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'reservation':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: ShoppingCart,
          badge: '🟡'
        };
      case 'review':
        return {
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          icon: Star,
          badge: '💬'
        };
      case 'stock_empty':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: AlertCircle,
          badge: '🔴'
        };
      case 'daily_summary':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: TrendingUp,
          badge: '🟢'
        };
      case 'offer':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: Package,
          badge: '🔵'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: Bell,
          badge: '⚪'
        };
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => {
                  const styles = getTypeStyles(notification.type);
                  const Icon = styles.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        !notification.is_read ? styles.bgColor : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${styles.bgColor}`}>
                          <Icon className={`w-5 h-5 ${styles.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-semibold ${styles.color}`}>
                              {styles.badge} {notification.title}
                            </h4>
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="ml-2 p-1 text-gray-400 hover:text-green-600 transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Toast for new notifications */}
      {toast && !isOpen && (
        <div className="fixed top-20 right-4 z-50 animate-slide-down">
          <div
            className={`${getTypeStyles(toast.type).bgColor} border-l-4 ${
              getTypeStyles(toast.type).color.replace('text', 'border')
            } rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow`}
            onClick={() => {
              setIsOpen(true);
              setToast(null);
            }}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full bg-white`}>
                {React.createElement(getTypeStyles(toast.type).icon, {
                  className: `w-5 h-5 ${getTypeStyles(toast.type).color}`
                })}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${getTypeStyles(toast.type).color} flex items-center gap-2`}>
                  <span>{getTypeStyles(toast.type).badge}</span>
                  {toast.title}
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setToast(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
