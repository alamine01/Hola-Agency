import { supabase } from '@/lib/supabase';

/**
 * Vérifie la disponibilité d'une villa pour les dates demandées.
 * Empêche les doublons de réservation avec un jour de battement après le départ.
 *
 * @param {string} itemId - L'ID de la villa à vérifier
 * @param {string} startDate - Date d'arrivée souhaitée (format YYYY-MM-DD)
 * @param {string} endDate - Date de départ souhaitée (format YYYY-MM-DD)
 * @returns {{ available: boolean, conflictingBooking: object|null }}
 */
export async function checkVillaAvailability(itemId, startDate, endDate) {
    const requestedStart = new Date(startDate);
    const requestedEnd = new Date(endDate);

    // Récupérer toutes les réservations actives pour cette villa
    const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('id, start_date, end_date, status, metadata')
        .eq('item_id', itemId)
        .in('status', ['en_attente_paiement', 'confirmee', 'payee']);

    if (error) {
        console.error('Erreur vérification disponibilité:', error);
        throw error;
    }

    for (const booking of (existingBookings || [])) {
        if (!booking.start_date || !booking.end_date) continue;

        const bStart = new Date(booking.start_date);
        const bEnd = new Date(booking.end_date);

        // Ajouter 1 jour de battement après le départ existant
        // Si le client A part le 15, le client B ne peut arriver qu'à partir du 16
        const bEndWithBuffer = new Date(bEnd);
        bEndWithBuffer.setDate(bEndWithBuffer.getDate() + 1);

        // Vérifier le chevauchement : les périodes se chevauchent si
        // la nouvelle arrivée est AVANT la fin (+ battement) de l'existante
        // ET le nouveau départ est APRÈS le début de l'existante
        if (requestedStart < bEndWithBuffer && requestedEnd > bStart) {
            return {
                available: false,
                conflictingBooking: booking
            };
        }
    }

    return { available: true, conflictingBooking: null };
}
