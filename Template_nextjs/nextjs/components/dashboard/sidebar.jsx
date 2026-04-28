"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    User,
    LogOut,
    Menu,
    X,
    Home,
    Briefcase,
    Settings,
    Bell,
    Heart,
    History,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const Sidebar = ({ role }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const menuItems = {
        client: [
            { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard/client' },
            { id: 'catalogue', label: 'Découvrir / Réserver', icon: Home, href: '/dashboard/client/explorer' },
            { id: 'activity', label: 'Mon activité', icon: History, href: '/dashboard/client/reservations' },
            { id: 'invoices', label: 'Mes factures', icon: Briefcase, href: '/dashboard/client/factures' },
            { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/client/messages' },
            { id: 'profile', label: 'Mon profil', icon: User, href: '/dashboard/client/profil' },
        ],
        proprietaire: [
            { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard/proprietaire' },
            { id: 'villas', label: 'Mes villas', icon: Home, href: '/dashboard/proprietaire/villas' },
            { id: 'reservations', label: 'Réservations reçues', icon: Calendar, href: '/dashboard/proprietaire/reservations' },
            { id: 'revenue', label: 'Portefeuille', icon: CreditCard, href: '/dashboard/proprietaire/revenus' },
            { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/dashboard/proprietaire/messages' },
            { id: 'profile', label: 'Mon profil', icon: User, href: '/dashboard/proprietaire/profil' },
        ],
        prestataire: [
            { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard/prestataire' },
            { id: 'services', label: 'Mes services', icon: Briefcase, href: '/dashboard/prestataire/services' },
            { id: 'requests', label: 'Demandes', icon: MessageSquare, href: '/dashboard/prestataire/demandes' },
            { id: 'revenue', label: 'Portefeuille', icon: CreditCard, href: '/dashboard/prestataire/revenus' },
            { id: 'profile', label: 'Mon profil', icon: User, href: '/dashboard/prestataire/profil' },
        ],
        admin: [
            { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard, href: '/dashboard/admin' },
            { id: 'revenue', label: 'Validation Paiements', icon: CreditCard, href: '/dashboard/admin/revenus' },
            { id: 'users', label: 'Utilisateurs', icon: User, href: '/dashboard/admin/utilisateurs' },
            { id: 'profile', label: 'Mon profil', icon: User, href: '/dashboard/admin/profil' },
        ]
    };

    const normalizeRole = (r) => {
        if (!r) return 'client';
        return r.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, "");
    };

    const normalized = normalizeRole(role);
    const currentMenu = menuItems[normalized] || menuItems.client;

    console.log("SIDEBAR DEBUG:", {
        role,
        normalized,
        hasMenu: !!menuItems[normalized],
        menuCount: currentMenu.length
    });

    const SidebarContent = () => (
        <div className="flex flex-col h-full py-8 px-6 bg-white border-r border-slate-100">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-10 group cursor-pointer hover:opacity-80 transition-opacity">
                <img src="/logo.svg" alt="Logo" className="h-10 w-auto object-contain" />
                <span className="text-xl font-bold tracking-tight text-slate-900">HOLA <span className="text-amber-600 underline decoration-amber-200">DASH</span></span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {currentMenu.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="pt-6 border-t border-slate-100 mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium text-inherit">Déconnexion</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-white shadow-xl rounded-full border border-slate-100"
            >
                <Menu className="w-6 h-6 text-slate-900" />
            </button>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Desktop & Mobile Container */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-[70] w-[280px] transition-transform duration-300 transform
                lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
