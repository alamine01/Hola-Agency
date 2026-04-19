'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        // Optionnel : vérifier si on a bien une session active (via le lien de récupération)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // Si pas de session, l'utilisateur n'est peut-être pas passé par le lien
                // Mais Supabase gère souvent ça en arrière-plan. On peut juste l'alerter si ça échoue.
            }
        };
        checkSession();
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setErrorMsg("Les mots de passe ne correspondent pas.");
        }
        if (password.length < 6) {
            return setErrorMsg("Le mot de passe doit faire au moins 6 caractères.");
        }

        setLoading(true);
        setErrorMsg('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;
            setIsSuccess(true);

            // Redirection automatique après 3 secondes
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (error) {
            setErrorMsg(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[#D4AF37]/5 rounded-l-full blur-3xl -z-10 translate-x-1/2" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl border border-slate-100"
            >
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-amber-500 transition-colors">
                        <Home className="w-8 h-8" />
                        <span className="font-bold text-xl tracking-wider uppercase">HOLA</span>
                    </Link>
                </div>

                {!isSuccess ? (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Nouveau Mot de Passe</h1>
                            <p className="text-slate-500 text-sm font-medium italic">Choisissez un mot de passe robuste et mémorable.</p>
                        </div>

                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-black uppercase tracking-widest mb-6 text-center border border-red-100">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Nouveau mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Confirmer le mot de passe</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none transition-all font-medium"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>Réinitialiser <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tight">Mot de Passe Mis à Jour !</h2>
                        <p className="text-slate-500 font-medium italic leading-relaxed mb-10">
                            Votre mot de passe a été modifié avec succès. Vous allez être redirigé vers la page de connexion.
                        </p>
                        <Link href="/login" className="text-[#D4AF37] font-black uppercase tracking-widest text-xs hover:underline">
                            Se connecter maintenant
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
