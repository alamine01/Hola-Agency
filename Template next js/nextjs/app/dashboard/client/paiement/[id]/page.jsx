'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard,
    Wallet,
    Smartphone,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Calendar,
    MapPin,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const PaymentMethod = ({ id, title, description, icon: Icon, image, active, onClick, color }) => (
    <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onClick(id)}
        className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-5 ${active
            ? `border-${color}-500 bg-${color}-50/50 shadow-lg shadow-${color}-900/5`
            : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
    >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden ${active && !image ? `bg-${color}-500 text-white shadow-lg` : 'bg-slate-50 text-slate-400'
            }`}>
            {image ? (
                <img src={image} alt={title} className="w-full h-full object-cover p-2" />
            ) : (
                <Icon className="w-7 h-7" />
            )}
        </div>
        <div className="flex-1">
            <h3 className={`font-black uppercase tracking-widest text-[11px] mb-1 ${active ? `text-${color}-600` : 'text-slate-400'}`}>
                {title}
            </h3>
            <p className="text-sm font-bold text-slate-700">{description}</p>
        </div>
        {active && (
            <motion.div
                layoutId="check"
                className={`w-6 h-6 rounded-full bg-${color}-500 flex items-center justify-center text-white`}
            >
                <CheckCircle2 className="w-4 h-4" />
            </motion.div>
        )}
    </motion.div>
);

export default function CheckoutPage() {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [booking, setBooking] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState('wave'); // 'wave', 'orange', 'stripe', 'paypal'
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const fetchBooking = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/login');
        setUser(user);

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error(error);
            return;
        }
        setBooking(data);
        setLoading(false);
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            const apiEndpoints = {
                wave: '/api/payments/paytech',
                orange: '/api/payments/paytech',
                stripe: '/api/payments/stripe',
                paypal: '/api/payments/paypal'
            };

            const response = await fetch(apiEndpoints[selectedMethod], {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bookingId: id,
                    amount: booking.amount,
                    title: booking.metadata?.title || "Hébergement HOLA"
                }),
            });

            const result = await response.json();

            if (result.success && result.redirect_url) {
                // Créer un enregistrement de paiement "pending" avant de rediriger
                await supabase.from('payments').insert({
                    booking_id: id,
                    user_id: user.id,
                    amount: booking.amount,
                    provider: selectedMethod,
                    provider_id: result.session_id || result.order_id || 'paytech_pending',
                    status: 'pending'
                });

                // Rediriger vers le fournisseur
                window.location.href = result.redirect_url;
            } else {
                throw new Error(result.error || "Échec de l'initialisation du paiement.");
            }
        } catch (error) {
            console.error("Payment Error:", error);
            alert("Erreur : " + error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-12 h-12 animate-spin text-[#D4AF37]" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between mb-10">
                    <Link href={`/logements/${booking.item_id}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold uppercase tracking-widest text-[10px]">
                        <ArrowLeft className="w-4 h-4" /> Annuler et retourner
                    </Link>
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <ShieldCheck className="w-4 h-4" /> Checkout Sécurisé HOLA
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Left: Summary */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">
                                Finalisez votre <br /> <span className="text-[#D4AF37]">Réservation</span>
                            </h1>
                            <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
                                Choisissez votre mode de paiement préféré pour confirmer votre séjour.
                            </p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 -z-0 opacity-50" />

                            <div className="relative z-10">
                                <div className="flex gap-6 mb-8 pb-8 border-b border-slate-100">
                                    <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg shrink-0">
                                        <img src={booking.metadata?.image || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750'} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 mb-2 truncate uppercase">{booking.metadata?.title || 'Résidence de luxe'}</h2>
                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-3">
                                            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {booking.metadata?.location || 'Sénégal'}
                                        </p>
                                        <div className="flex gap-4">
                                            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                                                    {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-slate-500 font-medium">
                                        <span className="text-xs uppercase tracking-widest font-black">Sous-total</span>
                                        <span className="font-bold text-slate-900">{booking.amount.toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 font-medium">
                                        <span className="text-xs uppercase tracking-widest font-black">Frais de service HOLA</span>
                                        <span className="text-emerald-600 font-black">OFFERT</span>
                                    </div>
                                    <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                        <span className="text-lg font-black text-slate-900 uppercase tracking-tight">Total à payer</span>
                                        <span className="text-3xl font-black text-[#D4AF37]">{booking.amount.toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
                            <p className="text-xs text-amber-900 font-medium italic leading-relaxed">
                                Votre paiement est sécurisé par des protocoles bancaires de pointe.
                                HOLA Agency ne conserve jamais vos informations de carte bancaire.
                            </p>
                        </div>
                    </div>

                    {/* Right: Payment Methods */}
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-6">Modes de paiement locaux</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <PaymentMethod
                                    id="wave"
                                    title="Wave"
                                    description="Paiement Mobile Sénégal"
                                    image="/assets/payment/wave.webp"
                                    icon={Smartphone}
                                    color="sky"
                                    active={selectedMethod === 'wave'}
                                    onClick={setSelectedMethod}
                                />
                                <PaymentMethod
                                    id="orange"
                                    title="Orange Money"
                                    description="Paiement Mobile Sénégal"
                                    image="/assets/payment/orange_money.jpg"
                                    icon={Smartphone}
                                    color="orange"
                                    active={selectedMethod === 'orange'}
                                    onClick={setSelectedMethod}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-6">Paiement International</h2>
                            <div className="grid gap-4">
                                <PaymentMethod
                                    id="stripe"
                                    title="Carte Bancaire"
                                    description="VISA / Mastercard / AMEX"
                                    icon={CreditCard}
                                    color="indigo"
                                    active={selectedMethod === 'stripe'}
                                    onClick={setSelectedMethod}
                                />
                                <PaymentMethod
                                    id="paypal"
                                    title="PayPal"
                                    description="Portefeuille & Compte"
                                    image="/assets/payment/paypal.png"
                                    icon={Wallet}
                                    color="blue"
                                    active={selectedMethod === 'paypal'}
                                    onClick={setSelectedMethod}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full mt-8 py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-[12px] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Initialisation...
                                </>
                            ) : (
                                <>
                                    Procéder au paiement
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </>
                            )}
                        </button>

                        <div className="flex justify-center gap-8 pt-10 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                            {[
                                { name: 'wave', url: '/assets/payment/wave.webp' },
                                { name: 'orange', url: '/assets/payment/orange_money.jpg' },
                                { name: 'visa', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
                                { name: 'mastercard', url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
                                { name: 'paypal', url: '/assets/payment/paypal.png' }
                            ].map((logo) => (
                                <div key={logo.name} className="h-6">
                                    <img src={logo.url} alt={logo.name} className="h-full object-contain" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .border-orange-500 { border-color: #f97316; }
                .bg-orange-50\/50 { background-color: rgb(255 247 237 / 0.5); }
                .bg-orange-500 { background-color: #f97316; }
                .text-orange-600 { color: #ea580c; }
                
                .border-indigo-500 { border-color: #6366f1; }
                .bg-indigo-50\/50 { background-color: rgb(238 242 255 / 0.5); }
                .bg-indigo-500 { background-color: #6366f1; }
                .text-indigo-600 { color: #4f46e5; }

                .border-blue-500 { border-color: #3b82f6; }
                .bg-blue-50\/50 { background-color: rgb(239 246 255 / 0.5); }
                .bg-blue-500 { background-color: #3b82f6; }
                .text-blue-600 { color: #2563eb; }
            `}</style>
        </div >
    );
}
