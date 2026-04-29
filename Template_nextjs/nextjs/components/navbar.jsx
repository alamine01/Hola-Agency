'use client';

import { MenuIcon, XIcon, Home, UserCircle2, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const links = [
        { name: 'Accueil', href: '/' },
        { name: 'Catalogue Logements', href: '/logements' },
        { name: 'Services Premium', href: '/#services' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <>
            <nav className='sticky top-0 z-50 flex w-full items-center justify-between bg-white/80 px-4 py-4 backdrop-blur-xl md:px-16 lg:px-24 border-b border-slate-100 shadow-sm'>
                <Link href='/' className='flex items-center gap-2 text-slate-800 hover:text-[#D4AF37] transition-colors'>
                    <img src="/logo.svg" alt="Logo" className="h-8 w-auto object-contain" />
                    <span className='font-bold text-lg tracking-wider'>HOLA AGENCY</span>
                </Link>

                <div className='hidden items-center space-x-8 text-sm font-medium text-slate-600 md:flex'>
                    {links.map((link) => (
                        <Link key={link.name} href={link.href} className='transition hover:text-[#D4AF37]'>
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className='hidden md:flex items-center gap-4'>
                    {user ? (
                        <Link href='/dashboard' className='flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 hover:shadow-lg active:scale-95'>
                            <LayoutDashboard className="w-4 h-4" />
                            Mon Tableau de Bord
                        </Link>
                    ) : (
                        <>
                            <Link href='/login' className='text-sm font-medium text-slate-600 hover:text-[#D4AF37] transition'>
                                Connexion
                            </Link>
                            <Link href='/register' className='flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 hover:shadow-lg'>
                                <UserCircle2 className="w-4 h-4" />
                                S'inscrire
                            </Link>
                        </>
                    )}
                </div>

                <button onClick={() => setIsOpen(true)} className='transition active:scale-90 md:hidden text-slate-800'>
                    <MenuIcon className='size-6' />
                </button>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[300px] z-[70] bg-white shadow-2xl p-8 md:hidden flex flex-col"
                        >
                            <button onClick={() => setIsOpen(false)} className="self-end p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors mb-8">
                                <XIcon className="size-6" />
                            </button>

                            <div className="flex items-center gap-2 text-[#D4AF37] font-bold tracking-wider mb-10">
                                <img src="/logo.svg" alt="Logo" className="h-8 w-auto object-contain" />
                                <span>HOLA AGENCY</span>
                            </div>

                            <div className="flex flex-col gap-6">
                                {links.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-lg font-semibold text-slate-900 hover:text-[#D4AF37] transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-auto pt-8 border-t border-slate-100 space-y-4">
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        className="block w-full py-4 text-center bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Mon Tableau de Bord
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="block w-full py-4 text-center text-slate-900 font-bold hover:bg-slate-50 rounded-2xl transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Connexion
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="block w-full py-4 text-center bg-slate-900 text-white font-bold rounded-2xl shadow-lg shadow-slate-200"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            S'inscrire
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
