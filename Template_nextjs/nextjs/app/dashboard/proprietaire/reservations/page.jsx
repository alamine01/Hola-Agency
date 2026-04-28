"use client";

import React, { useState, useEffect } from 'react';
import {
    Calendar,
    User,
    Home,
    CheckCircle2,
    XCircle,
    Clock,
    MoreHorizontal,
    FileText,
    MessageSquare,
    Trash2,
    X,
    ArrowDownLeft,
    ArrowUpRight,
    Search,
    MapPin,
    Star,
    Loader2,
    Shield
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const BookingDetailModal = ({ isOpen, onClose, reservation }) => {
    if (!isOpen || !reservation) return null;

    const details = reservation.metadata || {};
    const netPayout = Math.floor(reservation.amount * 0.85);
    const commission = reservation.amount - netPayout;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-50 z-10">
                    <X className="w-6 h-6" />
                </button>

                <div className="flex flex-col md:flex-row gap-8 mb-10">
                    <div className="w-full md:w-48 h-48 rounded-3xl overflow-hidden border border-slate-100 shadow-xl shrink-0">
                        <img
                            src={details.image || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400"}
                            className="w-full h-full object-cover"
                            alt={details.title || details.name || "Réservation"}
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="inline-flex px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest italic">
                            {reservation.item_type === 'service' ? 'Prestation Service' : 'Location Villa'}
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 leading-tight uppercase tracking-tight">{details.title || details.name || 'Réservation'}</h2>
                        <div className="flex items-center gap-4 text-slate-500 font-bold text-xs italic">
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-400" /> {details.location || details.city || 'Sénégal'}</span>
                            {details.rating && <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {details.rating}</span>}
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Informations Client</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-black text-slate-900">{details.client_name || 'Utilisateur HOLA'}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">{reservation.guests || 1} Voyageur(s)</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Dates de séjour</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-black text-slate-900 uppercase">
                                <p>{reservation.start_date ? new Date(reservation.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Arrivée non fixée'}</p>
                                <p className="text-slate-400">— {reservation.end_date ? new Date(reservation.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Départ non fixé'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant Brut (Payé par client)</p>
                            <p className="text-2xl font-black">{reservation.amount.toLocaleString()} <span className="text-xs">FCFA</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Commission HOLA (15%)</p>
                            <p className="text-lg font-bold text-slate-400 italic">-{commission.toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Votre Gain Net</p>
                            <p className="text-3xl font-black text-amber-400">{netPayout.toLocaleString()} <span className="text-sm">FCFA</span></p>
                        </div>
                        <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">En attente de virement</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const HistoryModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const historyItems = [
        { id: "#RES-892", client: "Moussa Diop", amount: "85,000", date: "15 Fév 2025", type: "Revenu", status: "Terminé" },
        { id: "#RES-741", client: "Sophie Bertrand", amount: "45,000", date: "10 Fév 2025", type: "Revenu", status: "Terminé" },
        { id: "#RES-632", client: "Amadou Kane", amount: "120,000", date: "02 Fév 2025", type: "Revenu", status: "Terminé" },
        { id: "#REF-102", client: "Jean Dupont", amount: "25,000", date: "28 Jan 2025", type: "Remboursement", status: "Validé" },
        { id: "#RES-521", client: "Awa Seck", amount: "95,000", date: "20 Jan 2025", type: "Revenu", status: "Terminé" },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-2xl shadow-2xl relative max-h-[85vh] flex flex-col">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 rounded-xl transition-all hover:bg-slate-50 z-10">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">Historique Complet</h2>
                    <p className="text-slate-500 font-medium text-sm italic">"Retrouvez le détail de vos transactions passées (Net calculé à 85% du brut)."</p>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                    {historyItems.map((item, idx) => {
                        const netAmount = Math.floor(parseInt(item.amount.replace(/[^0-9]/g, '')) * 0.85);
                        return (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'Revenu' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {item.type === 'Revenu' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{item.client}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.id} • {item.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-sm ${item.type === 'Revenu' ? 'text-emerald-600' : 'text-slate-900'}`}>{netAmount.toLocaleString()} <span className="text-[10px]">FCFA (Net)</span></p>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">{item.status}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Période (Brut)</p>
                        <p className="text-xl font-black text-slate-900">320,000 <span className="text-xs font-bold">FCFA</span></p>
                    </div>
                    <button className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-xl active:scale-95">
                        Exporter (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReservationItem = ({ reservation, onStatusUpdate, onViewDetails, onOpenChat }) => {
    const [showMenu, setShowMenu] = useState(false);
    const details = reservation.metadata || {};

    const statusColors = {
        payee: "text-emerald-600 bg-emerald-50 border-emerald-100",
        confirmee: "text-blue-600 bg-blue-50 border-blue-100 font-black",
        en_attente: "text-amber-600 bg-amber-50 border-amber-100 font-black animate-pulse",
        annulee: "text-slate-400 bg-slate-50 border-slate-100",
    };

    const priceValue = reservation.amount;
    const netPayout = Math.floor(priceValue * 0.85);

    const formattedDate = reservation.start_date
        ? new Date(reservation.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : 'Date non fixée';

    return (
        <div className={`bg-white rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 p-4 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 hover:shadow-lg transition-all group relative shadow-sm ${showMenu ? 'z-50' : ''}`}>
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 ${statusColors[reservation.status] ? (statusColors[reservation.status].split(' ')[1]) : 'bg-slate-100'} rounded-l-[1.5rem] md:rounded-l-[2rem]`}></div>

            <div className="flex items-center gap-4 relative z-10 pl-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 border border-slate-50 flex items-center justify-center text-slate-300 group-hover:scale-105 group-hover:bg-amber-50 group-hover:text-amber-400 transition-all overflow-hidden">
                    {details.image ? <img src={details.image} className="w-full h-full object-cover" /> : <User className="w-6 h-6 md:w-7 md:h-7" />}
                </div>
                <div>
                    <h3 className="font-black text-slate-900 leading-tight pr-10 uppercase text-sm tracking-tight">{details.title || details.name || 'Réservation'}</h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold italic uppercase tracking-wider">{details.client_name || 'Utilisateur HOLA'}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">{formattedDate}</p>
                    </div>
                </div>
            </div>


            <div className="grid grid-cols-2 lg:flex lg:items-center justify-between lg:justify-end gap-4 md:gap-14 w-full lg:w-auto pt-4 md:pt-6 lg:pt-0 border-t lg:border-0 border-slate-100 relative z-10">
                <div className="flex flex-col items-start md:items-end lg:min-w-[120px]">
                    <p className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black tracking-[0.15em] mb-1">Votre Gain Net</p>
                    <p className="font-black text-amber-600 text-sm md:text-lg">{netPayout.toLocaleString()} <span className="text-[8px] md:text-[10px]">FCFA</span></p>
                    <p className="text-[7px] md:text-[9px] text-slate-400 font-medium italic opacity-60">Brut : {priceValue.toLocaleString()} FCFA</p>
                </div>

                <div className="flex flex-col items-end lg:items-center lg:min-w-[100px]">
                    <p className="text-[8px] md:text-[10px] text-slate-400 uppercase font-black tracking-[0.15em] mb-2 text-right lg:text-center w-full">Statut</p>
                    <span className={`px-3 md:px-4 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${statusColors[reservation.status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                        {reservation.status === 'payee' ? 'PAYÉE' : reservation.status === 'confirmee' ? 'CONFIRMÉE' : reservation.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="flex items-center gap-2 col-span-2 justify-end pt-2 md:pt-0">
                    {reservation.status === 'en_attente' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onStatusUpdate(reservation, 'confirmee')}
                                title="Confirmer"
                                className="p-2 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 border border-emerald-100"
                            >
                                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={() => onStatusUpdate(reservation, 'annulee')}
                                title="Refuser"
                                className="p-2 md:p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 border border-red-100"
                            >
                                <XCircle className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 md:p-3 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all border border-slate-100"
                        >
                            <MoreHorizontal className="w-4 h-4 md:w-5 md:h-5" />
                        </button>

                        {showMenu && (
                            <div
                                onMouseLeave={() => setShowMenu(false)}
                                className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] p-2 overflow-visible animate-in fade-in zoom-in duration-150 ring-4 ring-slate-900/5"
                            >
                                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onViewDetails(reservation); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 rounded-[1.2rem] transition-all group">
                                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                                    Détails Résa
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onOpenChat(reservation.user_id); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 rounded-[1.2rem] transition-all group">
                                    <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                                    Chat Client
                                </button>
                                <div className="h-px bg-slate-50 my-2 mx-3"></div>
                                <button onClick={(e) => { e.stopPropagation(); setShowMenu(false); onStatusUpdate(reservation, 'annulee'); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-[1.2rem] transition-all">
                                    <Trash2 className="w-4 h-4" />
                                    Annuler (PHP Sync)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function ProprietaireReservationsPage() {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleOpenChat = async (clientId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { alert("Vous devez être connecté."); return; }
        if (!clientId) { alert("Impossible d'identifier le client de cette réservation."); return; }

        try {
            const { data: existing, error: fetchErr } = await supabase.from('conversations')
                .select('id')
                .or(`and(participant_1.eq.${user.id},participant_2.eq.${clientId}),and(participant_1.eq.${clientId},participant_2.eq.${user.id})`)
                .maybeSingle();

            if (fetchErr) {
                console.error("Chat error:", fetchErr);
                alert("La table 'conversations' n'existe pas encore. Exécutez le SQL conversations/messages dans Supabase d'abord.");
                return;
            }

            if (existing) {
                router.push(`/dashboard/proprietaire/messages?id=${existing.id}`);
            } else {
                const p1 = user.id < clientId ? user.id : clientId;
                const p2 = user.id < clientId ? clientId : user.id;
                const { data: newConv, error: insertErr } = await supabase.from('conversations').insert({
                    participant_1: p1,
                    participant_2: p2,
                    last_message_at: new Date().toISOString()
                }).select().single();

                if (insertErr) {
                    console.error("Insert error:", insertErr);
                    alert("Erreur lors de la création de la conversation : " + insertErr.message);
                    return;
                }
                if (newConv) router.push(`/dashboard/proprietaire/messages?id=${newConv.id}`);
            }
        } catch (err) {
            console.error("handleOpenChat error:", err);
            alert("Erreur inattendue : " + err.message);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('owner_id', user.id)
                .neq('item_type', 'Service')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Fetch error full details:", error);
                // Si l'erreur est liée à une colonne manquante
                if (error.code === '42703') {
                    alert("Erreur base de données : La colonne 'owner_id' semble manquer dans la table 'bookings'.");
                } else {
                    alert("Erreur de récupération : " + (error.message || "Erreur inconnue"));
                }
            } else {
                setBookings(data || []);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Une erreur inattendue est survenue lors de la synchronisation.");
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (booking, newStatus) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', booking.id);

        if (error) {
            alert("Erreur lors de la mise à jour : " + error.message);
        } else {
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));

            // Notify client
            const statusLabel = newStatus === 'confirmee' ? 'confirmée' : 'annulée';
            const propertyTitle = booking.metadata?.title || "votre réservation";

            await supabase
                .from('notifications')
                .insert({
                    user_id: booking.user_id,
                    title: "Mise à jour de réservation",
                    text: `Votre réservation pour "${propertyTitle}" a été ${statusLabel}.`,
                    type: "reservation",
                    metadata: { booking_id: booking.id, status: newStatus }
                });
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-10 px-4 md:px-8 pt-6 overflow-x-hidden">
            <div className="mb-8 md:mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Demandes & Réservations</h1>
                    <p className="text-sm md:text-base text-slate-500 font-medium italic opacity-80">Gérez vos revenus locatifs en accord avec le règlement HOLA (-15% commission).</p>
                </div>
                {loading && <div className="flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest"><Loader2 className="w-4 h-4 animate-spin" /> Synchronisation...</div>}
            </div>

            <div className="space-y-5">
                {bookings.length > 0 ? (
                    bookings.map((res) => (
                        <ReservationItem
                            key={res.id}
                            reservation={res}
                            onStatusUpdate={handleStatusUpdate}
                            onViewDetails={setSelectedReservation}
                            onOpenChat={handleOpenChat}
                        />
                    ))
                ) : !loading ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center">
                        <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold italic">Aucune demande de réservation trouvée.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2rem]"></div>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-20 bg-gradient-to-br from-white to-slate-50/50 rounded-[3rem] border border-slate-100 p-10 md:p-14 text-center group transition-all relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>

                <div className="w-20 h-20 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-amber-500 group-hover:scale-110 transition-transform relative z-10 ring-4 ring-slate-50/50">
                    <Shield className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight relative z-10 transition-colors group-hover:text-amber-600 uppercase tracking-widest text-lg text-center">Gestion Comptable</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed relative z-10 italic">"Consultez vos relevés de revenus nets et gérez vos justificatifs de versement."</p>

                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-amber-600 hover:shadow-2xl hover:shadow-amber-200 transition-all active:scale-95 relative z-10"
                >
                    Voir tout l'historique
                </button>
            </div>

            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />

            <BookingDetailModal
                isOpen={!!selectedReservation}
                reservation={selectedReservation}
                onClose={() => setSelectedReservation(null)}
            />
        </div>
    );
}
