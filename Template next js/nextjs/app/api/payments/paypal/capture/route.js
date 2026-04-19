import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendPaymentConfirmation } from '@/lib/brevo';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_API = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const data = await response.json();
    return data.access_token;
}

export async function POST(req) {
    try {
        const { orderId, bookingId } = await req.json();

        if (!orderId) throw new Error("ID de commande PayPal manquant.");

        const accessToken = await getAccessToken();

        // Capturer le paiement
        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            }
        });

        const capture = await response.json();

        if (capture.status === 'COMPLETED') {
            // Mettre à jour la réservation
            await supabase
                .from('bookings')
                .update({ status: 'payee' })
                .eq('id', bookingId);

            // Créer l'enregistrement de paiement
            await supabase.from('payments').insert({
                booking_id: bookingId,
                amount: parseFloat(capture.purchase_units[0].payments.captures[0].amount.value),
                provider: 'paypal',
                provider_id: orderId,
                status: 'completed'
            });

            await sendPaymentConfirmation(bookingId);
            return NextResponse.json({ success: true });
        } else {
            throw new Error("Le paiement PayPal n'a pas pu être complété.");
        }

    } catch (error) {
        console.error("PayPal Capture Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
