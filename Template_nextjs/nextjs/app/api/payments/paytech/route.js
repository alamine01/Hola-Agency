import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Note: Dans une vraie app, on utiliserait process.env.PAYTECH_API_KEY
// Pour la démo, on utilise des placeholders
const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY || 'test_api_key';
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET || 'test_api_secret';

export async function POST(req) {
    console.log("PayTech API Route hit");
    try {
        const { bookingId, amount, title } = await req.json();

        if (!bookingId || !amount) {
            return NextResponse.json({ success: false, error: "Données incomplètes." }, { status: 400 });
        }

        if (!PAYTECH_API_KEY || PAYTECH_API_KEY === 'votre_cle_api_ici') {
            return NextResponse.json({
                success: false,
                error: "Clé PayTech non configurée. Remplacez 'votre_cle_api_ici' par votre clé API réelle dans .env.local (récupérable sur paytech.sn)."
            }, { status: 500 });
        }
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const isLocal = siteUrl.includes('localhost');
        const ipnUrl = isLocal ? 'https://holaluxe.com/api/webhooks/paytech' : `${siteUrl}/api/webhooks/paytech`;

        // Astuce : PayTech déteste le mot "localhost" (qui n'est pas un domaine valide pour eux).
        // Ils exigent aussi absolument "https://" pour les urls de redirection (succès/annulation).
        // On trompe la sécurité en envoyant le domaine holaluxe.com pour que le popup s'affiche en mode test.
        const validSiteUrl = isLocal ? 'https://holaluxe.com' : siteUrl;

        // PayTech attend souvent un format spécifique
        const paytechData = {
            item_name: title || "Séjour HOLA",
            item_price: amount,
            currency: "XOF",
            ref_command: bookingId,
            command_name: `Réservation HOLA #${bookingId.slice(0, 8)}`,
            env: process.env.PAYTECH_ENVIRONMENT === 'live' ? 'prod' : (process.env.PAYTECH_ENVIRONMENT || "test"), // 'test' ou 'prod' (PayTech n'accepte pas 'live')
            success_url: `${validSiteUrl}/dashboard/client/paiement/success`,
            ipn_url: ipnUrl,
            cancel_url: `${validSiteUrl}/dashboard/client/paiement/${bookingId}`,
            custom_field: JSON.stringify({ booking_id: bookingId })
        };

        // 3. Appel à l'API PayTech
        const response = await fetch('https://paytech.sn/api/payment/request-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'API_KEY': PAYTECH_API_KEY,
                'API_SECRET': PAYTECH_API_SECRET
            },
            body: JSON.stringify(paytechData)
        });
        const result = await response.json();

        if (result.success !== 1) {
            throw new Error("Erreur de l'API PayTech: " + JSON.stringify(result));
        }

        return NextResponse.json({
            success: true,
            redirect_url: result.redirect_url
        });

    } catch (error) {
        console.error("PayTech Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
