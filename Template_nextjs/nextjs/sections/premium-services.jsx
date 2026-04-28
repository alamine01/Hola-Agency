'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, UtensilsCrossed, Car, Wine, Loader2, Briefcase } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function PremiumServices() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('status', 'active')
                .eq('is_featured', true)
                .limit(3); // On en garde 3 comme demandé

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section id="services" className="py-24 bg-slate-50 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4AF37]/5 rounded-l-[100px] -z-10 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-16 items-center">

                    {/* Left Typography */}
                    <div className="flex-1 text-left">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-6"
                        >
                            <Sparkles className="w-4 h-4" /> Services Premium
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6"
                        >
                            Sublimez chaque instant de votre séjour.
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-slate-600 mb-8 max-w-lg"
                        >
                            Au-delà d'un simple logement, HOLA vous donne accès à un réseau exclusif de prestataires haut de gamme, vérifiés pour vous garantir l'excellence.
                        </motion.p>

                        <motion.a
                            href="#services"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-200"
                        >
                            Découvrir nos services
                        </motion.a>
                    </div>

                    {/* Right Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                        {loading ? (
                            <div className="col-span-1 sm:col-span-2 flex justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : services.length === 0 ? (
                            <div className="col-span-1 sm:col-span-2 flex justify-center py-20 text-slate-400">
                                Aucune prestation à la une pour le moment.
                            </div>
                        ) : (
                            services.map((service, index) => (
                                <motion.div
                                    key={service.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 }}
                                    className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-slate-100 hover:border-indigo-100 hover:-translate-y-2 transition-all duration-300 flex flex-col"
                                >
                                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 overflow-hidden shrink-0">
                                        {service.image ? (
                                            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <Briefcase className="w-8 h-8" strokeWidth={1.5} />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{service.name}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">{service.description}</p>
                                    <div className="text-sm font-semibold text-[#D4AF37] mt-auto">
                                        {service.price ? `${service.price.toLocaleString()} FCFA` : "Sur Devis"}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
}
