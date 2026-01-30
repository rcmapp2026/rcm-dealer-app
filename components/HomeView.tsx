
import React, { useMemo, useCallback } from 'react';
import { LedgerSummary, Order, Offer, Product, Category, UserProfile } from '../types';
import { MapPin, RefreshCw, Database, ShieldCheck, ArrowRight, Clock, CheckCircle, Zap, Award, CreditCard, User } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { PLACEHOLDER_IMAGE } from '../constants';
import { PaymentBlockedModal } from './PaymentBlockedModal'; // Import the new component

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

// Helper to generate a stylish 3D multi-color logo from the first letter
const BrandLogo = React.memo(({ name }: { name: string }) => {
  const firstLetter = (name || '?').charAt(0).toUpperCase();

  const gradients = [
    'from-orange-400 to-red-600',
    'from-blue-400 to-indigo-600',
    'from-pink-400 to-fuchsia-600',
    'from-emerald-400 to-teal-600',
    'from-purple-400 to-violet-600',
    'from-cyan-400 to-blue-600'
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradient = gradients[hash % gradients.length];

  return (
    <div className="relative group [perspective:1000px]">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-[0_8px_20px_-5px_rgba(0,0,0,0.3)] border-b-4 border-black/20 relative overflow-hidden transition-all duration-300 group-active:translate-y-1 group-active:shadow-none group-active:border-b-0`}>
        <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 -skew-y-12 translate-y-[-20%]" />
        <span className="text-3xl font-[1000] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] italic">
          {firstLetter}
        </span>
      </div>
      <div className="absolute -inset-1.5 border border-slate-100 rounded-[22px] -z-10 opacity-50" />
    </div>
  );
});

export const HomeView: React.FC<HomeViewProps> = React.memo(({ user, ledger, onNavigate, products, orders, onSync, companyProfile }) => {
  // Logic: due_amount > 0 means money owed to company (Red). < 0 means Advance (Green).
  const isDue = (ledger?.due_amount || 0) > 0;

  const recentProducts = useMemo(() =>
    (Array.isArray(products) ? products : []).filter(p => !p.is_rcm).slice(0, 4)
  , [products]);

  const stats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    return {
      total: list.length,
      pending: list.filter(o => o.status === 'Pending' || o.status === 'Approved' || o.status === 'Draft').length,
      completed: list.filter(o => o.status === 'Completed').length
    };
  }, [orders]);

  const uniqueCompanies = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const names = list
      .map(p => p.company)
      .filter((c): c is string => typeof c === 'string' && c.trim() !== '');
    return Array.from(new Set(names)).sort();
  }, [products]);

  const getBrandTextColor = useCallback((name: string) => {
    const colors = ['text-brand-orange', 'text-brand-blue', 'text-fuchsia-600', 'text-emerald-600', 'text-indigo-600'];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);

  if (user?.payment_block) {
    return <PaymentBlockedModal supportNumber={companyProfile?.support_number || 'N/A'} user={user} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen space-y-8 pb-40 px-5 pt-8 overflow-x-hidden font-black">
      {/* Profile Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="bg-brand-blue text-white inline-block px-4 py-1 rounded-full shadow-lg">
            <span className="text-lg font-black tracking-widest uppercase italic">{user?.dealer_code || '---'}</span>
          </div>
          <h1 className="text-3xl text-black leading-none tracking-tighter italic uppercase font-[1000] break-words">
            {user?.shop_name || "RCM Dealer"}
          </h1>
          <p className="text-slate-400 text-[10px] tracking-widest flex items-center gap-1 font-black uppercase italic">
            <MapPin size={12} className="text-brand-blue" /> {user?.city || 'Central Hub'}
          </p>
        </div>
        <button onClick={onSync} className="w-12 h-12 bg-white rounded-2xl border-4 border-slate-50 shadow-sm text-brand-blue flex items-center justify-center active:rotate-180 transition-all">
           <RefreshCw size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
          <div onClick={() => onNavigate('orders')} className="bg-white p-4 rounded-[24px] border-2 border-slate-100 flex flex-col items-center gap-1 active:scale-95 transition-all">
             <Database size={16} className="text-brand-blue" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Total</p>
             <h4 className="text-xl text-black font-[1000] leading-none italic">{stats.total}</h4>
          </div>
          <div onClick={() => onNavigate('orders')} className="bg-white p-4 rounded-[24px] border-2 border-slate-100 flex flex-col items-center gap-1 active:scale-95 transition-all">
             <Clock size={16} className="text-brand-orange" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Active</p>
             <h4 className="text-xl text-black font-[1000] leading-none italic">{stats.pending}</h4>
          </div>
          <div onClick={() => onNavigate('orders')} className="bg-white p-4 rounded-[24px] border-2 border-slate-100 flex flex-col items-center gap-1 active:scale-95 transition-all">
             <CheckCircle size={16} className="text-emerald-600" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Sync</p>
             <h4 className="text-xl text-black font-[1000] leading-none italic">{stats.completed}</h4>
          </div>
      </div>

      {/* Financial Status & Brands (White Area) */}
      <div className="bg-white rounded-[40px] border-[4px] border-slate-50 p-6 space-y-8 shadow-sm">
        <div className="border-b-2 border-slate-50 pb-6">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <CreditCard size={14} className="text-brand-blue" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Settlement Log</span>
              </div>
              <h2 className={`text-4xl font-[1000] italic tracking-tighter leading-none ${isDue ? 'text-brand-red' : 'text-emerald-600'}`}>
                ₹{Math.abs(ledger?.due_amount || 0).toLocaleString()}
              </h2>
              <p className={`text-[8px] font-black uppercase tracking-[0.2em] italic ${isDue ? 'text-brand-red/60' : 'text-emerald-600/60'}`}>
                 {isDue ? 'Outstanding Dues' : 'Surplus Advance'}
              </p>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Award size={18} className="text-brand-orange" strokeWidth={3} />
                 <h3 className="text-base text-black italic tracking-tighter font-[1000] uppercase">Partner Brands</h3>
              </div>
              <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] italic">{uniqueCompanies.length} Nodes</p>
           </div>

           <div className="flex overflow-x-auto no-scrollbar gap-5 py-2">
              {uniqueCompanies.length > 0 ? uniqueCompanies.map((company, idx) => (
                 <motion.div
                   key={idx}
                   whileTap={{ scale: 0.92 }}
                   onClick={() => onNavigate('products', company)}
                   className="min-w-[125px] flex flex-col items-center gap-4 cursor-pointer group"
                 >
                    <BrandLogo name={company} />
                    <div className="text-center w-full">
                      <h4 className={`text-[10px] font-[1000] uppercase italic tracking-tight leading-tight line-clamp-2 px-1 transition-transform group-hover:scale-105 ${getBrandTextColor(company)}`}>
                        {company}
                      </h4>
                    </div>
                 </motion.div>
              )) : (
                <div className="w-full py-8 text-center border-4 border-dashed border-slate-50 rounded-[40px]">
                   <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] italic animate-pulse">Scanning Brands...</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Top Assets */}
      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between px-1">
           <h3 className="text-base text-black italic tracking-tighter font-[1000] uppercase">Top Assets</h3>
           <button onClick={() => onNavigate('products')} className="text-brand-blue text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1">Browse Catalog <ArrowRight size={12} strokeWidth={3} /></button>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {recentProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onNavigate('products', { productId: p.id })}
                className="bg-white p-5 rounded-[36px] border-[3px] border-slate-50 space-y-4 shadow-sm active:scale-95 transition-all"
              >
                 <div className="aspect-square bg-slate-50 rounded-[24px] p-4 flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner">
                    <img src={p.image_url || PLACEHOLDER_IMAGE} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
                 </div>
                 <div className="text-center space-y-1">
                    <p className="text-brand-blue text-[7px] font-black uppercase tracking-[0.2em] italic truncate">{p.company || 'GENUINE'}</p>
                    <h4 className="text-black text-[11px] leading-tight italic truncate uppercase font-[1000] tracking-tight">{p.name}</h4>
                    <div className="pt-1">
                       <p className="text-brand-red text-xl font-[1000] tracking-tighter italic leading-none">₹{p.selling_price?.toLocaleString() || '0'}</p>
                    </div>
                 </div>
              </div>
           ))}
        </div>
      </div>
    </div>
  );
});
