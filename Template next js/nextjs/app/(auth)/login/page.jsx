'use client';

import { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Home, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

function LoginForm() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleGoogleLogin = async () => {
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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        try {
            // 1. Authentifier via Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) throw error;

            // 2. Récupérer le rôle de l'utilisateur dans la table publique 'profiles'
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profileError && profileError.code !== 'PGRST116') {
                console.error("Erreur récupération rôle:", profileError);
            }

            // 3. Rediriger selon le rôle (par défaut client)
            const rawRole = profileData?.role || 'client';
            const role = rawRole.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "");
            router.push(`/dashboard/${role}`);

        } catch (error) {
            if (error.message === 'Invalid login credentials') {
                // Vérifier si un compte existe avec cet email
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', email.trim())
                    .single();

                if (!profile) {
                    router.push(`/register?email=${encodeURIComponent(email)}&error=no_account`);
                    return;
                }
            }
            setErrorMsg(error.message || "Identifiants incorrects.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4AF37]/5 rounded-l-full blur-3xl -z-10 translate-x-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-500 transition-colors">
                        <img src="/logo.svg" alt="Logo" className="h-10 w-auto object-contain" />
                        <span className="font-bold text-xl tracking-wider">HOLA AGENCY</span>
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Bon retour parmi nous</h1>
                    <p className="text-slate-500 text-sm">Connectez-vous pour accéder à votre espace personnel.</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-6 text-center border border-red-100">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Adresse Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                                placeholder="votre@email.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                            <Link href="/forgot-password" className="text-xs text-[#D4AF37] font-semibold hover:underline">Mot de passe oublié ?</Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-colors shadow-lg shadow-slate-200/50 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>Se connecter <ArrowRight className="w-4 h-4" /></>
                        )}
                    </button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Ou continuer avec</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                        Se connecter avec Google
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-8">
                    Pas encore de compte ?{' '}
                    <Link href="/register" className="text-[#D4AF37] font-semibold hover:underline">
                        S'inscrire gratuitement
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>}>
            <LoginForm />
        </Suspense>
    );
}
