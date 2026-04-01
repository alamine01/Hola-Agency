"use client";

import Sidebar from '@/components/dashboard/sidebar';
import { Bell, Search, X, Check, MessageSquare, CreditCard, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

const NotificationDropdown = ({ isOpen, onClose, role }) => {
    if (!isOpen) return null;

    const notifications = {
        proprietaire: [
            { id: 1, title: "Nouvelle réservation", text: "Moussa Diop a réservé la Villa Saly", time: "Il y a 5 min", icon: Home, color: "text-indigo-600 bg-indigo-50", unread: true },
            { id: 2, title: "Paiement reçu", text: "Versement de 240,000 FCFA effectué", time: "Il y a 2h", icon: CreditCard, color: "text-emerald-600 bg-emerald-50", unread: true },
            { id: 3, title: "Nouveau message", text: "Sophie : 'Est-ce que la piscine est chauffée ?'", time: "Il y a 5h", icon: MessageSquare, color: "text-amber-600 bg-amber-50", unread: false },
        ],
        client: [
            { id: 4, title: "Réservation confirmée", text: "Votre séjour à Somone est validé !", time: "Il y a 1h", icon: Check, color: "text-emerald-600 bg-emerald-50", unread: true },
            { id: 5, title: "Nouveau message", text: "Le propriétaire a répondu à votre question", time: "Hier", icon: MessageSquare, color: "text-indigo-600 bg-indigo-50", unread: false },
        ]
    };

    const currentNotifications = notifications[role] || notifications.client;

    return (
        <>
            <div className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-slate-900/5">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Notifications</h3>
                    <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full">3 NOUVELLES</span>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {currentNotifications.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group relative ${notif.unread ? 'bg-indigo-50/10' : ''}`}>
                            {notif.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>}
                            <div className="flex gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.color} group-hover:scale-110 transition-transform`}>
                                    <notif.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-slate-900 text-xs">{notif.title}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{notif.time}</p>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed truncate">{notif.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full py-4 text-xs font-black text-indigo-600 hover:bg-indigo-50 transition-all uppercase tracking-widest bg-slate-50/30">
                    Marquer tout comme lu
                </button>
            </div>
            {/* Backdrop transparent pour fermer */}
            <div className="fixed inset-0 z-50 cursor-default" onClick={onClose}></div>
        </>
    );
};

export default function DashboardLayout({ children }) {
    const pathname = usePathname();
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    // On extrait le rôle depuis l'URL : /dashboard/[role]/...
    const role = pathname.split('/')[2] || 'client';

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <Sidebar role={role} />

            {/* Main Content */}
            <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen">
                {/* Header / Topbar */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 w-full max-w-md focus-within:border-indigo-600/30 focus-within:bg-white transition-all group shadow-sm shadow-slate-100">
                            <Search className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Rechercher une réservation, un logement..."
                                className="bg-transparent border-none outline-none text-xs font-semibold w-full placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsNotifOpen(!isNotifOpen)}
                                className={`p-2.5 rounded-full transition-all relative ${isNotifOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 border border-slate-100 text-slate-500 hover:text-indigo-600'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {!isNotifOpen && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>}
                            </button>

                            <NotificationDropdown
                                isOpen={isNotifOpen}
                                onClose={() => setIsNotifOpen(false)}
                                role={role}
                            />
                        </div>

                        <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>

                        <Link href={`/dashboard/${role}/profil`} className="flex items-center gap-3 pl-2 group cursor-pointer hover:opacity-80 transition-all">
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 group-hover:text-indigo-600 transition-colors">{role}</p>
                                <p className="text-sm font-bold text-slate-900 leading-none">Compte vérifié</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-lg group-hover:bg-indigo-600 transition-colors active:scale-95">
                                {role?.charAt(0).toUpperCase()}
                            </div>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
                    {children}
                </main>

                {/* Footer simple */}
                <footer className="py-8 px-10 border-t border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center italic">
                    &copy; 2025 HOLA Real Estate Platform • Excellence en gestion immobilière
                </footer>
            </div>
        </div>
    );
}
