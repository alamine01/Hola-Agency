'use client';

import { ArrowRight, User, Home, Briefcase, Shield, Star, MapPin } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
    const fadeUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.4 }
        }
    };

    return (
        <section className="flex flex-col items-center justify-center relative min-h-[100svh] overflow-hidden py-24 bg-[#fafafa]">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop"
                    alt="Luxury Villa"
                    className="w-full h-full object-cover opacity-[0.15] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/80 to-[#fafafa] pointer-events-none" />
            </div>

            {/* Glowing Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/20 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-70"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-70"></div>



            {/* Header / Logo */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 flex flex-col items-center justify-center p-1.5 rounded-full border border-[#D4AF37]/40 bg-white/80 backdrop-blur-md mb-8 shadow-sm"
            >
                <div className="px-6 py-2 flex items-center gap-2 text-[#D4AF37] font-bold tracking-widest uppercase text-sm">
                    <img src="/logo.svg" alt="Logo" className="h-5 w-7 object-contain" />
                    <span className="whitespace-nowrap">HOLA AGENCY</span>
                </div>
            </motion.div>

            <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="z-10 text-5xl md:text-7xl/tight text-center font-bold max-w-4xl mt-2 text-slate-900 tracking-tight px-4"
            >
                L'immobilier premium & <br />
                <span className="bg-gradient-to-r from-[#D4AF37] via-amber-500 to-[#b38f26] bg-clip-text text-transparent italic pr-4">services d'exception.</span>
            </motion.h1>

            <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2, duration: 0.8 }}
                className="z-10 text-slate-500 md:text-xl text-center max-w-2xl mt-8 px-4 font-light leading-relaxed"
            >
                Pénétrez dans un univers où luxe rime avec simplicité. Réservez votre prochaine villa de rêve ou proposez vos services exclusifs à une clientèle de prestige.
            </motion.p>

            {/* Roles Grid */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-20 px-6"
            >

                {/* Client Card */}
                <motion.div variants={fadeUp} whileHover={{ y: -8 }} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                    <Link href="/register?role=client" className="relative flex flex-col items-center p-10 bg-gradient-to-br from-[#D4AF37]/5 to-amber-500/5 backdrop-blur-xl border border-[#D4AF37]/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(212,175,55,0.15)] hover:border-[#D4AF37]/50 transition-all duration-300 h-full">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-[#D4AF37] group-hover:to-amber-500 shadow-sm transition-all duration-500 mb-8">
                            <User className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">Je suis Client</h3>
                        <p className="text-slate-500 text-center text-sm mb-8 flex-grow leading-relaxed">
                            Accédez à un catalogue privé de villas somptueuses, d'appartements de standing et de services sur-mesure pour votre confort absolu.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-[#D4AF37] transition-colors mt-auto">
                            Explorer le catalogue <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>
                </motion.div>

                {/* Propriétaire Card */}
                <motion.div variants={fadeUp} whileHover={{ y: -8 }} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                    <Link href="/register?role=proprietaire" className="relative flex flex-col items-center p-10 bg-gradient-to-br from-slate-800/5 to-slate-900/5 backdrop-blur-xl border border-slate-800/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(15,23,42,0.1)] hover:border-slate-800/50 transition-all duration-300 h-full">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-800 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-slate-800 group-hover:to-slate-900 shadow-sm transition-all duration-500 mb-8">
                            <Home className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">Propriétaire</h3>
                        <p className="text-slate-500 text-center text-sm mb-8 flex-grow leading-relaxed">
                            Confiez-nous la visibilité de votre bien de prestige. Nous assurons la gestion de vos réservations avec une clientèle vérifiée.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-800 transition-colors mt-auto">
                            Proposer un bien <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>
                </motion.div>

                {/* Prestataire Card */}
                <motion.div variants={fadeUp} whileHover={{ y: -8 }} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl blur-xl"></div>
                    <Link href="/register?role=prestataire" className="relative flex flex-col items-center p-10 bg-gradient-to-br from-indigo-500/5 to-blue-600/5 backdrop-blur-xl border border-indigo-500/20 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(99,102,241,0.15)] hover:border-indigo-500/50 transition-all duration-300 h-full">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-blue-600 shadow-sm transition-all duration-500 mb-8">
                            <Briefcase className="w-10 h-10" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 text-center">Prestataire</h3>
                        <p className="text-slate-500 text-center text-sm mb-8 flex-grow leading-relaxed">
                            Massages, dîners privés, excursions VIP... Rejoignez notre réseau de partenaires et offrez vos services à nos clients.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-600 transition-colors mt-auto">
                            Devenir partenaire <ArrowRight className="w-4 h-4" />
                        </div>
                    </Link>
                </motion.div>

            </motion.div>

        </section>
    );
}