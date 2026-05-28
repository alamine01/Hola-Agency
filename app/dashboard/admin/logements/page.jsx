"use client";
 
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Star, Home, MapPin, Check, X, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
 
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

    const updateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const { error } = await supabase
                .from('villas')
                .update({ status: newStatus })
                .eq('id', id);
 
            if (error) throw error;

            // Si la villa est rejetée par l'admin, toutes ses réservations actives 
            // sont annulées ('annulee') pour libérer et réinitialiser complètement 
            // les dates de disponibilité pour de futurs clients.
            if (newStatus === 'rejected') {
                const { error: cancelError } = await supabase
                    .from('bookings')
                    .update({ status: 'annulee' })
                    .eq('item_id', id)
                    .in('status', ['en_attente_paiement', 'confirmee', 'payee']);
                
                if (cancelError) {
                    console.error("Erreur d'annulation des réservations:", cancelError);
                }
            }
 
            // Met à jour l'état local
            setVillas(villas.map(v => v.id === id ? { ...v, status: newStatus } : v));
        } catch (error) {
            console.error('Erreur update statut:', error);
            alert("Erreur lors du changement de statut.");
        } finally {
            setUpdatingId(null);
        }
    };
 
    if (loading) {
        return <div className="h-full flex items-center justify-center p-20"><Loader2 className="animate-spin text-slate-900 w-8 h-8" /></div>;
    }
 
    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 px-4 md:px-8 pt-6">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Modération des Logements</h1>
                <p className="text-slate-500 mt-2 font-medium italic">Validez les nouvelles villas, gérez les annonces actives et définissez les biens mis à la une.</p>
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
                                <th className="px-6 py-4 text-center">Statut</th>
                                <th className="px-6 py-4 text-right pr-8">Actions de Modération</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {villas.map((villa) => (
                                <tr key={villa.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                                                {villa.image ? (
                                                    <img src={villa.image} alt={villa.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Home className="w-5 h-5 m-2.5 text-slate-400" />
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-900 truncate max-w-[200px] uppercase text-xs tracking-tight">{villa.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 font-medium text-xs text-slate-500"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {villa.city || villa.location}</span>
                                    </td>
                                    <td className="px-6 py-4 font-black text-amber-600 text-xs">
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
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Star className={`w-4 h-4 ${villa.is_featured ? 'fill-amber-500 text-amber-500' : 'fill-transparent'}`} />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {(!villa.status || villa.status === 'pending') && (
                                            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-amber-100 inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                En attente
                                            </span>
                                        )}
                                        {villa.status === 'active' && (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-emerald-100 inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Validée
                                            </span>
                                        )}
                                        {villa.status === 'rejected' && (
                                            <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-wider border border-rose-100 inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                Refusée
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right pr-8">
                                        <div className="flex items-center justify-end gap-2">
                                            {villa.status !== 'active' && (
                                                <button
                                                    onClick={() => updateStatus(villa.id, 'active')}
                                                    disabled={updatingId === villa.id}
                                                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                                    title="Approuver la villa"
                                                >
                                                    {updatingId === villa.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                    Valider
                                                </button>
                                            )}
                                            {villa.status !== 'rejected' && (
                                                <button
                                                    onClick={() => updateStatus(villa.id, 'rejected')}
                                                    disabled={updatingId === villa.id}
                                                    className="px-3 py-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                                                    title="Rejeter la villa"
                                                >
                                                    {updatingId === villa.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                                    Rejeter
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
 
                            {villas.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="text-center py-10 text-slate-500 italic font-bold">Aucun logement trouvé sur la plateforme.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
