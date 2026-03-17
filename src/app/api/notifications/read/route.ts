// ═══════════════════════════════════════
// PATCH /api/notifications/read
// Marks notification(s) as read
// Body: { notificationId: string } or { all: true }
// ═══════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { notificationId?: string; all?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (body.all === true) {
    // Mark all unread notifications as read for this user
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('[API] Failed to mark all notifications as read:', error.message);
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  if (body.notificationId) {
    // Mark a single notification as read (only if it belongs to the user)
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', body.notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.error('[API] Failed to mark notification as read:', error.message);
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: 'Provide either "notificationId" or "all: true"' },
    { status: 400 }
  );
}
