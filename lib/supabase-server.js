import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Crée un client Supabase pour le middleware Next.js.
 * Gère la lecture/écriture des cookies via request/response.
 * 
 * @param {Request} request - La requête entrante
 * @returns {{ supabase, response }} - Le client Supabase et la response avec cookies mis à jour
 */
export function createSupabaseMiddlewareClient(request) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    // Mettre à jour les cookies sur la requête (pour le prochain middleware/handler)
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    // Recréer la response pour inclure les headers mis à jour
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    // Mettre à jour les cookies sur la response (pour le navigateur)
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    return { supabase, response };
}

/**
 * Crée un client Supabase pour les Server Components et API Routes.
 * Utilise les cookies de Next.js pour maintenir la session.
 * 
 * @returns {Promise<SupabaseClient>} Le client Supabase
 */
export async function createSupabaseServerClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Ignoré dans les Server Components en lecture seule
                    }
                },
            },
        }
    );
}
