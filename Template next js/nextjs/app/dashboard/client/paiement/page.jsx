"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    CreditCard,
    Smartphone,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Lock,
    ChevronRight,
    Wallet,
    MapPin,
    Star
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

function PaymentContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const itemId = searchParams.get('item_id');
    const itemType = searchParams.get('item_type');
    const amount = searchParams.get('amount');
    const title = searchParams.get('title');
    const image = searchParams.get('image');
    const location = searchParams.get('location');
    const rating = searchParams.get('rating');
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const guests = searchParams.get('guests');

    const [method, setMethod] = useState('wave'); // 'wave', 'orange', 'card'
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    const handlePayment = async () => {
        if (!user) return;
        setIsProcessing(true);

        const ownerId = searchParams.get('owner_id');

        // Simulation de délai de paiement
        await new Promise(resolve => setTimeout(resolve, 2500));

        const clientName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Utilisateur HOLA";

        // Enregistrement en base de données
        const { error } = await supabase.from('bookings').insert([{
            user_id: user.id,
            item_id: itemId,
            item_type: itemType,
            owner_id: ownerId,
            amount: parseFloat(amount),
            status: 'en_attente',
            start_date: startDate ? new Date(startDate) : null,
            end_date: endDate ? new Date(endDate) : null,
            metadata: { title, guests, image, location, client_name: clientName }
        }]);

        if (error) {
            console.error("Erreur enregistrement :", error);
            alert("Erreur lors de la validation : " + error.message);
            setIsProcessing(false);
            return;
        }

        // Envoyer une notification au propriétaire
        if (ownerId) {
            await supabase
                .from('notifications')
                .insert({
                    user_id: ownerId,
                    title: "Nouvelle réservation",
                    text: `${clientName} a réservé "${title}"`,
                    type: "reservation",
                    metadata: { booking_id: itemId, item_type: itemType, client_id: user.id }
                });
        }

        setIsProcessing(false);
        setIsSuccess(true);

        // Redirection après succès
        setTimeout(() => {
            router.push('/dashboard/client/reservations');
        }, 3000);
    };

    if (isSuccess) {
        return (
            <div className="max-w-md mx-auto py-20 text-center space-y-6">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20"
                >
                    <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Paiement Réussi !</h1>
                    <p className="text-slate-500 font-medium italic">Votre réservation pour "{title}" est confirmée.</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 animate-pulse">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Redirection vers votre historique...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-24">
            {/* Header */}
            <div className="mb-10 text-center sm:text-left">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group mb-4"
                >
                    <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Retour
                </button>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                    Finaliser votre <br className="sm:hidden" /> réservation
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Payment Methods */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest flex items-center gap-3">
                            <Wallet className="w-6 h-6 text-indigo-500" /> Mode de Paiement
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Wave */}
                            <button
                                onClick={() => setMethod('wave')}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group h-24 ${method === 'wave' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-50">
                                        <img src="/assets/payment/wave.webp" alt="Wave" className="w-full h-full object-contain p-2" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-900 text-sm">Wave</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Mobile Money</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'wave' ? 'border-indigo-600' : 'border-slate-200'}`}>
                                    {method === 'wave' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                </div>
                            </button>

                            {/* Orange Money */}
                            <button
                                onClick={() => setMethod('orange')}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group h-24 ${method === 'orange' ? 'border-orange-600 bg-orange-50/30' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-50">
                                        <img src="/assets/payment/orange_money.jpg" alt="Orange Money" className="w-full h-full object-contain p-2" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-900 text-sm">Orange Money</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Mobile Money</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'orange' ? 'border-orange-600' : 'border-slate-200'}`}>
                                    {method === 'orange' && <div className="w-2.5 h-2.5 bg-orange-600 rounded-full" />}
                                </div>
                            </button>

                            {/* PayPal */}
                            <button
                                onClick={() => setMethod('paypal')}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group h-24 ${method === 'paypal' ? 'border-sky-600 bg-sky-50 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50 overflow-hidden">
                                        <img src="/assets/payment/paypal.png" alt="PayPal" className="w-full h-full object-contain p-2" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-900 text-sm">PayPal</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Compte & Cartes</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'paypal' ? 'border-sky-600' : 'border-slate-200'}`}>
                                    {method === 'paypal' && <div className="w-2.5 h-2.5 bg-sky-600 rounded-full" />}
                                </div>
                            </button>

                            {/* Cards */}
                            <button
                                onClick={() => setMethod('card')}
                                className={`p-6 rounded-3xl border-2 transition-all flex items-center justify-between group h-24 ${method === 'card' ? 'border-slate-900 bg-slate-50 shadow-lg' : 'border-slate-100 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                                        <CreditCard className="w-7 h-7" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-900 text-sm">Carte Bancaire</p>
                                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Visa, Mastercard</p>
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${method === 'card' ? 'border-slate-900' : 'border-slate-200'}`}>
                                    {method === 'card' && <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />}
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-white flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                            <ShieldCheck className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Paiement 100% sécurisé</h3>
                            <p className="text-sm text-slate-500 italic">Vos données sont cryptées de bout en bout par HOLA Agency.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Summary */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                        <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
                            <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest border-b border-slate-50 pb-4">Récapitulatif</h2>

                            {/* Visual Preview */}
                            <div className="flex gap-4 mb-8">
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                                    <img src={image} alt={title} className="w-full h-full object-cover" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-black text-slate-900 text-sm leading-tight line-clamp-2 uppercase">{title}</h3>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-indigo-400" /> {location}
                                    </p>
                                    <div className="flex items-center gap-1 bg-amber-50 w-fit px-1.5 py-0.5 rounded-lg border border-amber-100">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span className="text-[9px] font-black text-amber-900">{rating}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">Type</span>
                                    <span className="text-slate-900 font-black uppercase text-[10px] bg-white px-2 py-1 rounded-md shadow-sm italic">{itemType}</span>
                                </div>
                                {startDate && (
                                    <div className="flex justify-between items-start text-xs">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest mt-0.5">Séjour</span>
                                        <div className="text-right">
                                            <p className="text-slate-900 font-black">{startDate}</p>
                                            <p className="text-slate-900 font-black">{endDate}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold uppercase tracking-widest">{itemType === 'service' ? 'Personnes' : 'Voyageurs'}</span>
                                    <span className="text-slate-900 font-black">{guests} {itemType === 'service' ? 'personne(s)' : 'voyageur(s)'}</span>
                                </div>
                            </div>

                            <div className="flex flex-col mb-8 p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1 text-center">Total à régler</span>
                                <span className="text-3xl font-black text-indigo-600 text-center">
                                    {Number(amount).toLocaleString()} <span className="text-sm">FCFA</span>
                                </span>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={isProcessing}
                                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 mb-4"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Validation...
                                    </>
                                ) : (
                                    <>
                                        Confirmer & Payer
                                    </>
                                )}
                            </button>

                            <p className="text-center text-slate-400 text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 opacity-60">
                                <Lock className="w-3 h-3" /> SSL 256-bit Secure Gateway
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}
