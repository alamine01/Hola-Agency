"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Home,
    Calendar,
    TrendingUp,
    ShieldCheck,
    Search,
    ChevronRight,
    ArrowUpRight,
    Loader2,
    Briefcase,
    MessageSquare,
    CheckCircle2,
    CalendarDays
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

const AdminStatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-slate-100 transition-colors"></div>
        <div className="relative z-10">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${color} flex items-center justify-center mb-4 md:mb-6 shadow-lg shadow-slate-100`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
            <div className="flex items-end gap-2 md:gap-3">
                <h3 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
                {trend && (
                    <span className="text-[8px] md:text-[10px] font-black text-emerald-600 mb-0.5 md:mb-1 flex items-center gap-0.5">
                        <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" /> {trend}
                    </span>
                )}
            </div>
        </div>
    </motion.div>
);

export default function AdminDashboardView() {
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState({
        users: 0,
        villas: 0,
        bookings: 0,
        revenue: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                setUserData(profile);
            }

            const [usersResp, villasResp, bookingsResp] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('villas').select('*', { count: 'exact', head: true }),
                supabase.from('bookings').select('amount', { count: 'exact' })
            ]);

            const totalRevenue = (bookingsResp.data || []).reduce((acc, curr) => acc + (curr.amount || 0), 0);

            setStats({
                users: usersResp.count || 0,
                villas: villasResp.count || 0,
                bookings: bookingsResp.count || 0,
                revenue: totalRevenue
            });

            const { data: latest } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            setRecentBookings(latest || []);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    if (loading) return <div className="h-full flex items-center justify-center p-20"><Loader2 className="animate-spin text-slate-900" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            <div className="mb-10 md:mb-14">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                        {userData?.display_name ? `Salut, ${userData.display_name}` : "Dashboard Admin"}
                    </h1>
                    <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={3} /> ADMIN HOLA
                    </div>
                </div>
                <p className="text-slate-500 text-sm md:text-xl font-medium italic opacity-80 underline underline-offset-8 decoration-amber-200">Vue d'ensemble de la plateforme HOLA.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <AdminStatCard title="Utilisateurs" value={stats.users} icon={Users} color="bg-amber-600" trend="+12" />
                <AdminStatCard title="Hébergements" value={stats.villas} icon={Home} color="bg-slate-900" trend="+5" />
                <AdminStatCard title="Réservations" value={stats.bookings} icon={CalendarDays} color="bg-emerald-600" trend="+24" />
                <AdminStatCard title="Chiffre d'Affaire" value={`${stats.revenue.toLocaleString()} FCFA`} icon={TrendingUp} color="bg-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-6 lg:order-2">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full -mb-16 -mr-16 blur-2xl"></div>
                        <h3 className="text-xl font-black mb-6 relative z-10">Actions Rapides</h3>
                        <div className="space-y-3 relative z-10">
                            {[
                                { label: "Gérer les utilisateurs", icon: Users, link: "/dashboard/admin/utilisateurs" },
                                { label: "Gérer les logements", icon: Home, link: "/dashboard/admin/logements" },
                                { label: "Vérifier les revenus", icon: TrendingUp, link: "/dashboard/admin/revenus" }
                            ].map((action, i) => (
                                <a key={i} href={action.link} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group-hover:translate-x-1">
                                    <div className="flex items-center gap-3">
                                        <action.icon className="w-5 h-5 text-amber-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6 lg:order-1">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Dernières Activités</h2>
                            <button className="text-[10px] font-black uppercase text-amber-600 hover:text-slate-900 transition-colors tracking-widest">Voir Tout</button>
                        </div>

                        <div className="space-y-4">
                            {recentBookings.map((book) => (
                                <div key={book.id} className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 hover:bg-slate-50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">Réservation #{book.id.slice(0, 8)}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(book.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-sm">{book.amount.toLocaleString()} FCFA</p>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${book.status === 'payee' || book.status === 'confirmee'
                                            ? 'text-emerald-600'
                                            : book.status === 'en_attente_paiement'
                                                ? 'text-amber-600'
                                                : 'text-amber-600'
                                            }`}>
                                            {(book.status || '').replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
