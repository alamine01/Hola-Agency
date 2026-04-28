"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Star, Home, MapPin, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLogementsPage() {
    const [villas, setVillas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchVillas();
    }, []);

    const fetchVillas = async () => {
        try {
            const { data, error } = await supabase
                .from('villas')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVillas(data || []);
        } catch (error) {
            console.error('Erreur fetch villas:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (id, currentStatus) => {
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('villas')
                .update({ is_featured: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            // Met à jour l'état local
            setVillas(villas.map(v => v.id === id ? { ...v, is_featured: !v.is_featured } : v));
        } catch (error) {
            console.error('Erreur update:', error);
            alert("Erreur lors de la mise à jour (Vérifiez que la colonne is_featured existe bien en base !)");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center p-20"><Loader2 className="animate-spin text-slate-900 w-8 h-8" /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Logements</h1>
                <p className="text-slate-500 mt-2">Gérez les propriétés et choisissez celles affichées "À la une" sur la page d'accueil.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Propriété</th>
                                <th className="px-6 py-4">Localisation</th>
                                <th className="px-6 py-4">Prix / Nuit</th>
                                <th className="px-6 py-4 text-center">À la une</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {villas.map((villa) => (
                                <tr key={villa.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                                {villa.image ? (
                                                    <img src={villa.image} alt={villa.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Home className="w-5 h-5 m-2.5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-900 truncate max-w-[200px]">{villa.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {villa.city || villa.location}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-amber-600">
                                        {villa.price?.toLocaleString()} FCFA
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleFeatured(villa.id, villa.is_featured)}
                                            disabled={updatingId === villa.id}
                                            className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all ${villa.is_featured
                                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                            title={villa.is_featured ? "Retirer de la une" : "Mettre à la une"}
                                        >
                                            {updatingId === villa.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Star className={`w-5 h-5 ${villa.is_featured ? 'fill-amber-500 text-amber-500' : 'fill-transparent'}`} />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {villas.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-500">Aucun logement trouvé sur la plateforme.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
