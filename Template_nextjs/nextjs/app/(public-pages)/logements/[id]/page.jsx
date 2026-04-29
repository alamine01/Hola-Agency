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

// Mock function to get property by ID (simulating database call)
// Removed mock function as we now fetch from Supabase

export default function PropertyDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
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

        fetchProperty();
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, [id]);

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                            className="rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 aspect-[4/3] sm:aspect-video lg:h-[500px] lg:aspect-auto"
                        >
                            <img src={property.image} alt={property.title} className="w-full h-full object-cover object-center" />
                        </motion.div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">{property.name}</h1>
                            <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 text-slate-800 font-bold self-start">
                                <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> {property.rating || 'Nouveau'}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-slate-500 mb-10 pb-10 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-indigo-500" /> <span className="font-medium text-slate-900">{property.location}</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <BedDouble className="w-5 h-5 text-slate-400" /> <span>{property.rooms} Ch.</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-slate-400" /> <span>{property.guests} Voyageurs max</span>
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
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                                                className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer"
                                                onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="p-4 bg-slate-50/30">
                                            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Départ</label>
                                            <input
                                                type="date"
                                                className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer"
                                                onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-slate-50/30">
                                        <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Voyageurs</label>
                                        <select
                                            className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer"
                                            onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}
                                        >
                                            {[...Array(property.guests)].map((_, i) => (
                                                <option key={i} value={i + 1}>{i + 1} voyageur{i > 0 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBooking}
                                className="w-full py-4 sm:py-5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[13px] sm:text-base shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95 mb-4 uppercase tracking-widest flex items-center justify-center whitespace-nowrap"
                                >
                                    {property.type === 'Service' ? 'Réserver la prestation' : 'Réserver maintenant'}
                                </button>

                                <button
                                    onClick={handleContact}
                                    className="w-full py-4 px-4 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-2xl font-black text-[13px] sm:text-base transition-all active:scale-95 mb-6 uppercase tracking-widest flex items-center justify-center whitespace-nowrap"
                                >
                                    {property.type === 'Service' ? 'Contacter le professionnel' : 'Contacter le propriétaire'}
                                </button>

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
