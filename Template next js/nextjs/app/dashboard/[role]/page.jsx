"use client";

import React, { use, useState, useEffect } from 'react';
import {
    TrendingUp,
    Users,
    Home,
    Calendar,
    ArrowUpRight,
    Search,
    ChevronRight,
    MapPin,
    Star,
    ShieldCheck,
    X,
    ArrowDownLeft,
    FileText,
    Loader2,
    MessageCircle,
    Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-indigo-50 transition-colors"></div>

        <div className="flex items-center justify-between mb-5 relative z-10">
            <div className={`p-3 rounded-2xl ${color} shadow-lg shadow-slate-100 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            {change && (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider">
                    <ArrowUpRight className="w-3 h-3" />
                    {change}
                </div>
            )}
        </div>

        <h3 className="text-slate-400 text-[10px] md:text-[11px] font-black mb-1 uppercase tracking-[0.2em] relative z-10">{title}</h3>
        <p className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight truncate relative z-10">{value}</p>
        {subtitle && (
            <p className="text-[9px] text-slate-400 mt-2 font-medium italic relative z-10 opacity-70">
                {subtitle}
            </p>
        )}
    </motion.div>
);

const RoleHeader = ({ role, name }) => {
    const titles = {
        client: "Espace Client Privilège",
        proprietaire: "Gestion Immobilière",
        prestataire: "Espace Prestataire",
    };
    const subtitles = {
        client: "Retrouvez vos réservations et gérez vos séjours de luxe.",
        proprietaire: "Suivez vos revenus nets et gérez vos villas d'exception.",
        prestataire: "Gérez vos prestations et suivez vos gains en temps réel.",
    };

    return (
        <div className="mb-10 md:mb-14">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                    {name ? `Salut, ${name}` : titles[role]}
                </h1>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" strokeWidth={3} /> {role.toUpperCase()} HOLA
                </div>
            </div>
            <p className="text-slate-500 text-sm md:text-xl font-medium italic opacity-80">{subtitles[role] || "Gérez votre activité en toute simplicité."}</p>
        </div>
    );
};

const ActivitiesModal = ({ isOpen, onClose, activities }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-2xl shadow-2xl relative z-10 max-h-[85vh] flex flex-col"
                >
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-50 border border-slate-50">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Historique Complet</h2>
                        <p className="text-slate-500 font-medium text-sm italic">Journal de vos dernières interactions sur HOLA.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {activities.map((act) => (
                            <div key={act.id} className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shadow-sm">
                                        <ArrowDownLeft className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm md:text-base">{act.metadata?.title || 'Réservation'}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 italic">#{act.id.slice(0, 5)} • {new Date(act.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-sm md:text-base">{act.amount.toLocaleString()} <span className="text-[9px]">FCFA</span></p>
                                    <span className={`text-[9px] uppercase font-black tracking-widest mt-2 block ${act.status === 'confirmee' ? 'text-emerald-600' : 'text-amber-600'}`}>{act.status}</span>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && <p className="text-center py-10 text-slate-400 italic">Aucune activité enregistrée.</p>}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button onClick={onClose} className="px-8 py-4 bg-slate-900 text-white rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl">
                            Fermer le journal
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default function DashboardPage({ params }) {
    const params_sync = use(params);
    const role = (params_sync.role || '').toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, [role]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Profil Info
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            setUserData(profile);

            // 2. Fetch based on role
            let dashboardStats = [];
            let recentActivities = [];

            if (role === 'client') {
                const [bookingsCount, favsCount, convsCount, lastBookings] = await Promise.all([
                    supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('conversations').select('*', { count: 'exact', head: true }).or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`),
                    supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
                ]);

                dashboardStats = [
                    { title: "Mes Réservations", value: bookingsCount.count || 0, change: null, icon: Calendar, color: "bg-indigo-600" },
                    { title: "Messages", value: convsCount.count || 0, change: null, icon: MessageCircle, color: "bg-slate-900" },
                    { title: "Mes Favoris", value: favsCount.count || 0, change: null, icon: Heart, color: "bg-pink-500" },
                ];
                recentActivities = lastBookings.data || [];

            } else if (role === 'proprietaire') {
                const [villasCount, bookingsData, lastBookings] = await Promise.all([
                    supabase.from('villas').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
                    supabase.from('bookings').select('amount').eq('owner_id', user.id).neq('item_type', 'Service').in('status', ['confirmee', 'payee']),
                    supabase.from('bookings').select('*').eq('owner_id', user.id).neq('item_type', 'Service').order('created_at', { ascending: false }).limit(3)
                ]);

                const totalGain = (bookingsData.data || []).reduce((acc, curr) => acc + curr.amount, 0);
                const netGain = Math.floor(totalGain * 0.85);
                const formatRevenue = (val) => {
                    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M FCFA`;
                    if (val >= 1000) return `${Math.floor(val / 1000)}k FCFA`;
                    return `${val.toLocaleString()} FCFA`;
                };

                dashboardStats = [
                    { title: "Revenu Net Global", value: formatRevenue(netGain), change: null, icon: TrendingUp, color: "bg-emerald-600", subtitle: "Total net versé après commission 15%" },
                    { title: "Mes Villas", value: villasCount.count || 0, change: null, icon: Home, color: "bg-slate-900" },
                    { title: "Réservations", value: (bookingsData.data || []).length, change: null, icon: Calendar, color: "bg-indigo-600" },
                ];
                recentActivities = lastBookings.data || [];

            } else if (role === 'prestataire') {
                const [servicesCount, bookingsData, lastBookings] = await Promise.all([
                    supabase.from('services').select('*', { count: 'exact', head: true }).eq('provider_id', user.id),
                    supabase.from('bookings').select('amount').eq('owner_id', user.id).eq('item_type', 'Service').in('status', ['confirmee', 'payee']),
                    supabase.from('bookings').select('*').eq('owner_id', user.id).eq('item_type', 'Service').order('created_at', { ascending: false }).limit(3)
                ]);

                const totalGain = (bookingsData.data || []).reduce((acc, curr) => acc + curr.amount, 0);
                const netGain = Math.floor(totalGain * 0.85);

                dashboardStats = [
                    { title: "Gains de Service", value: `${(netGain / 1000).toFixed(0)}k FCFA`, change: null, icon: TrendingUp, color: "bg-emerald-600", subtitle: "Après commission HOLA (-15%)" },
                    { title: "Mes Prestations", value: servicesCount.count || 0, change: null, icon: Star, color: "bg-amber-500" },
                    { title: "Demandes", value: (bookingsData.data || []).length, change: null, icon: Users, color: "bg-slate-900" },
                ];
                recentActivities = lastBookings.data || [];
            }

            setStats(dashboardStats);
            setActivities(recentActivities);

        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-0 pb-10">
            <RoleHeader role={role} name={userData?.display_name} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                {stats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Activités récentes</h2>
                            <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-widest italic opacity-70">Flux de vos dernières opérations</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95"
                        >
                            Journal complet <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {activities.map((act) => (
                            <div key={act.id} className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer group shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center overflow-hidden shrink-0 group-hover:rotate-3 transition-all shadow-lg ring-4 ring-white">
                                        {act.metadata?.image ? (
                                            <img src={act.metadata.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <Calendar className="w-6 h-6 text-indigo-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-base">{act.metadata?.title || 'Réservation'}</p>
                                        <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] flex items-center gap-1.5 whitespace-nowrap">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-500" /> {act.metadata?.location || 'Sénégal'} • {new Date(act.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">{act.amount.toLocaleString()} <span className="text-[10px] font-bold">FCFA</span></p>
                                    <span className={`text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg mt-2 inline-block border ${act.status === 'en_attente' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                        {act.status.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {activities.length === 0 && (
                            <div className="py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                <Search className="w-10 h-10 text-slate-100 mx-auto mb-3" />
                                <p className="text-slate-400 font-bold italic">Aucune activité récente à afficher.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ActivitiesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activities={activities}
            />
        </div>
    );
}
