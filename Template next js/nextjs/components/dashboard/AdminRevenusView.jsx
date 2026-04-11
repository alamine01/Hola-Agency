"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    ArrowUpRight,
    Calendar,
    Filter,
    Download,
    Loader2,
    CheckCircle2,
    Clock,
    AlertCircle,
    Wallet,
    ArrowDownLeft,
    ChevronRight,
    Briefcase,
    ShieldCheck,
    ArrowUpLeft,
    XCircle,
    CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminRevenusView() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [selectedTx, setSelectedTx] = useState(null);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('incomes'); // 'incomes' | 'payouts'
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        commission: 0,
        net: 0
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // Fetch Bookings
            const { data: bData, error: bError } = await supabase
                .from('bookings')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch Payouts
            const { data: pData, error: pError } = await supabase
                .from('payouts')
                .select(`
                    *,
                    profiles:user_id (
                        display_name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            if (pError) console.error("Payouts Error:", pError);

            if (bData) setBookings(bData);
            if (pData) setPayouts(pData);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const handleValidateBooking = async (bookingId) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ is_validated: true })
                .eq('id', bookingId);

            if (error) throw error;
            fetchAdminData();
        } catch (error) {
            alert("Erreur validation: " + error.message);
        }
    };

    const handleProcessPayout = async (payoutId, newStatus) => {
        const confirmMsg = newStatus === 'valide'
            ? "Voulez-vous confirmer avoir envoyé les fonds ?"
            : "Voulez-vous rejeter ce retrait ? L'argent sera automatiquement rendu au solde disponible de l'utilisateur.";

        if (!confirm(confirmMsg)) return;

        try {
            const { error } = await supabase
                .from('payouts')
                .update({ status: newStatus })
                .eq('id', payoutId);

            if (error) throw error;
            fetchAdminData();
        } catch (error) {
            alert("Erreur retrait: " + error.message);
        }
    };

    const filteredBookings = useMemo(() => {
        if (filter === 'all') return bookings;
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return bookings.filter(b => {
            const bDate = new Date(b.created_at);
            if (filter === 'today') return bDate >= startOfToday;
            if (filter === 'month') return bDate >= startOfMonth;
            return true;
        });
    }, [bookings, filter]);

    useEffect(() => {
        let total = 0;
        let pending = 0;

        filteredBookings.forEach(b => {
            if (b.status === 'payee' || b.status === 'confirmee') {
                total += b.amount;
            } else if (b.status === 'en_attente') {
                pending += b.amount;
            }
        });

        const commission = Math.floor(total * 0.15);
        const net = total - commission;

        setStats({ total, pending, commission, net });
    }, [filteredBookings]);

    const exportToCSV = () => {
        const dataToExport = activeTab === 'incomes' ? filteredBookings : payouts;
        if (!dataToExport.length) return alert("Aucune donnée à exporter");

        const headers = activeTab === 'incomes'
            ? ["ID", "Type", "Montant", "Statut", "Date"]
            : ["ID", "Utilisateur", "Montant", "Méthode", "Statut", "Date"];

        const rows = activeTab === 'incomes'
            ? dataToExport.map(b => [b.id, b.item_type, b.amount, b.status, new Date(b.created_at).toLocaleDateString()])
            : dataToExport.map(p => [p.id, p.profiles?.display_name, p.amount, p.method, p.status, new Date(p.created_at).toLocaleDateString()]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", `rapport-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`);
        link.click();
    };

    if (loading) return <div className="h-full flex items-center justify-center p-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Centre de Finance</h1>
                    <p className="text-slate-500 font-medium italic opacity-80">Gérez les revenus de la plateforme et les paiements partenaires.</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-2"
                >
                    <Download className="w-4 h-4" /> Exporter {activeTab === 'incomes' ? 'Rapport' : 'Retraits'}
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Volume Global", value: stats.total, icon: Wallet, color: "bg-indigo-600" },
                    { label: "Commissions (15%)", value: stats.commission, icon: Briefcase, color: "bg-amber-500" },
                    { label: "Transactions Net", value: stats.net, icon: TrendingUp, color: "bg-emerald-600" },
                    { label: "Flux en attente", value: stats.pending, icon: Clock, color: "bg-slate-900" }
                ].map((s, i) => (
                    <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-6 shadow-lg`}>
                                <s.icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{s.value.toLocaleString()} <span className="text-[10px]">FCFA</span></h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex border-b border-slate-50">
                    <button
                        onClick={() => setActiveTab('incomes')}
                        className={`flex-1 py-6 font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'incomes' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Paiements Clients
                    </button>
                    <button
                        onClick={() => setActiveTab('payouts')}
                        className={`flex-1 py-6 font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === 'payouts' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        Demandes de Retrait ({payouts.filter(p => p.status === 'en_attente').length})
                    </button>
                </div>

                <div className="p-8 md:p-12">
                    {activeTab === 'incomes' ? (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Dernières Réservations</h2>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="pl-8 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-tighter outline-none"
                                    >
                                        <option value="all">Tout</option>
                                        <option value="today">Aujourd'hui</option>
                                        <option value="month">Mois</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredBookings.map((book) => (
                                    <div key={book.id} className="p-6 bg-white rounded-3xl border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${book.status === 'payee' || book.status === 'confirmee' ? (book.is_validated ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400') : 'bg-amber-50 text-amber-600'}`}>
                                                <ArrowDownLeft className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{book.item_type} #{book.id.slice(0, 5)}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(book.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900 tracking-tight">{book.amount.toLocaleString()} FCFA</p>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${book.status === 'payee' || book.status === 'confirmee' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {book.status} {book.is_validated && "• Validé"}
                                                </span>
                                            </div>
                                            {(!book.is_validated && (book.status === 'payee' || book.status === 'confirmee')) && (
                                                <button
                                                    onClick={() => handleValidateBooking(book.id)}
                                                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[9px] hover:bg-slate-900 transition-all shadow-xl shadow-emerald-100"
                                                >
                                                    Valider
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Demandes de Fonds Partners</h2>
                            <div className="space-y-4">
                                {payouts.map((p) => (
                                    <div key={p.id} className="p-6 bg-white rounded-3xl border border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${p.status === 'valide' ? 'bg-emerald-50 text-emerald-600' : p.status === 'rejete' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                                <ArrowUpLeft className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{p.profiles?.display_name || 'Utilisateur'}</h4>
                                                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{p.method}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 md:gap-10">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-slate-900 tracking-tight">{p.amount.toLocaleString()} FCFA</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(p.created_at).toLocaleDateString()}</p>
                                            </div>
                                            {p.status === 'en_attente' ? (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleProcessPayout(p.id, 'valide')}
                                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                                        title="Approuver"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleProcessPayout(p.id, 'rejete')}
                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                        title="Rejeter"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${p.status === 'valide' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                    {p.status}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {payouts.length === 0 && <p className="text-center py-10 text-slate-400 italic">Aucune demande de retrait pour le moment.</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
