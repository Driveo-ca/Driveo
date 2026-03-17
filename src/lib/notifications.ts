// ═══════════════════════════════════════
// DRIVEO — Notification System
// SMS (Twilio) + Email (Resend) + In-App
// ═══════════════════════════════════════

import { createClient } from '@supabase/supabase-js';

// Admin client bypasses RLS for server-side notification operations
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(url, key);
}

// ── SMS via Twilio ──────────────────────────────────────────

export async function sendSMS(to: string, body: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('[Notifications] Twilio not configured — skipping SMS');
    return false;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Notifications] Twilio SMS failed:', response.status, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Notifications] Twilio SMS error:', err);
    return false;
  }
}

// ── Email via Resend ────────────────────────────────────────

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn('[Notifications] Resend not configured — skipping email');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DRIVEO <noreply@driveo.ca>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[Notifications] Resend email failed:', response.status, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[Notifications] Resend email error:', err);
    return false;
  }
}

// ── In-App Notification (DB) ────────────────────────────────

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  const admin = getAdminClient();

  const { error } = await admin.from('notifications').insert({
    user_id: userId,
    type,
    title,
    body,
    data: data ?? null,
    is_read: false,
  });

  if (error) {
    console.error('[Notifications] Failed to create in-app notification:', error.message);
  }
}

// ── Helper: Fetch user profile ──────────────────────────────

async function getUserContact(userId: string): Promise<{
  phone: string | null;
  email: string | null;
  full_name: string;
} | null> {
  const admin = getAdminClient();

  const { data, error } = await admin
    .from('profiles')
    .select('phone, email, full_name')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('[Notifications] Failed to fetch user profile:', error?.message);
    return null;
  }

  return data;
}

// ── High-Level Notification Functions ───────────────────────

export async function notifyWasherNewJob(
  washerId: string,
  booking: {
    id: string;
    service_address: string;
    wash_plan: string;
    total_price: number;
  }
): Promise<void> {
  const user = await getUserContact(washerId);
  if (!user) return;

  const planLabel = formatWashPlan(booking.wash_plan);
  const price = formatPrice(booking.total_price);

  const smsBody = `DRIVEO: New ${planLabel} job at ${booking.service_address}. Payout: ${price}. Open the app to accept.`;

  const emailSubject = `New Wash Job Available — ${planLabel}`;
  const emailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E23232;">New Job Available</h2>
      <p>Hi ${user.full_name},</p>
      <p>A new <strong>${planLabel}</strong> wash job is available:</p>
      <ul>
        <li><strong>Location:</strong> ${booking.service_address}</li>
        <li><strong>Your Payout:</strong> ${price}</li>
      </ul>
      <p>Open the Driveo app to view details and accept the job.</p>
      <p style="color: #666; font-size: 12px;">— DRIVEO Team</p>
    </div>
  `;

  const promises: Promise<unknown>[] = [
    createNotification(washerId, 'new_job', 'New Job Available', `${planLabel} wash at ${booking.service_address}`, {
      booking_id: booking.id,
      wash_plan: booking.wash_plan,
      total_price: booking.total_price,
    }),
  ];

  if (user.phone) {
    promises.push(sendSMS(user.phone, smsBody));
  }
  if (user.email) {
    promises.push(sendEmail(user.email, emailSubject, emailHtml));
  }

  await Promise.allSettled(promises);
}

export async function notifyCustomerWasherAssigned(
  customerId: string,
  washerName: string,
  bookingId: string
): Promise<void> {
  const user = await getUserContact(customerId);
  if (!user) return;

  const smsBody = `DRIVEO: ${washerName} has been assigned to your wash. Track their arrival in the app.`;

  const emailSubject = 'Your Washer Has Been Assigned';
  const emailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E23232;">Washer Assigned</h2>
      <p>Hi ${user.full_name},</p>
      <p><strong>${washerName}</strong> has been assigned to your wash booking.</p>
      <p>You can track their location in real-time through the Driveo app.</p>
      <p style="color: #666; font-size: 12px;">— DRIVEO Team</p>
    </div>
  `;

  const promises: Promise<unknown>[] = [
    createNotification(customerId, 'washer_assigned', 'Washer Assigned', `${washerName} has been assigned to your wash.`, {
      booking_id: bookingId,
      washer_name: washerName,
    }),
  ];

  if (user.phone) {
    promises.push(sendSMS(user.phone, smsBody));
  }
  if (user.email) {
    promises.push(sendEmail(user.email, emailSubject, emailHtml));
  }

  await Promise.allSettled(promises);
}

export async function notifyCustomerWasherEnRoute(
  customerId: string,
  washerName: string,
  bookingId: string
): Promise<void> {
  const user = await getUserContact(customerId);
  if (!user) return;

  const smsBody = `DRIVEO: ${washerName} is on the way! Track their location live in the app.`;

  const emailSubject = 'Your Washer Is On The Way';
  const emailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E23232;">Washer En Route</h2>
      <p>Hi ${user.full_name},</p>
      <p><strong>${washerName}</strong> is on the way to your location!</p>
      <p>Track their arrival in real-time through the Driveo app.</p>
      <p style="color: #666; font-size: 12px;">— DRIVEO Team</p>
    </div>
  `;

  const promises: Promise<unknown>[] = [
    createNotification(customerId, 'washer_en_route', 'Washer En Route', `${washerName} is on the way!`, {
      booking_id: bookingId,
      washer_name: washerName,
    }),
  ];

  if (user.phone) {
    promises.push(sendSMS(user.phone, smsBody));
  }
  if (user.email) {
    promises.push(sendEmail(user.email, emailSubject, emailHtml));
  }

  await Promise.allSettled(promises);
}

export async function notifyCustomerWashComplete(
  customerId: string,
  bookingId: string,
  totalPrice: number
): Promise<void> {
  const user = await getUserContact(customerId);
  if (!user) return;

  const price = formatPrice(totalPrice);

  const smsBody = `DRIVEO: Your wash is complete! Total charged: ${price}. View before/after photos in the app.`;

  const emailSubject = 'Your Wash Is Complete';
  const emailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #E23232;">Wash Complete</h2>
      <p>Hi ${user.full_name},</p>
      <p>Your car wash has been completed!</p>
      <ul>
        <li><strong>Total Charged:</strong> ${price}</li>
      </ul>
      <p>View your before &amp; after photos and leave a review in the Driveo app.</p>
      <p style="color: #666; font-size: 12px;">— DRIVEO Team</p>
    </div>
  `;

  const promises: Promise<unknown>[] = [
    createNotification(customerId, 'wash_complete', 'Wash Complete', `Your wash is done! Total: ${price}`, {
      booking_id: bookingId,
      total_price: totalPrice,
    }),
  ];

  if (user.phone) {
    promises.push(sendSMS(user.phone, smsBody));
  }
  if (user.email) {
    promises.push(sendEmail(user.email, emailSubject, emailHtml));
  }

  await Promise.allSettled(promises);
}

// ── Formatting Helpers ──────────────────────────────────────

function formatWashPlan(plan: string): string {
  const labels: Record<string, string> = {
    regular: 'Regular',
    interior_exterior: 'Interior & Exterior',
    detailing: 'Detailing',
  };
  return labels[plan] ?? plan;
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
