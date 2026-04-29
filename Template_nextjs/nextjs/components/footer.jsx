import { Instagram, Linkedin, Facebook, Twitter } from "lucide-react";

export default function Footer() {
    const data = [
        {
            title: 'HOLA Agency',
            links: [
                { title: 'À propos de nous', href: '#about' },
                { title: 'Nos services', href: '#services' },
                { title: 'Devenir Partenaire', href: '/register' },
                { title: 'Carrières', href: '#careers' },
            ],
        },
        {
            title: 'Légal',
            links: [
                { title: 'Conditions générales', href: '#terms' },
                { title: 'Politique de confidentialité', href: '#privacy' },
                { title: 'Mentions légales', href: '#legal' },
            ],
        },
        {
            title: 'Support',
            links: [
                { title: 'Contactez-nous', href: '#contact' },
                { title: 'FAQ', href: '#faq' },
                { title: 'Espace Client', href: '/login' },
            ],
        },
    ];

    return (
        <footer className="px-4 md:px-16 lg:px-24 text-[14px] mt-24 pt-16 pb-12 bg-white text-slate-600 border-t border-slate-100">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                {/* Brand Info */}
                <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-2 text-[#D4AF37] font-bold tracking-wider mb-6">
                        <img src="/logo.svg" alt="Logo" className="h-10 w-14 object-contain" />
                        <span className="text-xl whitespace-nowrap">HOLA AGENCY</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed mb-6 text-center md:text-left">
                        L'excellence de l'immobilier et des services premium au Sénégal. Nous vous offrons une expérience inoubliable avec un accompagnement sur-mesure.
                    </p>
                </div>

                {/* Links */}
                {data.map((item, index) => (
                    <div key={index} className="flex flex-col items-center md:items-start">
                        <p className="font-bold text-slate-900 mb-6">{item.title}</p>
                        <ul className="space-y-4">
                            {item.links.map((link, idx) => (
                                <li key={idx}>
                                    <a href={link.href} className="text-slate-500 hover:text-[#D4AF37] transition-colors">
                                        {link.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-400">© 2026 HOLA Agency. Tous droits réservés.</p>

                <div className="flex items-center gap-6">
                    <a href="#" className="text-slate-400 hover:text-[#D4AF37] transition-colors"><Instagram className="w-5 h-5" /></a>
                    <a href="#" className="text-slate-400 hover:text-[#D4AF37] transition-colors"><Facebook className="w-5 h-5" /></a>
                    <a href="#" className="text-slate-400 hover:text-[#D4AF37] transition-colors"><Linkedin className="w-5 h-5" /></a>
                    <a href="#" className="text-slate-400 hover:text-[#D4AF37] transition-colors"><Twitter className="w-5 h-5" /></a>
                </div>
            </div>
        </footer>
    );
};