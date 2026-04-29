import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Note: Dans une vraie app, on utiliserait process.env.PAYTECH_API_KEY
// Pour la démo, on utilise des placeholders
const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY || 'test_api_key';
const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET || 'test_api_secret';

export async function POST(req) {
    console.log("PayTech API Route hit");
    try {
        const { bookingId, amount, title, phoneNumber, accountHolder, paymentMethod } = await req.json();

        if (!bookingId || !amount) {
            return NextResponse.json({ success: false, error: "Données incomplètes." }, { status: 400 });
        }

        // 1. Mettre à jour les métadonnées de la réservation
        await supabase
            .from('bookings')
            .update({ 
                metadata: { 
                    phoneNumber, 
                    accountHolder, 
                    paymentMethod,
                    updated_at: new Date().toISOString() 
                } 
            })
            .eq('id', bookingId);

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const isLocal = siteUrl.includes('localhost');
        const callbackUrl = isLocal ? 'https://holaluxe.com/api/webhooks/paytech' : `${siteUrl}/api/webhooks/paytech`;
        const validSiteUrl = isLocal ? 'https://holaluxe.com' : siteUrl;

        // MODE REDIRECTION OPTIMISÉE (Bypass Menu + Bypass Personal Info)
        const paytechData = {
            item_name: title || "Séjour HOLA",
            item_price: amount,
            currency: "XOF",
            ref_command: bookingId,
            command_name: `Réservation HOLA #${bookingId.slice(0, 8)}`,
            env: process.env.PAYTECH_ENVIRONMENT === 'live' ? 'prod' : (process.env.PAYTECH_ENVIRONMENT || "test"),
            success_url: `${validSiteUrl}/dashboard/client/paiement/success?booking_id=${bookingId}`,
            ipn_url: callbackUrl,
            cancel_url: `${validSiteUrl}/dashboard/client/paiement/${bookingId}`,
            // Champs pour pré-remplir et sauter l'étape des infos personnelles chez PayTech
            customer_phone: phoneNumber.replace(/\s+/g, ''),
            customer_name: accountHolder,
            custom_field: JSON.stringify({ 
                booking_id: bookingId,
                customer_phone: phoneNumber,
                customer_name: accountHolder
            })
        };

        // Forcer le moyen de paiement pour sauter le menu de sélection
        if (paymentMethod === 'wave') {
            paytechData.target_payment = 'Wave';
        } else if (paymentMethod === 'orange') {
            paytechData.target_payment = 'Orange Money';
        }

        console.log("Calling PayTech (Optimized Redirect)...");
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
        console.log("PayTech Result:", result);

        if (result.success !== 1) {
            throw new Error(result.error || "Erreur de l'API PayTech.");
        }

        return NextResponse.json({
            success: true,
            redirect_url: result.redirect_url
        });

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
