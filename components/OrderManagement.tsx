
import React, { useState, useEffect } from 'react';
import { Order } from '../types';
import { ShoppingBag, ChevronRight, CheckCircle, XCircle, Clock, Info, ShieldCheck, Hash, Package, Truck, Tag, ArrowLeft } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { motion as m, AnimatePresence } from 'framer-motion';

const motion = m as any;

interface OrderManagementProps {
  orders: Order[];
  onSync: () => void;
  onDetailToggle: (isOpen: boolean) => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ orders, onSync, onDetailToggle }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    onDetailToggle(true);
  };

  const handleOrderDeselect = () => {
    setSelectedOrder(null);
    onDetailToggle(false);
  };

  if (selectedOrder) {
    return (
        <div className="bg-white min-h-screen font-bold">
             <header className="h-16 px-6 flex items-center gap-4 border-b-2 border-slate-50 sticky top-0 bg-white z-10">
                <button onClick={handleOrderDeselect} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-black active:scale-95 transition-transform">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-lg font-bold text-black uppercase italic">Order Details</h2>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar">
               <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] italic">Current Status</p>
                  <div className="flex items-center gap-3">
                     <h3 className="text-2xl font-bold text-black uppercase italic tracking-tighter">Order #{selectedOrder.order_no || selectedOrder.order_id?.slice(-6)}</h3>
                     <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${selectedOrder.status === 'Pending' ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{selectedOrder.status}</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-3 px-1">
                     <Info size={14} className="text-blue-600" strokeWidth={3} />
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Item List</h4>
                  </div>
                  <div className="space-y-2">
                     {(selectedOrder.items || []).map((it: any, idx: number) => (
                       <div key={idx} className="p-4 bg-white border-2 border-slate-50 rounded-2xl space-y-1">
                          <div className="flex justify-between items-start gap-4">
                             <p className="text-[12px] font-bold text-black uppercase italic leading-tight flex-1">{it.product_name || 'Product'}</p>
                             <p className="text-[12px] font-bold text-green-600 italic">₹{(it.quantity * (it.rate || it.price || 0)).toLocaleString()}</p>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{it.quantity} {it.unit || 'Pcs'} @ ₹{(it.rate || it.price || 0).toLocaleString()}</p>
                       </div>
                     ))}
                  </div>
               </div>

               <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3 px-1">
                     <Tag size={14} className="text-orange-500" strokeWidth={3} />
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Payment Summary</h4>
                  </div>
                  <div className="bg-white border-2 border-slate-100 rounded-[32px] p-6 space-y-4 shadow-sm">
                     <SummaryRow label="Subtotal" value={selectedOrder.subtotal} color="text-black" />
                     <SummaryRow label="Shipping" value={selectedOrder.transport_charges} color="text-blue-600" />
                     <SummaryRow label="Discount" value={-selectedOrder.discount} color="text-red-600" />
                     <div className="pt-4 border-t-2 border-slate-50 flex justify-between items-end">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grand Total</p>
                        <p className="text-3xl text-red-600 font-bold tracking-tighter italic leading-none">₹{(selectedOrder.final_total || 0).toLocaleString()}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white border-2 border-slate-100 p-5 rounded-2xl flex items-center gap-4 text-black">
                  <ShieldCheck size={24} className="text-green-600" />
                  <div className="flex-1">
                     <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Verified Order</p>
                     <p className="text-[10px] font-bold uppercase italic">ID: {selectedOrder.id?.slice(0, 12).toUpperCase()}</p>
                  </div>
               </div>
            </div>
        </div>
    )
  }

  return (
    <div className="bg-white min-h-screen pb-40 font-bold">
      <header className="px-6 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
           <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
           <span className="text-[10px] text-orange-500 font-bold uppercase tracking-[0.3em] leading-none">Logistics</span>
        </div>
        <h1 className="text-3xl font-bold text-black italic tracking-tighter uppercase leading-none">Order Management</h1>
      </header>

      <div className="px-6 space-y-3">
        {orders.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
             <Package size={32} className="mx-auto text-slate-200 mb-2" />
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No orders found</p>
          </div>
        ) : orders.map(o => (
          <div 
            key={o.id} 
            onClick={() => handleOrderSelect(o)}
            className="p-5 bg-white border-2 border-slate-100 rounded-[32px] flex items-center justify-between gap-4 active:scale-[0.98] transition-all shadow-sm"
          >
             <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white border-2 ${o.status === 'Pending' ? 'text-orange-500 border-orange-100' : 'text-green-600 border-green-100'}`}>
                   <ShoppingBag size={20} />
                </div>
                <div className="min-w-0">
                   <div className="flex items-center gap-2">
                     <h4 className="text-[12px] font-bold text-black uppercase italic truncate">Order #{o.order_no || o.order_id?.slice(-6)}</h4>
                     <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${o.status === 'Pending' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-600'}`}>{o.status}</span>
                   </div>
                   <p className="text-[14px] font-bold text-blue-600 mt-0.5 italic">₹{(o.final_total || 0).toLocaleString()}</p>
                </div>
             </div>
             <ChevronRight className="text-slate-300" size={18} strokeWidth={3} />
          </div>
        ))}
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, color = "text-black" }: any) => (
  <div className="flex justify-between items-center">
     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{label}</span>
     <span className={`text-[12px] font-bold italic ${color}`}>₹{Math.abs(value || 0).toLocaleString()}</span>
  </div>
);
