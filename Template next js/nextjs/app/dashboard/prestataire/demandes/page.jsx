"use client";

import React, { useState } from 'react';
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
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RequestDetailsModal = ({ isOpen, onClose, request }) => {
    if (!isOpen || !request) return null;

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
                            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                Demande #{request.id || '842'}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${request.status === 'nouveau' ? 'bg-amber-50 text-amber-600 border-amber-100 animate-pulse' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                }`}>
                                {request.status}
                            </div>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Détails de l'intervention</h2>
                        <p className="text-slate-400 font-medium text-sm mt-1">"Vérifiez les informations avant d'accepter la mission."</p>
                    </div>

                    <div className="space-y-8">
                        {/* Client Info */}
                        <div className="flex items-center gap-5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100">
                            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                                {request.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900">{request.name}</h3>
                                <p className="text-xs text-slate-500 font-medium">Client HOLA Privilège</p>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                                <button className="p-3 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm">
                                    <Phone className="w-4 h-4" />
                                </button>
                                <button className="p-3 bg-white text-slate-600 rounded-xl border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm">
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Event Details */}
                        <div className="grid grid-cols-2 gap-5">
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-100 transition-colors">
                                <Calendar className="w-5 h-5 text-indigo-500 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Heure</p>
                                <p className="text-sm font-black text-slate-900">{request.date}</p>
                            </div>
                            <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-100 transition-colors">
                                <MapPin className="w-5 h-5 text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lieu</p>
                                <p className="text-sm font-black text-slate-900">Saly, Villa Eden</p>
                            </div>
                        </div>

                        {/* Service Logic */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] pl-1 block">Description du besoin</label>
                            <div className="p-5 bg-indigo-50/20 rounded-3xl border border-indigo-50">
                                <p className="text-slate-700 text-sm font-medium leading-relaxed italic">
                                    "Bonjour, j'ai réservé la villa pour un anniversaire. Nous aurions besoin du service {request.service} pour un groupe de 6 personnes."
                                </p>
                            </div>
                        </div>

                        {/* Financials (Net PHP logic) */}
                        <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between shadow-2xl shadow-slate-200">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Votre Gain Net (-15%)</p>
                                <p className="text-2xl font-black">{request.netPrice || '38,250'} <span className="text-xs">FCFA</span></p>
                            </div>
                            <div className="text-right">
                                <CreditCard className="w-8 h-8 text-indigo-400 mb-1 ml-auto opacity-50" />
                                <p className="text-[9px] font-medium text-slate-500 italic">Paiement garanti par HOLA</p>
                            </div>
                        </div>

                        {/* Actions */}
                        {request.status === 'nouveau' && (
                            <div className="grid grid-cols-2 gap-4">
                                <button className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2">
                                    <XCircle className="w-4 h-4" /> Refuser
                                </button>
                                <button className="py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
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

const RequestCard = ({ name, service, date, status, onDetails }) => {
    const statusStyles = {
        nouveau: "bg-indigo-100 text-indigo-700 border-indigo-200 animate-pulse",
        accepté: "bg-emerald-100 text-emerald-700 border-emerald-200",
        refusé: "bg-red-100 text-red-700 border-red-200",
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group shadow-sm">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform shadow-lg relative">
                    {name.charAt(0)}
                    {status === 'nouveau' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white"></div>}
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">{name}</h3>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-2">
                        <span className="text-indigo-600">{service}</span> • {date}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <span className={`text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-lg border ${statusStyles[status]}`}>
                            {status}
                        </span>
                        {status === 'nouveau' && <span className="text-[9px] font-black text-indigo-500 uppercase tracking-tighter">Nouveau message client</span>}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2">
                    <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-50"><Phone className="w-4 h-4" /></button>
                    <button className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-50"><MessageSquare className="w-4 h-4" /></button>
                </div>
                <div className="w-px h-8 bg-slate-50 mx-2 hidden md:block"></div>
                <button
                    onClick={onDetails}
                    className="px-8 py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl active:scale-95 shrink-0"
                >
                    Détails
                </button>
            </div>
        </div>
    );
};

export default function DemandesPage() {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const requests = [
        { id: '842', name: "Fatou Diop", service: "Chef à domicile", date: "15 Avril 19h00", status: "nouveau", netPrice: "38,250" },
        { id: '841', name: "Moussa Sarr", service: "Excursion Quad", date: "18 Avril 10h00", status: "accepté", netPrice: "29,750" },
        { id: '839', name: "Awa Ndiaye", service: "Massage Relaxant", date: "20 Avril 15h00", status: "accepté", netPrice: "21,250" },
    ];

    const handleOpenDetails = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 md:px-0">
            <div className="mb-12">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Demandes de services</h1>
                <p className="text-slate-500 font-medium italic opacity-80">Gérez vos demandes entrantes et planifiez vos interventions HOLA.</p>
            </div>

            <div className="space-y-5 mb-16">
                {requests.map((req, idx) => (
                    <RequestCard
                        key={idx}
                        {...req}
                        onDetails={() => handleOpenDetails(req)}
                    />
                ))}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left">
                        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Rappel Important</h3>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">Réactivité & Excellence</h3>
                        <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl italic leading-relaxed">
                            "Les clients HOLA s'attendent à une réponse sous 2 heures. Une forte réactivité améliore votre classement dans les résultats de recherche."
                        </p>
                    </div>
                    <button className="px-10 py-4 bg-white text-slate-900 rounded-[1.2rem] font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shrink-0">
                        Guide Prestataire
                    </button>
                </div>
            </div>

            <RequestDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                request={selectedRequest}
            />
        </div>
    );
}
