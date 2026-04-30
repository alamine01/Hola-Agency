"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    User,
    Shield,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowLeft,
    Mail,
    Calendar,
    ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminUsersPage() {
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (!error) {
            setProfiles(data || []);
        }
        setLoading(false);
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', userId);

        if (error) {
            alert("Erreur lors de la mise à jour du rôle : " + error.message);
        } else {
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
        }
        setUpdatingId(null);
    };

    const filteredProfiles = profiles.filter(p => {
        const searchText = searchTerm.toLowerCase();
        const matchesSearch = (
            p.display_name?.toLowerCase().includes(searchText) ||
            p.id.toLowerCase().includes(searchText) ||
            p.email?.toLowerCase().includes(searchText)
        );
        const matchesRole = roleFilter === 'all' || p.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-8 pt-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Retour
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase flex items-center gap-4">
                        <Users className="w-10 h-10 text-amber-600" />
                        Gestion Utilisateurs
                    </h1>
                    <p className="text-slate-500 font-medium italic opacity-80 pl-1">Supervisez tous les comptes et modifiez les droits d'accès.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-amber-600/10 focus:border-amber-600/20"
                    />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-3.5 rounded-2xl">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-transparent text-sm font-bold text-slate-900 outline-none cursor-pointer pr-4"
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="admin">Administrateurs</option>
                        <option value="client">Clients</option>
                        <option value="proprietaire">Propriétaires</option>
                        <option value="prestataire">Prestataires</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Utilisateur</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rôle Actuel</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProfiles.map((profile) => (
                                <tr key={profile.id} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-white shadow-sm flex items-center justify-center text-amber-600 font-black overflow-hidden group-hover:scale-110 transition-transform">
                                                {profile.avatar_url ? (
                                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    profile.display_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm whitespace-nowrap">{profile.display_name || 'Utilisateur HOLA'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5 italic">
                                                    <Calendar className="w-3 h-3" /> Dernière act. : {new Date(profile.updated_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${profile.role === 'admin' ? 'bg-slate-900 text-white border-slate-900' :
                                            profile.role === 'proprietaire' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                profile.role === 'prestataire' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-slate-50 text-slate-500 border-slate-100'
                                            }`}>
                                            {profile.role || 'client'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <code className="text-xs font-bold text-slate-600">{profile.email || 'Non renseigné'}</code>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {updatingId === profile.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                            ) : (
                                                <div className="relative group/menu">
                                                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                                        Modifier Rôle <ChevronDown className="w-3 h-3" />
                                                    </button>
                                                    <div className="absolute bottom-full right-0 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 hidden group-hover/menu:block animate-in fade-in slide-in-from-bottom-2 duration-150 after:content-[''] after:absolute after:top-full after:left-0 after:right-0 after:h-4">
                                                        <button onClick={() => handleRoleChange(profile.id, 'admin')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap">Administrateur</button>
                                                        <button onClick={() => handleRoleChange(profile.id, 'client')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap">Client</button>
                                                        <button onClick={() => handleRoleChange(profile.id, 'proprietaire')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap">Propriétaire</button>
                                                        <button onClick={() => handleRoleChange(profile.id, 'prestataire')} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-slate-50 rounded-xl transition-all whitespace-nowrap">Prestataire</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredProfiles.length === 0 && (
                    <div className="p-20 text-center italic text-slate-400 font-medium">Aucun utilisateur trouvé pour ces critères.</div>
                )}
            </div>
        </div>
    );
}
