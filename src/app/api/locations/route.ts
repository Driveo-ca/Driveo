import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/locations — list saved locations for the current user
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('saved_locations')
    .select('*')
    .eq('customer_id', user.id)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 'private, max-age=300');
  return response;
}

// POST /api/locations — create a saved location
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { label, address, lat, lng, notes } = body;

  if (!label || !address || lat == null || lng == null) {
    return NextResponse.json({ error: 'label, address, lat, lng are required' }, { status: 400 });
  }

  // Max 10 saved locations per user
  const { count } = await supabase
    .from('saved_locations')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', user.id);

  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: 'Maximum 10 saved locations' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('saved_locations')
    .insert({
      customer_id: user.id,
      label: label.trim(),
      address,
      lat,
      lng,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// DELETE /api/locations?id=<uuid> — delete a saved location
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const { error } = await supabase
    .from('saved_locations')
    .delete()
    .eq('id', id)
    .eq('customer_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
