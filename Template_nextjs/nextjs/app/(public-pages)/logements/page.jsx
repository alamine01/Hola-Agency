'use client';

import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Users, Search, SlidersHorizontal, ArrowRight, Heart, Loader2, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function CatalogPage() {
    const [properties, setProperties] = useState([]);
    const [favorites, setFavorites] = useState(new Set());
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('Tous');

    // Pre-defined categories
    const defaultCategories = ["Villa", "Appartement", "Maison d'hôtes", "Studio"];

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // 1. Fetch user & favs
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    setUser(user);
                    const { data: favs } = await supabase
                        .from('favorites')
                        .select('item_id')
                        .eq('user_id', user.id);
                    if (favs) {
                        setFavorites(new Set(favs.map(f => f.item_id.toString())));
                    }
                }

                // 2. Fetch properties
                const { data: villas, error } = await supabase
                    .from('villas')
                    .select('*')
                    .eq('status', 'active')
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setProperties(villas || []);
            } catch (err) {
                console.error("Erreur de chargement des logements:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const toggleFavorite = async (property) => {
        if (!user) {
            alert("Connectez-vous pour ajouter des favoris !");
            return;
        }

        const isFav = favorites.has(property.id.toString());
        const newFavs = new Set(favorites);

        if (isFav) {
            newFavs.delete(property.id.toString());
            await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('item_id', property.id.toString());
        } else {
            newFavs.add(property.id.toString());
            await supabase
                .from('favorites')
                .insert([{
                    user_id: user.id,
                    item_id: property.id.toString(),
                    item_type: 'villa',
                    metadata: { title: property.name, image: property.image, price: property.price, location: property.location || property.city }
                }]);
        }
        setFavorites(newFavs);
    };

    // Combine DB types with default types, avoiding blanks
    const dbTypes = properties.map(p => p.type).filter(Boolean);
    const uniqueTypes = [...new Set([...defaultCategories, ...dbTypes])];

    const filteredProperties = properties.filter(p => {
        const title = p.name || p.title || '';
        const loc = p.location || p.city || '';
        const matchSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || loc.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === 'Tous' || p.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-24">
            {/* Page Header */}
            <div className="container-hola mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-3xl mx-auto"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">Trouvez l'exceptionnel.</h1>
                    <p className="text-lg text-slate-500 mb-10">
                        Explorez l'intégralité de nos biens vérifiés. Des villas luxueuses sur la Petite Côte aux appartements modernes au cœur de Dakar.
                    </p>
                </motion.div>

                {/* Search & Filter Bar */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between"
                >
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Où souhaitez-vous aller ? (ex: Dakar, Saly...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#D4AF37]/50 transition-all border border-transparent focus:border-[#D4AF37]/50"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-48">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl outline-none border border-transparent focus:ring-2 focus:ring-[#D4AF37]/50 appearance-none text-slate-600 font-medium cursor-pointer"
                            >
                                <option value="Tous">Toutes catégories</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                        <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium transition-colors whitespace-nowrap">
                            Rechercher
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Catalog Grid */}
            <div className="container-hola">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-[#D4AF37]">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-slate-500">Chargement de notre collection...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-slate-500 font-medium">{filteredProperties.length} biens trouvés</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredProperties.map((property, index) => (
                                <motion.div
                                    key={property.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="relative aspect-video overflow-hidden shrink-0 bg-slate-100">
                                        {property.image ? (
                                            <img
                                                src={property.image}
                                                alt={property.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Home className="w-16 h-16 text-slate-300" strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-sm font-semibold text-slate-800">
                                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                {property.rating || 'Nouveau'}
                                            </div>
                                            <button
                                                onClick={(e) => { e.preventDefault(); toggleFavorite(property); }}
                                                className={`p-2 rounded-full transition-all border ${favorites.has(property.id.toString()) ? 'bg-red-500 border-red-500 text-white' : 'bg-white/90 backdrop-blur-sm border-white text-slate-400 hover:text-red-500'}`}
                                            >
                                                <Heart className={`w-4 h-4 ${favorites.has(property.id.toString()) ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                        {property.type && (
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white tracking-widest uppercase shadow-sm">
                                                    {property.type}
                                                </div>
                                                {property.sale_price && property.sale_price > 0 && (
                                                    <div className="bg-amber-500 px-3 py-1.5 rounded-full text-[10px] font-black text-white tracking-widest uppercase shadow-xl animate-pulse self-start">
                                                        - {Math.round((1 - property.sale_price / property.price) * 100)}%
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{property.name || property.title}</h3>
                                            <div className="flex items-center text-slate-500 text-sm gap-1">
                                                <MapPin className="w-4 h-4 text-slate-400" /> {property.city || property.location}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-6 mt-auto">
                                            <div className="flex items-center text-slate-600 gap-2">
                                                <BedDouble className="w-5 h-5 text-slate-400" />
                                                <span className="text-sm font-medium">{property.rooms || property.beds || 1} Chambres</span>
                                            </div>
                                            <div className="flex items-center text-slate-600 gap-2">
                                                <Users className="w-5 h-5 text-slate-400" />
                                                <span className="text-sm font-medium">{property.max_guests || property.guests || 2} Pers.</span>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Prix par nuit</div>
                                                <div className="flex items-baseline gap-2">
                                                    <div className="text-lg font-bold text-[#D4AF37]">
                                                        {(property.sale_price && property.sale_price > 0 ? property.sale_price : property.price)?.toLocaleString()} FCFA
                                                    </div>
                                                    {property.sale_price && property.sale_price > 0 && (
                                                        <div className="text-xs text-slate-400 line-through font-medium italic">
                                                            {property.price?.toLocaleString()} FCFA
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <Link href={`/logements/${property.id}`} className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-slate-900 flex items-center justify-center transition-colors">
                                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredProperties.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 mt-8">
                                <p className="text-slate-500 text-lg">Aucun bien ne correspond à votre recherche pour le moment.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setTypeFilter('Tous'); }}
                                    className="mt-4 text-[#D4AF37] font-semibold hover:underline"
                                >
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
