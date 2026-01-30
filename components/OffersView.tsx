import React, { useState } from 'react';
import { Offer } from '../types';
import { Gift, RefreshCw, XCircle, ArrowLeft } from 'lucide-react';
import { PLACEHOLDER_IMAGE } from '../constants';
import { motion as m, AnimatePresence } from 'framer-motion';

const motion = m as any;

interface Props {
    offers: Offer[];
    onRefresh?: () => void;
}

export const OffersView: React.FC<Props> = ({ offers, onRefresh }) => {
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

    if (selectedOffer) {
        return (
            <div className="bg-white min-h-screen pb-40 px-6 pt-8 font-bold">
                 <header className="flex items-center gap-4 mb-8">
                    <button onClick={() => setSelectedOffer(null)} className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center text-black">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold text-black tracking-tighter uppercase italic">Offer Details</h1>
                </header>

                <div className="space-y-8">
                    <div className="rounded-[40px] overflow-hidden bg-slate-50 aspect-video shadow-lg">
                        <img src={selectedOffer.image_url || PLACEHOLDER_IMAGE} className="w-full h-full object-cover" alt="" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-black uppercase italic tracking-tighter">{selectedOffer.title}</h1>
                        <p className="text-sm text-slate-500 font-bold uppercase italic">{selectedOffer.description}</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reward Tiers</h4>
                        <div className="space-y-3">
                            {Array.isArray(selectedOffer.variants) ? selectedOffer.variants.map((v: any, i: number) => (
                                <div key={i} className="p-5 bg-white border-2 border-slate-100 rounded-3xl flex justify-between items-center shadow-sm">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Amount</p>
                                        <p className="text-lg font-bold text-blue-600 italic">₹{Number(v.amount).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Gift</p>
                                        <p className="text-sm font-bold text-green-600 uppercase italic">{v.gift || 'Reward'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-4 bg-slate-50 rounded-2xl text-center text-[10px] text-slate-400 uppercase">Standard Scheme Applied</div>
                            )}
                        </div>
                    </div>

                    {selectedOffer.terms && selectedOffer.terms.length > 0 && (
                        <div className="space-y-3 pt-4">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terms & Conditions</h4>
                            <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                                {selectedOffer.terms.map((term, i) => (
                                    <div key={i} className="flex gap-3 text-[11px] text-slate-600 font-bold uppercase italic">
                                        <span className="text-red-600">•</span>
                                        <p>{term}</p>
                                    </div>
                                ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
        )
    }

    return (
        <div className="bg-white min-h-screen pb-40 px-6 pt-8 font-bold">
            <header className="flex flex-col gap-1 mb-8">
                <div className="flex items-center gap-2">
                    <span className="h-1.5 w-8 bg-orange-500 rounded-full" />
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Incentives</p>
                </div>
                <h1 className="text-2xl font-bold text-black tracking-tighter uppercase italic">Offers & Schemes</h1>
            </header>

            {offers.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center gap-3">
                    <Gift size={32} className="text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No offers available</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {offers.map((offer) => (
                        <div
                            key={offer.id}
                            onClick={() => setSelectedOffer(offer)}
                            className="bg-white p-4 rounded-3xl border-2 border-slate-50 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all"
                        >
                            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                                <img src={offer.image_url || PLACEHOLDER_IMAGE} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-black uppercase italic leading-tight">{offer.title}</h3>
                                <p className="text-[10px] text-orange-500 font-bold uppercase mt-1">View Details →</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
