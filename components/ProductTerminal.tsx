
import React, { useState } from 'react';
import { Product } from '../types';
import { Package, Plus, Search, Edit3, Trash2, Tag, Loader2, Check, X } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

export const ProductTerminal: React.FC<{ products: Product[], onSync: () => void }> = ({ products, onSync }) => {
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This asset will be purged from the catalog.")) return;
    setIsProcessing(true);
    await supabaseService.deleteProduct(id);
    await onSync();
    setIsProcessing(false);
  };

  const handlePriceUpdate = async (p: Product) => {
    const newPrice = prompt(`Update price for ${p.name}:`, String(p.selling_price));
    if (!newPrice || isNaN(Number(newPrice))) return;
    setIsProcessing(true);
    await supabaseService.updateProduct(p.id, { selling_price: Number(newPrice) });
    await onSync();
    setIsProcessing(false);
  };

  const handleCreate = async () => {
      const name = prompt("Product Name:");
      const price = prompt("Selling Price:");
      const cat = prompt("Category (e.g. Hardware):");
      if (!name || !price) return;

      setIsProcessing(true);
      await supabaseService.createProduct({
          name,
          selling_price: Number(price),
          category: cat || 'General',
          company: 'RCM GENUINE',
          unit: 'Pcs',
          is_rcm: false
      });
      await onSync();
      setIsProcessing(false);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-8 font-black uppercase italic">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl tracking-tighter">Inventory Forge</h1>
          <p className="text-[10px] text-brand-blue tracking-[0.4em] mt-2">Asset Catalog Control</p>
        </div>
        <button 
          onClick={handleCreate}
          className="h-12 w-12 bg-brand-blue text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Plus size={24} strokeWidth={4} />
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-14 bg-slate-900 border-2 border-slate-800 rounded-2xl pl-12 pr-6 text-sm outline-none focus:border-brand-blue"
          placeholder="SEARCH ASSET CODES..."
        />
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} className="p-5 bg-slate-900 border-2 border-slate-800 rounded-[32px] flex items-center justify-between gap-4">
             <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-black border border-slate-800 flex items-center justify-center text-slate-600 shrink-0">
                   <Package size={22} />
                </div>
                <div className="min-w-0">
                   <h4 className="text-xs truncate">{p.name}</h4>
                   <p className="text-[9px] text-slate-500 mt-1">{p.category} • {p.company}</p>
                </div>
             </div>

             <div className="flex items-center gap-6 shrink-0">
                <div className="text-right cursor-pointer" onClick={() => handlePriceUpdate(p)}>
                   <div className="flex items-center gap-2 justify-end">
                      {p.mrp && <p className="text-xs text-slate-600 line-through">₹{p.mrp.toLocaleString()}</p>}
                      <p className="text-sm text-emerald-500 leading-none">₹{p.selling_price?.toLocaleString()}</p>
                   </div>
                   <div className="flex items-center gap-2 justify-end mt-1">
                     {p.discount_percent && <p className="text-[8px] text-amber-400 bg-amber-900/50 px-1 py-0.5 rounded">{p.discount_percent}% OFF</p>}
                     <p className="text-[7px] text-slate-600">TAP TO EDIT</p>
                   </div>
                </div>
                <button 
                  onClick={() => handleDelete(p.id)}
                  className="h-9 w-9 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
