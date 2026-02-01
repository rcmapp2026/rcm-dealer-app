import React, { memo } from 'react';
import { 
  Home, Package, 
  ShoppingBag, User,
  LogOut, X, Crown, Bell,
  LifeBuoy, Gift, Wallet as WalletIcon, Gamepad2, ShoppingCart, Building2, Layers
} from 'lucide-react';
import { UserProfile, Product } from '../types';
import { motion as m, AnimatePresence } from 'framer-motion';

const motion = m as any;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onNavigate: (tab: string, filter?: any) => void;
  onLogout: () => void;
  user: UserProfile | null;
  cartCount: number;
  translations?: any;
  products?: Product[];
}

const getCompanyColor = (name: string) => {
  const colors = [
    'bg-blue-500 shadow-blue-200',
    'bg-rose-500 shadow-rose-200',
    'bg-amber-500 shadow-amber-200',
    'bg-emerald-500 shadow-emerald-200',
    'bg-indigo-500 shadow-indigo-200',
    'bg-orange-500 shadow-orange-200',
    'bg-cyan-500 shadow-cyan-200',
    'bg-violet-500 shadow-violet-200'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const SidebarLink = memo(({ item, active, onNavigate, onClose }: any) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => {
        onNavigate(item.id);
        onClose();
      }}
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden
        ${active
          ? 'bg-black text-white shadow-xl scale-[1.02]'
          : 'text-slate-600 hover:bg-slate-50'
        }`}
    >
      <div className={`transition-all duration-500 p-2 rounded-xl group-active:scale-90
        ${active ? 'bg-white/10 text-white' : `bg-white shadow-sm border border-slate-100 ${item.color}`}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <span className="text-[11px] font-black uppercase tracking-wider flex-1 text-left italic">{item.label}</span>

      {active && (
        <motion.div
            layoutId="activeGlow"
            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316]"
        />
      )}
    </button>
  );
});

export const Sidebar: React.FC<SidebarProps> = memo(({
  isOpen, onClose, activeTab, onNavigate, onLogout, user, products = []
}) => {
  const menuItems = [
    { id: 'home', icon: Home, label: 'HOME', color: 'text-blue-500' },
    { id: 'partners', icon: Building2, label: 'OUR BRANDS', color: 'text-orange-500' },
    { id: 'notifications', icon: Bell, label: 'NOTIFICATIONS', color: 'text-amber-500' },
    { id: 'offers', icon: Gift, label: 'OFFERS', color: 'text-rose-500' },
    { id: 'profile', icon: User, label: 'PROFILE', color: 'text-indigo-500' },
    { id: 'rcm_products', icon: Crown, label: 'RCM STORE', color: 'text-orange-500' },
    { id: 'products', icon: Package, label: 'HARDWARE', color: 'text-emerald-500' },
    { id: 'orders', icon: ShoppingBag, label: 'ORDERS', color: 'text-violet-500' },
    { id: 'cart', icon: ShoppingCart, label: 'CART', color: 'text-cyan-500' },
    { id: 'support', icon: LifeBuoy, label: 'SUPPORT', color: 'text-sky-500' },
  ];

  const hardwareCompanies = React.useMemo(() => {
    const names = (products || [])
      .filter(p => !p.is_rcm && p.company?.toUpperCase() !== 'RCM' && p.company?.toUpperCase() !== 'GENUINE RCM')
      .map(p => p.company)
      .filter((c): c is string => typeof c === 'string' && c.trim() !== '');
    return Array.from(new Set(names)).sort();
  }, [products]);

  const SidebarContent = (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="p-8 flex flex-col gap-6 shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg rotate-3 shadow-orange-500/30 border-2 border-white">
                <span className="text-white font-black italic text-xl drop-shadow-md">R</span>
            </div>
            <h1 className="text-2xl font-black text-black tracking-tighter uppercase italic leading-none">
              RCM<br/><span className="text-orange-500">DEALER</span>
            </h1>
        </div>

        <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-[24px] space-y-1 border border-slate-100 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/40 rounded-full blur-2xl group-hover:bg-orange-200/40 transition-colors" />
            <p className="text-black font-black text-xs uppercase truncate italic relative z-10">{user?.shop_name || "RCM Dealer"}</p>
            <div className="flex items-center gap-2 relative z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em]">Live Session</p>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-8 no-scrollbar py-4">
        <div className="space-y-2">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-2 flex items-center gap-2">
                <Layers size={10} /> Main Hub
            </p>
            {menuItems.map((item) => (
                <SidebarLink key={item.id} item={item} active={activeTab === item.id} onNavigate={onNavigate} onClose={onClose} />
            ))}
        </div>

        {hardwareCompanies.length > 0 && (
            <div className="space-y-3 pb-10">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                    <Building2 size={10} /> Quick Partners
                </p>
                <div className="grid grid-cols-1 gap-1">
                    {hardwareCompanies.map((company, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                onNavigate('products', company);
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 active:scale-95 group"
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border-2 border-white shadow-md transition-all duration-300 ${getCompanyColor(company)}`}>
                                <span className="text-[10px] font-black text-white">{company.charAt(0).toUpperCase()}</span>
                            </div>
                            <span className="text-[10px] font-black uppercase italic tracking-tight truncate flex-1 text-left text-slate-500 group-hover:text-black">{company}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="p-8 border-t border-slate-50 shrink-0">
        <button
            onClick={onLogout}
            className="w-full h-14 rounded-2xl text-red-500 font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 bg-red-50 border border-red-100 active:scale-95 transition-all italic hover:bg-red-100/50"
        >
          <LogOut size={16} strokeWidth={3} /> Logout Account
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block w-72 h-screen fixed left-0 top-0 z-50 border-r border-slate-100 shadow-sm">{SidebarContent}</div>
      <AnimatePresence mode="wait">
        {isOpen && (
          <div key="sidebar-overlay" className="lg:hidden fixed inset-0 z-[60]">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3, ease: 'circOut' }}
                className="absolute left-0 top-0 bottom-0 w-80 shadow-2xl overflow-hidden rounded-r-[40px] bg-white border-r border-slate-100"
            >
              {SidebarContent}
              <button
                onClick={onClose}
                className="absolute top-8 -right-4 h-12 w-12 bg-white rounded-full flex items-center justify-center text-black shadow-2xl border border-slate-100 active:scale-90 transition-all z-50"
              >
                <X size={20} strokeWidth={3} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
});
