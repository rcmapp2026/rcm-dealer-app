
import { motion as m, AnimatePresence } from 'framer-motion';
import { Box, Check, Hash, Loader2, Minus, Plus, RefreshCw, ShoppingBag, ShoppingCart, X, ArrowLeft } from 'lucide-react';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { PLACEHOLDER_IMAGE } from '../constants';
import { supabaseService } from '../services/supabaseService';
import { Product, UserProfile } from '../types';

const motion = m as any;

interface ProductViewProps {
  products: Product[];
  user?: UserProfile;
  isRcmMode?: boolean;
  onAddToCart: (p: Product, qty: number, variantId?: string, price?: number, company?: string) => void | Promise<void>;
  onOpenCart?: () => void;
  onRefresh?: () => void;
  selectedProductId?: string | null;
  onNavigate: (tab: string, filterValue?: any) => void;
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onDetailToggle: (isOpen: boolean) => void;
}

export const ProductView: React.FC<ProductViewProps> = ({
  products: propsProducts,
  user,
  isRcmMode = false,
  onAddToCart,
  onOpenCart,
  onRefresh,
  selectedProductId,
  onNavigate,
  selectedCategory,
  onSelectCategory,
  onDetailToggle
}) => {
  const [internalProducts, setInternalProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const productRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (propsProducts && propsProducts.length > 0) {
      let filtered = propsProducts;
      if (user?.category_access && Array.isArray(user.category_access)) {
          const accessStrings = user.category_access.map(String);
          filtered = propsProducts.filter(p =>
            accessStrings.includes(String(p.category_id))
          );
      }

      const targetType = isRcmMode ? 'RCM' : 'Hardware';
      const contextFiltered = filtered.filter(p => p.product_type === targetType);

      setInternalProducts(contextFiltered);
    } else {
      setInternalProducts([]);
    }
  }, [propsProducts, user, isRcmMode]);

  useEffect(() => {
    if (selectedProductId && productRefs.current[selectedProductId]) {
      productRefs.current[selectedProductId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedProductId]);

  const categories = useMemo(() => {
    return Array.from(new Set(internalProducts.map(p => p.category)))
      .filter(Boolean) as string[];
  }, [internalProducts]);

  const filteredProducts = useMemo(() => {
    return internalProducts.filter(p => {
      const sTerm = search.toLowerCase();
      const nameMatch = (p.name || "").toLowerCase().includes(sTerm) ||
                       (p.company || "").toLowerCase().includes(sTerm) ||
                       (p.variant_name || "").toLowerCase().includes(sTerm) ||
                       (p.sku_code || "").toLowerCase().includes(sTerm);
      const catChipMatch = selectedCategory ? p.category === selectedCategory : true;
      return nameMatch && catChipMatch;
    });
  }, [internalProducts, search, selectedCategory]);

  const handleQuickAdd = async (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    if (addingId) return;
    setAddingId(p.id);
    await onAddToCart(p, 1, p.id, p.selling_price || 0, p.company);
    setTimeout(() => setAddingId(null), 800);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onDetailToggle(true);
  };

  const handleProductDeselect = () => {
    setSelectedProduct(null);
    onDetailToggle(false);
  };
  
  if (selectedProduct) {
      return (
          <ProductDetails
            product={selectedProduct}
            onClose={handleProductDeselect}
            onAddToCart={onAddToCart}
            onOpenCart={onOpenCart}
          />
      )
  }

  return (
    <div className="bg-white min-h-screen pb-40 font-black">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-100 px-3 py-2 space-y-2 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isRcmMode ? "Search RCM..." : "Search Hardware..."}
              className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg px-3 text-[10px] text-slate-900 outline-none focus:border-brand-blue font-black uppercase italic"
            />
          </div>
          <button onClick={onOpenCart} className="w-9 h-9 bg-white rounded-lg active:scale-90 transition-all border border-slate-200 text-slate-900 flex items-center justify-center">
            <ShoppingBag size={16} strokeWidth={3} />
          </button>
          <button onClick={onRefresh} className="w-9 h-9 bg-white rounded-lg active:rotate-180 transition-all border border-slate-200 text-brand-blue flex items-center justify-center">
            <RefreshCw size={16} strokeWidth={3} />
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
            <button
                onClick={() => onSelectCategory(null)}
                className={`px-3 py-1 rounded-md text-[7px] tracking-widest border transition-all font-[1000] uppercase italic whitespace-nowrap ${!selectedCategory ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-black border-slate-100'}`}
            >
                ALL ASSETS
            </button>
            {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1 rounded-md text-[7px] tracking-widest border whitespace-nowrap transition-all font-[1000] uppercase italic ${selectedCategory === cat ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-black border-slate-100'}`}
                >
                  {cat}
                </button>
            ))}
        </div>
      </div>

      <div className="px-3 py-3 grid grid-cols-1 gap-2">
        {filteredProducts.length > 0 ? filteredProducts.map(p => (
          <motion.div
            ref={el => productRefs.current[p.id] = el}
            whileTap={{ scale: 0.98 }}
            key={p.id}
            onClick={() => handleProductSelect(p)}
            className="p-2 bg-white border border-slate-100 rounded-xl flex items-center gap-3 active:bg-slate-50 transition-all shadow-sm"
          >
             <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                <img src={p.image_url || PLACEHOLDER_IMAGE} className="w-full h-full object-contain" alt={p.name} />
             </div>
             <div className="flex-1 min-w-0 flex flex-col justify-center py-0.5">
                <div>
                   <div className="flex justify-between items-start gap-2">
                     <p className="text-brand-blue text-[8px] tracking-widest font-[1000] uppercase truncate italic leading-none mb-0.5">{isRcmMode ? 'RCM' : (p.company || 'GENUINE RCM')}</p>
                     <span className="bg-slate-50 text-[6px] px-1 rounded border border-slate-100 text-slate-400 font-black uppercase">{p.variant_name}</span>
                   </div>
                   <h3 className="text-[11px] text-slate-900 leading-tight truncate font-[1000] uppercase italic tracking-tight">{p.name}</h3>
                   <p className="text-[8px] text-slate-900 font-[1000] uppercase mt-0.5 italic flex items-center gap-1 opacity-90">
                     <Hash size={8} className="text-brand-blue" strokeWidth={4} /> SKU: {String(p.sku_code || "---").toUpperCase()}
                   </p>
                </div>

                <div className="flex items-center justify-between mt-1.5">
                   <p className="text-brand-red text-sm font-[1000] italic">₹{p.selling_price?.toLocaleString()}</p>
                   <button
                    onClick={(e) => handleQuickAdd(e, p)}
                    disabled={addingId === p.id}
                    className={`h-6 px-2 rounded-md flex items-center justify-center gap-1 text-[7px] font-black uppercase tracking-widest transition-all italic ${addingId === p.id ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white active:scale-95'}`}
                   >
                     {addingId === p.id ? <Check size={8} strokeWidth={4} /> : <ShoppingCart size={8} strokeWidth={3} />}
                     {addingId === p.id ? 'SYC' : 'ADD'}
                   </button>
                </div>
             </div>
          </motion.div>
        )) : (
          <div className="py-12 text-center space-y-2">
             <div className="w-12 h-12 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-slate-200"><Box size={20} /></div>
             <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] italic">No Records</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProductDetails: React.FC<{
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product, qty: number, variantId?: string, price?: number, company?: string) => void | Promise<void>;
  onOpenCart?: () => void;
}> = ({ product, onClose, onAddToCart, onOpenCart }) => {
  const [variants, setVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isAdded, setIsAdded] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadVariants = async () => {
        setLoading(true);
        const prodId = product.product_id || product.id;
        const data = await supabaseService.fetchProductVariants(prodId);

        if (data.length > 0) {
            setVariants(data);
            const initialQty: Record<string, number> = {};
            data.forEach(v => initialQty[v.id] = v.id === product.id ? 1 : 0);
            if (!data.some(v => v.id === product.id)) {
              initialQty[data[0].id] = 1;
            }
            setQuantities(initialQty);
        } else {
            setVariants([product]);
            setQuantities({ [product.id]: 1 });
        }
        setLoading(false);
    };
    loadVariants();
  }, [product]);

  const totalAmount = useMemo(() => {
    return variants.reduce((sum, v) => sum + ((v.selling_price || 0) * (Number(quantities[v.id]) || 0)), 0);
  }, [variants, quantities]);

  const handleUpdateQty = (id: string, delta: number) => {
    setQuantities(prev => ({
        ...prev,
        [id]: Math.max(0, (Number(prev[id]) || 0) + delta)
    }));
  };

  const handleManualQtyChange = (id: string, value: string) => {
    const val = value === '' ? 0 : parseInt(value, 10);
    if (!isNaN(val)) {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, val)
        }));
    }
  };

  const handleAddAll = async () => {
    if (isAdded) return;
    let anyAdded = false;
    for (const v of variants) {
        const q = Number(quantities[v.id]) || 0;
        if (q > 0) {
            await onAddToCart(v, q, v.id, v.selling_price || 0, v.company);
            anyAdded = true;
        }
    }
    if (anyAdded) {
        setIsAdded(true);
        setTimeout(() => { setIsAdded(false); onClose(); }, 1000);
    }
  };

  const handleSingleAdd = async (v: Product) => {
    if (processingIds.has(v.id)) return;
    const q = Number(quantities[v.id]) || 0;
    if (q > 0) {
        setProcessingIds(prev => new Set(prev).add(v.id));
        try {
            await onAddToCart(v, q, v.id, v.selling_price || 0, v.company);
        } finally {
            setProcessingIds(prev => {
                const next = new Set(prev);
                next.delete(v.id);
                return next;
            });
        }
    }
  };

  return (
    <div className="bg-white min-h-screen font-black">
        <header className="h-16 px-6 flex items-center gap-4 border-b-2 border-slate-50 sticky top-0 bg-white z-10">
            <button onClick={onClose} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-black active:scale-95 transition-transform">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-lg font-bold text-black uppercase italic">Product Details</h2>
        </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar space-y-4">
          <div className="w-full bg-slate-50 rounded-[24px] p-4 flex items-center justify-center border border-slate-100 shadow-inner min-h-[180px]">
              <img src={product.image_url || PLACEHOLDER_IMAGE} className="w-full h-auto max-h-[220px] object-contain drop-shadow-md" alt="product" />
          </div>

          <div className="space-y-3">
              <div className="space-y-0.5">
                 <p className="text-brand-blue text-[8px] tracking-widest italic font-black uppercase mb-0.5">
                    {product.product_type === 'RCM' ? 'Official RCM' : (product.company || 'GENUINE RCM')}
                 </p>
                 <h1 className="text-lg text-black italic uppercase font-black tracking-tight">{product.name}</h1>
                 <div className="flex items-center gap-1.5 text-slate-900 text-[9px] font-[1000] uppercase tracking-widest mt-1">
                    <Hash size={10} strokeWidth={4} className="text-brand-blue" /> SKU REF: {String(product.sku_code || "N/A").toUpperCase()}
                 </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[8px] text-slate-400 uppercase tracking-widest ml-0.5 font-black italic">Available Variants</p>
                 <div className="grid grid-cols-1 gap-2">
                    {loading ? (
                        <div className="py-6 flex flex-col items-center justify-center gap-2 text-slate-200">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="text-[7px] uppercase tracking-widest">Scanning...</span>
                        </div>
                    ) : variants.map(v => (
                        <div key={v.id} className="p-4 bg-white border-[3px] border-slate-100 rounded-2xl flex flex-col gap-5 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0 flex-1 space-y-2">
                                    <p className="text-[13px] text-black font-[1000] uppercase italic truncate tracking-tight">SIZE: <span className="text-brand-blue">{v.variant_name}</span></p>
                                    <div className="flex flex-col gap-1.5">
                                        <p className="text-brand-red text-3xl font-[1000] italic leading-none">₹{v.selling_price?.toLocaleString()}</p>
                                        <div className="flex flex-wrap items-center gap-2.5 mt-1">
                                          <p className="text-[13px] text-slate-900 font-[1000]">MRP: ₹{v.mrp?.toLocaleString()}</p>
                                          <span className="text-white text-[12px] font-[1000] uppercase bg-emerald-600 px-2 py-0.5 rounded shadow-sm">SAVE {v.discount_percent}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border-2 border-slate-200 shadow-inner">
                                   <button onClick={() => handleUpdateQty(v.id, -1)} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-xl active:scale-75 text-brand-red shadow-sm transition-transform"><Minus size={20} strokeWidth={4}/></button>
                                   <input
                                     type="number"
                                     value={quantities[v.id] || 0}
                                     onChange={(e) => handleManualQtyChange(v.id, e.target.value)}
                                     className="w-14 bg-transparent text-center text-lg font-[1000] text-slate-900 italic leading-none outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                   />
                                   <button onClick={() => handleUpdateQty(v.id, 1)} className="w-12 h-12 flex items-center justify-center bg-white border-2 border-slate-200 rounded-xl active:scale-75 text-brand-blue shadow-sm transition-transform"><Plus size={20} strokeWidth={4}/></button>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSingleAdd(v)}
                                disabled={processingIds.has(v.id) || (quantities[v.id] || 0) === 0}
                                className={`w-full h-12 rounded-xl text-[10px] font-[1000] uppercase tracking-[0.2em] transition-all italic border-[3px] ${processingIds.has(v.id) ? 'bg-slate-50 text-slate-400 border-slate-100' : 'bg-white text-brand-blue border-brand-blue active:scale-[0.98] shadow-lg shadow-blue-500/5 disabled:opacity-40'}`}
                            >
                                {processingIds.has(v.id) ? 'SYNCING...' : 'ADD TO VAULT'}
                            </button>
                        </div>
                    ))}\
                 </div>
              </div>
          </div>

          {!loading && (
              <div className="bg-white p-5 rounded-[36px] border-[6px] border-brand-orange/40 shadow-[0_25px_60px_rgba(0,0,0,0.15)] mt-8 sticky bottom-5">
                  <div className="flex items-center justify-between gap-5">
                    <div className="flex-1">
                        <p className="text-[8px] tracking-[0.4em] text-slate-500 font-[1000] uppercase mb-1 italic leading-none">Valuation Log</p>
                        <p className="text-3xl text-emerald-600 italic tracking-tighter font-[1000] leading-none drop-shadow-sm">₹{totalAmount.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleAddAll}
                        disabled={isAdded || totalAmount === 0}
                        className={`h-16 flex-1 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-[1000] uppercase tracking-[0.3em] active:scale-95 italic border-2 transition-all ${isAdded ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-brand-blue text-white border-brand-blue shadow-xl shadow-blue-500/30 disabled:opacity-30'}`}
                    >
                        {isAdded ? (
                        <><Check size={20} strokeWidth={4} /> SYNCED</>
                        ) : (
                        <><ShoppingCart size={20} strokeWidth={3} /> DEPLOY ALL</>
                        )}
                    </button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
