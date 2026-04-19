import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/brevo';
import { supabase } from '@/lib/supabase';

export async function POST(req) {
    try {
        const body = await req.json();
        const { clientEmail, clientName, ownerId, bookingDetails } = body;

        // 1. Send Email to Client
        if (clientEmail) {
            await sendEmail({
                to: clientEmail,
                subject: "Confirmation de votre réservation - HOLA AGENCY",
                htmlText: `
                    <h2>Bonjour ${clientName || 'Cher client'},</h2>
                    <p>Votre réservation pour <strong>${bookingDetails.title}</strong> a bien été enregistrée.</p>
                    <p><strong>Dates :</strong> du ${bookingDetails.startDate} au ${bookingDetails.endDate}</p>
                    <p><strong>Total :</strong> ${bookingDetails.amount} FCFA</p>
                    <p>Votre réservation est en attente de paiement. Vous pouvez finaliser le paiement depuis votre espace client.</p>
                    <br/>
                    <p>L'équipe HOLA AGENCY</p>
                `
            });
        }

        // 2. Try to fetch Owner details to notify Owner/Provider
        let ownerEmail = null;
        if (ownerId) {
            // First check public.users
            const { data: user } = await supabase.from('users').select('email, nom, prenom').eq('id', ownerId).maybeSingle();
            if (user && user.email) ownerEmail = user.email;

            // Fallback to profiles if needed
            if (!ownerEmail) {
                const { data: profile } = await supabase.from('profiles').select('email, display_name').eq('id', ownerId).maybeSingle();
                if (profile && profile.email) ownerEmail = profile.email;
            }
        }

        if (ownerEmail) {
            await sendEmail({
                to: ownerEmail,
                subject: "Nouvelle réservation sur votre logement - HOLA AGENCY",
                htmlText: `
                    <h2>Bonjour,</h2>
                    <p>Une nouvelle réservation vient d'être initiée sur votre bien <strong>${bookingDetails.title}</strong>.</p>
                    <p><strong>Client :</strong> ${clientName || 'Non précisé'}</p>
                    <p><strong>Dates :</strong> du ${bookingDetails.startDate} au ${bookingDetails.endDate}</p>
                    <p>Connectez-vous à votre tableau de bord pour plus de détails.</p>
                    <br/>
                    <p>L'équipe HOLA AGENCY</p>
                `
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Booking Email API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
