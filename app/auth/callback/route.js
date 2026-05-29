import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // This can be ignored if you have middleware refreshing sessions
                        }
                    },
                },
            }
        )

        // Echanger le code contre une session
        await supabase.auth.exchangeCodeForSession(code)

        // Vérifier si le profil existe déjà
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (!profile || !profile.role) {
                return NextResponse.redirect(`${requestUrl.origin}/auth/onboarding`)
            }

            // Stocker le rôle dans un cookie pour le middleware de sécurité
            const normalizedRole = profile.role.toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]/g, "");

            const redirectResponse = NextResponse.redirect(`${requestUrl.origin}/dashboard/${normalizedRole}`)
            redirectResponse.cookies.set('x-user-role', normalizedRole, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 jours
                sameSite: 'lax',
            })
            return redirectResponse
        }
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}
