'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Users, ArrowRight, Loader2, Home } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function FeaturedProperties() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        try {
            const { data, error } = await supabase
                .from('villas')
                .select('*')
                .eq('status', 'active')
                .eq('is_featured', true)
                .limit(3);

            if (error) throw error;
            setProperties(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="logements" className="py-24 bg-white">
            <div className="container-hola">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-slate-900 mb-4"
                    >
                        Notre Collection Privée
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto"
                    >
                        Une sélection rigoureuse des plus belles propriétés pour des séjours inoubliables.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {loading ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 flex justify-center py-20 text-slate-400">
                            Aucune propriété à la une pour le moment.
                        </div>
                    ) : (
                        properties.map((property, index) => (
                            <Link href={`/logements/${property.id}`} key={property.id}>
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300 cursor-pointer h-full flex flex-col"
                                >
                                    <div className="relative h-64 overflow-hidden bg-slate-100">
                                        {property.image ? (
                                            <img
                                                src={property.image}
                                                alt={property.name}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Home className="w-12 h-12 text-slate-300" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-sm font-semibold text-slate-800">
                                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                            {property.rating || "Nouveau"}
                                        </div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-1">{property.name}</h3>
                                                <div className="flex items-center text-slate-500 text-sm gap-1">
                                                    <MapPin className="w-4 h-4" /> {property.city || property.location}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="flex items-center text-slate-600 gap-2">
                                                <BedDouble className="w-5 h-5 text-slate-400" />
                                                <span className="text-sm font-medium">{property.rooms || 1} Chambres</span>
                                            </div>
                                            <div className="flex items-center text-slate-600 gap-2">
                                                <Users className="w-5 h-5 text-slate-400" />
                                                <span className="text-sm font-medium">{property.guests || 2} Voyageurs</span>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                                            <div className="text-slate-500 text-sm">À partir de</div>
                                            <div className="text-lg font-bold text-[#D4AF37]">{property.price?.toLocaleString()} FCFA<span className="text-sm font-normal text-slate-400">/nuit</span></div>
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))
                    )}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/logements" className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full font-medium transition-colors shadow-lg hover:shadow-xl inline-flex items-center gap-2">
                        Voir tout le catalogue <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
