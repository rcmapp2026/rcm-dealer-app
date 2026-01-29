
import { motion as m } from 'framer-motion';
import { ArrowRight, UserPlus, Smartphone, Hash, Sparkles, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { RCMLogo } from './RCMLogo';
import { supabaseService } from '../services/supabaseService';

const motion = m as any;

interface LoginViewProps {
  // Fix: Add userData argument to onAuthSuccess to match implementation in App.tsx
  onAuthSuccess: (userData: any) => void;
  onOpenRegistration: () => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onAuthSuccess,
  onOpenRegistration,
  loading,
  setLoading
}) => {
  const [dealerCode, setDealerCode] = useState('RCM-');
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const cleanCode = dealerCode.trim().toUpperCase();
    const cleanMobile = mobile.trim();

    if (!cleanCode.startsWith('RCM-') || cleanCode.length < 5) {
      setError('Invalid ID Code. Required: RCM-XXXX');
      return;
    }
    if (cleanMobile.length !== 10) {
      setError('Signal verification failed: Mobile must be 10 digits.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Fix: Capture signed-in user and pass it to onAuthSuccess
      const user = await supabaseService.signIn(cleanCode, cleanMobile);
      onAuthSuccess(user);
    } catch (e: any) {
      setError(e.message || 'Access Denied. Terminal link rejected.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full w-full flex flex-col bg-white items-center justify-start p-8 pt-10 relative overflow-y-auto font-black">
       {/* Background Subtle Pattern */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

       <div className="w-full max-w-sm flex flex-col items-center relative z-10">
          <div className="mb-8 active:scale-95 transition-transform duration-300">
            <RCMLogo size={160} textColor="text-black" showText={false} />
          </div>

          <div className="w-full text-center mb-10">
            <h1 className="text-[2.6em] font-[1000] text-black italic tracking-tighter leading-[0.8] uppercase">
              RCM<br/><span className="text-brand-orange">DEALER</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-4">
               <div className="h-1 w-8 bg-brand-blue rounded-full" />
               <p className="text-black text-[10px] font-black uppercase tracking-[0.4em]">Secure Access Point</p>
               <div className="h-1 w-8 bg-brand-blue rounded-full" />
            </div>
          </div>

          <div className="w-full space-y-8">
             {error && (
               <div className="p-4 bg-rose-100 border-4 border-rose-600 rounded-2xl text-rose-900 text-[10px] font-black text-center uppercase tracking-widest italic animate-shake">
                 ERROR: {error}
               </div>
             )}

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-1">Terminal ID</label>
                   <div className="relative group">
                      <Hash className="absolute left-5 top-1/2 -translate-y-1/2 text-[#006666] group-focus-within:text-brand-blue transition-colors" size={18} />
                      <input
                        type="text"
                        value={dealerCode}
                        onChange={e => setDealerCode(e.target.value.toUpperCase())}
                        className="w-full h-16 bg-[#f0fdfa] border-4 border-[#006666] rounded-2xl pl-14 pr-6 text-black text-sm font-black outline-none focus:ring-4 focus:ring-[#006666]/20 transition-all shadow-sm uppercase italic placeholder:text-slate-600"
                        placeholder="RCM-XXXX"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-black uppercase tracking-[0.3em] ml-1">Verified Mobile</label>
                   <div className="relative group">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-[#006666] group-focus-within:text-brand-orange transition-colors" size={18} />
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobile}
                        onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-16 bg-[#f0fdfa] border-4 border-[#006666] rounded-2xl pl-14 pr-6 text-black text-sm font-black outline-none focus:ring-4 focus:ring-[#006666]/20 transition-all shadow-sm italic placeholder:text-slate-600"
                        placeholder="9876543210"
                      />
                   </div>
                </div>

                <div className="flex flex-col items-center gap-6 pt-4">
                    <button
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full h-20 bg-brand-orange text-black text-xs font-[1000] uppercase tracking-[0.4em] rounded-[28px] active:scale-[0.97] transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl py-6 italic border-4 border-black"
                    >
                       {loading ? (
                         <div className="flex items-center gap-3">
                           <div className="w-5 h-5 border-4 border-black/30 border-t-black rounded-full animate-spin" />
                           <span className="text-black">BOOTING...</span>
                         </div>
                       ) : (
                         <>
                           INITIALIZE COMMAND
                           <ArrowRight size={22} strokeWidth={4} className="text-black"/>
                         </>
                       )}
                    </button>

                    <button
                       onClick={onOpenRegistration}
                       className="flex items-center gap-3 text-black hover:text-brand-blue transition-colors uppercase font-black text-[11px] tracking-[0.2em] mt-2 underline underline-offset-8 decoration-2"
                    >
                       <UserPlus size={14} strokeWidth={4} className="text-[#006666]"/> NEW TERMINAL? REGISTER
                    </button>
                </div>
             </div>
          </div>
       </div>

       <div className="mt-auto pt-10 flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#006666]" />
          <span className="text-[10px] tracking-[0.5em] uppercase font-black text-black">Powered by RCM Technology</span>
       </div>
    </div>
  );
};
