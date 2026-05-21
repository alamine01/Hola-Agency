'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Home, Mail, Lock, User, Phone, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [formData, setFormData] = useState({
        role: 'client', // client, proprietaire, prestataire, agent
        nom_complet: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const urlRole = searchParams.get('role');
        const urlEmail = searchParams.get('email');
        const urlError = searchParams.get('error');

        if (urlRole && ['client', 'proprietaire', 'prestataire', 'agent'].includes(urlRole)) {
            setFormData(prev => ({ ...prev, role: urlRole }));
        }

        if (urlEmail) {
            setFormData(prev => ({ ...prev, email: urlEmail }));
        }

        if (urlError === 'no_account') {
            setErrorMsg("Aucun compte n'est lié à cette adresse. Créez votre compte en quelques secondes !");
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });
            if (error) throw error;
        } catch (error) {
            setErrorMsg(error.message);
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.password !== formData.confirmPassword) {
            return setErrorMsg("Les mots de passe ne correspondent pas.");
        }

        setLoading(true);

        try {
            // 1. Créer le compte utilisateur dans Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email.trim(),
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.nom_complet,
                        role: formData.role
                    }
                }
            });

            if (authError) throw authError;

            // 2. Insérer dynamiquement dans la table "users" publique (ancienne BD migrée)
            if (authData.user) {
                const nameParts = formData.nom_complet.split(' ');
                const prenom = nameParts[0];
                const nom = nameParts.slice(1).join(' ') || prenom;

                const { error: dbError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            display_name: formData.nom_complet,
                            email: formData.email,
                            role: formData.role,
                            updated_at: new Date().toISOString()
                        }
                    ]);

                if (dbError) {
                    console.error("Erreur insertion table users: ", dbError);
                    // On supprime l'utilisateur Auth si la création du profil échoue (optionnel)
                    // Mais ici on veut surtout savoir pourquoi ça échoue.
                    throw new Error(`Erreur Base de données: ${dbError.message} (${dbError.code})`);
                }
            }

            // 3. Succès
            alert("Compte créé avec succès !");
            router.push('/login');

        } catch (error) {
            setErrorMsg(error.message || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-1/2 h-full bg-indigo-500/5 rounded-r-full blur-3xl -z-10 -translate-x-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="container-auth bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-500 transition-colors">
                        <img src="/logo.svg" alt="Logo" className="h-10 w-14 object-contain" />
                        <span className="font-bold text-xl tracking-wider">HOLA AGENCY</span>
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
                    <p className="text-slate-500 text-sm">Rejoignez l'expérience HOLA et profitez de services premium.</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 text-center border border-red-100">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">

                    {/* Choix du Rôle */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                        {['client', 'proprietaire', 'prestataire'].map((r) => (
                            <div
                                key={r}
                                onClick={() => setFormData({ ...formData, role: r })}
                                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 text-center text-sm font-semibold
                                    ${formData.role === r
                                        ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37]'
                                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}`}
                            >
                                {r === 'client' && <User className="w-6 h-6" />}
                                {r === 'proprietaire' && <Home className="w-6 h-6" />}
                                {r === 'prestataire' && <Briefcase className="w-6 h-6" />}
                                <span className="capitalize">{r === 'proprietaire' ? 'Propriétaire' : r}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nom complet</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    name="nom_complet" type="text" required
                                    value={formData.nom_complet} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Téléphone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    name="telephone" type="tel" required
                                    value={formData.telephone} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                                    placeholder="+221 77 000 00 00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Adresse Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                name="email" type="email" required
                                value={formData.email} onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                                placeholder="votre@email.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    name="password" type="password" required minLength={6}
                                    value={formData.password} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Confirmer</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    name="confirmPassword" type="password" required minLength={6}
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>S'inscrire <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Ou s'inscrire avec</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleRegister}
                        disabled={loading}
                        className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                        S'inscrire avec Google
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-8">
                    Déjà un compte ?{' '}
                    <Link href="/login" className="text-[#D4AF37] font-semibold hover:underline">
                        Se connecter
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
            <RegisterForm />
        </Suspense>
    );
}
