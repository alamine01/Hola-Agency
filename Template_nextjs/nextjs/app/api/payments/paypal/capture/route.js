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
        const { orderId, bookingId, clientEmail, clientName, amount, title } = await req.json();

        if (!orderId) throw new Error("ID de commande PayPal manquant.");

        // Appel à l'API PayPal pour capturer réellement les fonds
        const accessToken = await getAccessToken();
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
                amount: amount || 10000, // Dummy amount
                provider: 'paypal',
                provider_id: orderId || 'TEST_PAYPAL_ORDER',
                status: 'completed'
            });

            await sendPaymentConfirmation(bookingId, { clientEmail, clientName, amount, title });
            return NextResponse.json({ success: true, capture_id: capture.purchase_units?.[0]?.payments?.captures?.[0]?.id });
        } else {
            console.error("Échec de capture PayPal:", capture);
            throw new Error(capture.message || "Le paiement PayPal n'a pas pu être complété.");
        }

    } catch (error) {
        console.error("PayPal Capture Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
