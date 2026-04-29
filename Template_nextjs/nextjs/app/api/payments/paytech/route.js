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

        // MODE SEAMLESS (Intech API) - Tentative finale avec structure corrigée
        if (paymentMethod === 'wave' || paymentMethod === 'orange') {
            const codeService = paymentMethod === 'wave' ? 'WAVE_SN_API_CASH_IN' : 'ORANGE_SN_API_CASH_IN';
            
            // Formatage du numéro : Intech API CashIn exige souvent le 221
            let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/\+/g, '');
            if (!formattedPhone.startsWith('221')) {
                formattedPhone = '221' + formattedPhone;
            }

            const intechData = {
                apiKey: PAYTECH_API_KEY,
                phone: formattedPhone,
                amount: parseInt(amount),
                codeService: codeService,
                externalTransactionId: bookingId.replace(/-/g, '').slice(0, 20),
                callbackUrl: callbackUrl,
                data: {} // Objet vide (important: pas de stringify ici car fetch le fera pour tout le body)
            };

            console.log("Initiating Seamless Payment with Intech...");
            
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
                    deepLinkUrl: result.data.deepLinkUrl || result.data.authLinkUrl || null,
                    message: "Paiement initié. Veuillez confirmer sur votre téléphone."
                });
            }
            // Si Intech échoue encore, on ne bloque pas, on prévient et on pourra voir le message
            console.warn("Intech Seamless failed, falling back to Redirect:", result.msg);
        }

        // MODE REDIRECTION (Standard) - Avec tous les champs possibles pour pré-remplir
        const validSiteUrl = isLocal ? 'https://holaluxe.com' : siteUrl;
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
            
            // Tentative massive de pré-remplissage pour forcer le saut de l'écran
            customer_phone: phoneNumber.replace(/\s+/g, ''),
            customer_phone_number: phoneNumber.replace(/\s+/g, ''),
            customer_name: accountHolder,
            customer_firstname: accountHolder.split(' ')[0],
            customer_lastname: accountHolder.split(' ').slice(1).join(' ') || "HOLA",
            
            custom_field: JSON.stringify({ booking_id: bookingId }),
            target_payment: paymentMethod === 'wave' ? 'Wave' : (paymentMethod === 'orange' ? 'Orange Money' : null)
        };

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
        if (result.success !== 1) throw new Error(result.error || "Erreur PayTech");

        return NextResponse.json({
            success: true,
            redirect_url: result.redirect_url
        });

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
