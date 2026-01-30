
import { motion as m } from 'framer-motion';
import { ArrowRight, CreditCard, Loader2, Minus, Plus, ShoppingBag, Trash2, ShieldCheck, RefreshCw } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PLACEHOLDER_IMAGE } from '../constants';
import { supabaseService } from '../services/supabaseService';
import { Order, UserProfile, Product } from '../types';
import { OrderSuccess } from './OrderSuccess';
import toast from 'react-hot-toast';

const motion = m as any;

interface CartViewProps {
  user: UserProfile;
  cartItemsProps: any[];
  products: Product[];
  onOrderPlaced: () => void;
  isOnline: boolean;
  onRefresh?: () => void;
  companyProfile: any;
  onClose: () => void;
}

export const CartView: React.FC<CartViewProps> = ({
  user, cartItemsProps, products, onOrderPlaced, onRefresh, onClose
}) => {
  const [placingOrder, setPlacingOrder] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [paymentMode, setPaymentMode] = useState<'COD' | 'POD'>('COD');

  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (onRefresh) onRefresh();
  }, []);

  const cartItemsList = useMemo(() => {
    return (cartItemsProps || []).map((item: any) => {
        const productInfo = products.find(p => p.id === item.product_id);
        const variantInfo = item.product_variants;
        const companyName = productInfo?.company || variantInfo?.company || 'GENUINE RCM';

      return {
            id: item.id,
            dealer_id: user.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            name: productInfo?.name || 'Inventory Item',
            company: companyName,
            qty: Number(item.quantity) || 0,
            price: Number(variantInfo?.final_price || variantInfo?.selling_price || productInfo?.selling_price || 0),
            size: variantInfo?.size || 'Standard',
            image: productInfo?.image_url || PLACEHOLDER_IMAGE,
        };
    }).filter(i => i.qty > 0);
  }, [cartItemsProps, products, user.id]);

  const subtotal = useMemo(() => cartItemsList.reduce((sum, item) => sum + (item.price * item.qty), 0), [cartItemsList]);

  const handleUpdateQty = async (productId: string, variantId: string, delta: number) => {
    const item = cartItemsList.find(i => i.product_id === productId && i.variant_id === variantId);
    const success = await supabaseService.manageCartItem(user.id, productId, variantId, delta, item?.company);
    if (success && onRefresh) onRefresh();
  };

  const handleCheckout = async () => {
      if (isProcessingRef.current || cartItemsList.length === 0) return;
      isProcessingRef.current = true;
      setPlacingOrder(true);
      try {
          const orderPayload = {
              subtotal: subtotal,
              final_total: subtotal,
              items: cartItemsList.map(i => ({
                  product_id: i.product_id,
                  name: i.name,
                  qty: i.qty,
                  price: i.price,
                  size: i.size,
                  company: i.company,
                  unit: 'Pcs'
              })),
              payment_mode: paymentMode
          };
          const res = await supabaseService.placeOrder(orderPayload, user);
          if (res.success) {
              setSuccessOrder({ id: res.orderId, final_total: subtotal, order_no: res.orderId.substring(0,8).toUpperCase() } as any);
              toast.success("ORDER TRANSMITTED");
          } else {
              toast.error(`Order Protocol Error: ${res.error}`);
          }
      } catch (err: any) {
          toast.error(`Error: ${err.message}`);
      } finally {
          setPlacingOrder(false);
          isProcessingRef.current = false;
      }
  };

  if (successOrder) return <OrderSuccess order={successOrder} user={user} onComplete={onOrderPlaced} companyProfile={null} />;

  if (cartItemsList.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-black">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-[36px] bg-slate-50 flex items-center justify-center border-4 border-dashed border-slate-200 text-slate-200 mb-6">
          <ShoppingBag size={48} />
        </motion.div>
        <h2 className="text-xl text-slate-900 uppercase italic tracking-tighter font-[1000]">Vault is Empty</h2>
        <button onClick={onClose} className="mt-8 px-8 py-4 bg-brand-blue text-white rounded-2xl font-black text-xs uppercase tracking-widest italic">Return to Hub</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen flex flex-col font-black pb-40">
      {/* Static Header */}
      <header className="px-6 py-6 flex items-center justify-between bg-white border-b border-slate-100">
        <div>
          <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.4em] italic mb-1">Secure Checkpoint</p>
          <h1 className="text-2xl text-black uppercase italic tracking-tighter font-[1000]">Cart <span className="text-brand-blue">Vault</span></h1>
        </div>
        <button onClick={onRefresh} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-blue active:rotate-180 transition-all">
          <RefreshCw size={20} strokeWidth={3} />
        </button>
      </header>

      <div className="p-4 space-y-6">
        {/* BOX 1: CART ITEM DETAILS (Smoke Grey Border) */}
        <div className="bg-white border-[3px] border-slate-200 rounded-[32px] overflow-hidden p-5 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-slate-400 rounded-full" />
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Asset Registry</h3>
           </div>

           <div className="space-y-4">
              {cartItemsList.map((item) => (
                <div key={item.id} className="flex items-center gap-4 relative">
                   <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl p-1 shrink-0">
                      <img src={item.image} className="w-full h-full object-contain mix-blend-multiply" alt="item" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="text-[12px] text-black font-[1000] uppercase italic truncate leading-tight tracking-tight">{item.name}</h4>
                      <p className="text-[9px] text-slate-500 font-black uppercase italic mt-0.5">{item.company}</p>
                      <p className="text-[9px] text-brand-blue font-black uppercase italic mt-0.5">SIZE: {item.size}</p>

                      <div className="flex items-center justify-between mt-1">
                         <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100">
                            <button onClick={() => handleUpdateQty(item.product_id, item.variant_id, -1)} className="w-6 h-6 flex items-center justify-center text-brand-red active:scale-75 transition-all"><Minus size={12} strokeWidth={4}/></button>
                            <span className="w-8 text-center text-[11px] font-black text-black"> {item.qty} </span>
                            <button onClick={() => handleUpdateQty(item.product_id, item.variant_id, 1)} className="w-6 h-6 flex items-center justify-center text-brand-blue active:scale-75 transition-all"><Plus size={12} strokeWidth={4}/></button>
                         </div>
                         <p className="text-brand-red text-[11px] font-black italic">₹{item.price.toLocaleString()}</p>
                      </div>
                   </div>
                   <button onClick={() => handleUpdateQty(item.product_id, item.variant_id, -item.qty)} className="p-1 text-slate-300 hover:text-brand-red transition-colors">
                      <Trash2 size={16} strokeWidth={3} />
                   </button>
                </div>
              ))}
           </div>
        </div>

        {/* BOX 2: PAYMENT METHOD (Light Orange Border) */}
        <div className="bg-white border-[3px] border-orange-100 rounded-[32px] p-5 shadow-sm">
           <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-brand-orange rounded-full" />
              <h3 className="text-[10px] font-black uppercase text-brand-orange tracking-widest">Payment Protocol</h3>
           </div>

           <div className="grid grid-cols-2 gap-3">
              {(['COD', 'POD'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`h-14 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest italic transition-all flex items-center justify-center gap-2 ${
                    paymentMode === mode
                    ? 'bg-brand-orange text-white border-brand-orange shadow-md'
                    : 'bg-white text-slate-400 border-slate-50'
                  }`}
                >
                  <CreditCard size={14} strokeWidth={3} />
                  {mode === 'COD' ? 'Cash On Delivery' : 'Pay On Delivery'}
                </button>
              ))}
           </div>
        </div>

        {/* BOX 3: AMOUNT (Light Green Border) */}
        <div className="bg-white border-[3px] border-emerald-100 rounded-[32px] p-6 shadow-sm flex items-center justify-between">
           <div className="space-y-0.5">
              <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.3em] italic leading-none">Net Hub Valuation</p>
              <h2 className="text-3xl text-emerald-600 font-[1000] italic tracking-tighter">₹{subtotal.toLocaleString()}</h2>
           </div>
           <div className="flex flex-col items-end">
              <span className="text-[7px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 italic">VERIFIED</span>
           </div>
        </div>

        {/* PLACE ORDER BUTTON (Primary Blue) */}
        <div className="px-2 pt-2">
           <button
              onClick={handleCheckout}
              disabled={placingOrder}
              className={`w-full h-20 bg-brand-blue text-white rounded-[28px] flex flex-col items-center justify-center gap-0.5 transition-all shadow-xl active:scale-[0.98] border-b-[8px] border-blue-800 disabled:opacity-50 relative overflow-hidden group ${placingOrder ? 'grayscale' : ''}`}
           >
              {placingOrder ? (
                 <Loader2 size={32} className="animate-spin" strokeWidth={3} />
              ) : (
                 <>
                    <div className="flex items-center gap-3">
                       <span className="text-lg font-[1000] uppercase tracking-[0.2em] italic">DEPLOY ORDER</span>
                       <ArrowRight size={22} strokeWidth={4} />
                    </div>
                    <div className="flex items-center gap-1.5 opacity-40">
                       <ShieldCheck size={10} strokeWidth={3} />
                       <span className="text-[7px] font-black uppercase tracking-widest italic">Encrypted Secure Transmission</span>
                    </div>
                 </>
              )}
           </button>
        </div>
      </div>
    </div>
  );
};
