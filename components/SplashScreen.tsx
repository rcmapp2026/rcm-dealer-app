
import { motion as m } from 'framer-motion';
import React, { useEffect } from 'react';
import { RCMLogo } from './RCMLogo';
import { requestFeaturePermission } from '../services/nativePermissionService';

const motion = m as any;

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const initApp = async () => {
      try {
        await requestFeaturePermission('notifications');
      } catch (e) {
        console.warn("Permission request failed", e);
      }
      setTimeout(onComplete, 3000);
    };
    initApp();
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center font-bold">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-orange-100 blur-[100px] rounded-full opacity-50" />
        <RCMLogo size={180} textColor="text-black" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-center space-y-2"
      >
        <h2 className="text-xl font-bold text-black uppercase tracking-[0.2em] italic">RCM Dealer Pro</h2>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">Premium Hardware Solutions</p>
      </motion.div>

      <div className="absolute bottom-20 w-64">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
            className="h-full bg-gradient-to-r from-blue-600 to-orange-500"
          />
        </div>
        <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest mt-3 animate-pulse italic">Initializing Secure Session...</p>
      </div>
    </div>
  );
};
