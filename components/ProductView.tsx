
import { motion as m, AnimatePresence } from 'framer-motion';
import { Box, Check, Hash, Loader2, Minus, Plus, RefreshCw, ShoppingBag, ShoppingCart, X, ArrowLeft, Search, Zap } from 'lucide-react';
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
  selectedCompany?: string | null;
  onSelectCompany?: (company: string | null) => void;
  onDetailToggle: (isOpen: boolean) => void;
}

const NewBadge = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-2 left-2 z-[40] w-10 h-10 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-xl"
  >
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-black text-white italic leading-none">NEW</span>
      <Zap size={7} className="text-yellow-300 fill-yellow-300 mt-0.5" />
    </div>
  </motion.div>
);

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
  selectedCompany,
  onSelectCompany,
  onDetailToggle
}) => {
  const [internalProducts, setInternalProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const productRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setSelectedProduct(null);
    onDetailToggle(false);
  }, [isRcmMode, selectedCategory, selectedCompany]);

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
      const companyMatch = selectedCompany ? p.company === selectedCompany : true;
      return nameMatch && catChipMatch && companyMatch;
    });
  }, [internalProducts, search, selectedCategory, selectedCompany]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    onDetailToggle(true);
  };

  const handleProductDeselect = () => {
    setSelectedProduct(null);
    onDetailToggle(false);
  };
  
  return (
    <div className="bg-white min-h-screen relative font-black">
      <AnimatePresence mode="wait">
        {selectedProduct ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <ProductDetails
              product={selectedProduct}
              onClose={handleProductDeselect}
              onAddToCart={onAddToCart}
              onOpenCart={onOpenCart}
            />
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-40"
          >
            <div className="sticky top-0 z-40 bg-white px-4 py-4 space-y-4 shadow-sm border-b border-slate-50">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isRcmMode ? "Search RCM Products..." : "Search Hardware Assets..."}
                    className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 text-xs text-slate-900 outline-none focus:bg-white focus:border-slate-300 transition-all font-bold"
                  />
                </div>
                <button onClick={onOpenCart} className="w-11 h-11 bg-white rounded-xl active:scale-90 transition-all border border-slate-100 text-slate-900 flex items-center justify-center shadow-sm">
                  <ShoppingBag size={20} />
                </button>
                <button onClick={onRefresh} className="w-11 h-11 bg-white rounded-xl active:rotate-180 transition-all border border-slate-100 text-blue-600 flex items-center justify-center shadow-sm">
                  <RefreshCw size={20} />
                </button>
              </div>

              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button
                      onClick={() => {
                          onSelectCategory(null);
                          if (onSelectCompany) onSelectCompany(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-[11px] tracking-widest border transition-all font-black uppercase italic whitespace-nowrap ${(!selectedCategory && !selectedCompany) ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100'}`}
                  >
                      ALL
                  </button>
                  {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => onSelectCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[11px] tracking-widest border whitespace-nowrap transition-all font-black uppercase italic ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100'}`}
                      >
                        {cat}
                      </button>
                  ))}
              </div>
            </div>

            <div className="px-4 py-4 grid grid-cols-2 gap-4">
              {filteredProducts.length > 0 ? filteredProducts.map(p => (
                <motion.div
                  ref={el => productRefs.current[p.id] = el}
                  whileTap={{ scale: 0.95 }}
                  key={p.id}
                  onClick={() => handleProductSelect(p)}
                  className="bg-white rounded-2xl flex flex-col active:bg-slate-50 transition-all group"
                >
                   <div className="aspect-square bg-white rounded-2xl border border-slate-100 flex items-center justify-center p-3 overflow-hidden shadow-sm mb-2 relative">
                      {/* Forced NEW badge on all products as requested */}
                      <NewBadge />
                      <img src={p.image_url || PLACEHOLDER_IMAGE} className="w-full h-full object-contain mix-blend-multiply" alt={p.name} />
                   </div>
                   <div className="px-1 space-y-1">
                      <h3 className="text-[11px] text-black font-black uppercase italic truncate leading-tight">{p.name}</h3>
                      <p className="text-[9px] text-blue-600 font-bold uppercase truncate">{p.company || 'GENUINE RCM'}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase truncate">SKU: {p.sku_code || '---'}</p>
                   </div>
                </motion.div>
              )) : (
                <div className="col-span-2 py-20 text-center space-y-3">
                   <div className="w-16 h-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-slate-200"><Box size={32} /></div>
                   <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">No Assets Found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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

  const totalQty = useMemo(() => {
    return Object.values(quantities).reduce((sum, q) => sum + (Number(q) || 0), 0);
  }, [quantities]);

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

  const handleSave = async () => {
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
        setTimeout(() => { setIsAdded(false); onClose(); }, 800);
    }
  };

  return (
    <div className="h-full flex flex-col font-black bg-white overflow-hidden">
        <header className="h-16 px-4 flex items-center justify-between border-b border-slate-50 shrink-0 bg-white z-[60]">
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 active:scale-90 transition-all">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-sm font-black uppercase italic">Details</h2>
            <div className="w-10" />
        </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
          <div className="space-y-8 pb-32">
              <div className="w-full aspect-square bg-white rounded-3xl flex items-center justify-center p-6 border border-slate-100 shadow-sm overflow-hidden relative">
                  <NewBadge />
                  <img src={product.image_url || PLACEHOLDER_IMAGE} className="w-full h-full object-contain mix-blend-multiply" alt="product" />
              </div>

              <div className="space-y-6">
                  <div className="text-center space-y-2">
                     <h1 className="text-2xl text-black font-black uppercase italic leading-tight">{product.name}</h1>
                     <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{product.company || 'GENUINE RCM'}</p>
                     <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        <span>SKU: {product.sku_code || '---'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span>UNIT: {product.unit || 'PCS'}</span>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] italic">Variants</p>
                     </div>

                     <div className="space-y-3">
                        {loading ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-300">
                                <Loader2 className="animate-spin" size={24} />
                                <span className="text-[8px] uppercase font-black tracking-widest">Scanning Vault...</span>
                            </div>
                        ) : variants.map(v => (
                            <div key={v.id} className="p-5 bg-slate-50 rounded-2xl border border-white shadow-sm space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[11px] text-slate-900 font-black uppercase italic">SIZE: {v.variant_name || 'STD'}</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-lg text-red-500 font-black italic">₹{v.selling_price?.toLocaleString()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold line-through decoration-slate-300">MRP ₹{v.mrp?.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                                       <button onClick={() => handleUpdateQty(v.id, -1)} className="w-8 h-8 flex items-center justify-center text-slate-400 active:scale-75"><Minus size={14} /></button>
                                       <input
                                         type="number"
                                         value={quantities[v.id] || 0}
                                         onChange={(e) => handleManualQtyChange(v.id, e.target.value)}
                                         className="w-10 bg-transparent text-center text-xs font-black text-slate-900 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                       />
                                       <button onClick={() => handleUpdateQty(v.id, 1)} className="w-8 h-8 flex items-center justify-center text-blue-600 active:scale-75"><Plus size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                  </div>

                  {/* Total Amount & Save Button - Positioned after variants, scrollable */}
                  {!loading && (
                    <div className="pt-4">
                      <div className="bg-slate-900 p-6 rounded-3xl space-y-4 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Valuation</p>
                          <p className="text-3xl text-white font-black italic leading-none">₹{totalAmount.toLocaleString()}</p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isAdded || totalQty === 0}
                            className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase italic active:scale-95 transition-all ${isAdded ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-600/30 disabled:opacity-30'}`}
                        >
                            {isAdded ? <><Check size={20} /> SAVED TO VAULT</> : 'SAVE TO VAULT'}
                        </button>
                      </div>
                    </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
