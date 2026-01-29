
import React from 'react';
import { Order, UserProfile } from '../types';
import { ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { motion as m } from 'framer-motion';

// Flower particle component
const FlowerParticle = ({ i }: { i: number }) => {
  const flowers = ['🌸', '🌺', '🌻', '🌼', '🌷'];
  const randomXStart = Math.random() * 100;
  const randomYStart = -10 - (Math.random() * 20);
  const randomXEnd = randomXStart + (Math.random() - 0.5) * 400;
  const randomYEnd = 120;
  const randomRotation = Math.random() * 720;
  const randomDuration = 3 + Math.random() * 2;
  const randomDelay = Math.random() * 1.5;
  const randomScale = 0.8 + Math.random() * 0.5;

  return (
    <m.div
      className="absolute text-3xl"
      style={{
        left: `${randomXStart}%`,
        top: `${randomYStart}%`,
        transform: `scale(${randomScale})`,
      }}
      initial={{ opacity: 1, rotate: 0 }}
      animate={{
        top: `${randomYEnd}%`,
        x: (Math.random() - 0.5) * 200, // side to side movement
        rotate: randomRotation,
        opacity: [1, 1, 0]
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'linear',
      }}
    >
      {flowers[i % flowers.length]}
    </m.div>
  );
};

interface Props {
  order: Order;
  user: UserProfile;
  onComplete: () => void;
  companyProfile: any;
}

export const OrderSuccess: React.FC<Props> = ({ order, user, onComplete }) => {
  const dealerName = user.owner_name?.split(' ')[0] || 'Partner';

  // Hinglish message
  const hinglishMessage = `${dealerName} Sir, Aapka Order Safalta Purvak Place ho gaya hai. Kripya Dues Payment Samay par Clear karein. Thank You for Choosing RCM ERP 🙏`;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-gray-50 overflow-hidden font-black">
      {/* Flower-falling Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(80)].map((_, i) => (
          <FlowerParticle key={i} i={i} />
        ))}
      </div>

      {/* Main Card */}
      <m.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
        className="w-full max-w-md bg-white rounded-[48px] p-8 md:p-12 shadow-2xl relative z-10 flex flex-col items-center text-center"
      >
        {/* Icon */}
        <m.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
          className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-6 border-4 border-white shadow-lg"
        >
          <CheckCircle size={48} className="text-emerald-500" strokeWidth={2.5} />
        </m.div>

        {/* Heading */}
        <m.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-3xl font-[1000] text-slate-800 tracking-tighter"
        >
            Order Placed!
        </m.h2>

        {/* Hinglish Message */}
        <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-center text-md font-bold text-slate-600 leading-relaxed px-4"
        >
            {hinglishMessage}
        </m.p>

        {/* Order Details */}
        <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="w-full mt-8 p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 space-y-4"
        >
            <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order No.</p>
                <p className="text-sm font-black text-slate-700">{order.order_no}</p>
            </div>
            <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
                <p className="text-2xl font-[1000] text-emerald-600">
                    ₹{(order.final_total || 0).toLocaleString()}
                </p>
            </div>
        </m.div>

        {/* Button */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="w-full mt-10"
        >
          <button
            onClick={onComplete}
            className="w-full h-16 rounded-3xl bg-brand-blue text-white font-bold text-md tracking-wider flex items-center justify-center gap-3 active:scale-95 shadow-lg hover:shadow-xl transition-all"
          >
            GO TO DASHBOARD
            <ArrowRight size={20} strokeWidth={3} />
          </button>
        </m.div>

      </m.div>

       {/* Footer */}
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="mt-8 flex items-center gap-2"
      >
        <TrendingUp size={14} className="text-slate-400" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Growing Together
        </span>
      </m.div>
    </div>
  );
};
