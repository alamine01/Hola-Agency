"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Star, BedDouble, Users, ArrowLeft,
    Wifi, Car, Coffee, Shield, Calendar, ChevronRight,
    Loader2, CheckCircle2, Heart
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function DashboardPropertyDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [favorites, setFavorites] = useState(new Set());

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase.from('favorites').select('item_id').eq('user_id', user.id);
                if (data) setFavorites(new Set(data.map(f => f.item_id.toString())));
            }
            await fetchProperty();
        };
        load();
    }, [id]);

    const fetchProperty = async () => {
        setLoading(true);
        try {
            // Tentative villa
            let { data, error } = await supabase.from('villas').select('*').eq('id', id).maybeSingle();

            if (data) {
                setProperty({
                    ...data,
                    title: data.name || data.title,
                    price: data.price,
                    image: data.image,
                    type: data.type || 'Villa',
                    location: data.location || data.city || 'Sénégal',
                    description: data.description || "Aucune description fournie.",
                    amenities: (data.amenities && data.amenities.length > 0) ? data.amenities : ["Wi-Fi", "Piscine", "Serviettes"], // Fallback if old data
                    beds: data.rooms || 4,
                    guests: data.guests || 8,
                    rating: 4.9,
                    owner_id: data.owner_id
                });
            } else {
                // Tentative service
                let { data: sData } = await supabase.from('services').select('*').eq('id', id).maybeSingle();
                if (sData) {
                    setProperty({
                        id: sData.id,
                        title: sData.name,
                        location: sData.location || "Sénégal",
                        price: sData.price,
                        image: sData.image,
                        type: 'Service',
                        description: sData.description || "Un service premium HOLA.",
                        amenities: ["Service professionnel", "Qualité HOLA"],
                        beds: 0,
                        guests: 10,
                        rating: 4.8,
                        owner_id: sData.provider_id
                    });
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const [bookingData, setBookingData] = useState({
        startDate: '',
        endDate: '',
        guests: 1
    });

    const calculateTotal = () => {
        if (!bookingData.startDate || !bookingData.endDate || !property) return 0;
        const start = new Date(bookingData.startDate);
        const end = new Date(bookingData.endDate);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return nights > 0 ? nights * property.price : 0;
    };

    const handleBooking = async () => {
        if (!property) return;
        if (!bookingData.startDate || !bookingData.endDate) {
            alert("Veuillez sélectionner vos dates de réservation avant de continuer.");
            return;
        }

        const params = new URLSearchParams({
            item_id: id,
            item_type: property.type,
            amount: property.price,
            title: property.title,
            image: property.image,
            location: property.location,
            rating: property.rating,
            start: bookingData.startDate,
            end: bookingData.endDate,
            guests: bookingData.guests,
            owner_id: property.owner_id
        });
        router.push(`/dashboard/client/paiement?${params.toString()}`);
    };

    const handleContact = async () => {
        if (!user || !property) return;
        const ownerId = property.owner_id;
        if (!ownerId) return;

        const { data: existing } = await supabase.from('conversations')
            .select('id')
            .or(`and(participant_1.eq.${user.id},participant_2.eq.${ownerId}),and(participant_1.eq.${ownerId},participant_2.eq.${user.id})`)
            .maybeSingle();

        if (existing) {
            router.push(`/dashboard/client/messages?id=${existing.id}`);
        } else {
            const { data: newConv } = await supabase.from('conversations').insert({
                participant_1: user.id < ownerId ? user.id : ownerId,
                participant_2: user.id < ownerId ? ownerId : user.id,
                last_message_at: new Date()
            }).select().single();
            if (newConv) router.push(`/dashboard/client/messages?id=${newConv.id}`);
        }
    };

    const toggleFavorite = async () => {
        if (!user || !property) return;
        const isFav = favorites.has(id.toString());
        const newFavs = new Set(favorites);
        if (isFav) {
            newFavs.delete(id.toString());
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', id.toString());
        } else {
            newFavs.add(id.toString());
            await supabase.from('favorites').insert([{
                user_id: user.id,
                item_id: id.toString(),
                item_type: property.type.toLowerCase(),
                metadata: { title: property.title, image: property.image, price: property.price, location: property.location }
            }]);
        }
        setFavorites(newFavs);
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!property) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400 font-bold italic">Bien non trouvé ou indisponible.</p>
                <Link href="/dashboard/client/explorer" className="text-indigo-600 font-black uppercase mt-4 block">Retour au catalogue</Link>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24">
            <div className="mb-10">
                <div className="flex items-center justify-between mb-8 px-2">
                    <Link href="/dashboard/client/explorer" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-all group">
                        <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Retour au catalogue
                    </Link>

                    <button
                        onClick={toggleFavorite}
                        className={`flex items-center gap-2 px-6 py-2 rounded-2xl font-bold transition-all border ${favorites.has(id.toString()) ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white text-slate-400 border-slate-100 hover:text-red-500'}`}
                    >
                        <Heart className={`w-4 h-4 ${favorites.has(id.toString()) ? 'fill-current' : ''}`} />
                        {favorites.has(id.toString()) ? 'Enregistré' : 'Enregistrer'}
                    </button>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-900"
                >
                    <img src={property.image} alt={property.title} className="w-full h-auto md:h-[550px] object-contain md:object-cover" />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 text-center md:text-left">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 uppercase tracking-tight">{property.title}</h1>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 font-medium italic">
                                    <MapPin className="w-4 h-4 text-indigo-500" /> {property.location}
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-1.5 bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 text-amber-700 font-black shadow-sm mx-auto md:mx-0 w-fit">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {property.rating}
                            </div>
                        </div>

                        <div className="flex items-center gap-10 border-y border-slate-50 py-8 mb-8">
                            {property.type !== 'Service' && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                        <BedDouble className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <span className="font-bold text-slate-900">{property.beds} Lits</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="font-bold text-slate-900">{property.guests} Pers. max</span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Description</h2>
                            <p className="text-slate-500 leading-relaxed font-medium text-lg italic">
                                {property.description}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                        <h2 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-widest">Commodités</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {property.amenities.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-transparent hover:border-indigo-100 transition-all">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                    <span className="font-bold text-sm tracking-tight">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-[0_30px_60px_rgb(0,0,0,0.12)] border border-slate-100"
                        >
                            <div className="mb-8">
                                <div className="text-3xl font-black text-slate-900">
                                    {property.price.toLocaleString()} <span className="text-sm font-normal text-slate-400">FCFA {property.type === 'Service' ? '' : '/ nuit'}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                {property.type === 'Service' ? (
                                    <>
                                        <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-slate-50/30">
                                            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Date souhaitée</label>
                                            <input
                                                type="date"
                                                className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer"
                                                onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value, endDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-slate-50/30">
                                            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Nombre de personnes</label>
                                            <select className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer" onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}>
                                                {[1, 2, 3, 4, 5, 10].map((num) => (
                                                    <option key={num} value={num}>{num} personne{num > 1 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 gap-0 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                            <div className="p-4 border-r border-slate-200 bg-slate-50/30">
                                                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Arrivée</label>
                                                <input type="date" className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer" onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })} />
                                            </div>
                                            <div className="p-4 bg-slate-50/30">
                                                <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Départ</label>
                                                <input type="date" className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer" onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="p-4 rounded-2xl border border-slate-200 shadow-sm bg-slate-50/30">
                                            <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Voyageurs</label>
                                            <select className="bg-transparent text-sm font-bold text-slate-900 outline-none w-full cursor-pointer" onChange={(e) => setBookingData({ ...bookingData, guests: e.target.value })}>
                                                {[...Array((property.guests || 1))].map((_, i) => (
                                                    <option key={i} value={i + 1}>{i + 1} voyageur{i > 0 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>

                            <button onClick={handleBooking} className="w-full py-4 sm:py-5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-[10px] sm:text-xs md:text-sm shadow-xl shadow-slate-200 transition-all active:scale-95 mb-4 uppercase tracking-wider flex items-center justify-center text-center">
                                {property.type === 'Service' ? 'Réserver la prestation' : 'Réserver maintenant'}
                            </button>

                            <button onClick={handleContact} className="w-full py-4 px-4 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-50 rounded-2xl font-black text-[10px] sm:text-xs md:text-sm transition-all active:scale-95 uppercase tracking-wider flex items-center justify-center text-center">
                                {property.type === 'Service' ? 'Contacter le professionnel' : 'Contacter le propriétaire'}
                            </button>

                            {calculateTotal() > 0 && property.type !== 'Service' && (
                                <div className="space-y-3 pt-6 border-t border-slate-100 mt-6">
                                    <div className="flex justify-between text-slate-500 font-medium">
                                        <span>Séjour ({Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))} nuits)</span>
                                        <span>{calculateTotal().toLocaleString()} FCFA</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-black text-slate-900 pt-4 border-t border-slate-100">
                                        <span>Total</span>
                                        <span>{calculateTotal().toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            )}

                            {property.type === 'Service' && (
                                <div className="pt-6 border-t border-slate-100 mt-6">
                                    <div className="flex justify-between text-xl font-black text-slate-900">
                                        <span>Tarif service</span>
                                        <span>{property.price.toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            )}

                            <p className="text-center text-slate-400 text-[10px] mt-6 font-medium italic">Aucun frais ne vous sera prélevé pour le moment.</p>
                        </motion.div>

                        <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-6 border border-white flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                                <Shield className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Protection HOLA</p>
                                <p className="text-xs font-bold text-slate-700">Paiement 100% sécurisé</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
