"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Clock,
    CheckCircle2,
    XCircle,
    MapPin,
    Calendar,
    ChevronRight,
    MessageSquare,
    Phone,
    X,
    User,
    CreditCard,
    Info,
    Check,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

const RequestDetailsModal = ({ isOpen, onClose, request, onStatusUpdate }) => {
    if (!isOpen || !request) return null;

    const details = request.metadata || {};
    const netPayout = Math.floor(request.amount * 0.85);

    return (
        <AnimatePresence>
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
                    className="bg-white rounded-[2.5rem] p-6 md:p-10 w-full max-w-xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    <button onClick={onClose} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-50 border border-slate-50">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="mb-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                Demande #{request.id.slice(0, 5)}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${request.status === 'en_attente' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                {request.status}
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">{details.title || 'Service'}</h2>
                        <p className="text-slate-400 font-medium text-sm mt-1">"Vérifiez les informations avant d'accepter la mission."</p>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">Utilisateur HOLA</h3>
                                <p className="text-xs text-slate-500 font-medium">{details.guests || 1} Personne(s)</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-amber-100 transition-colors">
                                <Calendar className="w-5 h-5 text-amber-500 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date souhaitée</p>
                                <p className="text-sm font-black text-slate-900">{request.start_date ? new Date(request.start_date).toLocaleDateString() : 'Non précisé'}</p>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-amber-100 transition-colors">
                                <MapPin className="w-5 h-5 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lieu</p>
                                <p className="text-sm font-black text-slate-900">{details.location || 'Sénégal'}</p>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-slate-200">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Votre Gain Net (-15%)</p>
                                <p className="text-2xl font-black">{netPayout.toLocaleString()} <span className="text-xs">FCFA</span></p>
                            </div>
                            <div className="text-right">
                                <CreditCard className="w-8 h-8 text-amber-400 mb-1 ml-auto opacity-50" />
                                <p className="text-[9px] font-medium text-slate-500 italic">Paiement garanti par HOLA</p>
                            </div>
                        </div>

                        {request.status === 'en_attente' && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => onStatusUpdate(request.id, 'annulee')}
                                    className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2">
                                    <XCircle className="w-4 h-4" /> Refuser
                                </button>
                                <button
                                    onClick={() => onStatusUpdate(request.id, 'confirmee')}
                                    className="py-4 bg-amber-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-amber-100 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Accepter
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const GuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-white rounded-[2.5rem] p-8 md:p-12 w-full max-w-xl shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-50 z-10">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <div className="w-16 h-16 bg-amber-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-100 shrink-0">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-1">Guide Prestataire</h2>
                        <p className="text-slate-500 font-bold text-xs italic tracking-wide uppercase opacity-60">"Optimisez votre réussite sur HOLA"</p>
                    </div>
                </div>

                <div className="space-y-4 mb-10 overflow-x-hidden">
                    {[
                        { 
                            id: 1, 
                            title: "Réactivité Express", 
                            desc: "Répondez aux demandes en moins de 2h pour être mis en avant.",
                            color: "bg-amber-50 text-amber-600 border-amber-100"
                        },
                        { 
                            id: 2, 
                            title: "Communication Exclusive", 
                            desc: "Utilisez uniquement le chat HOLA pour sécuriser vos paiements.",
                            color: "bg-emerald-50 text-emerald-600 border-emerald-100"
                        },
                        { 
                            id: 3, 
                            title: "Mise à jour Calendrier", 
                            desc: "Indiquez vos indisponibilités pour éviter les refus de demandes.",
                            color: "bg-blue-50 text-blue-600 border-blue-100"
                        }
                    ].map(tip => (
                        <div key={tip.id} className={`p-6 rounded-[2rem] border ${tip.color} shadow-sm`}>
                            <h4 className="font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-white/50 flex items-center justify-center border border-current opacity-50">{tip.id}</span>
                                {tip.title}
                            </h4>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed italic line-clamp-2 text-left">"{tip.desc}"</p>
                        </div>
                    ))}
                </div>

                <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-amber-600 transition-all shadow-xl active:scale-95">
                    J'ai compris
                </button>
            </motion.div>
        </div>
    );
};

