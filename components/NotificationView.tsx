
import React, { useState } from 'react';
import { AppNotification } from '../types';
import { Bell, RefreshCw, ChevronRight, X } from 'lucide-react';
import { motion as m, AnimatePresence } from 'framer-motion';

const motion = m as any;

interface Props {
    notifications: AppNotification[];
    onMarkRead: (id: string) => void;
    onRefresh?: () => void;
}

export const NotificationView: React.FC<Props> = ({ notifications, onMarkRead, onRefresh }) => {
    const readIds = JSON.parse(localStorage.getItem('rcm_read_notifications') || '[]');
    const [selectedNotif, setSelectedNotif] = useState<AppNotification | null>(null);

    const handleCardClick = (n: AppNotification) => {
        onMarkRead(n.id);
        setSelectedNotif(n);
    };

    return (
        <div className="bg-white min-h-screen pb-40 px-6 pt-8 font-bold">
            <header className="flex items-center justify-between mb-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="h-1.5 w-8 bg-orange-500 rounded-full" />
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em]">Updates</p>
                    </div>
                    <h1 className="text-2xl font-bold text-black tracking-tighter uppercase italic">Notifications</h1>
                </div>
                {onRefresh && (
                    <button onClick={onRefresh} className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-blue-600 border-2 border-slate-100">
                        <RefreshCw size={20} />
                    </button>
                )}
            </header>

            {notifications.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100 flex flex-col items-center gap-3">
                    <Bell size={32} className="text-slate-200" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No notifications</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => {
                        const isRead = readIds.includes(n.id);
                        return (
                            <div
                                key={n.id}
                                onClick={() => handleCardClick(n)}
                                className={`p-4 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${isRead ? 'bg-white border-slate-50 opacity-60' : 'bg-white border-blue-100 shadow-sm'}`}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.is_priority ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <Bell size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-black font-bold text-[13px] uppercase italic truncate leading-none mb-1">{n.title}</h3>
                                    <p className="text-slate-500 text-[10px] font-bold uppercase italic line-clamp-1">{n.message}</p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </div>
                        );
                    })}
                </div>
            )}

            <AnimatePresence>
                {selectedNotif && (
                    <div className="fixed inset-0 z-[150] bg-white flex flex-col font-bold">
                        <header className="h-16 px-6 flex items-center justify-between border-b-2 border-slate-50">
                            <h2 className="text-sm font-bold text-black uppercase italic">Notification Details</h2>
                            <button onClick={() => setSelectedNotif(null)} className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-black">
                                <X size={20} />
                            </button>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="space-y-2">
                                <h1 className="text-2xl font-bold text-black uppercase italic tracking-tighter">{selectedNotif.title}</h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(selectedNotif.created_at).toLocaleString()}</p>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100">
                                <p className="text-black text-sm font-bold uppercase italic leading-relaxed">{selectedNotif.message}</p>
                            </div>

                            {selectedNotif.image_url && (
                                <div className="rounded-3xl overflow-hidden border-4 border-slate-50 shadow-md">
                                    <img src={selectedNotif.image_url} className="w-full h-auto" alt="" />
                                </div>
                            )}

                            <button onClick={() => setSelectedNotif(null)} className="w-full h-14 bg-red-600 text-white rounded-2xl font-bold uppercase tracking-widest italic">
                                CLOSE
                            </button>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
