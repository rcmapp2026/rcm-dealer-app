
import React from 'react';
import { supabase } from '../services/supabaseClient';
import { Loader2, Bell, AlertTriangle, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserProfile, AppNotification } from '../types';

interface NotificationsScreenProps {
  user: UserProfile | null;
  notifications: AppNotification[];
  onRefresh: () => void;
}

const NotificationCard: React.FC<{ notification: AppNotification, onMarkAsRead: (id: string) => void }> = ({ notification, onMarkAsRead }) => {
  const isPaymentAlert = notification.data?.type === 'payment_alert';
  const isOffer = notification.data?.type === 'offer';

  const icon = isPaymentAlert ? (
    <AlertTriangle className="text-red-500" size={24} />
  ) : isOffer ? (
    <Bell className="text-blue-500" size={24} />
  ) : (
    <Bell className="text-gray-500" size={24} />
  );

  const handleCardClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={`p-4 rounded-2xl flex items-start gap-4 border ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className={`font-bold ${isPaymentAlert ? 'text-red-700' : 'text-black'}`}>
          {notification.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
      </div>
      {!notification.is_read && <Eye size={18} className="text-blue-500" />}
    </motion.div>
  );
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ user, notifications, onRefresh }) => {

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    onRefresh(); 
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-orange" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 pt-6 pb-24">
      <h1 className="text-2xl font-black text-black mb-6">Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center mt-12">You have no notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map(n => (
            <NotificationCard key={n.id} notification={n} onMarkAsRead={markAsRead} />
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
