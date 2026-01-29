
import React, { useState, useMemo } from 'react';
import { Order, UserProfile } from '../types';
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Package,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Box,
  Hash,
  ShieldCheck,
  Zap,
  Search
} from 'lucide-react';
import { motion as m } from 'framer-motion';
const motion = m as any;

const formatDate = (dateInput?: string | number | Date) => {
    if (!dateInput) return '---';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '---';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

interface Props {
  orders: Order[];
  onReorder: (order: Order) => void;
  user: UserProfile;
  onRefresh?: () => void;
  companyProfile: any;
}

export const OrderTrackingView: React.FC<Props> = ({ orders, onRefresh, user }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
      if (!onRefresh) return;
      setRefreshing(true);
      await onRefresh();
      setTimeout(() => setRefreshing(false), 800);
  };

  const filteredOrders = useMemo(() => {
    const list = orders || [];
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter(o =>
      (o.order_no && String(o.order_no).includes(s)) ||
      (o.id && o.id.toLowerCase().includes(s)) ||
      (o.status && o.status.toLowerCase().includes(s))
    );
  }, [orders, search]);

  const SimpleOrderDetail = ({ order }: { order: Order }) => {
    const isPaid = order.payment_status === 'PAID';
    const orderItems = Array.isArray(order.items) ? order.items : [];

    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8 px-1 font-black pb-48">
        <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-black hover:text-brand-blue transition-colors mb-4 font-black text-[11px] uppercase tracking-widest active:scale-95 italic bg-slate-50 py-2 px-4 rounded-xl border border-slate-100 shadow-sm">
          <ChevronLeft size={16} strokeWidth={4} /> REFRESH HUB LIST
        </button>

        <div className="overflow-hidden bg-white border-[6px] border-slate-900 rounded-[44px] shadow-2xl relative">
            <div className={`h-32 flex flex-col items-center justify-center text-center p-6 ${isPaid ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                <div className="absolute top-4 left-4 flex items-center gap-2 opacity-30">
                  <ShieldCheck size={14} className="text-white" />
                  <span className="text-[7px] text-white uppercase tracking-[0.4em]">Encrypted Log</span>
                </div>
                <h2 className="text-white text-xl font-[1000] tracking-tighter italic uppercase leading-none drop-shadow-lg">
                   ORD-SYNC #{order.order_no || order.id?.substring(0, 8)}
                </h2>
                <div className="mt-3 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                    <p className="text-white text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        {isPaid ? <CheckCircle2 size={12} className="text-emerald-300" /> : <AlertCircle size={12} className="text-rose-200" />}
                        SETTLEMENT: {isPaid ? 'CONFIRMED' : 'AWAITING PAY'}
                    </p>
                </div>
            </div>

            <div className="p-8 space-y-8 bg-white">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-1 shadow-inner">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10} className="text-brand-blue" /> TRANSMIT DATE</span>
                        <p className="text-black text-[11px] font-black uppercase italic leading-none">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-1 shadow-inner">
                        <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10} className="text-brand-orange" /> CURRENT PHASE</span>
                        <p className="text-brand-blue text-[11px] font-black uppercase italic leading-none">{order.status}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                       <Box size={14} className="text-brand-blue" />
                       <h3 className="text-[10px] font-black text-black uppercase tracking-[0.4em] italic">Consignment Log</h3>
                    </div>
                    <div className="space-y-3">
                        {orderItems.map((item, idx) => (
                            <div key={idx} className="p-5 bg-white border-2 border-slate-50 rounded-[28px] flex items-center justify-between gap-4 shadow-sm hover:border-brand-blue/30 transition-all">
                                <div className="min-w-0 flex-1 space-y-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                                        <h4 className="text-black font-[1000] text-sm uppercase italic truncate leading-tight tracking-tight">
                                            {item.product_name || item.product?.name || 'GENUINE ASSET'}
                                        </h4>
                                    </div>
                                    <div className="flex items-center gap-3 ml-3">
                                       <span className="text-slate-400 text-[8px] font-black uppercase italic tracking-widest">{item.quantity || 0} {item.unit || 'PCS'}</span>
                                       <div className="w-px h-2 bg-slate-100" />
                                       <span className="text-brand-orange text-[8px] font-black uppercase italic">@ ₹{Number(item.rate || item.price || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                   <p className="text-black text-sm font-[1000] italic tracking-tighter bg-slate-50 px-3 py-1 rounded-lg border border-slate-100 shadow-inner">
                                       ₹{((item.quantity || 0) * (item.rate || item.price || 0)).toLocaleString()}
                                   </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-8 bg-slate-900 rounded-[40px] border-2 border-slate-800 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-125 transition-transform">
                       <Zap size={140} className="text-white" />
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                            <span>GROSS VALUATION</span>
                            <span className="text-white">₹{(order.subtotal || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                            <span>TRANSPORT PROTOCOL (+)</span>
                            <span className="text-brand-blue font-mono">₹{(order.transport_charges || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black text-rose-500 uppercase tracking-widest italic bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20">
                            <span>HUB DISCOUNT (-)</span>
                            <span className="font-mono">₹{(order.discount || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex items-end justify-between gap-4 relative z-10">
                        <div className="flex-1">
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.4em] italic mb-1">Final Settlement</p>
                            <p className="text-emerald-400 text-5xl font-[1000] tracking-tighter italic leading-none drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                ₹{(order.final_total || 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 opacity-30 pt-4">
                   <Hash size={14} className="text-slate-900" />
                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.5em] italic">Official RCM System Terminal v3.1</span>
                </div>
            </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white min-h-screen space-y-6 pb-40 max-w-4xl mx-auto px-5 pt-8 transition-all duration-300 font-black">
      {!selectedOrder ? (
          <>
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                   <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em]">Central Registry</p>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1 opacity-70 italic">Terminal: {user.dealer_code}</p>
                </div>
                {onRefresh && (
                    <button onClick={handleRefresh} className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-black border-2 border-slate-100 active:scale-90 transition-all shadow-md shrink-0">
                        <RefreshCw size={24} className={refreshing ? "animate-spin text-brand-blue" : ""} strokeWidth={4} />
                    </button>
                )}
            </div>

            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-black" strokeWidth={3} />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full h-14 pl-12 pr-6 bg-white border-2 border-slate-200 rounded-[24px] text-sm font-black text-black placeholder:text-slate-400 outline-none focus:border-brand-blue transition-all uppercase italic shadow-sm"
                placeholder="Order Searching"
              />
            </div>

            {(!orders || orders.length === 0) ? (
                <div className="py-32 text-center flex flex-col items-center gap-6 bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-100 shadow-inner">
                    <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center text-slate-200 shadow-sm">
                       <ShoppingBag size={40} strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] italic">Linking...</p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <div className="py-32 text-center flex flex-col items-center gap-6 bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-100 shadow-inner">
                    <div className="w-20 h-20 rounded-[32px] bg-white flex items-center justify-center text-slate-200 shadow-sm">
                       <Package size={40} strokeWidth={1.5} />
                    </div>
                    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] italic">No Signal Detected</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((o) => (
                        <motion.div
                            key={o.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedOrder(o)}
                            className="p-6 bg-white border-4 border-slate-50 rounded-[36px] flex items-center justify-between shadow-sm cursor-pointer group active:border-brand-blue transition-all"
                        >
                            <div className="min-w-0 pr-4 space-y-2">
                                <h3 className="text-black font-[1000] text-[12px] tracking-tighter uppercase italic leading-none truncate group-hover:text-brand-blue transition-colors">ORDER #{o.order_no || o.id?.substring(0, 8)}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base font-black italic leading-none">₹{(o.final_total || 0).toLocaleString()}</span>
                                    <div className="h-3 w-px bg-slate-100" />
                                    <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest border transition-all ${o.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                        {o.status}
                                    </span>
                                </div>
                            </div>
                            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-brand-blue/10 transition-colors shrink-0">
                               <ChevronRight className="text-slate-200 group-hover:text-brand-blue transition-colors" size={24} strokeWidth={4} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
          </>
      ) : (
          <SimpleOrderDetail order={selectedOrder} />
      )}
    </div>
  );
};
