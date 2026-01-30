import React from 'react';
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
    <div className="min-h-screen bg-white font-sans pb-32 pt-12 px-4">
        <div className="text-center space-y-2 mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Support Center</h1>
            <p className="text-gray-500 text-sm">Your official RCM partnership support node.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {/* WhatsApp Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <MessageCircle size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">WhatsApp</h3>
                    <p className="text-gray-500 text-xs">Instant Resolution</p>
                </div>
                <a href={`https://wa.me/919471217445?text=Hi, I am partner ${user.dealer_code} (${user.shop_name}). I need help.`} target="_blank" rel="noreferrer" className="w-full">
                    <button className="w-full h-12 bg-gray-900 text-white rounded-lg font-semibold text-sm active:scale-95 transition-all">
                        Chat Now
                    </button>
                </a>
            </div>

            {/* Call Desk Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Phone size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">Call Desk</h3>
                    <p className="text-gray-500 text-xs">9 AM - 7 PM</p>
                </div>
                <a href="tel:+919471217445" className="w-full">
                    <button className="w-full h-12 bg-gray-900 text-white rounded-lg font-semibold text-sm active:scale-95 transition-all">
                        Call Support
                    </button>
                </a>
            </div>

            {/* Email Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <Mail size={32} />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">Email</h3>
                    <p className="text-gray-500 text-xs">Formal Queries</p>
                </div>
                <a href="mailto:rcmhardware@gamil.com" className="w-full">
                    <button className="w-full h-12 bg-gray-900 text-white rounded-lg font-semibold text-sm active:scale-95 transition-all">
                        Write Email
                    </button>
                </a>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-3 px-2">
              <HelpCircle size={20} className="text-gray-500" />
              <h3 className="font-bold text-gray-900 uppercase tracking-widest">Knowledge Base</h3>
            </div>
            
            <div className="space-y-3">
                {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden transition-all">
                        <div className="p-4 flex justify-between items-center cursor-pointer" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                            <h4 className="font-semibold text-gray-800 text-sm">{faq.q}</h4>
                            <ChevronDown className={`text-gray-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} size={20} />
                        </div>
                        {openFaq === idx && (
                            <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-200 pt-3">
                                {faq.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="mt-16 flex items-center justify-center gap-2 opacity-50">
           <LifeBuoy size={14} className="text-gray-500" />
           <p className="text-xs font-medium text-gray-500">System Protection v3.1</p>
        </div>
    </div>
  );
};
