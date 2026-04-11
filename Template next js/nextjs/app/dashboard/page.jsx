"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardRootPage() {
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login');
                return;
            }

            // Récupérer le rôle de l'utilisateur dans la table profiles
            const { data: profileData, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (error || !profileData) {
                // Par défaut on redirige vers client si pas de rôle trouvé 
                router.push('/dashboard/client');
            } else {
                const normalizedRole = (profileData.role || 'client').toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]/g, "");
                router.push(`/dashboard/${normalizedRole}`);
            }
        };

        checkUser();
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37] mx-auto mb-4" />
                <p className="text-slate-500 font-medium italic">Chargement de votre espace sécurisé...</p>
            </div>
        </div>
    );
}
