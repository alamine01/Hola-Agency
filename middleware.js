import { createSupabaseMiddlewareClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Rôles valides dans l'application
const VALID_ROLES = ['client', 'proprietaire', 'prestataire', 'admin'];

// Routes publiques (pas de vérification nécessaire)
const PUBLIC_ROUTES = ['/', '/api/webhooks'];

// Routes d'authentification (login, register, etc.)
const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

/**
 * Normalise un rôle pour comparaison (supprime accents, caractères spéciaux)
 */
function normalizeRole(role) {
    if (!role) return '';
    return role.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, "");
}

/**
 * Extrait le rôle depuis l'URL du dashboard
 * /dashboard/client/profil → "client"
 * /dashboard/admin → "admin"
 */
function getRoleFromPath(pathname) {
    const segments = pathname.split('/');
    if (segments[1] === 'dashboard' && segments[2]) {
        return normalizeRole(segments[2]);
    }
    return null;
}

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // --- 1. Ignorer les fichiers statiques et API publiques ---
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/webhooks') ||
        pathname.includes('.') // fichiers statiques (.css, .js, .ico, .png, etc.)
    ) {
        return NextResponse.next();
    }

    // --- 2. Créer le client Supabase et rafraîchir la session ---
    const { supabase, response } = createSupabaseMiddlewareClient(request);

    // Rafraîchir la session (IMPORTANT : doit être fait avant getUser)
    const { data: { user }, error } = await supabase.auth.getUser();

    // --- 3. Routes d'authentification : rediriger si déjà connecté ---
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
    if (isAuthRoute) {
        if (user) {
            // L'utilisateur est déjà connecté, le rediriger vers son dashboard
            const userRole = request.cookies.get('x-user-role')?.value;
            const role = normalizeRole(userRole) || 'client';
            const redirectUrl = new URL(`/dashboard/${role}`, request.url);
            return NextResponse.redirect(redirectUrl);
        }
        // Pas connecté → laisser accéder aux pages d'auth
        return response;
    }

    // --- 4. Routes du dashboard : vérifier l'authentification ---
    if (pathname.startsWith('/dashboard')) {
        // 4a. Pas d'utilisateur → rediriger vers login
        if (!user) {
            const loginUrl = new URL('/login', request.url);
            // Conserver l'URL demandée pour rediriger après login
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // 4b. Vérifier le rôle
        const userRoleCookie = request.cookies.get('x-user-role')?.value;
        const userRole = normalizeRole(userRoleCookie);
        const pathRole = getRoleFromPath(pathname);

        // Si pas de cookie de rôle → on laisse passer (le DashboardLayoutShell vérifiera)
        // Cela arrive la première fois après un login ou si le cookie est expiré
        if (!userRole) {
            return response;
        }

        // Si on est sur /dashboard (sans sous-route), laisser la page de routing gérer
        if (!pathRole || pathname === '/dashboard') {
            return response;
        }

        // 4c. Vérifier que le rôle correspond à la route demandée
        // L'admin a accès à tous les dashboards
        if (userRole === 'admin') {
            return response;
        }

        // Un non-admin ne peut accéder qu'à son propre dashboard
        if (pathRole !== userRole && VALID_ROLES.includes(pathRole)) {
            const redirectUrl = new URL(`/dashboard/${userRole}`, request.url);
            return NextResponse.redirect(redirectUrl);
        }

        return response;
    }

    // --- 5. Route d'onboarding : vérifier que l'utilisateur est connecté ---
    if (pathname.startsWith('/auth/onboarding')) {
        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        return response;
    }

    // --- 6. Toutes les autres routes → laisser passer ---
    return response;
}

// Configuration : sur quelles routes le middleware s'applique
export const config = {
    matcher: [
        /*
         * Appliquer le middleware sur toutes les routes SAUF :
         * - _next/static (fichiers statiques)
         * - _next/image (optimisation images)
         * - favicon.ico, logo.svg, etc.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
    ],
};
