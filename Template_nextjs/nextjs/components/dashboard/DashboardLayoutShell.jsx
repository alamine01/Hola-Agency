"use client";

import Sidebar from '@/components/dashboard/sidebar';
import { Bell, Search, X, Check, MessageSquare, CreditCard, Home, User, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const NotificationDropdown = ({ isOpen, onClose, notifications, onMarkAllRead }) => {
    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'reservation': return Home;
            case 'paiement': return CreditCard;
            case 'message': return MessageSquare;
            default: return Bell;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'reservation': return "text-amber-600 bg-amber-50";
            case 'paiement': return "text-emerald-600 bg-emerald-50";
            case 'message': return "text-amber-600 bg-amber-50";
            default: return "text-slate-600 bg-slate-50";
        }
    };

    return (
        <>
            <div className="fixed md:absolute top-20 md:top-full left-4 right-4 md:left-auto md:right-0 mt-3 md:w-96 bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-4 ring-slate-900/5">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h3 className="font-black text-slate-900 text-sm uppercase tracking-widest">Notifications</h3>
                    {notifications.filter(n => !n.is_read).length > 0 && (
                        <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-black rounded-full">
                            {notifications.filter(n => !n.is_read).length} NOUVELLES
                        </span>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => {
                            const Icon = getIcon(notif.type);
                            return (
                                <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group relative ${!notif.is_read ? 'bg-amber-50/10' : ''}`}>
                                    {!notif.is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-600"></div>}
                                    <div className="flex gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getColor(notif.type)} group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="font-bold text-slate-900 text-xs">{notif.title}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-500 leading-relaxed truncate">{notif.text}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-10 text-center">
                            <Bell className="w-8 h-8 text-slate-100 mx-auto mb-2" />
                            <p className="text-slate-400 text-xs italic font-medium">Aucune nouvelle notification.</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={onMarkAllRead}
                    className="w-full py-4 text-xs font-black text-amber-600 hover:bg-amber-50 transition-all uppercase tracking-widest bg-slate-50/30 disabled:opacity-50"
                    disabled={!notifications.some(n => !n.is_read)}
                >
                    Marquer tout comme lu
                </button>
            </div>
            <div className="fixed inset-0 z-50 cursor-default" onClick={onClose}></div>
        </>
    );
};

export default function DashboardLayoutShell({ children, forcedRole }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const normalize = (r) => {
        if (!r) return 'client';
        return r.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
    };

    const urlRole = normalize(pathname.split('/')[2] || 'client');
    const activeRole = forcedRole || profile?.role || urlRole;

    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch Profile
                const { data: profData } = await supabase
                    .from('profiles')
                    .select('display_name, avatar_url, role')
                    .eq('id', user.id)
                    .single();

                if (profData) {
                    setProfile(profData);
                }

                // Fetch Notifications
                const { data: notifData } = await supabase
                    .from('notifications')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(10);
                if (notifData) setNotifications(notifData);

                // Realtime Notifications
                const notifChannel = supabase
                    .channel(`notif_realtime_${user.id}_${Math.random().toString(36).substring(7)}`)
                    .on('postgres_changes', {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`
                    }, (payload) => {
                        setNotifications(prev => [payload.new, ...prev]);
                    })
                    .subscribe();

                // Realtime Profile
                const profileChannel = supabase
                    .channel(`profile_realtime_${user.id}_${Math.random().toString(36).substring(7)}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    }, (payload) => {
                        setProfile(prev => ({
                            ...prev,
                            display_name: payload.new.display_name,
                            avatar_url: payload.new.avatar_url,
                            role: payload.new.role
                        }));
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(notifChannel);
                    supabase.removeChannel(profileChannel);
                };
            }
            setLoading(false);
        };

        fetchInitialData();
    }, []);

    const handleMarkAllRead = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-x-hidden w-full">
            <Sidebar role={activeRole} />

            <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen w-full max-w-full overflow-x-hidden">
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-6 lg:px-10 sticky top-0 z-40 w-full">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="hidden md:flex items-center bg-slate-50 border border-slate-100 rounded-full px-5 py-2.5 w-full max-w-md focus-within:border-amber-600/30 focus-within:bg-white transition-all group shadow-sm shadow-slate-100">
                            <Search className="w-4 h-4 text-slate-400 mr-2 group-focus-within:text-amber-600 transition-colors" />
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
                                className={`p-2.5 rounded-full transition-all relative ${isNotifOpen ? 'bg-amber-600 text-white shadow-lg shadow-amber-100' : 'bg-slate-50 border border-slate-100 text-slate-500 hover:text-amber-600'}`}
                            >
                                <Bell className="w-5 h-5" />
                                {notifications.some(n => !n.is_read) && !isNotifOpen && (
                                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span>
                                )}
                            </button>

                            <NotificationDropdown
                                isOpen={isNotifOpen}
                                onClose={() => setIsNotifOpen(false)}
                                notifications={notifications}
                                onMarkAllRead={handleMarkAllRead}
                            />
                        </div>

                        <div className="h-10 w-[1px] bg-slate-100 mx-2 hidden sm:block"></div>

                        <Link
                            href={`/dashboard/${normalize(activeRole)}/profil`}
                            className="flex items-center gap-3 pl-2 group cursor-pointer hover:opacity-80 transition-all active:scale-95"
                        >
                            <div className="hidden sm:block text-right">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1 group-hover:text-amber-600 transition-colors">
                                    {profile?.role || 'CLIENT'}
                                </p>
                                <p className="text-sm font-bold text-slate-900 leading-none truncate max-w-[120px]">
                                    {profile?.display_name || 'HOLA User'}
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white font-black text-lg group-hover:bg-amber-600 transition-colors overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.display_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />
                                )}
                            </div>
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
                    {children}
                </main>

                <footer className="py-8 px-10 border-t border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest text-center italic">
                    &copy; 2025 HOLA Real Estate Platform • Excellence en gestion immobilière
                </footer>
            </div>
        </div>
    );
}
