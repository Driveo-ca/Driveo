// ═══════════════════════════════════════
// GET /api/notifications
// Returns notifications for the authenticated user
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[API] Failed to fetch notifications:', error.message);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }

  return NextResponse.json({ notifications: data });
}
