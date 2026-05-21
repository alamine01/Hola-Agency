import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req) {
    console.log("Stripe API Route hit");
    try {
        const { bookingId, amount, title } = await req.json();

        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_...') {
            return NextResponse.json({
                success: false,
                error: "Clé Stripe non configurée. Vous devez remplacer 'sk_test_...' par votre clé secrète réelle dans le fichier .env.local."
            }, { status: 500 });
        }

        // Conversion de FCFA (XOF) en EUR pour que Stripe autorise PayPal
        // Taux de change fixe BCEAO : 1 EUR = 655.957 XOF
        const amountEUR = parseFloat(amount) / 655.957;
        // Stripe attend le montant en centimes pour l'euro
        const unitAmountCents = Math.round(amountEUR * 100);

        // Créer une session Stripe Checkout avec le SDK
        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/${bookingId}`,
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: title || 'Réservation HOLA',
                        },
                        unit_amount: unitAmountCents,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                booking_id: bookingId,
            },
        });

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