const RequestCard = ({ request, onDetails, onChat }) => {
    const details = request.metadata || {};
    const statusStyles = {
        en_attente: "bg-amber-100 text-amber-700 border-amber-200 animate-pulse",
        confirmee: "bg-emerald-100 text-emerald-700 border-emerald-200",
        annulee: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group shadow-sm">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform shadow-lg relative overflow-hidden">
                    {details.image ? <img src={details.image} className="w-full h-full object-cover" /> : <User className="w-8 h-8" />}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{details.title || 'Service'}</h3>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-2">
                        <span className="text-amber-600">{request.item_type}</span> • {request.start_date ? new Date(request.start_date).toLocaleDateString() : 'Date à fixer'}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-lg border ${statusStyles[request.status] || 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {request.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onChat}
                    className="p-3.5 bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all active:scale-95 group"
                    title="Contacter le client"
                >
                    <MessageSquare className="w-5 h-5" />
                </button>
                <button
                    onClick={onDetails}
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl active:scale-95 shrink-0"
                >
                    Détails
                </button>
            </div>
        </div>
    );
};

export default function DemandesPage() {
    const router = useRouter();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleOpenChat = async (clientId, clientName) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Check if conversation already exists
            const { data: existing } = await supabase
                .from('conversations')
                .select('id')
                .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
                .or(`participant_1.eq.${clientId},participant_2.eq.${clientId}`)
                .maybeSingle();

            if (existing) {
                router.push(`/dashboard/prestataire/messages?id=${existing.id}`);
            } else {
                // 2. Create new conversation
                const { data: newConv, error } = await supabase
                    .from('conversations')
                    .insert({
                        participant_1: user.id,
                        participant_2: clientId,
                        last_message: "Nouvelle demande de service",
                        display_name: clientName || "Client HOLA"
                    })
                    .select()
                    .single();

                if (error) throw error;
                router.push(`/dashboard/prestataire/messages?id=${newConv.id}`);
            }
        } catch (error) {
            console.error("Chat error:", error);
            alert("Impossible d'ouvrir la discussion.");
        }
    };

    const fetchRequests = async () => {
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
                .eq('item_type', 'Service')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Fetch error full details:", error);
                if (error.code === '42703') {
                    alert("Erreur base de données : La colonne 'owner_id' semble manquer dans la table 'bookings'.");
                } else {
                    alert("Erreur de récupération : " + (error.message || "Erreur inconnue"));
                }
            } else {
                setRequests(data || []);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Une erreur inattendue est survenue.");
        }
        setLoading(false);
    };

    const handleStatusUpdate = async (id, newStatus) => {
        const { error } = await supabase
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert("Erreur : " + error.message);
        } else {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
            setIsModalOpen(false);
        }
    };

    const handleOpenDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-0">
            <div className="mb-12 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Demandes de services</h1>
                    <p className="text-slate-500 font-medium italic opacity-80">Gérez vos demandes entrantes et planifiez vos interventions HOLA.</p>
                </div>
                {loading && <Loader2 className="w-6 h-6 animate-spin text-amber-500" />}
            </div>

            <div className="space-y-5 mb-16">
                {requests.length > 0 ? (
                    requests.map((req, idx) => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            onDetails={() => handleOpenDetails(req)}
                            onChat={() => handleOpenChat(req.user_id, req.metadata?.client_name || "Client HOLA")}
                        />
                    ))
                ) : !loading ? (
                    <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 py-20 text-center">
                        <Clock className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold italic">Aucune demande pour le moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2rem]" />)}
                    </div>
                )}
            </div>

            <div className="mt-12 md:mt-20 bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="text-center lg:text-left">
                        <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">Rappel Important</h3>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight uppercase">Réactivité & Excellence</h3>
                        <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl italic leading-relaxed">
                            "Les clients HOLA s'attendent à une réponse sous 2 heures. Une forte réactivité améliore votre classement dans les résultats de recherche."
                        </p>
                    </div>
                    <button
                        onClick={() => setIsGuideOpen(true)}
                        className="w-full lg:w-auto px-10 py-5 bg-white text-slate-900 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 hover:text-white transition-all active:scale-95 shrink-0 shadow-xl"
                    >
                        Guide Prestataire
                    </button>
                </div>
            </div>

            <GuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />

            <RequestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
                onStatusUpdate={handleStatusUpdate}
            />
        </div>
    );
}
