"use client";

import React, { useState } from 'react';
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
    Search
} from 'lucide-react';

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
                    <button className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl active:scale-95">
                        Exporter (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReservationItem = ({ reservation }) => {
    const [showMenu, setShowMenu] = useState(false);

    // Mappage des statuts PHP vers couleurs
    const statusColors = {
        payee: "text-emerald-600 bg-emerald-50 border-emerald-100",
        confirmee: "text-blue-600 bg-blue-50 border-blue-100",
        en_attente: "text-amber-600 bg-amber-50 border-amber-100 font-black animate-pulse",
        annulee: "text-slate-400 bg-slate-50 border-slate-100",
    };

    // Calcul du net propriétaire (85%)
    const priceValue = parseInt(reservation.amount.replace(/[^0-9]/g, ''));
    const netPayout = Math.floor(priceValue * 0.85);

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all group relative overflow-hidden shadow-sm">
            <div className={`absolute left-0 top-0 bottom-0 w-2 ${statusColors[reservation.statut].split(' ')[1]}`}></div>

            <div className="flex items-center gap-4 relative z-10 pl-2">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 border border-slate-50 flex items-center justify-center text-slate-300 group-hover:scale-105 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
                    <User className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 leading-tight pr-10">{reservation.client}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-bold italic">{reservation.villa}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.1em]">{reservation.date}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-row md:flex-row items-center justify-between md:justify-end gap-6 md:gap-14 w-full md:w-auto pt-6 md:pt-0 border-t md:border-0 border-slate-50 relative z-10">
                <div className="flex flex-col items-center md:items-end min-w-[100px]">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.15em] mb-1">Votre Gain Net</p>
                    <p className="font-black text-indigo-600 text-lg">{netPayout.toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                    <p className="text-[9px] text-slate-400 font-medium italic opacity-60">Brut : {reservation.amount} FCFA</p>
                </div>

                <div className="flex flex-col items-center min-w-[100px]">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.15em] mb-2">Statut PHP</p>
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${statusColors[reservation.statut] || 'bg-slate-50 text-slate-500'}`}>
                        {reservation.statut === 'payee' ? 'PAYÉE' : reservation.statut === 'confirmee' ? 'CONFIRMÉE' : reservation.statut.replace('_', ' ')}
                    </span>
                </div>

                <div className="flex items-center gap-2 relative">
                    {reservation.statut === 'en_attente' && (
                        <div className="flex items-center gap-2">
                            <button title="Confirmer" className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95">
                                <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button title="Refuser" className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-3 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all border border-slate-100"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in duration-150 ring-4 ring-slate-900/5">
                                <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 rounded-[1.2rem] transition-all group">
                                    <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                    Détails Résa
                                </button>
                                <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 rounded-[1.2rem] transition-all group">
                                    <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                                    Chat Client
                                </button>
                                <div className="h-px bg-slate-50 my-2 mx-3"></div>
                                <button onClick={() => setShowMenu(false)} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-red-600 hover:bg-red-50 rounded-[1.2rem] transition-all">
                                    <Trash2 className="w-4 h-4" />
                                    Annuler (Statut PHP)
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showMenu && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowMenu(false)}></div>}
        </div>
    );
};

export default function ProprietaireReservationsPage() {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const reservations = [
        {
            client: "Moussa Diop",
            villa: "Villa Saly Exception",
            date: "12 Avril 2025",
            amount: "510000",
            statut: "en_attente"
        },
        {
            client: "Sophie Bertrand",
            villa: "L'Escale de Somone",
            date: "25 Mars 2025",
            amount: "150000",
            statut: "confirmee"
        },
        {
            client: "Amadou Kane",
            villa: "Villas Palmes d'Or",
            date: "02 Mai 2025",
            amount: "960000",
            statut: "payee"
        }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-10 px-4 md:px-0">
            <div className="mb-12 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">Demandes & Réservations</h1>
                <p className="text-slate-500 font-medium italic opacity-80">Gérez vos revenus locatifs en accord avec le règlement HOLA (-15% commission).</p>
            </div>

            <div className="space-y-5">
                {reservations.map((res, idx) => (
                    <ReservationItem key={idx} reservation={res} />
                ))}
            </div>

            <div className="mt-20 bg-gradient-to-br from-white to-slate-50/50 rounded-[3rem] border border-slate-100 p-10 md:p-14 text-center group transition-all relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl translate-y-10 -translate-x-10"></div>

                <div className="w-20 h-20 bg-white shadow-2xl shadow-slate-200/50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-indigo-500 group-hover:scale-110 transition-transform relative z-10 ring-4 ring-slate-50/50">
                    <Calendar className="w-10 h-10" />
                </div>

                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight relative z-10 transition-colors group-hover:text-indigo-600 uppercase tracking-widest text-lg">Archives Financières</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed relative z-10 italic">"Gérez vos écritures comptables et exportez vos relevés de revenus nets annuels."</p>

                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="px-10 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-indigo-600 hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 relative z-10"
                >
                    Voir tout l'historique
                </button>
            </div>

            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
            />
        </div>
    );
}
