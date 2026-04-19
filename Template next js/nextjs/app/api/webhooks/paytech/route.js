import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendPaymentConfirmation } from '@/lib/brevo';

export async function POST(req) {
    try {
        const formData = await req.formData();

        // PayTech envoie les données en tant que Form Data (souvent)
        // Les champs sont : type_event (sale_complete), custom_field, api_key_sha256, etc.
        const type_event = formData.get('type_event');
        const custom_field = formData.get('custom_field');

        if (type_event === 'sale_complete' && custom_field) {
            const { booking_id } = JSON.parse(custom_field);

            if (booking_id) {
                // 1. Mettre à jour la réservation
                await supabase
                    .from('bookings')
                    .update({ status: 'payee' })
                    .eq('id', booking_id);

                // 2. Mettre à jour le paiement
                await supabase
                    .from('payments')
                    .update({ status: 'completed' })
                    .eq('booking_id', booking_id);

                console.log(`Webhook Success: Booking ${booking_id} marked as paid.`);

                // 3. Envoyer l'email de confirmation et de facture
                await sendPaymentConfirmation(booking_id);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PayTech Webhook Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
