'use client';

import { motion } from 'framer-motion';

const PARTNERS = [
    { name: 'Microsoft', logo: '/companies-logo/microsoft.svg' },
    { name: 'Huawei', logo: '/companies-logo/huawei.svg' },
    { name: 'Instagram', logo: '/companies-logo/instagram.svg' },
    { name: 'Walmart', logo: '/companies-logo/walmart.svg' },
    { name: 'Framer', logo: '/companies-logo/framer.svg' },
    { name: 'Microsoft 2', logo: '/companies-logo/microsoft.svg' }, // Duplicated to ensure track is full
    { name: 'Huawei 2', logo: '/companies-logo/huawei.svg' },
];

export default function PartnersSection() {
    return (
        <section className="py-20 bg-white overflow-hidden border-b border-slate-100 relative">
            <div className="max-w-7xl mx-auto px-4 md:px-16 lg:px-24 mb-12 text-center">
                <h2 className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-3">Nos marques & partenaires de confiance</h2>
                <div className="w-12 h-1 bg-gradient-to-r from-[#D4AF37] to-amber-500 mx-auto rounded-full"></div>
            </div>

            <div className="relative w-full flex items-center overflow-hidden">
                {/* Left gradient mask */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>

                {/* Scrolling Track */}
                <motion.div
                    className="flex items-center gap-16 md:gap-28 w-max px-8"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ ease: "linear", duration: 30, repeat: Infinity }}
                >
                    {/* Double the array for seamless infinite scroll */}
                    {[...PARTNERS, ...PARTNERS].map((partner, index) => (
                        <div key={index} className="flex-shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
                            <img
                                src={partner.logo}
                                alt={`Partenaire ${partner.name}`}
                                className="h-8 md:h-10 w-auto object-contain drop-shadow-sm"
                            />
                        </div>
                    ))}
                </motion.div>

                {/* Right gradient mask */}
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
            </div>
        </section>
    );
}
