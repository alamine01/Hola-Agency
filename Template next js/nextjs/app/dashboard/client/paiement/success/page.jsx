'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, ArrowRight, Loader2, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);
    const [booking, setBooking] = useState(null);

    const bookingId = searchParams.get('booking_id') || searchParams.get('ref_command'); // ref_command pour PayTech

    useEffect(() => {
        if (bookingId) {
            confirmPayment();
        }
    }, [bookingId]);

    const confirmPayment = async () => {
        try {
            const provider = searchParams.get('provider');
            const token = searchParams.get('token'); // PayPal order_id

            // 1. Si PayPal, capturer d'abord
            if (token && (provider === 'paypal' || !provider)) {
                const res = await fetch('/api/payments/paypal/capture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: token, bookingId })
                });
                const captureResult = await res.json();
                if (!captureResult.success) throw new Error(captureResult.error);
            }

            // 2. Mettre à jour la réservation
            const { data, error } = await supabase
                .from('bookings')
                .update({ status: 'payee' })
                .eq('id', bookingId)
                .select()
                .single();

            if (error) throw error;
            setBooking(data);

            // 3. Mettre à jour le paiement correspondant en "completed"
            await supabase
                .from('payments')
                .update({ status: 'completed' })
                .eq('booking_id', bookingId);

        } catch (error) {
            console.error("Confirmation Error:", error);
        } finally {
            setVerifying(false);
        }
    };

    if (verifying) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Vérification de votre paiement...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />

                <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-900/5 relative">
                    <CheckCircle2 className="w-12 h-12" />
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        className="absolute -top-2 -right-2 bg-amber-400 text-white p-2 rounded-full shadow-md"
                    >
                        <PartyPopper className="w-4 h-4" />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight uppercase leading-tight">
                    Paiement <br /> <span className="text-emerald-600">Confirmé !</span>
                </h1>

                <p className="text-slate-500 font-medium italic mb-10 leading-relaxed">
                    Félicitations ! Votre réservation pour <strong>{booking?.metadata?.title || 'votre séjour'}</strong> est maintenant confirmée.
                    Vous pouvez retrouver tous les détails dans votre espace client.
                </p>

                <div className="space-y-4">
                    <Link
                        href="/dashboard/client"
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
                    >
                        Accéder à mon tableau de bord <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/"
                        className="w-full py-4 bg-white text-slate-400 hover:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" /> Retour à l'accueil
                    </Link>
                </div>

                <p className="mt-10 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    Un reçu de paiement vous a été envoyé par email.
                </p>
            </motion.div>
        </div>
    );
}
