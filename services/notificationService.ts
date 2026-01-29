import { walletService } from './walletService';
import { WalletNotification } from '../types';

class NotificationService {
  private static instance: NotificationService;
  private notificationQueue: WalletNotification[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Show browser notification
   */
  private showBrowserNotification(notification: WalletNotification) {
    if (!('Notification' in window)) {
      console.log('Browser notifications not supported');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: true
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
            requireInteraction: true
          });
        }
      });
    }
  }

  /**
   * Show in-app toast notification
   */
  private showToast(notification: WalletNotification) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-[9999] p-4 rounded-xl shadow-xl max-w-sm transform translate-x-full transition-transform duration-300 ${
      notification.type === 'success' ? 'bg-green-500 text-white' :
      notification.type === 'error' ? 'bg-red-500 text-white' :
      notification.type === 'warning' ? 'bg-yellow-500 text-white' :
      'bg-blue-500 text-white'
    }`;

    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 mt-1">
          ${notification.type === 'success' ? '✓' :
            notification.type === 'error' ? '✕' :
            notification.type === 'warning' ? '!' :
            'ℹ'}
        </div>
        <div class="flex-1">
          <div class="font-bold text-sm">${notification.title}</div>
          <div class="text-sm opacity-90 mt-1">${notification.message}</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 ml-2 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
      toast.classList.add('translate-x-0');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  /**
   * Process and show notification
   */
  async processNotification(notification: WalletNotification) {
    // Mark as read
    await walletService.markNotificationAsRead(notification.id);

    // Show browser notification if page is not visible
    if (document.hidden) {
      this.showBrowserNotification(notification);
    } else {
      // Show in-app toast
      this.showToast(notification);
    }

    // Add to queue for notification center
    this.notificationQueue.unshift(notification);
    if (this.notificationQueue.length > 50) {
      this.notificationQueue = this.notificationQueue.slice(0, 50);
    }

    // Trigger custom event for components to listen
    window.dispatchEvent(new CustomEvent('walletNotification', {
      detail: notification
    }));
  }

  /**
   * Get notification queue
   */
  getNotificationQueue(): WalletNotification[] {
    return [...this.notificationQueue];
  }

  /**
   * Clear notification queue
   */
  clearNotificationQueue(): void {
    this.notificationQueue = [];
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// React Hook for notifications
import { useEffect, useState, useCallback } from 'react';

export function useWalletNotifications(dealerId: string) {
  const [notifications, setNotifications] = useState<WalletNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notificationData = await walletService.getWalletNotifications(dealerId, 20);
      setNotifications(notificationData);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await walletService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const clearAll = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      for (const notification of unreadNotifications) {
        await walletService.markNotificationAsRead(notification.id);
      }
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications
    const handleNotification = (event: CustomEvent) => {
      const notification = event.detail as WalletNotification;
      setNotifications(prev => [notification, ...prev.slice(0, 19)]);
    };

    window.addEventListener('walletNotification', handleNotification as EventListener);

    return () => {
      window.removeEventListener('walletNotification', handleNotification as EventListener);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    markAsRead,
    clearAll,
    refetch: fetchNotifications,
    unreadCount: notifications.filter(n => !n.is_read).length
  };
}
