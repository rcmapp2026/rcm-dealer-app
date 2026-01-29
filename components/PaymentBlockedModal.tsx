import React from 'react';
import { ShieldAlert, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  supportNumber: string;
  user: UserProfile | null;
}

export const PaymentBlockedModal: React.FC<Props> = ({ supportNumber, user }) => {
  const handleWhatsAppRedirect = () => {
    const whatsAppNumber = '9471217445';
    const dealerCode = user?.dealer_code || 'Not Available';

    const message = 
`Hello RCM Support Team,

My account is currently blocked due to pending payments.

Could you please provide my current outstanding dues? I would like to clear the amount at the earliest to regain full access to the RCM Dealer app.

*My Dealer Code is:* ${dealerCode}

Thank you for your prompt assistance! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsAppNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-8 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 text-center shadow-2xl border-4 border-red-500/50">
        <div className="flex justify-center mb-6">
          <ShieldAlert className="text-red-500" size={64} strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-extrabold text-red-700 tracking-tight">🚫 Account Blocked</h2>
        <p className="text-slate-600 mt-4 font-semibold leading-relaxed">
          Your account has been temporarily blocked due to pending payments. To continue accessing our services, please clear your outstanding dues.
        </p>
        <div className="mt-8">
          <button
            onClick={handleWhatsAppRedirect}
            className="w-full bg-emerald-500 text-white font-bold py-4 px-6 rounded-2xl text-lg flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg hover:bg-emerald-600"
          >
            <MessageCircle size={22} strokeWidth={2.5} />
            Contact Support
          </button>
          <p className="text-xs text-slate-400 mt-4">
            Or call our support line at <a href={`tel:${supportNumber}`} className="font-bold text-slate-500">{supportNumber}</a>
          </p>
        </div>
      </div>
    </div>
  );
};
