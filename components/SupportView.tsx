import React from 'react';
import { GlassCard } from './UIComponents';
import { Phone, Mail, MessageCircle, ChevronDown, HelpCircle, LifeBuoy } from 'lucide-react';
import { UserProfile } from '../types';

interface SupportViewProps {
  user: UserProfile;
}

export const SupportView: React.FC<SupportViewProps> = ({ user }) => {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const faqs = [
      { q: "How do I check my order status?", a: "Navigate to the 'Orders' section. You will see a list of all your past and active orders with their current status (Pending, Completed, etc.)." },
      { q: "Who do I contact for damaged goods?", a: "Please contact our support team via WhatsApp or Call immediately with photos of the damaged items. We will process a replacement." }
  ];

  return (
    <div className="min-h-screen bg-white font-black pb-32 pt-12 px-4">
        <div className="text-center space-y-4 mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-1 bg-brand-orange rounded-full animate-pulse" />
            </div>
            <h2 className="text-brand-blue text-sm font-black uppercase tracking-[0.4em]">Helpdesk Terminal</h2>
            <h1 className="text-4xl font-black text-black tracking-tight uppercase italic leading-none">Support <span className="text-brand-orange">& Center</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">Official RCM Partnership Support Node</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <GlassCard className="p-8 flex flex-col items-center text-center space-y-6 bg-white border-4 border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all shadow-xl rounded-[40px]">
                <div className="w-20 h-20 rounded-[28px] bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100 shadow-inner">
                    <MessageCircle size={36} strokeWidth={3} />
                </div>
                <div>
                    <h3 className="text-brand-blue font-black text-xl uppercase tracking-tight italic">WhatsApp</h3>
                    <p className="text-brand-orange text-[9px] font-black mt-2 uppercase tracking-widest">Instant Resolution</p>
                </div>
                <a href={`https://wa.me/919471217445?text=Hi, I am partner ${user.dealer_code} (${user.shop_name}). I need help.`} target="_blank" rel="noreferrer" className="w-full">
                    <button className="w-full h-16 bg-black text-white rounded-[24px] font-black tracking-widest text-[11px] uppercase active:scale-95 transition-all shadow-lg italic">
                        CHAT NOW
                    </button>
                </a>
            </GlassCard>

            <GlassCard className="p-8 flex flex-col items-center text-center space-y-6 bg-white border-4 border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all shadow-xl rounded-[40px]">
                <div className="w-20 h-20 rounded-[28px] bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100 shadow-inner">
                    <Phone size={36} strokeWidth={3} />
                </div>
                <div>
                    <h3 className="text-brand-blue font-black text-xl uppercase tracking-tight italic">Call Desk</h3>
                    <p className="text-brand-orange text-[9px] font-black mt-2 uppercase tracking-widest">9 AM - 7 PM</p>
                </div>
                <a href="tel:+919471217445" className="w-full">
                    <button className="w-full h-16 bg-brand-blue text-white rounded-[24px] font-black tracking-widest text-[11px] uppercase active:scale-95 transition-all shadow-highlight italic">
                        CALL SUPPORT
                    </button>
                </a>
            </GlassCard>

            <GlassCard className="p-8 flex flex-col items-center text-center space-y-6 bg-white border-4 border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all shadow-xl rounded-[40px]">
                <div className="w-20 h-20 rounded-[28px] bg-purple-50 text-purple-600 flex items-center justify-center border-2 border-purple-100 shadow-inner">
                    <Mail size={36} strokeWidth={3} />
                </div>
                <div>
                    <h3 className="text-brand-blue font-black text-xl uppercase tracking-tight italic">Email</h3>
                    <p className="text-brand-orange text-[9px] font-black mt-2 uppercase tracking-widest">Formal Queries</p>
                </div>
                <a href="mailto:rcmhardware@gamil.com" className="w-full">
                    <button className="w-full h-16 bg-slate-100 text-black border-2 border-slate-200 rounded-[24px] font-black tracking-widest text-[11px] uppercase active:scale-95 transition-all italic">
                        WRITE EMAIL
                    </button>
                </a>
            </GlassCard>
        </div>

        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <HelpCircle size={22} className="text-brand-orange" strokeWidth={3} />
              <h3 className="text-[14px] font-black text-black uppercase tracking-[0.4em] italic">Knowledge Base</h3>
            </div>
            
            <div className="space-y-4">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-white border-4 border-purple-500 rounded-[32px] overflow-hidden shadow-sm transition-all" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                        <div className="p-6 flex justify-between items-center cursor-pointer hover:bg-purple-50/30 transition-all">
                            <h4 className="font-black text-black text-sm uppercase tracking-tight italic">{faq.q}</h4>
                            <ChevronDown className={`text-brand-blue transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} size={20} strokeWidth={4} />
                        </div>
                        {openFaq === idx && (
                            <div className="px-6 pb-8 text-slate-700 text-sm font-black leading-relaxed border-t-2 border-purple-100 pt-5 animate-fade-in tracking-tight italic">
                                <span className="text-brand-orange mr-2">&gt;&gt;&gt;</span> {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-3 opacity-40">
           <LifeBuoy size={16} className="text-brand-blue" />
           <p className="text-[10px] font-black text-black uppercase tracking-[0.5em] italic">System Protection v3.1</p>
        </div>
    </div>
  );
};