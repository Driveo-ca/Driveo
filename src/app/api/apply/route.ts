import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated. Please sign up first.' }, { status: 401 });
    }

    const formData = await request.formData();

    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string;
    const streetAddress = formData.get('streetAddress') as string;
    const city = formData.get('city') as string;
    const province = formData.get('province') as string;
    const postalCode = formData.get('postalCode') as string;
    const experienceLevel = formData.get('experienceLevel') as string;
    const yearsExperience = formData.get('yearsExperience') as string;
    const maxWashesPerDay = formData.get('maxWashesPerDay') as string;
    const governmentId = formData.get('governmentId') as File | null;
    const insurance = formData.get('insurance') as File | null;

    if (!fullName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Use raw supabase-js client with service role key to bypass RLS on storage
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Upload documents to Supabase Storage
    let governmentIdPath = '';
    let insurancePath = '';

    if (governmentId && governmentId.size > 0) {
      const ext = governmentId.name.split('.').pop() || 'jpg';
      const path = `${user.id}/government-id.${ext}`;
      const buffer = Buffer.from(await governmentId.arrayBuffer());
      const { error: uploadErr } = await admin.storage
        .from('washer-docs')
        .upload(path, buffer, {
          contentType: governmentId.type,
          upsert: true,
        });
      if (!uploadErr) {
        governmentIdPath = path;
        console.log('[Apply] Gov ID uploaded:', path);
      } else {
        console.error('[Apply] Gov ID upload error:', uploadErr.message);
      }
    }

    if (insurance && insurance.size > 0) {
      const ext = insurance.name.split('.').pop() || 'pdf';
      const path = `${user.id}/insurance.${ext}`;
      const buffer = Buffer.from(await insurance.arrayBuffer());
      const { error: uploadErr } = await admin.storage
        .from('washer-docs')
        .upload(path, buffer, {
          contentType: insurance.type,
          upsert: true,
        });
      if (!uploadErr) insurancePath = path;
      else console.error('[Apply] Insurance upload error:', uploadErr.message);
    }

    // Update the profile with washer details
    await admin.from('profiles').upsert({
      id: user.id,
      role: 'washer',
      full_name: fullName,
      email: user.email,
      phone,
    });

    // Store structured application data as JSON in bio field
    const applicationData = {
      fullName,
      phone,
      streetAddress,
      city,
      province,
      postalCode,
      experienceLevel,
      yearsExperience: yearsExperience || '',
      maxWashesPerDay: maxWashesPerDay || '4',
      governmentIdPath,
      insurancePath,
      appliedAt: new Date().toISOString(),
    };

    // Create/update washer profile with application details
    await admin.from('washer_profiles').upsert({
      id: user.id,
      status: 'pending',
      bio: JSON.stringify(applicationData),
      service_zones: [postalCode?.substring(0, 3)].filter(Boolean),
    });

    // Send notification email to admin (if Resend is configured)
    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'DRIVEO Applications <onboarding@resend.dev>',
            to: process.env.ADMIN_EMAIL,
            subject: `New Washer Application: ${fullName}`,
            html: `
              <h2>New Washer Application</h2>
              <p><strong>Name:</strong> ${fullName}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Location:</strong> ${streetAddress}, ${city}, ${province} ${postalCode}</p>
              <p><strong>Experience:</strong> ${experienceLevel === 'trained' ? `Trained (${yearsExperience} years)` : 'Fresher'}</p>
              <p><strong>Max Washes/Day:</strong> ${maxWashesPerDay}</p>
              <p><strong>Documents:</strong> Gov ID ${governmentIdPath ? 'uploaded' : 'missing'}, Insurance ${insurancePath ? 'uploaded' : 'not provided'}</p>
              <p><a href="https://driveo.ca/admin/washers">Review in Admin Dashboard</a></p>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
      }
    }

    console.log(`Washer application submitted for ${fullName} (${user.email}) — pending approval`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application submission error:', error);
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 });
  }
}
