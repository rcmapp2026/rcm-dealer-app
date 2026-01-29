
import React, { useState } from 'react';
import { Bell, Gift, Send, Image as ImageIcon, CheckCircle, Loader2 } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';

export const BroadcastHub: React.FC = () => {
  const [notif, setNotif] = useState({ title: '', message: '', is_priority: false });
  const [offer, setOffer] = useState({ title: '', description: '', image_url: '', pdf_url: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendNotif = async () => {
    if (!notif.title || !notif.message) return;
    setLoading(true);
    await supabaseService.sendNotification({ ...notif, created_at: new Date().toISOString(), sender: 'ADMIN' });
    setLoading(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setNotif({ title: '', message: '', is_priority: false });
  };

  return (
    <div className="p-6 space-y-8 font-black uppercase italic">
      <header>
        <h1 className="text-3xl tracking-tighter">Broadcast Hub</h1>
        <p className="text-[10px] text-brand-orange tracking-[0.4em] mt-2">Neural Link Distribution</p>
      </header>

      <div className="space-y-10">
        {/* Notification Form */}
        <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] space-y-6">
           <div className="flex items-center gap-3 text-brand-blue">
             <Bell size={20} />
             <h2 className="text-sm tracking-widest">General Broadcast</h2>
           </div>

           <div className="space-y-4">
              <input 
                value={notif.title}
                onChange={e => setNotif({...notif, title: e.target.value})}
                className="w-full h-14 bg-black border-2 border-slate-800 rounded-2xl px-6 text-sm outline-none focus:border-brand-blue"
                placeholder="NOTIFICATION TITLE..."
              />
              <textarea 
                value={notif.message}
                onChange={e => setNotif({...notif, message: e.target.value})}
                className="w-full h-32 bg-black border-2 border-slate-800 rounded-2xl p-6 text-sm outline-none focus:border-brand-blue resize-none"
                placeholder="TRANSMISSION MESSAGE..."
              />
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" checked={notif.is_priority}
                  onChange={e => setNotif({...notif, is_priority: e.target.checked})}
                  className="w-6 h-6 rounded-lg bg-black border-2 border-slate-800"
                />
                <span className="text-[10px] text-rose-400">Mark as Priority Alert</span>
              </label>

              <button 
                onClick={handleSendNotif}
                disabled={loading}
                className="w-full h-16 bg-brand-blue text-white rounded-2xl flex items-center justify-center gap-3 text-[11px] shadow-lg active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : sent ? <CheckCircle size={20} /> : <><Send size={18} /> INITIALIZE BROADCAST</>}
              </button>
           </div>
        </div>

        {/* Offer Form */}
        <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] space-y-6 opacity-60 pointer-events-none">
           <div className="flex items-center gap-3 text-brand-orange">
             <Gift size={20} />
             <h2 className="text-sm tracking-widest">Market Schemes (Coming Soon)</h2>
           </div>
           <p className="text-[8px] text-slate-500 normal-case italic">Advanced marketing module for PDF distribution and visual offers.</p>
        </div>
      </div>
    </div>
  );
};
