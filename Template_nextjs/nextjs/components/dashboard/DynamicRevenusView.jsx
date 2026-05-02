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

export default function DynamicRevenusView({ role = 'client' }) {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [payouts, setPayouts] = useState([]);
    const [wallet, setWallet] = useState({ pending: 0, available: 0, withdrawn: 0 });
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState(null);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawForm, setWithdrawForm] = useState({ 
        amount: '', 
        method: 'Wave',
        phone: '',
        iban: '',
        account_holder: '',
        email: ''
    });

    useEffect(() => {
        fetchFinancialData();
    }, []);

    const fetchFinancialData = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('*')
                .eq('owner_id', user.id)
                .in('status', ['confirmee', 'payee'])
                .order('created_at', { ascending: false });

            const { data: payoutsData } = await supabase
                .from('payouts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setBookings(bookingsData || []);
            setPayouts(payoutsData || []);

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
                    available -= p.amount;
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
            
            // Build metadata based on method
            let metadata = {};
            if (withdrawForm.method === 'Wave' || withdrawForm.method === 'Orange Money') {
                metadata = { phone: withdrawForm.phone };
            } else if (withdrawForm.method === 'Virement bancaire') {
                metadata = { iban: withdrawForm.iban, account_holder: withdrawForm.account_holder };
            } else if (withdrawForm.method === 'PayPal') {
                metadata = { email: withdrawForm.email };
            }

            const { error } = await supabase.from('payouts').insert({
                user_id: user.id,
                amount: amount,
                method: withdrawForm.method,
                metadata: metadata, // Storing details in metadata
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
                status: p.status,
                subtitle: 'Demande de fonds'
            }))
        ];
        return list.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [bookings, payouts]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-20 text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 md:space-y-10 pb-20 px-4 md:px-8 pt-6 overflow-x-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight uppercase">Portefeuille</h1>
                    <p className="text-xs md:text-base text-slate-500 font-medium italic opacity-80 leading-relaxed">Suivez vos gains et gérez vos demandes de retrait.</p>
                </div>
                <button
                    onClick={() => setIsWithdrawModalOpen(true)}
                    className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Demander un retrait
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-amber-50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 text-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                            <Clock className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenus en Attente</p>
                        <h3 className="text-lg sm:text-xl md:text-3xl font-black text-slate-900 tracking-tight">{(wallet.pending || 0).toLocaleString()} <span className="text-[9px] md:text-sm font-bold">FCFA</span></h3>
                        <p className="hidden md:block text-[9px] text-slate-400 mt-4 font-medium italic leading-relaxed">"Revenus en cours de validation par l'administrateur HOLA."</p>
                    </div>
                </div>

                <div className="bg-slate-900 p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] shadow-2xl shadow-amber-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-amber-500/10 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500 text-white rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-xl shadow-amber-500/20">
                            <Wallet className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black text-amber-300 uppercase tracking-widest mb-1">Solde Disponible</p>
                        <h3 className="text-lg sm:text-xl md:text-3xl font-black text-white tracking-tight">{(wallet.available || 0).toLocaleString()} <span className="text-[9px] md:text-sm font-bold">FCFA</span></h3>
                        <div className="mt-3 md:mt-4 flex items-center gap-2">
                            <span className="text-[7px] md:text-[9px] font-black text-emerald-400 uppercase tracking-widest px-2 py-0.5 bg-emerald-400/10 rounded-full">Prêt au retrait</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-full -mr-12 -mt-12 md:-mr-16 md:-mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative z-10">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 text-slate-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6">
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Retiré</p>
                        <h3 className="text-lg sm:text-xl md:text-3xl font-black text-slate-900 tracking-tight">{(wallet.withdrawn || 0).toLocaleString()} <span className="text-[9px] md:text-sm font-bold">FCFA</span></h3>
                        <p className="hidden md:block text-[9px] text-slate-400 mt-4 font-medium italic leading-relaxed">Historique complet de vos virements reçus.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm p-5 md:p-12">
                <div className="flex items-center justify-between mb-8 md:mb-10">
                    <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                        Historique <span className="hidden sm:inline">des mouvements</span>
                        <span className="px-3 py-1 bg-slate-100 text-[10px] rounded-full text-slate-500">{transactions.length}</span>
                    </h2>
                </div>

                <div className="space-y-4">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-50 hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 cursor-pointer">
                                <div className="flex items-center gap-4 md:gap-6">
                                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 shrink-0 ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600 shadow-rose-100/50'}`}>
                                        {tx.type === 'income' ? <ArrowDownLeft className="w-5 h-5 md:w-6 md:h-6" /> : <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-[11px] md:text-sm mb-0.5 md:mb-1 truncate">{tx.title}</h4>
                                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                                            <p className="text-[8px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{tx.subtitle || 'Transaction'}</p>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full shrink-0"></span>
                                            <p className="text-[8px] md:text-[10px] text-slate-400 font-medium italic truncate">{new Date(tx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-10 border-t md:border-t-0 pt-3 md:pt-0 border-slate-50 shrink-0">
                                    <div className="text-right flex-1 md:flex-none">
                                        <p className={`text-sm sm:text-base md:text-xl font-black tracking-tight whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{(tx.amount || 0).toLocaleString()} <span className="text-[9px] md:text-[10px]">FCFA</span>
                                        </p>
                                        <div className="flex items-center justify-end gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                                            <div className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${tx.status === 'validated' || tx.status === 'valide' ? 'bg-emerald-500' : tx.status === 'pending' || tx.status === 'en_attente' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                            <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${tx.status === 'validated' || tx.status === 'valide' ? 'text-emerald-600' : tx.status === 'pending' || tx.status === 'en_attente' ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {tx.status === 'validated' || tx.status === 'valide' ? 'Confirmé' : tx.status === 'pending' || tx.status === 'en_attente' ? 'En attente' : 'Refusé'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-slate-300 group-hover:text-amber-600 transition-colors" />
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
                            className="modal-hola bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative z-10 max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            <button onClick={() => setIsWithdrawModalOpen(false)} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-900 rounded-2xl transition-all hover:bg-slate-50 border border-slate-50">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6 md:mb-8 text-center md:text-left shrink-0">
                                <div className="w-14 h-14 bg-amber-600 text-white rounded-[1.2rem] flex items-center justify-center mb-5 shadow-xl shadow-amber-200 mx-auto md:mx-0">
                                    <ArrowUpRight className="w-7 h-7" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase mb-1">Retrait de fonds</h2>
                                <p className="text-slate-500 text-xs font-medium italic">Transférez vos gains vers votre compte préféré.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-5 md:space-y-6 custom-scrollbar">
                                <div className="p-5 bg-slate-50 rounded-[1.8rem] border border-slate-100 flex items-center justify-between shadow-inner">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Solde disponible</p>
                                        <p className="text-xl md:text-2xl font-black text-slate-900">{(wallet.available || 0).toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                                    </div>
                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm shadow-amber-100">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Montant du retrait</label>
                                    <input
                                        type="number"
                                        placeholder="Min. 5,000 FCFA"
                                        value={withdrawForm.amount}
                                        onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                                        className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-600 transition-all font-black text-slate-900 text-base shadow-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Méthode de réception</label>
                                    <div className="grid grid-cols-2 gap-2.5">
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
                                                className={`py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border-2 ${withdrawForm.method === m.id ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-500 border-slate-100 hover:border-amber-200'}`}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">
                                    {(withdrawForm.method === 'Wave' || withdrawForm.method === 'Orange Money') && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Numéro de téléphone</label>
                                            <input
                                                type="tel"
                                                placeholder="7x xxx xx xx"
                                                value={withdrawForm.phone || ''}
                                                onChange={e => setWithdrawForm({ ...withdrawForm, phone: e.target.value })}
                                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-600 transition-all font-black text-slate-900 text-base shadow-sm"
                                            />
                                        </motion.div>
                                    )}

                                    {withdrawForm.method === 'Virement bancaire' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">IBAN / Numéro de compte</label>
                                                <input
                                                    type="text"
                                                    placeholder="SNxx xxxx xxxx xxxx xxxx"
                                                    value={withdrawForm.iban || ''}
                                                    onChange={e => setWithdrawForm({ ...withdrawForm, iban: e.target.value })}
                                                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-600 transition-all font-black text-slate-900 text-base shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Nom du titulaire</label>
                                                <input
                                                    type="text"
                                                    placeholder="Nom complet tel qu'indiqué sur le RIB"
                                                    value={withdrawForm.account_holder || ''}
                                                    onChange={e => setWithdrawForm({ ...withdrawForm, account_holder: e.target.value })}
                                                    className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-600 transition-all font-black text-slate-900 text-base shadow-sm"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {withdrawForm.method === 'PayPal' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] pl-1">Adresse Email PayPal</label>
                                            <input
                                                type="email"
                                                placeholder="exemple@email.com"
                                                value={withdrawForm.email || ''}
                                                onChange={e => setWithdrawForm({ ...withdrawForm, email: e.target.value })}
                                                className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-600 transition-all font-black text-slate-900 text-base shadow-sm"
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="pt-4">
                                    <button
                                        onClick={handleWithdrawRequest}
                                        disabled={
                                            withdrawLoading || 
                                            !withdrawForm.amount || 
                                            parseInt(withdrawForm.amount) > wallet.available ||
                                            (withdrawForm.method === 'Wave' && !withdrawForm.phone) ||
                                            (withdrawForm.method === 'Orange Money' && !withdrawForm.phone) ||
                                            (withdrawForm.method === 'Virement bancaire' && (!withdrawForm.iban || !withdrawForm.account_holder)) ||
                                            (withdrawForm.method === 'PayPal' && !withdrawForm.email)
                                        }
                                        className="w-full py-4 bg-amber-600 text-white rounded-[1.2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-900 transition-all shadow-2xl shadow-amber-100 active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                                    >
                                        {withdrawLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmer le retrait"}
                                    </button>
                                    <p className="text-center text-[8px] text-slate-400 mt-5 font-medium italic flex items-center justify-center gap-2">
                                        <AlertCircle className="w-3 h-3" /> Traitement sous 24h ouvrées.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
                {selectedTx && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTx(null)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="modal-hola relative w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 shrink-0">
                                <div>
                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-1">Détails du mouvement</p>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Rçu de transaction</h3>
                                </div>
                                <button onClick={() => setSelectedTx(null)} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedTx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                            {selectedTx.type === 'income' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedTx.subtitle || 'Type'}</p>
                                            <p className="text-sm font-black text-slate-900 uppercase">{selectedTx.type === 'income' ? 'Revenu reçu' : 'Retrait effectué'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${selectedTx.status === 'validated' || selectedTx.status === 'valide' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                            {selectedTx.status === 'validated' || selectedTx.status === 'valide' ? 'Confirmé' : 'En attente'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</p>
                                        <p className="text-sm font-bold text-slate-900">#{selectedTx.id.slice(0, 8).toUpperCase()}</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                                        <p className="text-sm font-bold text-slate-900">{new Date(selectedTx.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    <div className="col-span-2 space-y-1.5 pt-4 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Libellé</p>
                                        <p className="text-base font-black text-slate-900 uppercase tracking-tight">{selectedTx.title}</p>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex items-center justify-between shadow-xl shadow-slate-200">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-300 uppercase tracking-[0.2em]">Montant Total</p>
                                        <p className="text-xs text-amber-400 font-medium italic">Commission incluse</p>
                                    </div>
                                    <p className="text-3xl font-black tracking-tighter">
                                        {selectedTx.amount.toLocaleString()} <span className="text-sm font-bold">FCFA</span>
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
