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
                htmlText: getClientEmailTemplate({ clientName, amount, title, invoiceUrl })
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
                htmlText: getOwnerEmailTemplate({ ownerName, clientName, clientEmail, amount, title, ownerDashboardUrl })
            });
            console.log(`Payment email sent successfully to owner ${ownerEmail}`);
        } else {
            console.log("No owner email found to notify for booking", bookingId);
        }

    } catch (err) {
        console.error("Error sending payment confirmation email:", err);
    }
}

// ==========================================
// PREMIUM EMAIL TEMPLATES GENERATION HELPERS
// ==========================================

export function getClientEmailTemplate({ clientName, amount, title, invoiceUrl }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://holaluxe.com";
    const logoUrl = `${appUrl}/logo.svg`;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de paiement - HOLA AGENCY</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; width: 100% !important;">
  <div style="background-color: #f8fafc; padding: 40px 20px; min-height: 100%;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-top: 6px solid #D4AF37; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="text-align: center; padding: 32px 24px; background-color: #0f172a;">
        <div style="margin-bottom: 12px;">
          <img src="${logoUrl}" alt="Logo Hola Agency" style="height: 48px; width: auto; display: inline-block;" />
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">HOLA AGENCY</h1>
        <p style="color: #D4AF37; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 600;">Conciergerie de Luxe</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 40px 32px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">Bonjour ${clientName},</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Nous avons le plaisir de vous confirmer la bonne réception de votre paiement. Votre réservation est désormais entièrement validée et active pour votre séjour d'exception.</p>
        
        <!-- Details Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Détails de la Réservation</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Hébergement :</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; text-align: right;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Statut du Paiement :</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 700; text-align: right;">Payé / Confirmé</td>
            </tr>
            <tr>
              <td style="padding: 16px 0 0 0; color: #0f172a; font-weight: 700; font-size: 15px; border-top: 1px dashed #e2e8f0;">Montant Payé :</td>
              <td style="padding: 16px 0 0 0; color: #D4AF37; font-weight: 800; font-size: 18px; text-align: right; border-top: 1px dashed #e2e8f0;">${amount} FCFA</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">Votre facture acquittée est disponible et téléchargeable à tout moment depuis votre espace client.</p>
        
        <!-- CTA -->
        <div style="text-align: center; margin-bottom: 8px;">
          <a href="${invoiceUrl}" style="background-color: #0f172a; color: #ffffff; border: 2px solid #D4AF37; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; display: inline-block; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.15);">VOIR MA FACTURE</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 32px 24px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #64748b;">L'équipe HOLA AGENCY</p>
        <p style="margin: 0 0 4px 0;">Dakar, Sénégal | <a href="mailto:contact@holaluxe.com" style="color: #D4AF37; text-decoration: none; font-weight: 500;">contact@holaluxe.com</a></p>
        <p style="margin: 12px 0 0 0; font-size: 11px;">© 2026 Hola Agency. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
}

export function getOwnerEmailTemplate({ ownerName, clientName, clientEmail, amount, title, ownerDashboardUrl }) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://holaluxe.com";
    const logoUrl = `${appUrl}/logo.svg`;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paiement Reçu - HOLA AGENCY</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; width: 100% !important;">
  <div style="background-color: #f8fafc; padding: 40px 20px; min-height: 100%;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; border-top: 6px solid #0f172a; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      
      <!-- Header -->
      <div style="text-align: center; padding: 32px 24px; background-color: #0f172a;">
        <div style="margin-bottom: 12px;">
          <img src="${logoUrl}" alt="Logo Hola Agency" style="height: 48px; width: auto; display: inline-block;" />
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.2em; text-transform: uppercase;">HOLA AGENCY</h1>
        <p style="color: #D4AF37; margin: 6px 0 0 0; font-size: 11px; letter-spacing: 0.3em; text-transform: uppercase; font-weight: 600;">Partenaire Propriétaire</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 40px 32px;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px; font-weight: 700; border-bottom: 1px solid #f1f5f9; padding-bottom: 16px;">Bonjour ${ownerName},</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Excellente nouvelle ! Un paiement a été validé avec succès pour l'une de vos propriétés gérées par notre plateforme.</p>
        
        <!-- Details Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
          <h3 style="margin-top: 0; margin-bottom: 16px; color: #0f172a; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Détails de la Transaction</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Hébergement :</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; text-align: right;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Client :</td>
              <td style="padding: 8px 0; color: #0f172a; font-weight: 700; text-align: right;">${clientName} (${clientEmail || 'Non spécifié'})</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-weight: 500;">Statut :</td>
              <td style="padding: 8px 0; color: #10b981; font-weight: 700; text-align: right;">Confirmé / Payé</td>
            </tr>
            <tr>
              <td style="padding: 16px 0 0 0; color: #0f172a; font-weight: 700; font-size: 15px; border-top: 1px dashed #e2e8f0;">Revenus (Montant Payé) :</td>
              <td style="padding: 16px 0 0 0; color: #D4AF37; font-weight: 800; font-size: 18px; text-align: right; border-top: 1px dashed #e2e8f0;">${amount} FCFA</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">La réservation est désormais confirmée. Vous pouvez suivre l'état de vos réservations et vos versements depuis votre espace propriétaire.</p>
        
        <!-- CTA -->
        <div style="text-align: center; margin-bottom: 8px;">
          <a href="${ownerDashboardUrl}" style="background-color: #0f172a; color: #ffffff; border: 2px solid #D4AF37; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; display: inline-block; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.15);">ACCÉDER À MON ESPACE</a>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 32px 24px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.5;">
        <p style="margin: 0 0 8px 0; font-weight: 600; color: #64748b;">L'équipe HOLA AGENCY</p>
        <p style="margin: 0 0 4px 0;">Dakar, Sénégal | <a href="mailto:contact@holaluxe.com" style="color: #D4AF37; text-decoration: none; font-weight: 500;">contact@holaluxe.com</a></p>
        <p style="margin: 12px 0 0 0; font-size: 11px;">© 2026 Hola Agency. Tous droits réservés.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;
}


