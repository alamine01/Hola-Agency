'use client';

import { motion } from 'framer-motion';
import { MapPin, Search, SlidersHorizontal, ArrowRight, Loader2, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ServicesCatalogPage() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('Tous');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                // Si la colonne status existe, on peut ajouter .eq('status', 'active')
                const { data, error } = await supabase
                    .from('services')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setServices(data || []);
            } catch (err) {
                console.error("Erreur de chargement des services:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, []);

    // Catégories par défaut combinées avec celles de la base de données
    const defaultCategories = ["Chef à Domicile", "Chauffeur Privé", "Bien-être & Spa", "Conciergerie", "Événementiel"];
    const dbTypes = services.map(s => s.type).filter(Boolean);
    const uniqueTypes = [...new Set([...defaultCategories, ...dbTypes])];

    const filteredServices = services.filter(s => {
        const matchSearch = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.location || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === 'Tous' || s.type === typeFilter;
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
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-6">L'excellence à la carte.</h1>
                    <p className="text-lg text-slate-500 mb-10">
                        Découvrez notre catalogue exclusif de prestataires haut de gamme. Des repas étoilés aux massages relaxants, tout est conçu pour sublimer votre séjour.
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
                            placeholder="Rechercher une prestation (ex: Chef, Massage...)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all border border-transparent focus:border-indigo-500/50"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-48">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl outline-none border border-transparent focus:ring-2 focus:ring-indigo-500/50 appearance-none text-slate-600 font-medium cursor-pointer"
                            >
                                <option value="Tous">Toutes catégories</option>
                                {uniqueTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Catalog Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-indigo-500">
                        <Loader2 className="w-10 h-10 animate-spin mb-4" />
                        <p className="text-slate-500">Chargement des prestataires...</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <p className="text-slate-500 font-medium">{filteredServices.length} prestations trouvées</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredServices.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full"
                                >
                                    <div className="relative h-64 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center">
                                        {service.image ? (
                                            <img
                                                src={service.image}
                                                alt={service.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <Briefcase className="w-16 h-16 text-slate-300" strokeWidth={1} />
                                        )}
                                        {service.type && (
                                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                                <div className="bg-indigo-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white tracking-widest uppercase shadow-sm">
                                                    {service.type}
                                                </div>
                                                {service.sale_price && service.sale_price > 0 && (
                                                    <div className="bg-amber-500 px-3 py-1.5 rounded-full text-[10px] font-black text-white tracking-widest uppercase shadow-xl animate-pulse self-start">
                                                        PROMO
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{service.name}</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                                                {service.description || "Aucune description fournie pour ce service."}
                                            </p>
                                        </div>

                                        <div className="flex items-center text-slate-500 text-sm gap-2 mb-6 mt-auto">
                                            <MapPin className="w-4 h-4 text-indigo-500" /> {service.location || 'Sur place ou à domicile'}
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <div className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Tarif indicatif</div>
                                                <div className="flex items-baseline gap-2">
                                                    <div className="text-lg font-bold text-indigo-600">
                                                        {service.sale_price && service.sale_price > 0 
                                                            ? `${service.sale_price.toLocaleString()} FCFA`
                                                            : (service.price ? `${service.price.toLocaleString()} FCFA` : "Sur devis")}
                                                    </div>
                                                    {service.sale_price && service.sale_price > 0 && (
                                                        <div className="text-xs text-slate-400 line-through font-medium italic">
                                                            {service.price?.toLocaleString()} FCFA
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Link pointant vers le book ou detail si existant, placeholder pour l'instant */}
                                            <Link href="#" onClick={(e) => { e.preventDefault(); alert("Réservation de service bientôt disponible !"); }} className="w-12 h-12 rounded-full bg-indigo-50 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
                                                <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {filteredServices.length === 0 && (
                            <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 mt-8">
                                <p className="text-slate-500 text-lg">Aucun service ne correspond à votre recherche.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setTypeFilter('Tous'); }}
                                    className="mt-4 text-indigo-600 font-semibold hover:underline"
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
