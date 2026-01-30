
import React from 'react';
import { Menu, Bell, ShoppingCart } from 'lucide-react';
import { UserProfile, AppNotification } from '../types';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onToggleSidebar: () => void;
  user: UserProfile | null;
  notifications: AppNotification[];
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  cartCount?: number;
  translations: any;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ 
  onToggleSidebar, onNavigate, notifications, user, cartCount = 0, translations
}) => {
  const readIds = JSON.parse(localStorage.getItem('rcm_read_notifications') || '[]');
  const hasUnread = notifications.some(n => !readIds.includes(n.id));

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-50 h-16 px-4">
      <div className="h-full flex items-center justify-between">
        <button 
          onClick={onToggleSidebar}
          className="flex items-center justify-center h-11 w-11 text-black bg-white rounded-2xl active:scale-90 transition-all border border-slate-200"
        >
          <Menu size={26} strokeWidth={3} />
        </button>

        <div className="flex flex-col items-center group">
           <div className="flex items-center gap-2">
             <span className="text-black font-black text-xl tracking-tighter uppercase italic leading-none">RCM</span>
             <div className="h-4 w-px bg-slate-200" />
             <span className="text-brand-orange font-black text-lg tracking-widest uppercase">DEALER</span>
           </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate('cart')}
            className="relative flex items-center justify-center h-11 w-11 bg-white border-2 border-slate-100 rounded-2xl active:scale-90 transition-all text-black"
          >
            <ShoppingCart size={22} strokeWidth={3} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-md">
                {cartCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => onNavigate('notifications')}
            className={`relative flex items-center justify-center h-11 w-11 bg-white border-2 rounded-2xl active:scale-90 transition-all ${hasUnread ? 'border-brand-blue text-brand-blue' : 'border-slate-100 text-black'}`}
          >
            <Bell size={22} strokeWidth={3} className={hasUnread ? "animate-pulse" : ""} />
            {hasUnread && (
              <span className="absolute top-1 right-1 w-3 h-3 bg-brand-blue rounded-full border-2 border-white" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
});
