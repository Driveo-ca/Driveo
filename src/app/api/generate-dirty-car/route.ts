import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * Generates a photo-realistic car image at a specific dirt level
 * using Gemini text-to-image — no Imagin Studio, no watermarks.
 * Consistent angle, color, and lighting across all 11 levels.
 */

function buildPrompt(vehicleLabel: string, dirtLevel: number, vehicleColor: string): string {
  // STRICT camera & environment — identical across all dirt levels
  const base =
    `Hyper-realistic automotive photograph of a ${vehicleColor} ${vehicleLabel}. ` +
    `EXACT FIXED CAMERA ANGLE: low 3/4 rear passenger-side view, camera positioned at rear bumper height, ` +
    `car fills 90% of frame and is centered, slight upward camera tilt. ` +
    `EXACT FIXED LIGHTING: single dramatic key light from upper-left, subtle rim light on rear quarter panel, ` +
    `near-black dark studio background, soft reflection on a dark wet studio floor beneath the car. ` +
    `Car body paint color is strictly ${vehicleColor} — paint color must NOT change between images. ` +
    `Ultra-high detail, 8K, photographic quality, no watermarks, no text. `;

  const dirtDescriptions: Record<number, string> = {
    0:  'PRISTINE showroom condition. Mirror-perfect paint, flawless reflections on every panel, spotless wheels, zero dirt or dust.',
    1:  'Almost perfect. Barely-visible micro dust film on horizontal surfaces only. Paint still gleams.',
    2:  'Light dust settled on roof, hood, and trunk. Faint haze dulling the gloss slightly.',
    3:  'Noticeable fine dust coating on all panels. Faint smear streaks on rear glass. Paint still visible under dust.',
    4:  'Clear road dust on all panels. Light mud flicks beginning to appear on lower rocker panels and wheel arches.',
    5:  'Moderately dirty. Uniform dust coat on all panels. Distinct brown mud splatters on lower half and wheels.',
    6:  'Quite dirty. Heavy grey-brown road grime on lower two-thirds. Dried dirty-water streaks running down doors. Muddy wheel arches.',
    7:  'Very dirty. Dense caked mud on entire lower body and bumpers. Thick mud caking all four wheels and arches. Grime streaks running from roof down doors.',
    8:  'Extremely filthy. Thick heavy mud completely encrusting lower body and bumpers. Upper panels coated in brown road spray. Wheels nearly buried in mud.',
    9:  'Severely caked. Almost entire car buried under thick wet brown mud. Paint color barely visible through crust. Mud dripping from wheel arches and bumper.',
    10: 'Maximum filth. Car COMPLETELY encrusted in thick dripping brown mud from roof to ground — looks like it drove through a swamp. Only tail lights faintly visible through the mud.',
  };

  return base + (dirtDescriptions[dirtLevel] ?? dirtDescriptions[5]);
}

export async function POST(request: NextRequest) {
  try {
    const { vehicleId, dirtLevel, vehicleLabel, vehicleColor } = await request.json();

    if (!vehicleId || dirtLevel === undefined || !vehicleLabel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const color = (vehicleColor as string | undefined)?.trim() || 'Pearl White';

    const supabase = await createAdminClient();
    const storagePath = `${vehicleId}/level-${dirtLevel}.jpg`;

    // ── Cache check ────────────────────────────────────────────────────────
    const { data: { publicUrl } } = supabase.storage
      .from('dirty-cars')
      .getPublicUrl(storagePath);

    const headCheck = await fetch(publicUrl, { method: 'HEAD' }).catch(() => null);
    if (headCheck?.ok) {
      return NextResponse.json({ url: publicUrl, cached: true });
    }

    // ── Generate with Gemini (text → image) ───────────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const prompt = buildPrompt(vehicleLabel, dirtLevel, color);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // @ts-ignore — responseModalities not yet in TS types
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    const parts   = result.response.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p.inlineData?.data);

    if (!imgPart?.inlineData?.data) {
      return NextResponse.json({ error: 'Gemini returned no image' }, { status: 500 });
    }

    // ── Upload to Supabase storage ─────────────────────────────────────────
    const generated = Buffer.from(imgPart.inlineData.data, 'base64');
    const { error: uploadErr } = await supabase.storage
      .from('dirty-cars')
      .upload(storagePath, generated, { contentType: 'image/jpeg', upsert: true });

    if (uploadErr) {
      return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
    }

    const { data: { publicUrl: freshUrl } } = supabase.storage
      .from('dirty-cars')
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: freshUrl, cached: false });
  } catch (err: any) {
    console.error('[generate-dirty-car]', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
