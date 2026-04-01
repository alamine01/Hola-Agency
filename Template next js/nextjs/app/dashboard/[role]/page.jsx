"use client";

import React, { use, useState } from 'react';
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
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const RoleHeader = ({ role }) => {
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
                    {titles[role] || "Mon Tableau de Bord"}
                </h1>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Profil Vérifié
                </div>
            </div>
            <p className="text-slate-500 text-sm md:text-xl font-medium italic opacity-80">{subtitles[role] || "Gérez votre activité en toute simplicité."}</p>
        </div>
    );
};

const ActivitiesModal = ({ isOpen, onClose, role }) => (
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
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-50">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Historique d'Activité</h2>
                        <p className="text-slate-500 font-medium text-sm italic">Journal complet de vos dernières interactions sur HOLA.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                        <ArrowDownLeft className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-sm md:text-base">Réservation #10{i}84</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 italic">VILLA SALY • 25 MARS 2025</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-sm md:text-base">38,000 <span className="text-[9px]">FCFA (Net)</span></p>
                                    <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 mt-2 block">Confirmé</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button onClick={onClose} className="px-8 py-4 bg-slate-900 text-white rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl">
                            Fermer le journal
                        </button>
                        <button className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-[10px] hover:text-indigo-800 transition-colors">
                            <FileText className="w-4 h-4" /> Exporter Rapport
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export default function DashboardPage({ params }) {
    const { role } = use(params);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const stats = {
        client: [
            { title: "Réservations actives", value: "3", change: "+1", icon: Calendar, color: "bg-indigo-600" },
            { title: "Messages non lus", value: "8", change: null, icon: Users, color: "bg-slate-900" },
            { title: "Favoris", value: "12", change: null, icon: Home, color: "bg-pink-500" },
        ],
        proprietaire: [
            { title: "Gain Net (Mars)", value: "2.04M FCFA", change: "+12%", icon: TrendingUp, color: "bg-emerald-600", subtitle: "Déjà déduit de la commission HOLA (-15%)" },
            { title: "Villas en ligne", value: "4", change: null, icon: Home, color: "bg-slate-900" },
            { title: "Réservations", value: "18", change: "+4", icon: Calendar, color: "bg-indigo-600" },
        ],
        prestataire: [
            { title: "Gain Net (Cumulé)", value: "722k FCFA", change: "+5%", icon: TrendingUp, color: "bg-emerald-600", subtitle: "Quote-part après commission plateforme (-15%)" },
            { title: "Services actifs", value: "6", change: null, icon: Star, color: "bg-amber-500" },
            { title: "Demandes", value: "5", change: "+2", icon: Users, color: "bg-slate-900" },
        ]
    };

    const currentStats = stats[role] || stats.client;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-0 pb-10">
            <RoleHeader role={role} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                {currentStats.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Activités récentes</h2>
                            <p className="text-slate-400 text-xs font-semibold mt-1 uppercase tracking-widest">Flux en temps réel</p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-5 py-2.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                            Tout voir <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-3xl border border-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-all shadow-sm ring-4 ring-white">
                                        <div className="w-full h-full bg-slate-200"></div>
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 text-base">Réservation #10{i}84</p>
                                        <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em] flex items-center gap-1.5 whitespace-nowrap">
                                                <MapPin className="w-3.5 h-3.5" /> Villa Saly • 25 Mars
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">38k <span className="text-[10px] font-bold">FCFA (Net)</span></p>
                                    <span className="text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 mt-2 inline-block border border-amber-100/50">En attente</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <ActivitiesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                role={role}
            />
        </div>
    );
}
