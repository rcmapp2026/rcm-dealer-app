
import React from 'react';
import { Home, Package, Crown, ShoppingBag, ShoppingCart, Bot } from 'lucide-react';
import { motion as m } from 'framer-motion';

const motion = m as any;

export const BottomNav: React.FC<{ activeTab: string; onNavigate: (tab: string) => void; }> = React.memo(({ activeTab, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: Home, label: 'HOME' },
    { id: 'rcm_products', icon: Crown, label: 'RCM', isRcm: true },
    { id: 'products', icon: Package, label: 'HARDWARE' },
    { id: 'orders', icon: ShoppingBag, label: 'TRACK' },
    { id: 'cart', icon: ShoppingCart, label: 'CART' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-sm lg:hidden">
      <div className="bg-gradient-to-t from-gray-900 to-gray-800 rounded-[28px] h-16 px-4 flex items-center justify-between shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white/5">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${isActive ? 'text-brand-orange' : 'text-white/40'}`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${isActive && 'bg-white/5'}`}>
                <item.icon 
                  size={isActive ? 22 : 18} 
                  strokeWidth={isActive ? 3 : 2.5} 
                  className={isActive ? 'text-brand-orange' : 'text-white'} 
                />
              </div>
              <span className={`text-[7px] font-black tracking-widest uppercase mt-0.5 ${isActive ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                {item.label}
              </span>
              {isActive && (
                  <motion.div 
                    layoutId="navGlow"
                    className="absolute -top-1 w-5 h-0.5 rounded-full bg-brand-orange shadow-[0_0_8px_#F36F21]" 
                  />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});
