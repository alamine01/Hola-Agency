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
        
        // MODE 100% SEAMLESS (Intech API) - Uniquement Wave et Orange Money
        if (paymentMethod === 'wave' || paymentMethod === 'orange') {
            const codeService = paymentMethod === 'wave' ? 'WAVE_SN_API_CASH_IN' : 'ORANGE_SN_API_CASH_IN';
            
            // Formatage du numéro : Intech API CashIn exige le 221
            let formattedPhone = phoneNumber.replace(/\s+/g, '').replace(/\+/g, '');
            if (!formattedPhone.startsWith('221')) {
                formattedPhone = '221' + formattedPhone;
            }

            const intechData = {
                apiKey: PAYTECH_API_KEY,
                phone: formattedPhone,
                amount: Math.round(Number(amount)),
                codeService: codeService,
                externalTransactionId: bookingId.replace(/-/g, '').slice(0, 20),
                callbackUrl: callbackUrl,
                data: {} 
            };

            console.log("Calling Intech API (100% Seamless)...");
            const response = await fetch('https://api.intech.sn/api-services/operation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(intechData)
            });

            const result = await response.json();
            console.log("Intech API Result:", result);

            if (result.code === 2000) {
                return NextResponse.json({
                    success: true,
                    seamless: true,
                    status: result.data.status,
                    transactionId: result.data.transactionId,
                    deepLinkUrl: result.data.deepLinkUrl || result.data.authLinkUrl || null,
                    message: "Paiement initié. Veuillez confirmer sur votre téléphone."
                });
            } else {
                // On renvoie l'erreur directe de l'API pour débugger
                return NextResponse.json({ 
                    success: false, 
                    error: result.msg || "Le paiement direct a échoué. Vérifiez vos paramètres Intech." 
                }, { status: 400 });
            }
        }

        // Cas par défaut : Redirection pour les autres moyens (Carte, etc.) si nécessaire
        return NextResponse.json({ 
            success: false, 
            error: "Méthode de paiement non supportée en mode direct." 
        }, { status: 400 });

    } catch (error) {
        console.error("Payment API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
