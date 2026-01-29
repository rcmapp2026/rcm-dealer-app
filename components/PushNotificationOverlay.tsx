import React, { useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle } from 'lucide-react';

const motion = m as any;

export interface PushMessage {
  id: string;
  title: string;
  body: string;
  type: 'payment_alert' | 'general';
}

interface Props {
  notifications: PushMessage[];
  onDismiss: (id: string) => void;
}

export const PushNotificationOverlay: React.FC<Props> = ({ notifications, onDismiss }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] pointer-events-none p-4 flex flex-col items-center gap-3">
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} onDismiss={() => onDismiss(n.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationCard: React.FC<{ notification: PushMessage; onDismiss: () => void }> = ({ notification, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isPaymentAlert = notification.type === 'payment_alert';

  const icons = {
    general: <Bell className="text-orange-500" size={24} />,
    payment_alert: <AlertTriangle className="text-red-500" size={24} />
  };

  if (isPaymentAlert) {
    return (
      <motion.div
        initial={{ y: -100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        className="pointer-events-auto w-full max-w-sm bg-red-50 border border-red-200 rounded-3xl p-4 shadow-2xl flex items-start gap-4 relative overflow-hidden"
      >
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-md">
          {icons.payment_alert}
        </div>
        
        <div className="flex-1 min-w-0 pr-6">
          <h4 className="text-sm font-extrabold text-red-700">{notification.title}</h4>
          <p className="text-sm font-semibold text-red-900 leading-tight mt-1">{notification.body}</p>
        </div>

        <button onClick={onDismiss} className="absolute top-3 right-3 text-red-400 hover:text-red-700 transition-colors">
          <X size={16} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0, scale: 0.9 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: -20, opacity: 0, scale: 0.95 }}
      className="pointer-events-auto w-full max-w-sm bg-white/80 backdrop-blur-2xl border border-gray-200/50 rounded-3xl p-4 shadow-xl flex items-center gap-4 relative overflow-hidden"
    >
      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-md">
        {icons.general}
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{notification.title}</h4>
        <p className="text-sm font-semibold text-gray-800 leading-tight mt-0.5">{notification.body}</p>
      </div>

      <button onClick={onDismiss} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 transition-colors">
        <X size={16} />
      </button>
    </motion.div>
  );
};
