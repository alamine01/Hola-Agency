import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Note: Dans une vraie app, on utiliserait process.env.PAYTECH_API_KEY
// Pour la démo, on utilise des placeholders
const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY || 'test_api_key';
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET || 'test_api_secret';

export async function POST(req) {
    console.log("PayTech API Route hit");
    try {
        const { bookingId } = await req.json();

        // 1. Récupérer les détails de la réservation
        const { data: booking, error: bError } = await supabase
            .from('bookings')
            .select('*, profiles(id, display_name, email)')
            .eq('id', bookingId)
            .single();

        if (!PAYTECH_API_KEY || PAYTECH_API_KEY === 'votre_cle_api_ici') {
            return NextResponse.json({
                success: false,
                error: "Clé PayTech non configurée. Remplacez 'votre_cle_api_ici' par votre clé API réelle dans .env.local (récupérable sur paytech.sn)."
            }, { status: 500 });
        }
        // PayTech attend souvent un format spécifique
        const paytechData = {
            item_name: booking.metadata?.title || "Séjour HOLA",
            item_price: booking.amount,
            currency: "XOF",
            ref_command: booking.id,
            command_name: `Réservation HOLA #${booking.id.slice(0, 8)}`,
            env: process.env.PAYTECH_ENVIRONMENT || "test", // 'test' ou 'live'
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/success`,
            ipn_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/paytech`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/client/paiement/${booking.id}`,
            custom_field: JSON.stringify({ booking_id: booking.id })
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
