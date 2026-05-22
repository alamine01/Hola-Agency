import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/brevo';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get('bookingId');

        if (!bookingId) {
            return NextResponse.json({ error: "Missing bookingId parameter" }, { status: 400 });
        }

        console.log("Running manual test of sendPaymentConfirmation for bookingId:", bookingId);
        
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .maybeSingle();

        if (bookingError) {
            return NextResponse.json({ error: "Failed to fetch booking from database", details: bookingError.message }, { status: 500 });
        }

        if (!booking) {
            return NextResponse.json({ error: "Booking not found in database", bookingId }, { status: 404 });
        }

        let clientEmail = null;
        let clientName = "Cher client";
        let clientSource = "none";
        let clientAuthDetails = null;
        let clientProfileDetails = null;
        let clientUserDetails = null;

        // 1. Fetch Client Email
        if (booking.user_id) {
            try {
                const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(booking.user_id);
                clientAuthDetails = { data: authUser, error: authErr?.message };
                if (authUser?.user?.email) {
                    clientEmail = authUser.user.email;
                    clientName = authUser.user.user_metadata?.full_name || authUser.user.user_metadata?.display_name || clientName;
                    clientSource = "auth_admin";
                }
            } catch (err) {
                clientAuthDetails = { error: err.message };
            }

            if (!clientEmail) {
                try {
                    const { data: profile, error: profErr } = await supabase.from('profiles').select('email, display_name').eq('id', booking.user_id).maybeSingle();
                    clientProfileDetails = { data: profile, error: profErr?.message };
                    if (profile?.email) {
                        clientEmail = profile.email;
                        clientName = profile.display_name || clientName;
                        clientSource = "profiles_table";
                    }
                } catch (err) {
                    clientProfileDetails = { error: err.message };
                }
            }

            if (!clientEmail) {
                try {
                    const { data: user, error: userErr } = await supabase.from('users').select('email, prenom').eq('id', booking.user_id).maybeSingle();
                    clientUserDetails = { data: user, error: userErr?.message };
                    if (user?.email) {
                        clientEmail = user.email;
                        clientName = user.prenom || clientName;
                        clientSource = "users_table";
                    }
                } catch (err) {
                    clientUserDetails = { error: err.message };
                }
            }
        }

        // 2. Fetch Owner Email
        let ownerEmail = null;
        let ownerName = "Partenaire";
        let ownerSource = "none";
        let ownerAuthDetails = null;
        let ownerProfileDetails = null;
        let ownerUserDetails = null;

        if (booking.owner_id) {
            try {
                const { data: authOwner, error: authErr } = await supabase.auth.admin.getUserById(booking.owner_id);
                ownerAuthDetails = { data: authOwner, error: authErr?.message };
                if (authOwner?.user?.email) {
                    ownerEmail = authOwner.user.email;
                    ownerName = authOwner.user.user_metadata?.full_name || authOwner.user.user_metadata?.display_name || ownerName;
                    ownerSource = "auth_admin";
                }
            } catch (err) {
                ownerAuthDetails = { error: err.message };
            }

            if (!ownerEmail) {
                try {
                    const { data: profile, error: profErr } = await supabase.from('profiles').select('email, display_name').eq('id', booking.owner_id).maybeSingle();
                    ownerProfileDetails = { data: profile, error: profErr?.message };
                    if (profile?.email) {
                        ownerEmail = profile.email;
                        ownerName = profile.display_name || ownerName;
                        ownerSource = "profiles_table";
                    }
                } catch (err) {
                    ownerProfileDetails = { error: err.message };
                }
            }

            if (!ownerEmail) {
                try {
                    const { data: user, error: userErr } = await supabase.from('users').select('email, prenom, nom').eq('id', booking.owner_id).maybeSingle();
                    ownerUserDetails = { data: user, error: userErr?.message };
                    if (user?.email) {
                        ownerEmail = user.email;
                        ownerName = `${user.prenom || ''} ${user.nom || ''}`.trim() || ownerName;
                        ownerSource = "users_table";
                    }
                } catch (err) {
                    ownerUserDetails = { error: err.message };
                }
            }
        }

        const BREVO_KEY_EXISTS = !!process.env.BREVO_API_KEY;
        const BREVO_KEY_LENGTH = process.env.BREVO_API_KEY ? process.env.BREVO_API_KEY.length : 0;

        let clientEmailResult = null;
        let ownerEmailResult = null;

        if (clientEmail) {
            try {
                clientEmailResult = await sendEmail({
                    to: clientEmail,
                    subject: "[TEST-DIAGNOSTIC] Confirmation de paiement - HOLA AGENCY",
                    htmlText: `<h3>Ceci est un e-mail de diagnostic technique.</h3><p>Paiement reçu pour la réservation ${booking.metadata?.title || 'du logement'}.</p>`
                });
            } catch (err) {
                clientEmailResult = { error: err.message };
            }
        }

        if (ownerEmail) {
            try {
                ownerEmailResult = await sendEmail({
                    to: ownerEmail,
                    subject: "[TEST-DIAGNOSTIC] Notification Propriétaire - HOLA AGENCY",
                    htmlText: `<h3>Ceci est un e-mail de diagnostic technique pour le propriétaire.</h3><p>Paiement reçu pour la réservation ${booking.metadata?.title || 'du logement'}.</p>`
                });
            } catch (err) {
                ownerEmailResult = { error: err.message };
            }
        }

        return NextResponse.json({
            success: true,
            bookingId,
            env: {
                BREVO_KEY_EXISTS,
                BREVO_KEY_LENGTH,
                supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                supabaseServiceKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
                supabaseServiceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0
            },
            client: {
                userId: booking.user_id,
                resolvedEmail: clientEmail,
                resolvedName: clientName,
                source: clientSource,
                authDetails: clientAuthDetails,
                profileDetails: clientProfileDetails,
                userDetails: clientUserDetails,
                emailSendResult: clientEmailResult
            },
            owner: {
                ownerId: booking.owner_id,
                resolvedEmail: ownerEmail,
                resolvedName: ownerName,
                source: ownerSource,
                authDetails: ownerAuthDetails,
                profileDetails: ownerProfileDetails,
                userDetails: ownerUserDetails,
                emailSendResult: ownerEmailResult
            }
        });

    } catch (error) {
        console.error("Test Email API Error:", error);
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
