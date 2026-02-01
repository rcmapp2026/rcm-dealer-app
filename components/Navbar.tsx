
import React from 'react';
import { Menu, Bell, ShoppingCart, User } from 'lucide-react';
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
    <nav className="sticky top-0 z-50 w-full bg-slate-50/80 backdrop-blur-md h-16 px-4 border-b border-slate-100">
      <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
        <button 
          onClick={onToggleSidebar}
          className="flex items-center justify-center h-10 w-10 text-slate-900 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all hover:bg-slate-50"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center select-none" onClick={() => onNavigate('home')}>
           <div className="flex items-center gap-1.5">
             <span className="text-slate-900 font-black text-xl tracking-tighter uppercase italic leading-none">RCM</span>
             <div className="h-3 w-[2px] bg-orange-500 rotate-12" />
             <span className="text-orange-500 font-black text-lg tracking-widest uppercase italic">DEALER</span>
           </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('cart')}
            className="relative flex items-center justify-center h-10 w-10 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-all text-slate-900 hover:bg-slate-50"
          >
            <ShoppingCart size={20} strokeWidth={2.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-md animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => onNavigate('notifications')}
            className={`relative flex items-center justify-center h-10 w-10 bg-white border rounded-xl shadow-sm active:scale-90 transition-all ${hasUnread ? 'border-blue-100 text-blue-600' : 'border-slate-100 text-slate-900'}`}
          >
            <Bell size={20} strokeWidth={2.5} className={hasUnread ? "animate-swing" : ""} />
            {hasUnread && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border border-white" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
});
