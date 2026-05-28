'use client';

import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    MapPin, Star, BedDouble, Users, ArrowLeft,
    Wifi, Car, Coffee, Shield, Calendar, ChevronRight, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { checkVillaAvailability } from '@/lib/checkAvailability';

// Mock function to get property by ID (simulating database call)
// Removed mock function as we now fetch from Supabase

export default function PropertyDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [existingBookings, setExistingBookings] = useState([]);
    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        guests: 1
    });

    useEffect(() => {
        const fetchProperty = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('villas')
                    .select('*')
                    .eq('id', id)
                    .single();
                
                if (error) throw error;
                setProperty(data);
            } catch (err) {
                console.error("Erreur chargement bien:", err);
            } finally {
                setLoading(false);
            }
        };

        const fetchBookings = async () => {
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('start_date, end_date, status')
                    .eq('item_id', id)
                    .in('status', ['en_attente_paiement', 'confirmee', 'payee']);
                if (!error && data) {
                    setExistingBookings(data);
                }
            } catch (err) {
                console.error("Erreur chargement réservations existantes:", err);
            }
        };

        fetchProperty();
        fetchBookings();
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, [id]);

    const isDateOccupied = (dateStr) => {
        if (!dateStr || existingBookings.length === 0) return false;
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0);

        for (const b of existingBookings) {
            if (!b.start_date || !b.end_date) continue;
            const start = new Date(b.start_date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(b.end_date);
            end.setHours(0, 0, 0, 0);

            // 1-day logistics buffer after departure
            const endWithBuffer = new Date(end);
            endWithBuffer.setDate(endWithBuffer.getDate() + 1);
            endWithBuffer.setHours(0, 0, 0, 0);

            if (targetDate >= start && targetDate < endWithBuffer) {
                return b;
            }
        }
        return false;
    };

    const calculateTotal = () => {
        if (!bookingData.startDate || !bookingData.endDate || !property) return 0;
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const activePrice = property.sale_price && property.sale_price > 0 ? property.sale_price : property.price;
        return nights > 0 ? nights * activePrice : 0;
    };

    const handleBooking = async () => {
        if (!user) {
            router.push(`/login?redirect=/logements/${id}`);
            return;
        }

        if (calculateTotal() <= 0) {
            alert("Veuillez sélectionner des dates valides.");
            return;
        }

        try {
            // Vérification des doublons de réservation (uniquement pour les villas)
            const { available, conflictingBooking } = await checkVillaAvailability(
                id,
                bookingData.startDate,
                bookingData.endDate
            );

            if (!available) {
                const depDate = conflictingBooking?.end_date
                    ? new Date(conflictingBooking.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'une date prochaine';
                alert(`Cette villa n'est pas disponible pour les dates sélectionnées.\n\nElle est déjà réservée jusqu'au ${depDate}. Vous pouvez réserver à partir du lendemain.`);
                return;
            }
            // Création de la réservation en attente de paiement
            const { data: booking, error } = await supabase
                .from('bookings')
                .insert({
                    user_id: user.id,
                    owner_id: "7670e62f-3ae3-4b0c-9d94-3d400df4228c", // À remplacer par property.owner_id quand dispo
                    item_id: id,
                    item_type: property.type,
                    start_date: bookingData.startDate,
                    end_date: bookingData.endDate,
                    amount: calculateTotal(),
                    status: 'en_attente_paiement',
                    metadata: {
                        title: property.title,
                        image: property.image,
                        location: property.location
                    }
                })
                .select()
                .single();

            if (error) throw error;

            // Envoi des emails de notification et de confirmation
            fetch('/api/emails/booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientEmail: user.email,
                    clientName: user.user_metadata?.full_name || user.email?.split('@')[0],
                    ownerId: "7670e62f-3ae3-4b0c-9d94-3d400df4228c", // À remplacer par property.owner_id
                    bookingDetails: {
                        title: property.title,
                        startDate: bookingData.startDate,
                        endDate: bookingData.endDate,
                        amount: calculateTotal()
                    }
                })
            }).catch(e => console.error("Email API init failed:", e));

            // Redirection vers la page de paiement
            router.push(`/dashboard/client/paiement/${booking.id}`);
        } catch (error) {
            console.error(error);
            alert("Erreur lors de la réservation : " + error.message);
        }
    };

    const handleContact = async () => {
        if (!user) {
            router.push(`/login?redirect=/logements/${id}`);
            return;
        }

        // Pour la démo, on utilise un ID fixe pour le propriétaire ou on simule
        // Dans une vraie app, property.owner_id viendrait de la DB
        const ownerId = "7670e62f-3ae3-4b0c-9d94-3d400df4228c"; // ID de démo

        // Chercher si une conversation existe déjà
        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .or(`and(participant_1.eq.${user.id},participant_2.eq.${ownerId}),and(participant_1.eq.${ownerId},participant_2.eq.${user.id})`)
            .maybeSingle();

        if (existing) {
            router.push(`/dashboard/client/messages?id=${existing.id}`);
        } else {
            const { data: newConv } = await supabase
                .from('conversations')
                .insert({
                    participant_1: user.id < ownerId ? user.id : ownerId,
                    participant_2: user.id < ownerId ? ownerId : user.id,
                    last_message_at: new Date()
                })
                .select()
                .single();

            if (newConv) {
                router.push(`/dashboard/client/messages?id=${newConv.id}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-4">Bien introuvable</h1>
                <Link href="/logements" className="text-indigo-600 font-bold hover:underline">Retourner au catalogue</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-24">
            <div className="container-hola">

                {/* Back Button */}
                <Link href="/logements" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Retour au catalogue
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Content: Image & Details */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 relative h-[300px] sm:h-[450px] lg:h-[550px] bg-slate-100"
                        >
                            <img 
                                src={property.image} 
                                alt={property.name} 
                                className="absolute inset-0 w-full h-full object-cover" 
                            />
                        </motion.div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">{property.name}</h1>
                            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-slate-800 font-bold self-start">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> {property.rating || 'Nouveau'}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-slate-500 mb-10 pb-10 border-b border-slate-200 overflow-x-auto custom-scrollbar whitespace-nowrap">
                            <div className="flex items-center gap-2 shrink-0">
                                <MapPin className="w-5 h-5 text-indigo-500" /> <span className="font-medium text-slate-900">{property.location}</span>
                            </div>
                             <div className="flex items-center gap-2 shrink-0">
                                <BedDouble className="w-5 h-5 text-slate-400" /> <span>{property.rooms || 1} Ch.</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Users className="w-5 h-5 text-slate-400" /> <span>{property.guests || 2} Voyageurs max</span>
                            </div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight">À propos de ce logement</h2>
                            <p className="text-slate-600 leading-relaxed text-lg">
                                {property.description}
                                <br /><br />
                                Situé dans un quartier calme et sécurisé, ce bien a été sélectionné par nos experts pour sa qualité exceptionnelle et son confort de haut niveau.
                            </p>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Ce que propose ce lieu</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                 {property.amenities?.map((amenity, idx) => (
                                    <div key={idx} className="flex items-center gap-3 text-slate-600 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <span className="font-medium">{amenity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-32">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-slate-100"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex flex-col">
                                        <div className="text-2xl font-black text-[#D4AF37]">
                                            {(property.sale_price && property.sale_price > 0 ? property.sale_price : property.price).toLocaleString()} FCFA 
                                            <span className="text-sm font-normal text-slate-400 tracking-normal ml-1">/nuit</span>
                                        </div>
                                        {property.sale_price && property.sale_price > 0 && (
                                            <div className="text-sm text-slate-400 line-through font-medium italic mt-1">
                                                {property.price.toLocaleString()} FCFA
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="grid grid-cols-2 gap-0 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                        <div className="p-4 border-r border-slate-200 bg-slate-50/30">
                                            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Arrivée</label>
                                            <input
                                                type="date"
                                                min={new Date().toISOString().split('T')[0]}
                                                className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer"
                                                value={bookingData.startDate}
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    const conflict = isDateOccupied(date);
                                                    if (conflict) {
                                                        const depDate = new Date(conflict.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                                                        alert(`Cette date d'arrivée n'est pas disponible.\nLa villa est déjà réservée. Elle se libère le ${depDate} (réservable dès le lendemain).`);
                                                        setBookingData(prev => ({ ...prev, startDate: '' }));
                                                    } else {
                                                        setBookingData(prev => ({ ...prev, startDate: date }));
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="p-4 bg-slate-50/30">
                                            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Départ</label>
                                            <input
                                                type="date"
                                                min={bookingData.startDate ? new Date(new Date(bookingData.startDate).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                                className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer"
                                                value={bookingData.endDate}
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    const conflict = isDateOccupied(date);
                                                    if (conflict) {
                                                        alert(`Cette date de départ n'est pas disponible car la villa est déjà occupée sur cette période.`);
                                                        setBookingData(prev => ({ ...prev, endDate: '' }));
                                                    } else {
                                                        setBookingData(prev => ({ ...prev, endDate: date }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-slate-50/30">
                                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Voyageurs</label>
                                        <select
                                            className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer h-6"
                                            onChange={(e) => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                                            value={bookingData.guests}
                                        >
                                            {[...Array(Math.max(10, parseInt(property.guests) || 1))].map((_, i) => (
                                                <option key={i} value={i + 1} className="text-slate-900 bg-white">
                                                    {i + 1} Voyageur{i > 0 ? 's' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {existingBookings.length > 0 && (
                                        <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100/50 mt-4">
                                            <label className="block text-[9px] uppercase font-black text-amber-600 tracking-widest mb-2 leading-none">Indisponible aux dates suivantes :</label>
                                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                                {existingBookings.map((b, idx) => {
                                                    const startStr = new Date(b.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                                                    const endStr = new Date(b.end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                                                    return (
                                                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold bg-amber-100/60 text-amber-700 border border-amber-100 whitespace-nowrap">
                                                            {startStr} au {endStr}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {property.status && property.status !== 'active' ? (
                                    <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl text-center shadow-sm">
                                        <p className="text-amber-700 font-black text-xs uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            Validation en cours
                                        </p>
                                        <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic">Ce logement est en attente de validation par l'administration et n'est pas encore ouvert aux réservations.</p>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleBooking}
                                            className="w-full py-4 sm:py-5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 mb-4 uppercase tracking-[0.2em] flex items-center justify-center text-center"
                                        >
                                            Réserver
                                        </button>

                                        <button
                                            onClick={handleContact}
                                            className="w-full py-4 px-2 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-2xl font-black text-sm transition-all active:scale-95 mb-6 uppercase tracking-[0.2em] flex items-center justify-center text-center"
                                        >
                                            Contacter
                                        </button>
                                    </>
                                )}

                                {calculateTotal() > 0 && (
                                    <div className="space-y-3 pt-6 border-t border-slate-100">
                                        <div className="flex justify-between text-slate-500 font-medium">
                                            <span>
                                                {(property.sale_price && property.sale_price > 0 ? property.sale_price : property.price).toLocaleString()} FCFA x {Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))} nuits
                                            </span>
                                            <span>{calculateTotal().toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500 font-medium pb-2">
                                            <span>Frais de service (HOLA)</span>
                                            <span>0 FCFA</span>
                                        </div>
                                        <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-100">
                                            <span>Total</span>
                                            <span>{calculateTotal().toLocaleString()} FCFA</span>
                                        </div>
                                    </div>
                                )}

                                <p className="text-center text-slate-400 text-xs mt-6 font-medium italic">Vous ne serez pas débité immédiatement.</p>
                            </motion.div>

                            <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-white flex items-center gap-4 shadow-sm">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none mb-1">Paiement Sécurisé</p>
                                    <p className="text-xs font-bold text-slate-700 leading-tight">Wave, Orange Money, PayPal & Carte bancaire</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Small helper component
function CheckCircle2(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}
