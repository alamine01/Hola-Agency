import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
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
            console.log("Webhook Form Data received:", Object.fromEntries(formData.entries()));
            
            const type_event = formData.get('type_event');
            const custom_field = formData.get('custom_field');
            const ref_command = formData.get('ref_command');

            if (type_event === 'sale_complete') {
                isSuccess = true;
                
                // 1. Try custom_field
                if (custom_field) {
                    try {
                        const parsed = JSON.parse(custom_field);
                        bookingId = parsed.booking_id || parsed.bookingId;
                    } catch (e) {
                        console.error("Failed to parse custom_field:", e);
                    }
                }
                
                // 2. Fallback to ref_command (highly reliable direct string)
                if (!bookingId && ref_command) {
                    bookingId = ref_command;
                }
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
