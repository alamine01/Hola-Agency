"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Filter,
    Download,
    Plus,
    Loader2,
    Calendar,
    Wallet,
    AlertCircle,
    X,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

export default function RevenuePage() {
    const { role } = useParams();
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [wallet, setWallet] = useState({ pending: 0, available: 0, withdrawn: 0 });
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'Wave' });

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch Bookings (Income)
            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('*')
                .eq('owner_id', user.id)
                .in('status', ['confirmee', 'payee'])
                .order('created_at', { ascending: false });

            // 2. Fetch Payouts (Withdrawals)
            const { data: payoutsData } = await supabase
                .from('payouts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setBookings(bookingsData || []);
            setPayouts(payoutsData || []);

            // 3. Calculate Balances
            let pending = 0;
            let available = 0;
            let withdrawn = 0;

            (bookingsData || []).forEach(b => {
                const net = Math.floor(b.amount * 0.85);
                if (b.is_validated) {
                    available += net;
                } else {
                    pending += net;
                }
            });

            (payoutsData || []).forEach(p => {
                if (p.status === 'valide') {
                    available -= p.amount;
                    withdrawn += p.amount;
                } else if (p.status === 'en_attente') {
                    available -= p.amount; // Lock funds during request
                }
            });

            setWallet({ pending, available: Math.max(0, available), withdrawn });

        } catch (error) {
            console.error("Fetch error:", error);
        }
        setLoading(false);
    };

    const handleWithdrawRequest = async () => {
        const amount = parseInt(withdrawForm.amount);
        if (!amount || amount <= 0) return alert("Montant invalide");
        if (amount > wallet.available) return alert("Solde disponible insuffisant");

        setWithdrawLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('payouts').insert({
                user_id: user.id,
                amount: amount,
                method: withdrawForm.method,
                status: 'en_attente'
            });

            if (error) throw error;

            alert("Demande de retrait envoyée ! Elle sera traitée sous 24h.");
            setIsWithdrawModalOpen(false);
            fetchFinancialData();
        } catch (error) {
            alert("Erreur lors de la demande : " + error.message);
        }
        setWithdrawLoading(false);
    };

    const transactions = useMemo(() => {
        const list = [
            ...bookings.map(b => ({
                id: b.id,
                date: b.created_at,
                type: 'income',
                title: `Réservation #${b.id.slice(0, 5)}`,
                amount: Math.floor(b.amount * 0.85),
                status: b.is_validated ? 'validated' : 'pending',
                subtitle: b.item_type
            })),
            ...payouts.map(p => ({
                id: p.id,
                date: p.created_at,
                type: 'payout',
                title: `Retrait ${p.method}`,
                amount: p.amount,
                status: p.status, // en_attente, valide, rejete
                subtitle: 'Demande de fonds'
            }))
        ];
        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [bookings, payouts]);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Portefeuille</h1>
                    <p className="text-slate-500 font-medium italic opacity-80">Suivez vos gains et gérez vos demandes de retrait.</p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Demander un retrait
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                            <Clock className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenus en Attente</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{wallet.pending.toLocaleString()} <span className="text-sm font-bold">FCFA</span></h3>
                        <p className="text-[9px] text-slate-400 mt-4 font-medium italic leading-relaxed">"Revenus en cours de validation par l'administrateur HOLA."</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Solde Disponible</p>
                        <h3 className="text-3xl font-black text-white tracking-tight">{wallet.available.toLocaleString()} <span className="text-sm font-bold">FCFA</span></h3>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-400/10 rounded-full">Prêt au retrait</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mb-6">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Retiré</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{wallet.withdrawn.toLocaleString()} <span className="text-sm font-bold">FCFA</span></h3>
                        <p className="text-[9px] text-slate-400 mt-4 font-medium italic leading-relaxed">Historique complet de vos virements reçus.</p>
                    </div>
                </div>
            </div>

            {/* Transactions */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                        Historique des mouvements
                        <span className="px-3 py-1 bg-slate-100 text-[10px] rounded-full text-slate-500">{transactions.length}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <button className="p-3 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all border border-slate-50">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx.id} className="group p-6 bg-white rounded-3xl border border-slate-50 hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 shadow-rose-100/50'}`}>
                                        {tx.type === 'income' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{tx.title}</h4>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{tx.subtitle || 'Transaction'}</p>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <p className="text-[10px] text-slate-400 font-medium italic">{new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                                    <div className="text-right">
                                        <p className={`text-xl font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString()} <span className="text-[10px]">FCFA</span>
                                        </p>
                                        <div className="flex items-center justify-end gap-2 mt-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'validated' || tx.status === 'valide' ? 'bg-emerald-500' : tx.status === 'pending' || tx.status === 'en_attente' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${tx.status === 'validated' || tx.status === 'valide' ? 'text-emerald-600' : tx.status === 'pending' || tx.status === 'en_attente' ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {tx.status === 'validated' || tx.status === 'valide' ? 'Confirmé' : tx.status === 'pending' || tx.status === 'en_attente' ? 'En attente' : 'Refusé'}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <TrendingUp className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold italic">Aucune transaction enregistrée.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            <AnimatePresence>
                {isWithdrawModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsWithdrawModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-lg shadow-2xl relative z-10"
                        >
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-8 right-8 p-3 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-50 border border-slate-50">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-10 text-center md:text-left">
                                <div className="w-16 h-16 bg-indigo-600 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-indigo-200 mx-auto md:mx-0">
                                    <ArrowUpRight className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">Retrait de fonds</h2>
                                <p className="text-slate-500 font-medium italic">Transférez vos gains vers votre compte préféré.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-inner">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Solde disponible</p>
                                        <p className="text-2xl font-black text-slate-900">{wallet.available.toLocaleString()} <span className="text-xs">FCFA</span></p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Montant du retrait</label>
                                    <input
                                        type="number"
                                        placeholder="Min. 5,000 FCFA"
                                        value={withdrawForm.amount}
                                        onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                        className="w-full px-6 py-5 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 transition-all font-black text-slate-900 text-lg shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Méthode de réception</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { id: 'Wave', label: 'Wave' },
                                            { id: 'Orange Money', label: 'Orange Money' },
                                            { id: 'Virement bancaire', label: 'Virement' },
                                            { id: 'PayPal', label: 'PayPal' }
                                        ].map(m => (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setWithdrawForm({ ...withdrawForm, method: m.id })}
                                                className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${withdrawForm.method === m.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        onClick={handleWithdrawRequest}
                                        disabled={withdrawLoading || !withdrawForm.amount || parseInt(withdrawForm.amount) > wallet.available}
                                        className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-900 transition-all shadow-2xl shadow-indigo-100 active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                                    >
                                        {withdrawLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer le retrait"}
                                    </button>
                                    <p className="text-center text-[9px] text-slate-400 mt-6 font-medium italic flex items-center justify-center gap-2">
                                        <AlertCircle className="w-3 h-3" /> Les retraits sont traités sous un délai de 24h ouvrées.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
