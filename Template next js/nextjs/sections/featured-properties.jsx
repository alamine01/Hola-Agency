'use client';

import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const properties = [
    {
        id: 1,
        title: "Villa Saly Exception",
        location: "Saly, Sénégal",
        price: "85 000 FCFA",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        beds: 4,
        guests: 8,
        rating: 4.9
    },
    {
        id: 2,
        title: "Appartement Cosy Plateau",
        location: "Dakar Plateau",
        price: "50 000 FCFA",
        image: "https://images.unsplash.com/photo-1502672260266-1c1db2dba659?q=80&w=1936&auto=format&fit=crop",
        beds: 2,
        guests: 4,
        rating: 4.8
    },
    {
        id: 3,
        title: "Maison Diagne Premium",
        location: "Rufisque",
        price: "50 000 FCFA",
        image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop",
        beds: 4,
        guests: 6,
        rating: 4.7
    }
];

export default function FeaturedProperties() {
    return (
        <section id="logements" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    {properties.map((property, index) => (
                        <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={property.image}
                                    alt={property.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm text-sm font-semibold text-slate-800">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    {property.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{property.title}</h3>
                                        <div className="flex items-center text-slate-500 text-sm gap-1">
                                            <MapPin className="w-4 h-4" /> {property.location}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 mb-6">
                                    <div className="flex items-center text-slate-600 gap-2">
                                        <BedDouble className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-medium">{property.beds} Lits</span>
                                    </div>
                                    <div className="flex items-center text-slate-600 gap-2">
                                        <Users className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-medium">{property.guests} Voyageurs</span>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="text-slate-500 text-sm">À partir de</div>
                                    <div className="text-lg font-bold text-[#D4AF37]">{property.price}<span className="text-sm font-normal text-slate-400">/nuit</span></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
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
