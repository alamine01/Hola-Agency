import { NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

export async function POST(req) {
    console.log("Stripe API Route hit");
    try {
        const { bookingId, amount, title } = await req.json();

        if (!STRIPE_SECRET_KEY || STRIPE_SECRET_KEY === 'sk_test_...') {
            return NextResponse.json({
                success: false,
                error: "Clé Stripe non configurée. Vous devez remplacer 'sk_test_...' par votre clé secrète réelle dans le fichier .env.local (récupérable sur dashboard.stripe.com/apikeys)."
            }, { status: 500 });
        }

        // Créer une session Stripe Checkout
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'mode': 'payment',
                'success_url': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
                'cancel_url': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/${bookingId}`,
                'line_items[0][price_data][currency]': 'xof',
                'line_items[0][price_data][product_data][name]': title || 'Réservation HOLA',
                'line_items[0][price_data][unit_amount]': Math.round(parseFloat(amount)).toString(),
                'line_items[0][quantity]': '1',
                'metadata[booking_id]': bookingId,
            }),
        });

        // 3. Lire la réponse
        const rawResponse = await response.text();
        console.log("Stripe Raw response:", rawResponse.slice(0, 100));

        let session;
        try {
            session = JSON.parse(rawResponse);
        } catch (e) {
            console.error("Stripe non-JSON error:", rawResponse);
            throw new Error("Réponse invalide de Stripe. Vérifiez vos clés et votre connexion.");
        }

        if (session.error) {
            console.error("Stripe Error Details:", session.error);
            throw new Error(session.error.message || "Erreur Stripe inconnue.");
        }

        return NextResponse.json({
            success: true,
            redirect_url: session.url,
            session_id: session.id
        });

    } catch (error) {
        console.error("Stripe Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
