import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendPaymentConfirmation } from '@/lib/brevo';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        // En production, vérifier la signature pour sécurité maximale:
        // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        // const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);

        const event = JSON.parse(body);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const bookingId = session.metadata?.booking_id;

            if (bookingId) {
                // Marquer la réservation comme payée
                await supabase
                    .from('bookings')
                    .update({ status: 'payee' })
                    .eq('id', bookingId);

                // Marquer le paiement comme complété
                await supabase
                    .from('payments')
                    .update({ status: 'completed', provider_id: session.id })
                    .eq('booking_id', bookingId);

                // Récupérer la réservation pour notifier le propriétaire
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
                await sendPaymentConfirmation(bookingId);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Stripe Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
