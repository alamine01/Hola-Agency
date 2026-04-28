'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactSection() {
    return (
        <section id="contact" className="py-24 bg-white relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold text-slate-900 mb-4"
                    >
                        Contactez-nous
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto"
                    >
                        Une question sur nos biens, une demande de prestation sur-mesure ou une proposition de partenariat ? Notre équipe d'experts est à votre écoute.
                    </motion.p>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

                    {/* Left: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-8"
                    >
                        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 h-full">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8">Informations de contact</h3>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Notre Siège</p>
                                        <p className="text-slate-500">Almadies, Zone 12<br />Dakar, Sénégal</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Téléphone</p>
                                        <p className="text-slate-500">+221 77 123 45 67<br />+221 33 820 00 00</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D4AF37] shadow-sm shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Email</p>
                                        <p className="text-slate-500">contact@hola-agency.sn<br />partenaires@hola-agency.sn</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex-[1.5]"
                    >
                        <form className="space-y-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nom complet</label>
                                    <input type="text" id="name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all" placeholder="Jean Dupont" />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Adresse Email</label>
                                    <input type="email" id="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all" placeholder="jean@exemple.com" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700">Sujet</label>
                                <select id="subject" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all text-slate-600 cursor-pointer">
                                    <option>Je souhaite réserver un bien</option>
                                    <option>Je souhaite mettre mon bien en location (Propriétaire)</option>
                                    <option>Je souhaite proposer mes services (Prestataire)</option>
                                    <option>Autre demande</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700">Message</label>
                                <textarea id="message" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all resize-none" placeholder="Décrivez votre besoin..."></textarea>
                            </div>

                            <button type="button" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2">
                                Envoyer le message <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
