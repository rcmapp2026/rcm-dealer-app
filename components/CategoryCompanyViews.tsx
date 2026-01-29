
import React from 'react';
import { Category, Company, Product } from '../types';
import { GlassCard, SearchBar } from './UIComponents';
import { Layers, Briefcase, ChevronRight, Box } from 'lucide-react';

// --- Category List View ---
interface CategoryViewProps {
  categories: Category[];
  products: Product[];
  onSelect: (categoryName: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ categories, products, onSelect }) => {
  const [search, setSearch] = React.useState('');

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  // Fixed: Use correct property p.category from Product interface.
  const getCount = (catName: string) => products.filter(p => p.category === catName).length;

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
        <div className="flex flex-col gap-1 px-1">
          <h2 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">Product Classification</h2>
          <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Shop by <span className="text-cyan-400">Category</span></h1>
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Filter categories..." />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {filtered.map(cat => (
                <GlassCard 
                    key={cat.id} 
                    onClick={() => onSelect(cat.name)}
                    className="p-6 flex flex-col items-center text-center cursor-pointer border-white/5 hover:bg-white/5 group bg-navy-lighter/20"
                >
                    <div className="w-20 h-20 rounded-[28px] bg-black border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner group-hover:border-cyan-500/30">
                        {cat.icon ? (
                            <img src={cat.icon} className="w-10 h-10 object-contain mix-blend-lighten" />
                        ) : (
                            <Box className="text-slate-600 group-hover:text-cyan-400" size={32} />
                        )}
                    </div>
                    <h3 className="text-white font-black text-sm mb-1.5 uppercase tracking-tight">{cat.name}</h3>
                    <span className="text-[9px] text-cyan-400/70 bg-cyan-500/5 px-3 py-1 rounded-lg border border-cyan-500/10 font-black uppercase tracking-widest">
                        {getCount(cat.name)} STOCKS
                    </span>
                </GlassCard>
            ))}
        </div>
    </div>
  );
};

// --- Company / Brand List View ---
interface CompanyViewProps {
  companies: Company[];
  products: Product[];
  onSelect: (companyName: string) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({ companies, products, onSelect }) => {
  const [search, setSearch] = React.useState('');
  
  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  // Fixed: Use correct property p.company from Product interface.
  const getCount = (compName: string) => products.filter(p => p.company === compName).length;

  return (
    <div className="space-y-8 pb-32 animate-fade-in">
        <div className="flex flex-col gap-1 px-1">
          <h2 className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em]">Official Suppliers</h2>
          <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-white tracking-tight uppercase">Partner <span className="text-cyan-400">Brands</span></h1>
          </div>
        </div>

        <SearchBar value={search} onChange={setSearch} placeholder="Search manufacturer..." />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {filtered.map(comp => (
                <GlassCard 
                    key={comp.id} 
                    onClick={() => onSelect(comp.name)}
                    className="p-6 flex flex-col items-center justify-between cursor-pointer border-white/5 hover:bg-white/5 group h-44 bg-navy-lighter/20"
                >
                   <div className="flex-1 flex items-center justify-center w-full">
                       {comp.logo ? (
                           <img src={comp.logo} className="max-h-16 max-w-[85%] object-contain grayscale-[40%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 mix-blend-lighten" />
                       ) : (
                           <div className="text-3xl font-black text-slate-800 uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">{comp.name.substring(0,2)}</div>
                       )}
                   </div>
                   
                   <div className="w-full border-t border-white/5 pt-4 mt-3">
                       <h4 className="text-white font-black text-[11px] truncate text-center uppercase tracking-widest">{comp.name}</h4>
                       <p className="text-center text-[9px] text-slate-500 font-bold mt-1.5 uppercase tracking-[0.2em]">{getCount(comp.name)} Items</p>
                   </div>
                </GlassCard>
            ))}
        </div>
    </div>
  );
};
