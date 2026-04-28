"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Star, Briefcase, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminServicesPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error('Erreur fetch services:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeatured = async (id, currentStatus) => {
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('services')
                .update({ is_featured: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            // Met à jour l'état local
            setServices(services.map(s => s.id === id ? { ...s, is_featured: !s.is_featured } : s));
        } catch (error) {
            console.error('Erreur update:', error);
            alert("Erreur lors de la mise à jour (Vérifiez que la colonne is_featured existe bien dans la table services !)");
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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Services</h1>
                <p className="text-slate-500 mt-2">Gérez les prestations et choisissez celles affichées "À la une" sur la page d'accueil.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-900 font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Prestation</th>
                                <th className="px-6 py-4">Localisation/Type</th>
                                <th className="px-6 py-4">Tarif</th>
                                <th className="px-6 py-4 text-center">À la une</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {services.map((service) => (
                                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                                                {service.image ? (
                                                    <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Briefcase className="w-5 h-5 m-2.5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-900 truncate max-w-[200px]">{service.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex flex-col gap-1 text-xs">
                                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {service.location || 'Sur place'}</span>
                                            {service.type && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full w-max">{service.type}</span>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-indigo-600">
                                        {service.price?.toLocaleString()} FCFA
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleFeatured(service.id, service.is_featured)}
                                            disabled={updatingId === service.id}
                                            className={`relative inline-flex items-center justify-center p-2 rounded-xl transition-all ${service.is_featured
                                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                                }`}
                                            title={service.is_featured ? "Retirer de la une" : "Mettre à la une"}
                                        >
                                            {updatingId === service.id ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : (
                                                <Star className={`w-5 h-5 ${service.is_featured ? 'fill-amber-500 text-amber-500' : 'fill-transparent'}`} />
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {services.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-10 text-slate-500">Aucune prestation trouvée sur la plateforme.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
