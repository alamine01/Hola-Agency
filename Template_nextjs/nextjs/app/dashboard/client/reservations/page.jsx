"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    MapPin,
    ChevronRight,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    Heart,
    Star,
    ArrowRight,
    Trash2,
    Loader2,
    Search,
    Home,
    History
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

// --- Components ---

const ReservationCard = ({ item, onCancel, onChat }) => {
    const [showMenu, setShowMenu] = useState(false);
    const details = item.metadata || {};
    const status = item.status || 'en_attente';

    const isService = item.item_type === 'Service' || item.item_type === 'service';

    const statusStyles = {
        confirmee: "bg-emerald-100 text-emerald-700",
        payee: "bg-emerald-100 text-emerald-700",
        "en_attente": "bg-amber-100 text-amber-700",
        "en_attente_paiement": "bg-[#D4AF37]/20 text-[#D4AF37]",
        annulee: "bg-red-100 text-red-700",
    };

    const StatusIcon = {
        confirmee: CheckCircle2,
        payee: CheckCircle2,
        "en_attente": Clock,
        "en_attente_paiement": Clock,
        annulee: XCircle,
    }[status] || Clock; // Fallback to Clock if undefined

    const displayStatus = {
        confirmee: "confirmée",
        payee: "payée",
        "en_attente": "en attente",
        "en_attente_paiement": "en attente de paiement",
        annulee: "annulée",
    }[status] || status.replace(/_/g, ' ');

    const formatDateRange = (start, end) => {
        if (!start) return "Date non spécifiée";
        const s = new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        if (!end || start === end) return s;
        const e = new Date(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
        return `${s} - ${e}`;
    };

    return (
        <div className={`bg-white rounded-2xl border border-slate-100 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 hover:shadow-md transition-shadow relative ${showMenu ? 'z-50' : ''}`}>
            <div className="flex items-center gap-4 md:gap-6">
                <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                    <img src={details.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400"} alt={details.title} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{details.title || details.name || (item.item_type === 'service' ? 'Prestation HOLA' : 'Hébergement')}</h3>
                    <p className="text-slate-500 text-sm flex items-center gap-1 mb-2">
                        <MapPin className="w-3.5 h-3.5" /> {item.item_type === 'service' ? 'Prestation HOLA' : (details.location || details.city || 'Sénégal')}
                    </p>

                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md flex items-center gap-1 ${statusStyles[status] || statusStyles['en_attente']}`}>
                            <StatusIcon className="w-3 h-3" /> {displayStatus}
                        </span>
                        <span className="text-xs text-slate-400">{formatDateRange(item.start_date, item.end_date)}</span>
                    </div>

                </div>
            </div>

            <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right">
                    <p className="text-xs text-slate-400 mb-0.5">Montant total</p>
                    <p className="text-xl font-black text-slate-900">{Number(item.amount).toLocaleString()} FCFA</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onChat}
                        className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors group relative"
                        title="Contacter l'hôte"
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                    <Link href={`/dashboard/client/explorer/${item.item_id}`} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                        Revoir
                    </Link>

                    {status === 'en_attente_paiement' && (
                        <Link href={`/dashboard/client/paiement/${item.id}`} className="px-5 py-2 text-[10px] font-black uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md active:scale-95">
                            Payer
                        </Link>
                    )}

                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-400 hover:text-slate-900 rounded-lg">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <div
                                onMouseLeave={() => setShowMenu(false)}
                                className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] p-2 overflow-visible animate-in fade-in zoom-in duration-150 ring-4 ring-slate-900/5"
                            >
                                {status === 'en_attente' ? (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onCancel(item.id); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-[1.2rem] transition-all">
                                            <XCircle className="w-4 h-4" /> Annuler (Client)
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center py-4 italic">Action non dispo.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FavoriteCard = ({ item, onRemove }) => {
    const details = item.metadata || {};
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={details.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400"}
                    alt={details.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                    onClick={() => onRemove(item.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm text-red-500 rounded-xl shadow-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{details.title || "Sans titre"}</h3>
                <div className="flex items-center text-slate-500 text-xs gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5" /> {details.location}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-amber-600 font-bold">{Number(details.price).toLocaleString()} FCFA</span>
                    <Link href={`/dashboard/client/explorer/${item.item_id}`} className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-900 hover:text-white transition-all">
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Component ---

export default function ClientActivityPage() {
    const router = useRouter();
    const [mainTab, setMainTab] = useState('reservations');
    const [activeFilter, setActiveFilter] = useState('toutes');
    const [favorites, setFavorites] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [mainTab]);

    const handleOpenChat = async (hostId, hostName) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            if (!hostId) {
                alert("Impossible de contacter l'hôte (ID manquant)");
                return;
            }

            // 1. Check existing
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
                .or(`participant_1.eq.${hostId},participant_2.eq.${hostId}`)
                .maybeSingle();

            if (existing) {
                router.push(`/dashboard/client/messages?id=${existing.id}`);
            } else {
                // 2. Create new
                const { data: newConv, error } = await supabase
                    .from('conversations')
                    .insert({
                        participant_1: user.id,
                        participant_2: hostId,
                        last_message: "Nouvelle discussion client",
                        display_name: hostName || "Hôte HOLA"
                    })
                    .select()
                    .single();

                if (error) throw error;
                router.push(`/dashboard/client/messages?id=${newConv.id}`);
            }
        } catch (error) {
            console.error("Chat error:", error);
            alert("Erreur lors de l'ouverture du chat.");
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (mainTab === 'favorites') {
            const { data } = await supabase.from('favorites').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (data) setFavorites(data);
        } else {
            const { data } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
            if (data) setBookings(data);
        }
        setLoading(false);
    };

    const handleRemoveFavorite = async (id) => {
        const { error } = await supabase.from('favorites').delete().eq('id', id);
        if (!error) setFavorites(prev => prev.filter(f => f.id !== id));
    };

    const handleCancelReservation = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.")) return;
        const { error } = await supabase.from('bookings').update({ status: 'annulee' }).eq('id', id);
        if (error) {
            alert("Erreur lors de l'annulation : " + error.message);
        } else {
            setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'annulee' } : b));
        }
    };

    const filteredReservations = useMemo(() => {
        let res = bookings;
        const now = new Date();
        now.setHours(0, 0, 0, 0); // To compare accurately with just dates

        if (activeFilter === 'avenir') {
            res = res.filter(r => !r.start_date || new Date(r.start_date) >= now);
        }
        if (activeFilter === 'passees') {
            res = res.filter(r => r.start_date && new Date(r.start_date) < now);
        }
        return res;
    }, [bookings, activeFilter]);


    const filteredFavorites = favorites.filter(f =>
        f.metadata?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.metadata?.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header with Main Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Mon Activité</h1>
                    <p className="text-slate-500 font-medium italic">Gérez vos réservations et vos coups de cœur.</p>
                </div>

                <div className="flex p-1.5 bg-slate-100 rounded-[1.5rem] w-full lg:w-fit shadow-inner">
                    <button
                        onClick={() => setMainTab('reservations')}
                        className={`flex-1 lg:px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mainTab === 'reservations' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-3.5 h-3.5" /> Réservations
                        </div>
                    </button>
                    <button
                        onClick={() => setMainTab('favorites')}
                        className={`flex-1 lg:px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mainTab === 'favorites' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Heart className={`w-3.5 h-3.5 ${mainTab === 'favorites' ? 'fill-red-500 text-red-500' : ''}`} /> Favoris
                        </div>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {mainTab === 'reservations' ? (
                    <motion.div
                        key="res-tab"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        <div className="flex bg-white rounded-2xl p-1 border border-slate-100 shadow-sm w-fit">
                            {['toutes', 'avenir', 'passees'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                                >
                                    {f === 'toutes' ? 'Toutes' : f === 'avenir' ? 'À venir' : 'Passées'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
                                </div>
                            ) : filteredReservations.length > 0 ? (
                                filteredReservations.map((res) => (
                                    <ReservationCard
                                        key={res.id}
                                        item={res}
                                        onCancel={handleCancelReservation}
                                        onChat={() => handleOpenChat(res.owner_id, res.metadata?.host_name || "Hôte HOLA")}
                                    />
                                ))
                            ) : (
                                <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-20 text-center">
                                    <History className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold italic">Aucune réservation confirmée pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="fav-tab"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher dans mes favoris..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-amber-500/5 transition-all text-sm font-bold shadow-sm"
                            />
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="w-10 h-10 animate-spin text-amber-200" />
                            </div>
                        ) : favorites.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <AnimatePresence mode="popLayout">
                                    {filteredFavorites.map(item => (
                                        <FavoriteCard key={item.id} item={item} onRemove={handleRemoveFavorite} />
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center space-y-6">
                                <Heart className="w-12 h-12 text-slate-100 mx-auto" />
                                <div className="space-y-2">
                                    <p className="text-slate-900 font-bold">Votre liste est vide</p>
                                    <p className="text-slate-400 text-sm">Parcourez le catalogue pour ajouter des coups de cœur.</p>
                                </div>
                                <Link href="/dashboard/client/explorer" className="inline-block px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                                    Découvrir les villas
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
