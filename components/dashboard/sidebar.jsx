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
    CreditCard,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const Sidebar = ({ role, isCollapsed, setIsCollapsed }) => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        // Supprimer le cookie de rôle utilisé par le middleware
        document.cookie = 'x-user-role=; path=/; max-age=0; SameSite=Lax';
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
            { id: 'contacts', label: 'Messages Contact', icon: MessageSquare, href: '/dashboard/admin/contacts' },
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
        <div className={`flex flex-col h-full py-8 bg-white border-r border-slate-100 transition-all duration-300 relative ${isCollapsed ? 'px-3' : 'px-6'}`}>
            {/* Collapse Button (Desktop Only) */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex absolute top-10 -right-4 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all z-[80] cursor-pointer"
            >
                <ChevronLeft className={`w-4.5 h-4.5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>

            {/* Logo */}
            <Link href="/" className={`flex items-center mb-12 group cursor-pointer hover:opacity-80 transition-all ${isCollapsed ? 'justify-center gap-0' : 'gap-4'}`}>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-50 group-hover:scale-110 transition-transform shrink-0">
                    <img src="/logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
                </div>
                {!isCollapsed && (
                    <span className="text-2xl font-black tracking-tighter text-slate-900 whitespace-nowrap overflow-hidden animate-in fade-in duration-300">
                        HOLA <span className="text-amber-600">DASH</span>
                    </span>
                )}
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
                            title={isCollapsed ? item.label : undefined}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {!isCollapsed && (
                                <span className="font-medium whitespace-nowrap animate-in fade-in duration-300">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="pt-6 border-t border-slate-100 mt-auto">
                <button
                    onClick={handleLogout}
                    title={isCollapsed ? 'Déconnexion' : undefined}
                    className={`flex items-center gap-3 px-4 py-3 w-full text-left text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    {!isCollapsed && (
                        <span className="font-medium text-inherit whitespace-nowrap animate-in fade-in duration-300">Déconnexion</span>
                    )}
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
            <aside 
                className={`
                    fixed top-0 left-0 bottom-0 z-[70] transition-all duration-300 transform
                    lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ width: isCollapsed ? '80px' : '280px' }}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
