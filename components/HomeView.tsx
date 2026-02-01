
import React, { useMemo } from 'react';
import { LedgerSummary, Order, Offer, Product, Category, UserProfile } from '../types';
import { MapPin, RefreshCw, Database, Clock, CheckCircle, Award, CreditCard, ChevronRight, LayoutGrid, Sparkles, Box } from 'lucide-react';
import { motion as m } from 'framer-motion';
import { PaymentBlockedModal } from './PaymentBlockedModal';
import { PLACEHOLDER_IMAGE } from '../constants';

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

const getBrandGradient = (name: string) => {
  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-orange-400 to-rose-500',
    'from-emerald-400 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-sky-400 to-blue-600',
    'from-pink-500 to-rose-600',
    'from-amber-400 to-orange-600',
    'from-cyan-500 to-blue-700',
    'from-lime-400 to-emerald-600',
    'from-fuchsia-500 to-purple-700',
    'from-red-500 to-rose-700',
    'from-teal-500 to-emerald-700'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

const BrandCard = React.memo(({ name, onClick }: { name: string, onClick: () => void }) => {
  const firstLetter = (name || '?').charAt(0).toUpperCase();
  const gradient = getBrandGradient(name);

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer group active:bg-slate-50 transition-all"
    >
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shrink-0 group-hover:rotate-3 transition-transform`}>
        <span className="text-xl font-black text-white italic drop-shadow-md">{firstLetter}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-[13px] font-black uppercase italic tracking-tight text-slate-900 truncate">
          {name}
        </h4>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Official Partner</p>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-black group-hover:text-white transition-all">
        <ChevronRight size={16} strokeWidth={3} />
      </div>
    </motion.div>
  );
});

export const HomeView: React.FC<HomeViewProps> = React.memo(({ user, ledger, onNavigate, products, orders, onSync, companyProfile }) => {
  const isDue = (ledger?.due_amount || 0) > 0;

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
      .filter(p => !p.is_rcm && p.company?.toUpperCase() !== 'RCM' && p.company?.toUpperCase() !== 'GENUINE RCM')
      .map(p => p.company)
      .filter((c): c is string => typeof c === 'string' && c.trim() !== '');
    return Array.from(new Set(names)).sort();
  }, [products]);

  const topCompanies = useMemo(() => uniqueCompanies.slice(0, 6), [uniqueCompanies]);

  const recentProducts = useMemo(() => {
    return (Array.isArray(products) ? products : [])
      .filter(p => !p.is_rcm)
      .slice(0, 10);
  }, [products]);

  if (user?.payment_block) {
    return <PaymentBlockedModal supportNumber={companyProfile?.support_number || 'N/A'} user={user} />;
  }

  return (
    <div className="bg-slate-50 min-h-screen space-y-8 pb-40 px-5 pt-8 overflow-x-hidden font-black">
      {/* Profile Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="bg-blue-600 text-white inline-block px-4 py-1 rounded-full shadow-lg shadow-blue-600/20 border-2 border-white/20">
            <span className="text-lg font-black tracking-widest uppercase italic">{user?.dealer_code || '---'}</span>
          </div>
          <h1 className="text-3xl text-black leading-none tracking-tighter italic uppercase font-[1000] break-words">
            {user?.shop_name || "RCM Dealer"}
          </h1>
          <p className="text-slate-400 text-[10px] tracking-widest flex items-center gap-1 font-black uppercase italic">
            <MapPin size={12} className="text-blue-500" /> {user?.city || 'Central Hub'}
          </p>
        </div>
        <button onClick={onSync} className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-blue-600 flex items-center justify-center active:scale-90 transition-all">
           <RefreshCw size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
          <div onClick={() => onNavigate('orders')} className="bg-white p-4 rounded-[24px] border border-slate-100 flex flex-col items-center gap-1 active:scale-95 transition-all shadow-sm">
             <Database size={16} className="text-blue-500" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Total</p>
             <h4 className="text-xl text-black font-[1000] leading-none italic">{stats.total}</h4>
          </div>
          <div onClick={() => onNavigate('orders')} className="bg-white p-4 rounded-[24px] border border-slate-100 flex flex-col items-center gap-1 active:scale-95 transition-all shadow-sm">
             <Clock size={16} className="text-orange-500" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Active</p>
             <h4 className="text-xl text-black font-[1000] leading-none italic">{stats.pending}</h4>
          </div>
          <div onClick={() => onNavigate('orders')} className="bg-white p-4 rounded-[24px] border border-slate-100 flex flex-col items-center gap-1 active:scale-95 transition-all shadow-sm">
             <CheckCircle size={16} className="text-emerald-600" strokeWidth={3} />
             <p className="text-slate-400 text-[7px] font-black uppercase tracking-widest">Sync</p>
             <h4 className="text-xl text-black font-[1000] leading-none italic">{stats.completed}</h4>
          </div>
      </div>

      {/* Financial Status Card */}
      <div className="bg-white rounded-[32px] border border-slate-100 p-6 shadow-sm">
           <div className="space-y-1">
              <div className="flex items-center gap-2">
                 <CreditCard size={14} className="text-blue-500" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Financial Summary</span>
              </div>
              <h2 className={`text-4xl font-[1000] italic tracking-tighter leading-none ${isDue ? 'text-red-500' : 'text-emerald-600'}`}>
                ₹{Math.abs(ledger?.due_amount || 0).toLocaleString()}
              </h2>
              <p className={`text-[8px] font-black uppercase tracking-[0.2em] italic ${isDue ? 'text-red-400' : 'text-emerald-400'}`}>
                 {isDue ? 'Outstanding Dues' : 'Surplus Advance'}
              </p>
           </div>
      </div>

      {/* Our Brands Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
                <LayoutGrid size={18} className="text-orange-500" strokeWidth={3} />
                <h3 className="text-base text-black italic tracking-tighter font-[1000] uppercase">Our Brands</h3>
            </div>
            <button onClick={() => onNavigate('partners')} className="text-blue-600 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1 hover:gap-2 transition-all">
                View All <ChevronRight size={12} strokeWidth={3}/>
            </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
            {topCompanies.length > 0 ? topCompanies.map((company, idx) => (
                <BrandCard
                    key={idx}
                    name={company}
                    onClick={() => onNavigate('products', company)}
                />
            )) : (
                <div className="w-full py-12 text-center bg-white border-2 border-dashed border-slate-100 rounded-[32px]">
                    <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] italic animate-pulse">Syncing Brands...</p>
                </div>
            )}
        </div>
      </div>

      {/* Recent Products Section */}
      {recentProducts.length > 0 && (
        <div className="space-y-5 pt-2 pb-10">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-500" strokeWidth={3} />
                    <h3 className="text-base text-black italic tracking-tighter font-[1000] uppercase">Recent Assets</h3>
                </div>
                <button onClick={() => onNavigate('products')} className="text-blue-600 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1">View All <ChevronRight size={12} strokeWidth={3}/></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {recentProducts.map((p) => (
                    <motion.div
                        key={p.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onNavigate('products', { productId: p.id })}
                        className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm space-y-3 active:bg-slate-50 transition-all group"
                    >
                        <div className="aspect-square bg-slate-50 rounded-[24px] p-3 flex items-center justify-center overflow-hidden border border-slate-50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                            <img src={p.image_url || PLACEHOLDER_IMAGE} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-blue-500 text-[7px] font-black uppercase tracking-[0.2em] italic truncate">{p.company || 'GENUINE'}</p>
                            <h4 className="text-black text-[10px] leading-tight italic truncate uppercase font-black tracking-tight">{p.name}</h4>
                            <p className="text-blue-600 text-lg font-[1000] tracking-tighter italic leading-none pt-1">₹{p.selling_price?.toLocaleString() || '0'}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      )}
    </div>
  );
});
