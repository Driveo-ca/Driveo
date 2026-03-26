import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import { getVehicleImageUrl } from '@/lib/vehicle-image';

// Use plain supabase-js client (NOT the SSR one) for storage operations
// The SSR client's cookie handling causes upload failures in Route Handlers
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Image-to-image dirt generation using Gemini.
 * Downloads the clean car from Imagin Studio, sends it to Gemini
 * with a prompt to add realistic dirt ON the car body, then caches
 * the result in Supabase Storage (`dirty-cars` bucket).
 */

const DIRT_PROMPTS: Record<number, string> = {
  1:  'Add a very faint, barely-visible thin film of fine light dust settling on the car\'s hood, roof, and trunk lid. The dust is a soft warm grey. Extremely subtle — the paint still gleams underneath.',
  2:  'Add a light layer of fine road dust coating the car\'s horizontal surfaces — hood, roof, trunk. A slight dusty haze on the windshield and rear glass. Paint is still clearly visible under the thin dust film.',
  3:  'Add a noticeable fine dust coating on all car body panels — hood, roof, doors, fenders, and bumpers. The dust is warm grey-brown. Faint dusty streaks on the side windows.',
  4:  'Add clear road dust on all car panels. Light brownish mud flecks and road spray appearing on the lower doors, rocker panels, wheel arches, and rear bumper. Dust film on all glass surfaces.',
  5:  'Add moderate dirt: uniform dust coat on all panels, with distinct brown mud splatters on the lower half of the doors, both bumpers, side skirts, and wheel wells. Wheels are dusty with light mud.',
  6:  'Add heavy grey-brown road grime coating the lower two-thirds of the car body. Dried dirty-water streaks running down the doors from the roof. Muddy wheel arches and bumpers. Heavy dust on the hood and roof.',
  7:  'Add very heavy dirt: dense caked mud on the entire lower body and bumpers. Thick mud caking on all four wheels and wheel arches. Grime streaks running from roof down doors. Upper panels have brown road spray.',
  8:  'Add extreme filth: thick heavy brown mud completely encrusting the lower body, bumpers, and wheel wells. Upper panels coated in thick brown road spray and grime. Wheels nearly buried in caked mud.',
  9:  'Add severe mud caking: almost the entire car body is covered in thick wet brown mud. The original paint color is barely visible through the heavy mud crust. Mud dripping from wheel arches and door sills.',
  10: 'Add MAXIMUM filth: the car is COMPLETELY encrusted in thick dripping dark brown mud from roof to ground — it looks like it drove through a deep mud swamp. Only the headlights and tail lights are faintly visible.',
};

function buildEditPrompt(dirtLevel: number): string {
  const desc = DIRT_PROMPTS[dirtLevel] ?? DIRT_PROMPTS[5];
  return (
    `Edit this car image: ${desc} ` +
    'CRITICAL RULES: ' +
    '1) Add the dirt, dust, and mud ONLY to the car\'s body panels, windows, wheels, bumpers, and trim — NOT on the background or floor. ' +
    '2) Keep the background, lighting, camera angle, and overall composition EXACTLY identical to the input image. ' +
    '3) The dirt must look photo-realistic — real road grime, real mud textures with proper shadows and depth. ' +
    '4) Do NOT change the car\'s shape, model, color underneath, or any background elements. ' +
    '5) REMOVE any watermarks, overlay text, or semi-transparent logos from the image completely. The output must be a clean photo with no text or branding overlaid on it. ' +
    '6) Output a single photo-realistic image with the same dimensions.'
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { make, model, year, color, dirtLevel } = body;

    if (!make || !model || dirtLevel === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const level = Math.round(Number(dirtLevel));
    if (level < 0 || level > 10) {
      return NextResponse.json({ error: 'dirtLevel must be 0-10' }, { status: 400 });
    }

    // Level 0 = clean car — return Imagin Studio URL directly
    if (level === 0) {
      const url = getVehicleImageUrl(make, model, year, {
        angle: 'front-side', width: 1000, color: color || undefined,
      });
      return NextResponse.json({ url, cached: true });
    }

    const slug = `${make}-${model}-${year}`.toLowerCase().replace(/\s+/g, '-');
    const colorSlug = (color || 'default').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const storagePath = `${slug}/${colorSlug}/level-${level}.jpg`;

    // ── Check Supabase cache ──────────────────────────────────────
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('dirty-cars')
      .getPublicUrl(storagePath);

    const headCheck = await fetch(publicUrl, { method: 'HEAD' }).catch(() => null);
    if (headCheck?.ok) {
      return NextResponse.json({ url: publicUrl, cached: true });
    }

    // ── Download clean car from Imagin Studio ─────────────────────
    const cleanUrl = getVehicleImageUrl(make, model, year, {
      angle: 'front-side', width: 1000, color: color || undefined,
    });

    const cleanRes = await fetch(cleanUrl);
    if (!cleanRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch base car image' }, { status: 502 });
    }

    const cleanBuf = Buffer.from(await cleanRes.arrayBuffer());
    const cleanB64 = cleanBuf.toString('base64');
    const mimeType = cleanRes.headers.get('content-type') || 'image/png';

    // ── Generate dirty version with Gemini (image → image) ────────
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

    const prompt = buildEditPrompt(level);

    const result = await geminiModel.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: cleanB64 } },
          { text: prompt },
        ],
      }],
      // @ts-expect-error — responseModalities not in stable TS types yet
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
    });

    const parts = result.response.candidates?.[0]?.content?.parts ?? [];
    const imgPart = parts.find((p: any) => p.inlineData?.data);

    if (!imgPart?.inlineData?.data) {
      console.error('[generate-dirty-car] Gemini returned no image for level', level);
      return NextResponse.json({ error: 'Gemini returned no image' }, { status: 500 });
    }

    // ── Try uploading to Supabase Storage for caching ─────────────
    const imgBuffer = Buffer.from(imgPart.inlineData.data, 'base64');
    const imgMime = imgPart.inlineData.mimeType || 'image/png';
    const { error: uploadErr } = await supabaseAdmin.storage
      .from('dirty-cars')
      .upload(storagePath, imgBuffer, {
        contentType: imgMime,
        upsert: true,
      });

    if (uploadErr) {
      console.error('[generate-dirty-car] upload error:', uploadErr);
      // Storage failed — return the image as a data URL instead
      const dataUrl = `data:${imgMime};base64,${imgPart.inlineData.data}`;
      return NextResponse.json({ url: dataUrl, cached: false });
    }

    const { data: { publicUrl: freshUrl } } = supabaseAdmin.storage
      .from('dirty-cars')
      .getPublicUrl(storagePath);

    return NextResponse.json({ url: freshUrl, cached: false });
  } catch (err: any) {
    console.error('[generate-dirty-car]', err);
    return NextResponse.json({ error: err.message ?? 'Internal error' }, { status: 500 });
  }
}
