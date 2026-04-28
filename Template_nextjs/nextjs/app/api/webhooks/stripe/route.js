import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendPaymentConfirmation } from '@/lib/brevo';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature || !STRIPE_WEBHOOK_SECRET) {
            console.error("Missing signature or webhook secret");
            return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
        }

        let event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const bookingId = session.metadata?.booking_id;

            if (bookingId) {
                // 1. Marquer la réservation comme payée
                const { error: bookingError } = await supabase
                    .from('bookings')
                    .update({ status: 'payee' })
                    .eq('id', bookingId);
                
                if (bookingError) throw bookingError;

                // 2. Créer ou mettre à jour l'entrée de paiement
                // On essaie d'abord de voir si une entrée existe pour ce booking
                const { data: existingPayment } = await supabase
                    .from('payments')
                    .select('id')
                    .eq('booking_id', bookingId)
                    .maybeSingle();

                if (existingPayment) {
                    await supabase
                        .from('payments')
                        .update({ 
                            status: 'completed', 
                            provider_id: session.id,
                            payment_method: 'stripe_card'
                        })
                        .eq('booking_id', bookingId);
                } else {
                    // Si pas de paiement existant (cas rare mais possible selon le flow), on en crée un
                    await supabase
                        .from('payments')
                        .insert({
                            booking_id: bookingId,
                            amount: session.amount_total / 100, // Stripe est en centimes
                            status: 'completed',
                            provider: 'stripe',
                            provider_id: session.id,
                            payment_method: 'stripe_card'
                        });
                }

                // 3. Récupérer la réservation pour notifier le propriétaire
                const { data: booking } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', bookingId)
                    .single();

                if (booking?.owner_id) {
                    await supabase.from('notifications').insert({
                        user_id: booking.owner_id,
                        title: "✅ Nouvelle réservation confirmée",
                        text: `Paiement reçu pour "${booking.metadata?.title || 'une réservation'}"`,
                        type: "reservation",
                        metadata: { booking_id: bookingId }
                    });
                }

                console.log(`Stripe Webhook: Booking ${bookingId} confirmed.`);
                
                // 4. Envoyer l'email de confirmation via Brevo
                await sendPaymentConfirmation(bookingId);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Stripe Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
