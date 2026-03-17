import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  // Use raw supabase-js client to fully bypass RLS
  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await admin
    .from('profiles')
    .select('*, washer_profiles(*)')
    .eq('role', 'washer')
    .order('created_at', { ascending: false });

  // Generate signed URLs for any documents referenced in bio JSON
  const washers = data || [];
  for (const w of washers) {
    const wp = w.washer_profiles;
    if (!wp?.bio) continue;

    try {
      const appData = JSON.parse(wp.bio);
      if (appData.governmentIdPath) {
        const { data: signedUrl } = await admin.storage
          .from('washer-docs')
          .createSignedUrl(appData.governmentIdPath, 3600);
        appData.governmentIdUrl = signedUrl?.signedUrl || '';
      }
      if (appData.insurancePath) {
        const { data: signedUrl } = await admin.storage
          .from('washer-docs')
          .createSignedUrl(appData.insurancePath, 3600);
        appData.insuranceUrl = signedUrl?.signedUrl || '';
      }
      wp.application_data = appData;
    } catch {
      wp.application_data = null;
    }
  }

  return NextResponse.json({ washers });
}

export async function PATCH(request: NextRequest) {
  const { washerId, status, query_message } = await request.json();

  if (!washerId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  // Verify caller is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Check if caller is admin (if authenticated, check role; allow service-level access)
  if (user) {
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Update washer status
  const updateData: Record<string, unknown> = { status };

  const { error } = await admin
    .from('washer_profiles')
    .update(updateData)
    .eq('id', washerId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get washer email for notification
  const { data: washerProfile } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', washerId)
    .single();

  // Send email notification to washer (if Resend configured)
  if (process.env.RESEND_API_KEY && washerProfile?.email) {
    const subjects: Record<string, string> = {
      approved: 'Your DRIVEO application has been approved!',
      rejected: 'Your DRIVEO application update',
      query: 'We need more info about your DRIVEO application',
    };

    const bodies: Record<string, string> = {
      approved: `<h2>Welcome to DRIVEO, ${washerProfile.full_name}!</h2><p>Your application has been approved. You can now log in and start accepting jobs.</p><p><a href="https://driveo.ca/auth/login">Log in to your dashboard</a></p>`,
      rejected: `<h2>Hi ${washerProfile.full_name},</h2><p>Unfortunately, we're unable to approve your application at this time. If you have questions, reach out to us at hello@driveo.ca.</p>`,
      query: `<h2>Hi ${washerProfile.full_name},</h2><p>We need a bit more information about your application:</p><p><strong>${query_message || 'Please contact us at hello@driveo.ca'}</strong></p><p>Please reply to this email or contact us at hello@driveo.ca.</p>`,
    };

    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'DRIVEO <noreply@resend.dev>',
          to: washerProfile.email,
          subject: subjects[status] || 'DRIVEO Application Update',
          html: bodies[status] || `<p>Your application status has been updated to: ${status}</p>`,
        }),
      });
    } catch (e) {
      console.error('Failed to send washer notification:', e);
    }
  }

  return NextResponse.json({ success: true });
}
