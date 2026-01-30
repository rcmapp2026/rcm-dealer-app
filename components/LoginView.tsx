
import { motion as m } from 'framer-motion';
import { ArrowRight, UserPlus, Smartphone, Hash, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { RCMLogo } from './RCMLogo';
import { supabaseService } from '../services/supabaseService';

const motion = m as any;

interface LoginViewProps {
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
      setError('Invalid Dealer ID. Must be in RCM-XXXX format.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setError('Invalid mobile number. Must be 10 digits.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await supabaseService.signIn(cleanCode, cleanMobile);
      onAuthSuccess(user);
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-full w-full flex flex-col bg-gray-50 items-center justify-center p-6 font-sans">
       <div className="w-full max-w-sm flex flex-col items-center">
          <div className="mb-6">
            <RCMLogo size={100} />
          </div>

          <div className="w-full text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to your RCM Dealer account.</p>
          </div>

          <div className="w-full space-y-4">
             {error && (
               <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-xs font-semibold text-center">
                 {error}
               </div>
             )}

             <div className="space-y-4">
                <div>
                   <label className="text-xs font-medium text-gray-700">Dealer ID</label>
                   <div className="relative mt-1">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        value={dealerCode}
                        onChange={e => {
                            const value = e.target.value.toUpperCase();
                            if (!value.startsWith('RCM-')) {
                                setDealerCode('RCM-');
                            } else {
                                setDealerCode(value);
                            }
                        }}
                        className="w-full h-12 bg-white border border-gray-300 rounded-lg pl-9 pr-4 text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="RCM-XXXX"
                      />
                   </div>
                </div>

                <div>
                   <label className="text-xs font-medium text-gray-700">Registered Mobile</label>
                   <div className="relative mt-1">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobile}
                        onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full h-12 bg-white border border-gray-300 rounded-lg pl-9 pr-4 text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder="10-digit mobile number"
                      />
                   </div>
                </div>

                <div className="pt-2">
                    <button
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full h-12 bg-gray-900 text-white text-sm font-bold rounded-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 shadow-md"
                    >
                       {loading ? (
                         <>
                           <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                           <span>Authenticating...</span>
                         </>
                       ) : (
                         <>
                           Sign In
                           <ArrowRight size={16} strokeWidth={3} />
                         </>
                       )}
                    </button>
                </div>
             </div>

            <div className="text-center mt-4">
              <button
                  onClick={onOpenRegistration}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-semibold text-xs group"
              >
                  <UserPlus size={14} className="text-gray-400 group-hover:text-blue-500" />
                  New Dealer? Register Here
              </button>
            </div>
          </div>
       </div>

       <div className="absolute bottom-6 flex items-center gap-2 opacity-60">
          <ShieldCheck size={12} className="text-gray-500" />
          <span className="text-xs text-gray-500">Powered by RCM Technology</span>
       </div>
    </div>
  );
};
