import React, { useState, useEffect, useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { ChevronRight, Heart, Sparkles, User, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { RCMLogo } from './RCMLogo';

const motion = m as any;

interface WelcomeOverlayProps {
  user: UserProfile;
  onClose: () => void;
}

// Flower Component for the shower effect
const Flower = ({ index }: { index: number }) => {
  const randomX = useMemo(() => Math.random() * 100, []);
  const randomDelay = useMemo(() => Math.random() * 20, []);
  const randomDuration = useMemo(() => 5 + Math.random() * 10, []);
  const randomRotate = useMemo(() => Math.random() * 360, []);
  const flowers = ['🌸', '✨', '🌹', '🌺', '🌷', '🧡'];
  const icon = useMemo(() => flowers[Math.floor(Math.random() * flowers.length)], []);

  return (
    <motion.div
      initial={{ y: -50, x: `${randomX}%`, opacity: 0, rotate: 0 }}
      animate={{
        y: ['0vh', '110vh'],
        opacity: [0, 1, 1, 0],
        rotate: [0, randomRotate, randomRotate * 2]
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "linear"
      }}
      className="absolute text-xl pointer-events-none z-[5]"
    >
      {icon}
    </motion.div>
  );
};

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ user, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [showFlowers, setShowFlowers] = useState(true);
  const [greeting, setGreeting] = useState('Welcome');
  const dealerName = user.owner_name?.split(' ')[0] || 'Partner';

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);

    // Stop flowers after 1 minute (60,000 ms)
    const flowerTimer = setTimeout(() => setShowFlowers(false), 60000);

    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Good Morning');
    else if (currentHour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    return () => {
      clearTimeout(timer);
      clearTimeout(flowerTimer);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-8 overflow-hidden"
    >
      {/* Flower Shower Layer */}
      <AnimatePresence>
        {showFlowers && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <Flower key={i} index={i} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Soft Elegant Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[60%] aspect-square bg-blue-50 rounded-full blur-[80px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] aspect-square bg-rose-50 rounded-full blur-[80px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Premium Badge */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="mb-8 flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-2xl shadow-xl"
        >
           <Sparkles size={14} className="text-orange-400 fill-orange-400" />
           <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Authorized Dealer Interface</span>
        </motion.div>

        {/* Logo Section - Clean & Floating */}
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative mb-12"
        >
          <div className="w-40 h-40 bg-white rounded-[48px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] flex items-center justify-center border border-slate-50 relative">
             <RCMLogo size={100} showText={false} />
             <motion.div
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: 0.8, type: 'spring' }}
               className="absolute -top-2 -right-2 w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white"
             >
                <ShieldCheck size={18} />
             </motion.div>
          </div>
        </motion.div>
        
        {/* Content Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-8"
        >
          <div className="space-y-4">
             <h1 className="text-4xl font-[1000] text-slate-900 tracking-tight leading-tight uppercase italic">
                {greeting}, <br />
                <span className="text-blue-600 drop-shadow-sm">{dealerName} Sir</span>
             </h1>
             <div className="h-1 w-12 bg-orange-500 mx-auto rounded-full" />
          </div>
          
          <div className="space-y-6">
             <p className="text-slate-500 text-sm font-bold leading-relaxed max-w-[260px] mx-auto uppercase italic opacity-70">
                Welcome to the next generation of <br />
                <span className="text-black font-black">RCM Business Hub</span>
             </p>

             <div className="flex items-center justify-center gap-8">
                <div className="flex flex-col items-center gap-1">
                   <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Heart size={18} fill="currentColor" />
                   </div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Trust</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                   <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <Sparkles size={18} fill="currentColor" />
                   </div>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Quality</span>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Action Button - Elegant & Soft */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 30 }}
          transition={{ delay: 0.7 }}
          className="mt-16 w-full px-4"
        >
          <button
            onClick={onClose}
            className="group relative w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[28px] font-black text-xs uppercase italic tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl shadow-blue-600/30 active:scale-[0.98]"
          >
            Enter Dashboard
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
               <ChevronRight size={18} strokeWidth={3} />
            </div>
          </button>
          
          <p className="mt-8 text-[9px] text-slate-300 font-black uppercase tracking-[0.3em] text-center italic">
             Secure Terminal v2.5.0
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
