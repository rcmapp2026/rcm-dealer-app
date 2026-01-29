import React, { useMemo } from 'react';
import { motion as m, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, ArrowLeft, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';

const motion = m as any;

const Flower = ({ initialX, initialY, delay, duration, size, rotation }: any) => (
  <m.div
    initial={{ x: initialX, y: initialY, opacity: 0, rotate: 0 }}
    animate={{ 
      y: '110vh', 
      opacity: [0.5, 1, 0],
      rotate: rotation,
      x: initialX + (Math.random() - 0.5) * 200
    }}
    transition={{
      delay,
      duration,
      ease: 'linear',
      repeat: Infinity,
      repeatType: 'loop'
    }}
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      fontSize: size,
    }}
  >
    🌸
  </m.div>
);

const FallingFlowers = () => {
    const flowers = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      initialX: `${Math.random() * 100}vw`,
      initialY: `${Math.random() * -100 - 100}px`,
      delay: Math.random() * 5,
      duration: Math.random() * 5 + 5,
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360 + 360,
    })), []);

    return <>{flowers.map(f => <Flower key={f.id} {...f} />)}</>;
};


interface Props {
  dealer: UserProfile;
  onComplete: () => void;
}

export const RegistrationSuccess: React.FC<Props> = ({ dealer, onComplete }) => {
  
    const handleFastVerification = () => {
        const message = `
Hello RCM Team! 👋

I've just completed my registration on the RCM app and would like to request fast verification.

Here are my details:

👤 **Owner Name:** ${dealer.owner_name}
🏪 **Shop Name:** ${dealer.shop_name}
🏙️ **City:** ${dealer.city}
📍 **Pincode:** ${dealer.pincode}
📱 **Mobile:** ${dealer.mobile}

Looking forward to a quick verification process! Thank you! 🙏
        `;
        const whatsappUrl = `https://wa.me/919471217445?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-[100] bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center p-8 text-center overflow-hidden"
      >
        <FallingFlowers />
        <motion.div 
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0, transition: { delay: 0.2, type: 'spring', stiffness: 150 } }}
          className="relative w-40 h-40"
        >
          <div className="absolute inset-0 bg-teal-500 rounded-full animate-ping opacity-20" />
          <div className="w-full h-full bg-teal-600 text-white rounded-full flex items-center justify-center shadow-2xl border-8 border-white">
            <Check size={80} strokeWidth={4} />
          </div>
          <motion.div 
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0, transition: { delay: 0.6, duration: 0.5 } }}
            className="absolute -top-2 -right-2 bg-amber-400 text-black p-3 rounded-full shadow-lg border-4 border-white"
          >
            <ShieldCheck size={24} />
          </motion.div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 0.8 } }}
          className="text-4xl font-[1000] text-teal-900 tracking-tighter mt-12 italic uppercase"
        >
          Registration Complete 🎉
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
          className="text-slate-600 font-semibold max-w-md mt-4"
        >
          Welcome, <strong className="text-teal-800">{dealer.owner_name}</strong>! Your application for <strong className="text-teal-800">{dealer.shop_name}</strong> has been submitted. You will be notified once your account is activated.
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1, transition: { delay: 1.2 } }}
          className="mt-12 bg-white border-2 border-teal-100 rounded-3xl p-6 w-full max-w-sm shadow-xl"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500 italic">Next Step</p>
          <p className="text-sm font-bold text-teal-800 mt-2">
            Our team will now verify your details. This process usually takes 24-48 hours. Please wait for the activation confirmation.
          </p>
        </motion.div>

        <motion.div 
            className='flex gap-4'
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1, transition: { delay: 1.4 } }}
        >
            <button
                onClick={onComplete}
                className="mt-10 bg-slate-600 text-white font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-full shadow-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
                <ArrowLeft size={14} /> Back
            </button>
            <button
                onClick={handleFastVerification}
                className="mt-10 bg-green-500 text-white font-bold uppercase tracking-widest text-xs px-8 py-4 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
                <MessageCircle size={14} /> Fast Verification
            </button>
      </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
