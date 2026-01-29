import React from 'react';
import { 
  Home, Package, 
  ShoppingBag, User,
  LogOut, X, Crown, Bell,
  LifeBuoy, Gift, Wallet as WalletIcon, Gamepad2, ShoppingCart
} from 'lucide-react';
import { UserProfile } from '../types';
import { motion as m, AnimatePresence } from 'framer-motion';

const motion = m as any;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  user: UserProfile | null;
  cartCount: number;
  translations?: any;
}

const SidebarLink = ({ item, active, onNavigate, onClose }: any) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => {
        onNavigate(item.id);
        onClose();
      }}
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300 group
        ${active
          ? 'bg-black text-white shadow-lg'
          : 'text-black hover:bg-slate-50'
        }`}
    >
      <div className={`transition-transform duration-300 group-active:scale-90 ${active ? 'text-orange-500' : 'text-inherit'}`}>
        <Icon size={18} strokeWidth={3} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest flex-1 text-left italic">{item.label}</span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen, onClose, activeTab, onNavigate, onLogout, user
}) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'notifications', icon: Bell, label: 'NOTIFICATIONS' },
    { id: 'offers', icon: Gift, label: 'OFFERS' },
    { id: 'profile', icon: User, label: 'PROFILE' },
    { id: 'rcm_products', icon: Crown, label: 'RCM STORE' },
    { id: 'products', icon: Package, label: 'HARDWARE' },
    { id: 'orders', icon: ShoppingBag, label: 'ORDERS' },
    { id: 'cart', icon: ShoppingCart, label: 'CART' },
    { id: 'support', icon: LifeBuoy, label: 'SUPPORT' },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white border-r-2 border-slate-50">
      <div className="p-6 flex flex-col gap-5">
        <h1 className="text-2xl font-bold text-black tracking-tighter uppercase italic leading-none">
          RCM<br/><span className="text-orange-500">DEALER</span>
        </h1>

        <div className="p-4 bg-slate-50 rounded-2xl space-y-0.5 border border-slate-100">
            <p className="text-black font-bold text-[11px] uppercase truncate italic">{user?.shop_name || "RCM Dealer"}</p>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em]">Active Session</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 space-y-2 no-scrollbar py-2">
        {menuItems.map((item) => (
          <SidebarLink key={item.id} item={item} active={activeTab === item.id} onNavigate={onNavigate} onClose={onClose} />
        ))}
      </div>

      <div className="p-6 border-t border-slate-50">
        <button onClick={onLogout} className="w-full h-11 rounded-xl text-red-600 font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2.5 bg-slate-50 border border-slate-100 active:scale-95 transition-all italic">
          <LogOut size={14} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-72 h-screen fixed left-0 top-0 z-50">{SidebarContent}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="lg:hidden fixed inset-0 bg-white/60 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="lg:hidden fixed left-0 top-0 bottom-0 w-72 z-[70] shadow-2xl">
              {SidebarContent}
              <button onClick={onClose} className="absolute top-5 -right-12 h-9 w-9 bg-white rounded-full flex items-center justify-center text-black shadow-xl border-2 border-slate-50">
                <X size={18} />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
