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
        const { data: currentBooking } = await supabase.from('bookings').select('metadata').eq('id', bookingId).single();
        const currentMeta = currentBooking?.metadata || {};

        await supabase
            .from('bookings')
            .update({ 
                metadata: { 
                    ...currentMeta,
                    phoneNumber, 
                    accountHolder, 
                    payment_method: paymentMethod === 'wave' ? 'Wave' : (paymentMethod === 'orange' ? 'Orange Money' : paymentMethod),
                    updated_at: new Date().toISOString() 
                } 
            })
            .eq('id', bookingId);

        const requestOrigin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.holaluxe.com';
        const isLocal = requestOrigin.includes('localhost');
        const validSiteUrl = isLocal ? 'http://localhost:3000' : requestOrigin;
        const callbackUrl = `${validSiteUrl}/api/webhooks/paytech`;
        
        // TENTATIVE DE MODE 100% DIRECT (Intech API)
        if (paymentMethod === 'wave' || paymentMethod === 'orange') {
            const codeService = paymentMethod === 'wave' ? 'WAVE_SN_API_CASH_IN' : 'ORANGE_SN_API_CASH_IN';
            
            // Format 9 chiffres strict pour Intech (ex: 774155121)
            let cleanPhone = phoneNumber.replace(/\s+/g, '').replace(/\+/g, '');
            if (cleanPhone.startsWith('221')) cleanPhone = cleanPhone.substring(3);

            const intechData = {
                apiKey: PAYTECH_API_KEY,
                service: codeService,
                phoneNumber: cleanPhone,
                amount: Math.round(Number(amount)),
                externalId: bookingId,
                callbackUrl: callbackUrl,
                data: "{}"
            };

            console.log("Calling Intech API Seamless (9-digit phone)...");
            const response = await fetch('https://api.intech.sn/api-services/operation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(intechData)
            });

            const result = await response.json();
            console.log("Intech Result:", result);

            if (result.code === 2000) {
                return NextResponse.json({
                    success: true,
                    seamless: true,
                    status: result.data.status,
                    transactionId: result.data.transactionId,
                    deepLinkUrl: result.data.deepLinkUrl || result.data.authLinkUrl || null
                });
            }
            // Si Intech échoue, on continue vers la redirection auto-submit en fallback
            console.warn("Intech failed, using pre-filled redirect fallback.");
        }

        // MODE REDIRECTION AVEC AUTO-FILL (Fallback si Seamless échoue)
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
            target_payment: paymentMethod === 'wave' ? 'Wave' : (paymentMethod === 'orange' ? 'Orange Money' : null),
            custom_field: JSON.stringify({ booking_id: bookingId })
        };

        const paytechRes = await fetch('https://paytech.sn/api/payment/request-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'API_KEY': PAYTECH_API_KEY,
                'API_SECRET': PAYTECH_API_SECRET
            },
            body: JSON.stringify(paytechData)
        });

        const paytechResult = await paytechRes.json();
        if (paytechResult.success !== 1) throw new Error(paytechResult.error || "Erreur PayTech");

        let finalRedirectUrl = paytechResult.redirect_url;
        const cleanPhoneRaw = phoneNumber.replace(/\s+/g, '').replace(/\+/g, '');
        const phoneNoPrefix = cleanPhoneRaw.startsWith('221') ? cleanPhoneRaw.substring(3) : cleanPhoneRaw;

        const autoSubmitParams = new URLSearchParams({
            'pn': cleanPhoneRaw.startsWith('221') ? `+${cleanPhoneRaw}` : `+221${cleanPhoneRaw}`,
            'nn': phoneNoPrefix,
            'fn': accountHolder || "Client",
            'tp': paymentMethod === 'wave' ? 'Wave' : 'Orange Money',
            'nac': '1'
        });

        return NextResponse.json({
            success: true,
            redirect_url: finalRedirectUrl + '?' + autoSubmitParams.toString()
        });

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
