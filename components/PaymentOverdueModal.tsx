
import React from 'react';
import { motion as m } from 'framer-motion';
import { AlertCircle, ArrowRight } from 'lucide-react';

const motion = m as any;

interface PaymentOverdueModalProps {
  onNavigateToLedger: () => void;
}

export const PaymentOverdueModal: React.FC<PaymentOverdueModalProps> = ({ onNavigateToLedger }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-white flex items-center justify-center p-8 font-black">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white border-4 border-red-500 rounded-[40px] p-8 text-center max-w-sm w-full shadow-2xl space-y-6"
      >
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600">
           <AlertCircle size={40} strokeWidth={3} />
        </div>
        
        <div className="space-y-2">
            <h2 className="text-2xl font-[1000] text-black italic tracking-tighter uppercase leading-none">Access Restricted</h2>
            <p className="text-[10px] text-red-600 font-black uppercase tracking-widest italic">Terminal Payment Overdue</p>
        </div>

        <p className="text-[11px] text-slate-500 font-black uppercase leading-relaxed italic">
          Your account has been restricted due to outstanding dues. Please settle your ledger to restore terminal functionality.
        </p>
        
        <button
          onClick={onNavigateToLedger}
          className="w-full h-16 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
        >
          VIEW LEDGER <ArrowRight size={18} strokeWidth={3} />
        </button>
      </motion.div>
    </div>
  );
};
