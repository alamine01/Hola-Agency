"use client";

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Search,
    CreditCard,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    X,
    Loader2,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

function InvoiceModal({ isOpen, onClose, invoice }) {
    if (!invoice) return null;

    const handleDownloadPDF = () => {
        const printWindow = window.open('', '_blank');
        const html = `
        <!DOCTYPE html>
        <html><head><title>Facture ${invoice.ref}</title>
        <style>
            body { font-family: 'Segoe UI', sans-serif; max-width: 700px; margin: 0 auto; padding: 40px; color: #1e293b; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: 900; color: #1e293b; } .logo span { color: #4f46e5; }
            .ref { text-align: right; } .ref p { margin: 4px 0; font-size: 13px; color: #64748b; }
            .ref .id { font-size: 16px; font-weight: 800; color: #1e293b; letter-spacing: 1px; }
            .section { margin-bottom: 30px; } .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .grid-item p { margin: 4px 0; } .grid-item .label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; }
            .grid-item .value { font-size: 15px; font-weight: 700; color: #334155; }
            .total-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 30px; }
            .total-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 800; }
            .total-value { font-size: 28px; font-weight: 900; color: #1e293b; }
            .status { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
            .paid { background: #ecfdf5; color: #059669; } .pending { background: #fffbeb; color: #d97706; } .cancelled { background: #fef2f2; color: #dc2626; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print { body { padding: 20px; } }
        </style></head><body>
            <div class="header">
                <div class="logo">HOLA <span>PLATFORM</span></div>
                <div class="ref">
                    <p class="id">${invoice.ref}</p>
                    <p>${invoice.date}</p>
                </div>
            </div>
            <div class="grid">
                <div class="grid-item"><p class="label">Service / Villa</p><p class="value">${invoice.service}</p></div>
                <div class="grid-item"><p class="label">Localisation</p><p class="value">${invoice.location}</p></div>
                <div class="grid-item"><p class="label">Dates</p><p class="value">${invoice.dates}</p></div>
                <div class="grid-item"><p class="label">Mode de paiement</p><p class="value">${invoice.method}</p></div>
            </div>
            <div class="section">
                <p class="section-title">Statut</p>
                <span class="status ${invoice.isPaid ? 'paid' : invoice.status === 'annulee' ? 'cancelled' : 'pending'}">${invoice.statusLabel}</span>
            </div>
            <div class="total-box">
                <div><p class="total-label">Montant Total</p><p class="total-value">${invoice.amount.toLocaleString()} FCFA</p></div>
            </div>
            <div class="footer">
                <p>HOLA Platform — Facture générée automatiquement</p>
                <p>Pour toute question, contactez support@hola-platform.com</p>
            </div>
        </body></html>`;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Détails de la facture</h3>
                            <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-900">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase font-black text-slate-400 tracking-widest mb-1">{invoice.ref}</p>
                                    <p className="text-xl font-black text-slate-900">{invoice.service}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Date d'émission</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold italic">
                                            <Calendar className="w-4 h-4 text-indigo-400" /> {invoice.date}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Mode de paiement</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold italic">
                                            <CreditCard className="w-4 h-4 text-indigo-400" /> {invoice.method}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Lieu</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold italic">
                                            <MapPin className="w-4 h-4 text-indigo-400" /> {invoice.location}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Séjour</p>
                                        <div className="flex items-center gap-2 text-slate-700 font-bold italic">
                                            <Calendar className="w-4 h-4 text-indigo-400" /> {invoice.dates}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-2">Statut de la transaction</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${invoice.isPaid ? 'bg-emerald-50 text-emerald-600' : invoice.status === 'annulee' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {invoice.isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                        {invoice.statusLabel}
                                    </div>
                                </div>

                                <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Montant Total</p>
                                        <p className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{invoice.amount.toLocaleString()} FCFA</p>
                                    </div>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-slate-200"
                                    >
                                        <Download className="w-5 h-5" /> Télécharger PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

export default function ClientInvoicesPage() {
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            const formatted = data.map((b, idx) => {
                const meta = b.metadata || {};
                const isPaid = b.status === 'payee' || b.status === 'confirmee';
                const statusMap = {
                    en_attente: 'En attente',
                    confirmee: 'Confirmée',
                    payee: 'Payée',
                    annulee: 'Annulée'
                };
                return {
                    id: b.id,
                    ref: `INV-${new Date(b.created_at).getFullYear()}-${String(idx + 1).padStart(3, '0')}`,
                    date: new Date(b.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
                    service: meta.title || meta.name || 'Réservation HOLA',
                    location: meta.location || meta.city || 'Sénégal',
                    amount: b.amount || 0,
                    status: b.status,
                    statusLabel: statusMap[b.status] || b.status,
                    method: meta.payment_method || 'Wave / Orange Money',
                    isPaid,
                    dates: b.start_date && b.end_date
                        ? `${new Date(b.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} → ${new Date(b.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                        : 'Date non fixée',
                    item_type: b.item_type
                };
            });
            setInvoices(formatted);
        }
        setLoading(false);
    };

    const openDetails = (inv) => {
        setSelectedInvoice(inv);
        setIsModalOpen(true);
    };

    const totalPaid = invoices.filter(i => i.isPaid).reduce((acc, i) => acc + i.amount, 0);
    const filtered = invoices.filter(i =>
        i.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto">
            <InvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Facturation</h1>
                    <p className="text-slate-500 font-medium italic">Consultez et suivez vos transactions.</p>
                </div>

                <div className="bg-indigo-50 px-6 py-4 rounded-3xl border border-indigo-100">
                    <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-1">Total Payé</p>
                    <p className="text-xl font-black text-indigo-700 font-mono">{totalPaid.toLocaleString()} FCFA</p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Historique</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-indigo-400 transition-colors"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-20 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/30 font-black text-[10px] uppercase tracking-widest text-slate-400">
                                <th className="px-8 py-5">Référence</th>
                                <th className="px-8 py-5">Service</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Montant</th>
                                <th className="px-8 py-5">Statut</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length > 0 ? filtered.map((inv, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={inv.id}
                                    className="hover:bg-slate-50/50 transition-colors group"
                                >
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-slate-700 font-mono text-sm">{inv.ref}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-slate-900 text-sm truncate max-w-[200px]">{inv.service}</p>
                                        <p className="text-[10px] text-slate-400 font-medium italic">{inv.location}</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-medium text-slate-500 italic">
                                        {inv.date}
                                    </td>
                                    <td className="px-8 py-6 font-black text-slate-900 font-mono">{inv.amount.toLocaleString()} FCFA</td>
                                    <td className="px-8 py-6">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.isPaid ? 'bg-emerald-50 text-emerald-600' : inv.status === 'annulee' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {inv.statusLabel}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => openDetails(inv)}
                                            className="p-2 bg-slate-100 hover:bg-slate-900 text-slate-500 hover:text-white rounded-xl transition-all active:scale-95 group"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-slate-400 text-sm italic">
                                        {searchTerm ? 'Aucune facture correspondante.' : 'Aucune facture trouvée.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4 mb-12">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Historique récent</h2>
                    <Search className="w-5 h-5 text-slate-400" />
                </div>
                {loading ? (
                    <div className="p-16 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : filtered.length > 0 ? filtered.map((inv, idx) => (
                    <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
                        onClick={() => openDetails(inv)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 whitespace-nowrap">{inv.ref}</p>
                                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{inv.service}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${inv.isPaid ? 'bg-emerald-50 text-emerald-600' : inv.status === 'annulee' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                {inv.statusLabel}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Montant</p>
                                <p className="text-lg font-black text-slate-900">{inv.amount.toLocaleString()} FCFA</p>
                            </div>
                            <Eye className="w-5 h-5 text-indigo-500" />
                        </div>
                    </motion.div>
                )) : (
                    <div className="p-12 text-center text-slate-400 text-sm italic">Aucune facture trouvée.</div>
                )}
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 opacity-10 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl animate-pulse" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
                    <div className="flex-1">
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Besoin d'aide ?</h2>
                        <p className="text-slate-400 text-lg leading-relaxed italic mb-8">Notre équipe support est là pour vous accompagner 24/7 sur vos transactions via Wave, Orange Money, PayPal ou Carte bancaire.</p>
                        <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-[#D4AF37] transition-all hover:scale-105 active:scale-95">
                            Contacter le support
                        </button>
                    </div>
                    <div className="w-full md:w-auto flex flex-wrap gap-4 justify-center md:justify-end">
                        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-center w-40">
                            <p className="text-2xl font-black text-white mb-1">0%</p>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Frais cachés</p>
                        </div>
                        <div className="p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 text-center w-40">
                            <p className="text-2xl font-black text-white mb-1">SSL</p>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Sécurisé</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
