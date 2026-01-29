
import React, { useState, useEffect } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { RCMLogo } from './RCMLogo';

const motion = m as any;

interface WelcomeOverlayProps {
  user: UserProfile;
  onClose: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ user, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState('Welcome');
  const [isFirstTime, setIsFirstTime] = useState(false);
  const dealerName = user.owner_name?.split(' ')[0] || 'Partner';

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    const hasVisited = localStorage.getItem('rcm-dealer-has-visited');
    if (hasVisited) {
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        setGreeting('Good Morning');
      } else if (currentHour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
    } else {
      setIsFirstTime(true);
      localStorage.setItem('rcm-dealer-has-visited', 'true');
    }
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 font-bold"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-orange-100 rounded-full blur-3xl" />
         <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-blue-100 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm text-center flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-48 h-48 bg-white rounded-[60px] shadow-2xl shadow-blue-100 flex items-center justify-center border-4 border-slate-50 relative">
             <div className="absolute -top-4 -right-4 bg-orange-500 text-white p-3 rounded-2xl shadow-lg">
                <Sparkles size={24} />
             </div>
             <RCMLogo size={120} showText={false} />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="space-y-1">
             <p className="text-orange-500 uppercase tracking-[0.3em] text-[10px] font-bold">Authenticated Terminal</p>
             <h1 className="text-3xl font-bold text-black tracking-tighter uppercase italic">
                {isFirstTime ? (
                    <>
                        Welcome, <span className="text-blue-600">{dealerName}</span> Sir, ...........................
                    </>
                ) : (
                    <>
                        {greeting}, <span className="text-blue-600">{dealerName}</span>
                    </>
                )}
             </h1>
          </div>
          
          <p className="text-slate-500 text-sm uppercase italic leading-relaxed px-4">
            Experience the next level of hardware management with <span className="text-red-600">RCM Dealer Pro</span>. Simple, Fast & Secure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ delay: 0.8 }}
          className="mt-12 w-full"
        >
          <button
            onClick={onClose}
            className="w-full h-16 bg-blue-600 text-white rounded-3xl font-bold uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-200 border-b-4 border-blue-700 italic"
          >
            Go to Dashboard
            <ChevronRight size={20} />
          </button>
          
          <p className="mt-6 text-[9px] text-slate-400 uppercase tracking-widest font-bold">Version 2.4.0 • Secure Node</p>
        </motion.div>
      </div>
    </motion.div>
  );
};
