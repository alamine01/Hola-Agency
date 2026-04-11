"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Home, Briefcase, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('client');

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }
            setUser(user);

            // Vérifier si le profil existe déjà (au cas où il rafraîchit la page)
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (profile?.role) {
                router.push(`/dashboard/${profile.role}`);
            }
        };
        checkUser();
    }, [router]);

    const handleCompleteProfile = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    display_name: user.user_metadata?.full_name || user.email.split('@')[0],
                    email: user.email,
                    role: role,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            router.push(`/dashboard/${role}`);
        } catch (error) {
            console.error("Erreur onboarding:", error);
            alert("Une erreur est survenue lors de la création de votre profil.");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/5 -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100"
            >
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6 shadow-sm">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                        BIENVENUE SUR HOLA
                    </h1>
                    <p className="text-slate-500 font-medium italic">
                        Dernière étape ! Quel sera votre rôle sur la plateforme ?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { id: 'client', label: 'Client', icon: User, desc: 'Louer des villas & réserver des services' },
                        { id: 'proprietaire', label: 'Propriétaire', icon: Home, desc: 'Mettre en location mes villas' },
                        { id: 'prestataire', label: 'Prestataire', icon: Briefcase, desc: 'Proposer mes services de luxe' }
                    ].map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setRole(item.id)}
                            className={`group relative p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer text-center flex flex-col items-center gap-4
                                ${role === item.id
                                    ? 'border-indigo-600 bg-indigo-50/50 shadow-lg'
                                    : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-sm
                                ${role === item.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 group-hover:text-indigo-600'}`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className={`font-black uppercase tracking-widest text-xs mb-2 ${role === item.id ? 'text-indigo-600' : 'text-slate-900'}`}>
                                    {item.label}
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold leading-relaxed italic">
                                    {item.desc}
                                </p>
                            </div>
                            {role === item.id && (
                                <div className="absolute top-4 right-4 text-indigo-600">
                                    <ShieldCheck className="w-5 h-5" fill="currentColor" fillOpacity={0.2} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleCompleteProfile}
                    disabled={saving}
                    className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-70 group"
                >
                    {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>Finaliser mon profil <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>
                    )}
                </button>

                <p className="text-center mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    HOLA AGENCY • SERVICES IMMOBILIERS DE LUXE
                </p>
            </motion.div>
        </div>
    );
}
