"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Home,
    Building2,
    Sparkles,
    ArrowRight,
    Star,
    MapPin,
    BedDouble,
    Users,
    Heart,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function ClientExplorerPage() {
    const [filter, setFilter] = useState('Tous');
    const [favorites, setFavorites] = useState(new Set());
    const [user, setUser] = useState(null);
    const [loadingFavs, setLoadingFavs] = useState(true);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserAndFavs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data } = await supabase
                    .from('favorites')
                    .select('item_id')
                    .eq('user_id', user.id);
                if (data) {
                    setFavorites(new Set(data.map(f => f.item_id.toString())));
                }
            }
            setLoadingFavs(false);
        };
        fetchUserAndFavs();
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [villasResp, servicesResp] = await Promise.all([
                supabase.from('villas').select('*'),
                supabase.from('services').select('*')
            ]);

            const villas = (villasResp.data || []).map(v => ({
                id: v.id,
                title: v.name,
                location: v.location || 'Sénégal',
                price: `${(v.price || 0).toLocaleString()} FCFA`,
                image: v.image,
                type: v.type || 'Villa',
                beds: v.rooms || 0,
                guests: v.guests || 0,
                rating: v.rating || 0
            }));

            const services = (servicesResp.data || []).map(s => ({
                id: s.id,
                title: s.name,
                location: s.location || 'Sénégal',
                price: `${(s.price || 0).toLocaleString()} FCFA`,
                image: s.image,
                type: 'Service',
                rating: s.rating || 4.7
            }));

            setItems([...villas, ...services]);
        } catch (err) {
            console.error("Fetch data error:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (item) => {
        if (!user) return;

        const isFav = favorites.has(item.id.toString());
        const newFavs = new Set(favorites);

        if (isFav) {
            newFavs.delete(item.id.toString());
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('item_id', item.id.toString());
        } else {
            newFavs.add(item.id.toString());
            const { error } = await supabase.from('favorites').insert([{
                user_id: user.id,
                item_id: item.id.toString(),
                item_type: item.type.toLowerCase(),
                metadata: { title: item.title, image: item.image, price: item.price, location: item.location }
            }]);
            if (error) alert("Erreur favoris : Table manquante dans Supabase.");
        }
        setFavorites(newFavs);
    };

    const filteredItems = filter === 'Tous'
        ? items
        : items.filter(item => {
            if (filter === 'Service') return item.type === 'Service';
            return item.type?.toLowerCase().includes(filter.toLowerCase());
        });


    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase italic">Catalogue Privé</h1>
                    <p className="text-slate-500 font-medium italic">Découvrez nos nouvelles villas et services exclusifs.</p>
                </div>

                <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto whitespace-nowrap max-w-full custom-scrollbar-hide">
                    {['Tous', 'Villa', 'Appartement', 'Service'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl transition-all flex-shrink-0 ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            {f === 'Service' ? 'Services' : f}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 bg-slate-50 animate-pulse rounded-[2rem]"></div>
                    ))}
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item) => (
                        <motion.div
                            layout
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-xl transition-all group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm italic">
                                    {item.type}
                                </div>
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <button
                                        onClick={(e) => { e.preventDefault(); toggleFavorite(item); }}
                                        className={`p-2.5 rounded-xl transition-all border shadow-sm ${favorites.has(item.id.toString()) ? 'bg-red-500 border-red-500 text-white' : 'bg-white/90 backdrop-blur-sm border-white text-slate-400 hover:text-red-500'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${favorites.has(item.id.toString()) ? 'fill-current' : ''}`} />
                                    </button>
                                    {item.rating && (
                                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm text-[10px] font-black text-slate-900">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            {item.rating}
                                        </div>
                                    )}
                                </div>
                                {loadingFavs && (
                                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[1px]">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-black text-slate-900 mb-1 truncate uppercase tracking-tight">{item.title}</h3>
                                <p className="text-slate-500 text-xs flex items-center gap-1 mb-4 italic">
                                    <MapPin className="w-3 h-3 text-indigo-500" /> {item.location}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-0.5">Prix</p>
                                        <p className="text-md font-black text-indigo-600">{item.price}</p>
                                    </div>
                                    <Link
                                        href={`/dashboard/client/explorer/${item.id}`}
                                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all active:scale-95"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center">
                    <p className="text-slate-400 font-bold italic">Aucun résultat trouvé pour cette catégorie.</p>
                </div>
            )}
        </div>
    );
}
