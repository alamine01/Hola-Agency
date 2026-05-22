import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const createScopedClient = (request: Request) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    }
  );
};

export async function GET(request: Request) {
  const supabase = createScopedClient(request);
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : '';
  
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('platform_settings')
    .select('commission_percent')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ commission_percent: (data as any)?.commission_percent });
}

// PUT to update commission percent (admin only)
export async function PUT(request: Request) {
  const supabase = createScopedClient(request);
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : '';

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }
  // Fetch role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await request.json();
  const percent = Number(body.commission_percent);
  if (isNaN(percent) || percent < 0 || percent > 100) {
    return NextResponse.json({ error: 'Invalid commission percent (0-100)' }, { status: 400 });
  }
  // Use a fixed id for singleton settings row
  const { data, error } = await supabase
    .from('platform_settings')
    .upsert({ id: 'platform', commission_percent: percent })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ commission_percent: (data as any)?.commission_percent });
}
