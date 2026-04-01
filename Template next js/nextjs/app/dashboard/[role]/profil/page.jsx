"use client";

import React, { use } from 'react';
import {
    User,
    Mail,
    Phone,
    ShieldCheck,
    Camera,
    Lock,
    MapPin,
    LogOut,
    Trash2,
    Briefcase,
    Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage({ params }) {
    const { role } = use(params);

    const roleConfigs = {
        client: {
            title: "Dakar, Sénégal",
            badgeLabel: "Vérifié",
            badgeIcon: ShieldCheck,
            badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
            subtitle: "Client Membre depuis Janvier 2024"
        },
        proprietaire: {
            title: "Saly, Sénégal",
            badgeLabel: "Propriétaire Premium",
            badgeIcon: Crown,
            badgeColor: "bg-amber-50 text-amber-600 border-amber-100",
            subtitle: "Hôte Partenaire HOLA depuis 2023"
        },
        prestataire: {
            title: "Dakar & Thiès",
            badgeLabel: "Prestataire Certifié",
            badgeIcon: Briefcase,
            badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-100",
            subtitle: "Expert Multi-services HOLA"
        }
    };

    const config = roleConfigs[role] || roleConfigs.client;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header épuré */}
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Mon Profil {role.charAt(0).toUpperCase() + role.slice(1)}</h1>
                <p className="text-slate-500 font-medium text-sm md:text-base">Gérez vos informations de base et la sécurité de votre compte.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Carte d'identité principale */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-20 translate-x-20"></div>

                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="relative group">
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] bg-slate-50 flex items-center justify-center text-slate-200 overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all">
                                <User className="w-16 h-16 md:w-20 md:h-20" />
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform border-4 border-white">
                                <Camera className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Youssou Ndiaye</h3>
                                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full border flex items-center gap-2 ${config.badgeColor}`}>
                                    <config.badgeIcon className="w-3.5 h-3.5" /> {config.badgeLabel}
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium mb-8 flex items-center justify-center md:justify-start gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" /> {config.title} • <span className="text-indigo-600">{config.subtitle}</span>
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block pl-1">Email</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-50 focus-within:bg-white focus-within:border-indigo-600/20 transition-all">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-900 truncate">youssou.nd@gmail.com</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] block pl-1">Téléphone</label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-50 focus-within:bg-white focus-within:border-indigo-600/20 transition-all">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-bold text-slate-900">+221 77 000 00 00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Sécurité & Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                                <Lock className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Mot de passe</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                            Mettez à jour vos informations de connexion pour garantir la sécurité continue de vos données.
                        </p>
                        <button className="w-full py-4.5 bg-slate-50 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                            Modifier la clé
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 group-hover:text-red-500 transition-colors">Suppression</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                            La désactivation de votre compte HOLA est irréversible. Toutes vos informations seront supprimées.
                        </p>
                        <button className="w-full py-4.5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all active:scale-95">
                            Quitter la plateforme
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-10 text-center">
                <button className="inline-flex items-center gap-3 text-slate-400 hover:text-indigo-600 font-black tracking-widest text-[10px] uppercase transition-all hover:scale-105 active:scale-95">
                    <LogOut className="w-5 h-5" /> Se déconnecter maintenant
                </button>
            </div>
        </div>
    );
}
