'use client';

import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Users, Search, SlidersHorizontal, ArrowRight, Heart, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Mock data pour le catalogue
const allProperties = [
    {
        id: 1, title: "Villa Saly Exception", location: "Saly, Sénégal",
        price: "85 000 FCFA", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        beds: 4, guests: 8, rating: 4.9, type: "Villa"
    },
    {
        id: 2, title: "Appartement Cosy Plateau", location: "Dakar Plateau",
        price: "50 000 FCFA", image: "https://images.unsplash.com/photo-1502672260266-1c1db2dba659?q=80&w=1936&auto=format&fit=crop",
        beds: 2, guests: 4, rating: 4.8, type: "Appartement"
    },
    {
        id: 3, title: "Maison Diagne Premium", location: "Rufisque",
        price: "50 000 FCFA", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop",
        beds: 4, guests: 6, rating: 4.7, type: "Maison"
    },
    {
        id: 4, title: "Penthouse Almadies", location: "Almadies, Dakar",
        price: "150 000 FCFA", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        beds: 3, guests: 6, rating: 5.0, type: "Appartement"
    },
    {
        id: 5, title: "Villa Pied dans l'eau", location: "Somone",
        price: "120 000 FCFA", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
        beds: 5, guests: 10, rating: 4.9, type: "Villa"
    },
    {
        id: 6, title: "Studio Moderne Mermoz", location: "Mermoz, Dakar",
        price: "35 000 FCFA", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop",
        beds: 1, guests: 2, rating: 4.6, type: "Appartement"
    }
];

export default function CatalogPage() {
    const [favorites, setFavorites] = useState(new Set());
    const [user, setUser] = useState(null);
    const [loadingFavs, setLoadingFavs] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('Tous');

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
            const { error } = await supabase
                .from('favorites')
                .delete()
                .eq('user_id', user.id)
                .eq('item_id', property.id.toString());
            if (error) {
                alert("Erreur lors de la suppression du favori.");
                console.error(error);
            }
        } else {
            newFavs.add(property.id.toString());
            const { error } = await supabase
                .from('favorites')
                .insert([{
                    user_id: user.id,
                    item_id: property.id.toString(),
                    item_type: 'villa',
                    metadata: { title: property.title, image: property.image, price: property.price, location: property.location }
                }]);
            if (error) {
                alert("Erreur : La table 'favorites' n'existe pas ou les droits RLS sont manquants.");
                console.error(error);
                return; // Don't update state if DB failed
            }
        }
        setFavorites(newFavs);
    };

    // Filtrage simple (pour la démo)
    const filteredProperties = allProperties.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === 'Tous' || p.type === typeFilter;
        return matchSearch && matchType;
    });

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-24">

            {/* Page Header */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
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
                                <option value="Tous">Type de bien</option>
                                <option value="Villa">Villas</option>
                                <option value="Appartement">Appartements</option>
                                <option value="Maison">Maisons</option>
                            </select>
                        </div>
                        <button className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-medium transition-colors whitespace-nowrap">
                            Rechercher
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Catalog Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

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
                            <div className="relative h-64 overflow-hidden shrink-0">
                                <img
                                    src={property.image}
                                    alt={property.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-sm font-semibold text-slate-800">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        {property.rating}
                                    </div>
                                    <button
                                        onClick={(e) => { e.preventDefault(); toggleFavorite(property); }}
                                        className={`p-2 rounded-full transition-all border ${favorites.has(property.id.toString()) ? 'bg-red-500 border-red-500 text-white' : 'bg-white/90 backdrop-blur-sm border-white text-slate-400 hover:text-red-500'}`}
                                    >
                                        <Heart className={`w-4 h-4 ${favorites.has(property.id.toString()) ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white tracking-widest uppercase">
                                    {property.type}
                                </div>
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{property.title}</h3>
                                    <div className="flex items-center text-slate-500 text-sm gap-1">
                                        <MapPin className="w-4 h-4" /> {property.location}
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center text-slate-600 gap-2">
                                        <BedDouble className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-medium">{property.beds} Lits</span>
                                    </div>
                                    <div className="flex items-center text-slate-600 gap-2">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-medium">{property.guests} Pers.</span>
                                    </div>
                                </div>

                                <div className="pt-6 mt-auto border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Prix par nuit</div>
                                        <div className="text-lg font-bold text-[#D4AF37]">{property.price}</div>
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
                        <p className="text-slate-500 text-lg">Aucun bien ne correspond à votre recherche.</p>
                        <button
                            onClick={() => { setSearchTerm(''); setTypeFilter('Tous'); }}
                            className="mt-4 text-[#D4AF37] font-semibold hover:underline"
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
}
