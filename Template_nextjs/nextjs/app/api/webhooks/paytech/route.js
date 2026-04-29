import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendPaymentConfirmation } from '@/lib/brevo';

export async function POST(req) {
    try {
        let bookingId = null;
        let isSuccess = false;

        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            // Format Intech API (Seamless)
            const json = await req.json();
            console.log("Webhook JSON received:", json);
            bookingId = json.externalTransactionId;
            isSuccess = json.status === 'SUCCESS';
        } else {
            // Format PayTech (Redirection)
            const formData = await req.formData();
            console.log("Webhook Form Data received");
            const type_event = formData.get('type_event');
            const custom_field = formData.get('custom_field');

            if (type_event === 'sale_complete' && custom_field) {
                const { booking_id } = JSON.parse(custom_field);
                bookingId = booking_id;
                isSuccess = true;
            }
        }

        if (isSuccess && bookingId) {
            // 1. Mettre à jour la réservation
            await supabase
                .from('bookings')
                .update({ status: 'payee' })
                .eq('id', bookingId);

            // 2. Mettre à jour le paiement (si la table existe)
            try {
                await supabase
                    .from('payments')
                    .update({ status: 'completed' })
                    .eq('booking_id', bookingId);
            } catch (e) {
                console.log("Note: Table 'payments' not found or update failed.");
            }

            console.log(`Webhook Success: Booking ${bookingId} marked as paid.`);

            // 3. Envoyer l'email de confirmation
            try {
                await sendPaymentConfirmation(bookingId);
            } catch (e) {
                console.error("Error sending confirmation email:", e);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
