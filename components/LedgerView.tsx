import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { UserProfile, LedgerEntry, LedgerSummary } from '../types';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, X, ArrowLeft } from 'lucide-react';

interface LedgerViewProps {
  user: UserProfile;
  summary: LedgerSummary;
  isOnline: boolean;
  onRefresh?: () => void;
  companyProfile: any;
}

export const LedgerView: React.FC<LedgerViewProps> = ({ user, summary, onRefresh }) => {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<LedgerEntry | null>(null);

  const fetchLedger = async () => {
    setLoading(true);
    const data = await supabaseService.fetchLedger(user.id);
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchLedger();
  }, [user.id]);

  const isDue = (summary.due_amount || 0) > 0;

  if (selectedTx) {
      return (
        <div className="bg-white min-h-screen pb-40 px-6 pt-8 font-bold">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => setSelectedTx(null)} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-black">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-black tracking-tighter uppercase italic">Transaction Details</h1>
            </header>
            <div className="p-8 text-center space-y-8">
                <div className="space-y-2">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Amount</p>
                    <h1 className={`text-4xl font-bold italic ${selectedTx.type.toLowerCase() === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{Number(selectedTx.amount).toLocaleString()}
                    </h1>
                </div>
                <div className="p-6 bg-slate-50 rounded-3xl space-y-4 text-left">
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase">Remark</p>
                        <p className="text-sm italic uppercase">{selectedTx.narration || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase">Date & Time</p>
                        <p className="text-sm italic uppercase">{new Date(selectedTx.date).toLocaleString()}</p>
                    </div>
                </div>
                <button onClick={() => setSelectedTx(null)} className="w-full h-14 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest italic">Close Details</button>
            </div>
        </div>
      )
  }

  return (
    <div className="bg-white min-h-screen pb-40 px-6 pt-8 font-bold">
      <header className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-8 bg-orange-500 rounded-full" />
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Finances</p>
        </div>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black uppercase italic">Finance Ledger</h1>
          <button onClick={fetchLedger} className="p-2 bg-white rounded-xl border-2 border-slate-100 text-blue-600">
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[40px] border-2 border-slate-100 shadow-sm text-center mb-8">
          <p className="text-slate-400 text-[10px] uppercase tracking-widest mb-2">
            {isDue ? 'Net Outstanding (Dues)' : 'Surplus Balance (Advance)'}
          </p>
          <h2 className={`text-5xl font-bold tracking-tighter italic ${isDue ? 'text-red-600' : 'text-green-600'}`}>
            ₹{Math.abs(summary.due_amount || 0).toLocaleString()}
          </h2>
          <p className="text-[10px] font-bold uppercase mt-2 text-blue-600">ID: {user.dealer_code}</p>
      </div>

      <div className="space-y-4">
          <h3 className="text-sm font-bold text-black uppercase italic tracking-tighter px-1">Transaction History</h3>
          
          <div className="space-y-2">
            {entries.map((entry, idx) => {
               const isCredit = entry.type?.toLowerCase() === 'credit';
               return (
                  <div key={idx} onClick={() => setSelectedTx(entry)} className="p-4 bg-white rounded-2xl border-2 border-slate-50 flex justify-between items-center shadow-sm">
                      <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                             {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                         </div>
                         <div>
                            <p className="text-black text-[12px] font-bold uppercase truncate max-w-[150px] italic">{entry.narration || 'Adjustment'}</p>
                            <p className="text-[10px] text-slate-400 font-bold">{new Date(entry.date).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <p className={`text-sm font-bold italic ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                         {isCredit ? '+' : '-'} ₹{Number(entry.amount || 0).toLocaleString()}
                      </p>
                  </div>
               );
            })}
          </div>
      </div>
    </div>
  );
};
