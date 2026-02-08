
import React, { useMemo } from 'react';
import { LedgerSummary, Order, Offer, Product, Category, UserProfile } from '../types';
import { MapPin, RefreshCw, Database, Clock, CheckCircle, ChevronRight, LayoutGrid, CreditCard, Sparkles } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { PaymentBlockedModal } from './PaymentBlockedModal';

const motion = m as any;

interface HomeViewProps {
  user: UserProfile;
  ledger: LedgerSummary;
  offers: Offer[];
  orders: Order[];
  products: Product[];
  categories: Category[];
  onNavigate: (tab: string, filterValue?: any) => void;
  onSync?: () => void;
  companyProfile: any;
}

const getUniqueColor = (text: string) => {
  const colors = [
    'text-blue-600', 'text-rose-600', 'text-amber-600', 'text-emerald-600',
    'text-indigo-600', 'text-orange-600', 'text-cyan-600', 'text-violet-600',
    'text-fuchsia-600', 'text-teal-600', 'text-pink-600', 'text-sky-600',
    'text-lime-600', 'text-red-600', 'text-purple-600', 'text-yellow-600'
  ];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const CategoryBox = React.memo(({ name, onClick, index }: { name: string, onClick: () => void, index: number }) => {
  const textColor = getUniqueColor(name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: index * 0.03,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ y: -8, rotate: index % 2 === 0 ? 2 : -2 }}
      onClick={onClick}
      className="flex flex-col gap-2 cursor-pointer w-full items-center"
    >
      <div className="w-full aspect-square bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-4 active:bg-slate-50 transition-all relative group">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-3 right-3 text-slate-200"
          >
            <Sparkles size={12} />
          </motion.div>

          <p className={`text-[11px] font-black uppercase text-center leading-tight relative z-10 drop-shadow-sm transition-all group-hover:scale-110 ${textColor}`}>
            {name}
          </p>

          <motion.div
            className="mt-3 w-8 h-1 rounded-full bg-slate-100"
            animate={{ width: [8, 16, 8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
      </div>
    </motion.div>
  );
});

export const HomeView: React.FC<HomeViewProps> = React.memo(({ user, ledger, onNavigate, products, orders, categories, onSync, companyProfile }) => {
  const isDue = (ledger?.due_amount || 0) > 0;

  const stats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return {
      total: list.length,
      pending: list.filter(o => o.status === 'Pending' || o.status === 'Approved' || o.status === 'Draft').length,
      completed: list.filter(o => o.status === 'Completed').length
    };
  }, [orders]);

  const hardwareCategories = useMemo(() => {
    return (categories || []).filter(cat => {
        const prod = products.find(p => p.category === cat.name);
        return prod?.product_type === 'Hardware' || !prod?.product_type;
    });
  }, [categories, products]);

  const rcmCategories = useMemo(() => {
    return (categories || []).filter(cat => {
        const prod = products.find(p => p.category === cat.name);
        return prod?.product_type === 'RCM';
    });
  }, [categories, products]);

  if (user?.payment_block) {
    return <PaymentBlockedModal supportNumber={companyProfile?.support_number || 'N/A'} user={user} />;
  }

  return (
    <div className="bg-white min-h-screen space-y-10 pb-40 px-6 pt-10 overflow-x-hidden">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-start"
      >
        <div className="space-y-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-slate-900 text-white inline-block px-4 py-1 rounded-full shadow-lg border-2 border-white/10"
          >
            <span className="text-base font-black tracking-[0.2em] uppercase italic">{user?.dealer_code || '---'}</span>
          </motion.div>
          <h1 className="text-3xl text-slate-900 leading-[0.9] tracking-tighter italic uppercase font-black break-words">
            {user?.shop_name || "RCM Dealer"}
          </h1>
          <p className="text-slate-400 text-[9px] tracking-widest flex items-center gap-1.5 font-black uppercase italic">
            <MapPin size={12} className="text-blue-600" /> {user?.city || 'Central Hub'}
          </p>
        </div>
        <motion.button
          whileTap={{ rotate: 180, scale: 0.9 }}
          onClick={onSync}
          className="w-12 h-12 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-blue-100/30 text-blue-600 flex items-center justify-center transition-all"
        >
           <RefreshCw size={24} strokeWidth={3} />
        </motion.button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => onNavigate('orders')}
            className="bg-slate-50 p-4 rounded-[32px] border border-white shadow-inner flex flex-col items-center gap-1 active:scale-95 transition-all"
          >
             <Database size={16} className="text-blue-600" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Orders</p>
             <h4 className="text-xl text-slate-900 font-black leading-none italic">{stats.total}</h4>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => onNavigate('orders')}
            className="bg-slate-50 p-4 rounded-[32px] border border-white shadow-inner flex flex-col items-center gap-1 active:scale-95 transition-all"
          >
             <Clock size={16} className="text-orange-500" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Active</p>
             <h4 className="text-xl text-slate-900 font-black leading-none italic">{stats.pending}</h4>
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => onNavigate('orders')}
            className="bg-slate-50 p-4 rounded-[32px] border border-white shadow-inner flex flex-col items-center gap-1 active:scale-95 transition-all"
          >
             <CheckCircle size={16} className="text-emerald-600" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Sync</p>
             <h4 className="text-xl text-slate-900 font-black leading-none italic">{stats.completed}</h4>
          </motion.div>
      </div>

      {/* Financial Status Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate('ledger')}
        className="bg-white rounded-[40px] border border-slate-50 p-7 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] relative overflow-hidden group cursor-pointer"
      >
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <CreditCard size={70} strokeWidth={1} />
           </div>

           <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 italic">Financial Summary</span>
              </div>

              <h2
                className={`text-4xl font-black italic tracking-tighter leading-none py-1 ${isDue ? 'text-red-500' : 'text-emerald-500'}`}
                style={{
                  filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.05))',
                  textShadow: '1px 1px 0px rgba(255,255,255,0.5)'
                }}
              >
                ₹{Math.abs(ledger?.due_amount || 0).toLocaleString()}
              </h2>

              <div className="flex items-center justify-between">
                <p
                  className={`text-[8px] font-black uppercase tracking-[0.3em] italic ${isDue ? 'text-red-500' : 'text-emerald-500'}`}
                >
                   {isDue ? 'Outstanding Dues' : 'Surplus Advance'}
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="bg-slate-900 px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                   <span className="text-[7px] text-white font-black uppercase italic tracking-widest">Details</span>
                   <ChevronRight size={8} className="text-white" />
                </motion.div>
              </div>
           </div>
      </motion.div>

      {/* Hardware Categories Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-slate-900/5 flex items-center justify-center">
                    <LayoutGrid size={20} className="text-slate-900" strokeWidth={3} />
                </div>
                <h3 className="text-lg text-slate-900 italic tracking-tighter font-black uppercase">Hardware Category</h3>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
            {hardwareCategories.length > 0 ? hardwareCategories.map((cat, idx) => (
                <CategoryBox
                    key={cat.id || idx}
                    name={cat.name}
                    index={idx}
                    onClick={() => onNavigate('products', { category: cat.name })}
                />
            )) : (
                <div className="col-span-3 py-10 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                    <p className="text-slate-300 text-[7px] font-black uppercase tracking-widest italic">Scanning Hardware...</p>
                </div>
            )}
        </div>
      </div>

      {/* RCM Categories Section */}
      {rcmCategories.length > 0 && (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-orange-500/5 flex items-center justify-center">
                        <ChevronRight size={20} className="text-orange-500" strokeWidth={3} />
                    </div>
                    <h3 className="text-lg text-slate-900 italic tracking-tighter font-black uppercase">RCM Category</h3>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {rcmCategories.map((cat, idx) => (
                    <CategoryBox
                        key={cat.id || idx}
                        name={cat.name}
                        index={idx}
                        onClick={() => onNavigate('rcm_products', { category: cat.name })}
                    />
                ))}
            </div>
        </div>
      )}
    </div>
  );
});
