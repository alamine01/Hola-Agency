import { NextResponse } from 'next/server';
import { sendPaymentConfirmation } from '@/lib/brevo';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get('bookingId');

        if (!bookingId) {
            return NextResponse.json({ error: "Missing bookingId parameter" }, { status: 400 });
        }

        console.log("Running manual test of sendPaymentConfirmation for bookingId:", bookingId);
        
        // Let's also check if we can fetch the booking first
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .maybeSingle();

        if (bookingError) {
            return NextResponse.json({ 
                error: "Failed to fetch booking from database", 
                details: bookingError.message 
            }, { status: 500 });
        }

        if (!booking) {
            return NextResponse.json({ 
                error: "Booking not found in database", 
                bookingId 
            }, { status: 404 });
        }

        // Run the email confirmation function
        await sendPaymentConfirmation(bookingId);

        return NextResponse.json({ 
            success: true, 
            message: "sendPaymentConfirmation completed execution. Check your Vercel logs and emails.",
            booking 
        });

    } catch (error) {
        console.error("Test Email API Error:", error);
        return NextResponse.json({ 
            error: error.message, 
            stack: error.stack 
        }, { status: 500 });
    }
}
