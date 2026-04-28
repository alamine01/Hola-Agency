import { supabase } from './supabase';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

export async function sendEmail({ to, subject, htmlText }) {
    if (!BREVO_API_KEY) {
        console.warn("BREVO_API_KEY is not defined. Email will not be sent.");
        return null;
    }

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": BREVO_API_KEY,
                "content-type": "application/json"
            },
            body: JSON.stringify({
                sender: { name: "Hola Agency", email: "contact@holaluxe.com" },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlText,
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error("Brevo Email Sending Error:", errBody);
            throw new Error(`Failed to send email: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Brevo utility error:", error);
        throw error;
    }
}

export async function sendPaymentConfirmation(bookingId, fallbackData = null) {
    if (!bookingId && !fallbackData) return;
    try {
        const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).maybeSingle();

        let clientEmail = fallbackData?.clientEmail || null;
        let clientName = fallbackData?.clientName || "Cher client";
        const amount = fallbackData?.amount || booking?.amount || '---';
        const title = fallbackData?.title || booking?.metadata?.title || 'du logement';

        if (!clientEmail && booking?.user_id) {
            const { data: profile } = await supabase.from('profiles').select('email, display_name').eq('id', booking.user_id).maybeSingle();
            if (profile?.email) {
                clientEmail = profile.email;
                clientName = profile.display_name || clientName;
            }

            if (!clientEmail) {
                const { data: user } = await supabase.from('users').select('email, prenom').eq('id', booking.user_id).maybeSingle();
                if (user?.email) {
                    clientEmail = user.email;
                    clientName = user.prenom || clientName;
                }
            }
        }

        if (!clientEmail) {
            console.log("Cannot send payment email: no email found for booking", bookingId);
            return;
        }

        const invoiceUrl = `http://localhost:3000/dashboard/client/factures`;

        await sendEmail({
            to: clientEmail,
            subject: "Confirmation de paiement & Facture - HOLA AGENCY",
            htmlText: `
                <h2>Bonjour ${clientName},</h2>
                <p>Nous vous confirmons la réception de votre paiement de <strong>${amount} FCFA</strong> pour la réservation <strong>${title}</strong>.</p>
                <p>Votre réservation est désormais <strong>confirmée</strong>.</p>
                <p>Vous pouvez consulter et télécharger votre facture complète depuis votre espace client :</p>
                <p><a href="${invoiceUrl}" style="display:inline-block; padding:10px 20px; background-color:#1e293b; color:#ffffff; text-decoration:none; border-radius:8px;">Voir ma facture</a></p>
                <br/>
                <p>L'équipe HOLA AGENCY</p>
            `
        });
        console.log(`Payment email sent successfully to ${clientEmail}`);
    } catch (err) {
        console.error("Error sending payment confirmation email:", err);
    }
}

