import { supabaseAdmin as supabase } from './supabase';

const rawBrevoKey = process.env.BREVO_API_KEY || '';
const BREVO_API_KEY = rawBrevoKey.trim().replace(/^["']|["']$/g, '');

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

        // 1. Fetch Client Email (with highest priority from Auth.users)
        if (!clientEmail && booking?.user_id) {
            try {
                const { data: authUser } = await supabase.auth.admin.getUserById(booking.user_id);
                if (authUser?.user?.email) {
                    clientEmail = authUser.user.email;
                    clientName = authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.display_name || clientName;
                }
            } catch (authErr) {
                console.error("Failed to fetch client email from auth admin API:", authErr);
            }

            // Fallback 1: profiles table
            if (!clientEmail) {
                const { data: profile } = await supabase.from('profiles').select('email, display_name').eq('id', booking.user_id).maybeSingle();
                if (profile?.email) {
                    clientEmail = profile.email;
                    clientName = profile.display_name || clientName;
                }
            }

            // Fallback 2: users table
            if (!clientEmail) {
                const { data: user } = await supabase.from('users').select('email, prenom').eq('id', booking.user_id).maybeSingle();
                if (user?.email) {
                    clientEmail = user.email;
                    clientName = user.prenom || clientName;
                }
            }
        }

        // 2. Fetch Owner/Provider Email (to notify them of payment)
        let ownerEmail = null;
        let ownerName = "Partenaire";
        if (booking?.owner_id) {
            try {
                const { data: authOwner } = await supabase.auth.admin.getUserById(booking.owner_id);
                if (authOwner?.user?.email) {
                    ownerEmail = authOwner.user.email;
                    ownerName = authOwner.user.user_metadata?.full_name || authOwner.user.user_metadata?.display_name || ownerName;
                }
            } catch (authErr) {
                console.error("Failed to fetch owner email from auth admin API:", authErr);
            }

            // Fallback 1: profiles table
            if (!ownerEmail) {
                const { data: profile } = await supabase.from('profiles').select('email, display_name').eq('id', booking.owner_id).maybeSingle();
                if (profile?.email) {
                    ownerEmail = profile.email;
                    ownerName = profile.display_name || ownerName;
                }
            }

            // Fallback 2: users table
            if (!ownerEmail) {
                const { data: user } = await supabase.from('users').select('email, prenom, nom').eq('id', booking.owner_id).maybeSingle();
                if (user?.email) {
                    ownerEmail = user.email;
                    ownerName = `${user.prenom || ''} ${user.nom || ''}`.trim() || ownerName;
                }
            }
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://holaluxe.com";
        const invoiceUrl = `${appUrl}/dashboard/client/factures`;
        const ownerDashboardUrl = `${appUrl}/dashboard/proprietaire/reservations`;

        // 3. Send confirmation email to CLIENT
        if (clientEmail) {
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
            console.log(`Payment email sent successfully to client ${clientEmail}`);
        } else {
            console.log("Cannot send payment email: no email found for client booking", bookingId);
        }

        // 4. Send payment notification email to OWNER/PROVIDER
        if (ownerEmail) {
            await sendEmail({
                to: ownerEmail,
                subject: "Paiement Reçu - Nouvelle réservation confirmée ! - HOLA AGENCY",
                htmlText: `
                    <h2>Bonjour ${ownerName},</h2>
                    <p>Bonne nouvelle ! Le paiement de <strong>${amount} FCFA</strong> a été effectué avec succès par le client <strong>${clientName}</strong> (${clientEmail || ''}) pour le logement <strong>${title}</strong>.</p>
                    <p>La réservation est désormais <strong>confirmée</strong> et active.</p>
                    <p>Vous pouvez gérer cette réservation et voir les détails depuis votre espace propriétaire :</p>
                    <p><a href="${ownerDashboardUrl}" style="display:inline-block; padding:10px 20px; background-color:#1e293b; color:#ffffff; text-decoration:none; border-radius:8px;">Accéder à mes réservations</a></p>
                    <br/>
                    <p>L'équipe HOLA AGENCY</p>
                `
            });
            console.log(`Payment email sent successfully to owner ${ownerEmail}`);
        } else {
            console.log("No owner email found to notify for booking", bookingId);
        }

    } catch (err) {
        console.error("Error sending payment confirmation email:", err);
    }
}

