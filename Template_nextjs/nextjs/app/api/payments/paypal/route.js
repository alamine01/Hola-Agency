import { NextResponse } from 'next/server';

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
        const { bookingId, amount, title } = await req.json();

        if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'votre_client_id_ici' || !PAYPAL_SECRET || PAYPAL_SECRET === 'votre_secret_ici') {
            return NextResponse.json({
                success: false,
                error: "Clés PayPal non configurées. Vous devez remplacer les valeurs par défaut par vos identifiants réels dans .env.local (récupérables sur developer.paypal.com)."
            }, { status: 500 });
        }

        const accessToken = await getAccessToken();

        // Convertir FCFA en EUR pour PayPal (taux approximatif)
        const amountEUR = (amount / 655.957).toFixed(2);

        const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: bookingId,
                    description: title || 'Réservation HOLA',
                    amount: {
                        currency_code: 'EUR',
                        value: amountEUR,
                    },
                }],
                application_context: {
                    brand_name: 'HOLA Agency',
                    locale: 'fr-FR',
                    landing_page: 'LOGIN',
                    user_action: 'PAY_NOW',
                    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/success?provider=paypal&booking_id=${bookingId}`,
                    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/${bookingId}`,
                },
            }),
        });

        const order = await response.json();

        if (order.error) {
            throw new Error(order.error_description || order.message);
        }

        // Trouver l'URL d'approbation
        const approveLink = order.links?.find(l => l.rel === 'approve');

        return NextResponse.json({
            success: true,
            redirect_url: approveLink?.href,
            order_id: order.id
        });

    } catch (error) {
        console.error("PayPal Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
