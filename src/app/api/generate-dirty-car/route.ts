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
  1:  'Add a very faint, barely-visible thin film of fine light dust evenly across the ENTIRE car — hood, roof, trunk, all doors, fenders, and bumpers. The dust is a soft warm grey. Extremely subtle — the paint still gleams underneath.',
  2:  'Add a light layer of fine road dust coating the ENTIRE car body evenly — hood, roof, trunk, all four doors, fenders, bumpers, and all glass surfaces. A slight dusty haze covers everything uniformly.',
  3:  'Add a noticeable fine dust coating uniformly on ALL car body panels — hood, roof, trunk, every door, every fender, both bumpers, and side mirrors. The dust is warm grey-brown. Dusty film on all windows and windshield.',
  4:  'Add clear road dust uniformly on ALL car panels from roof to bumpers. Light brownish mud flecks and road spray scattered across the entire body — hood, roof, doors, fenders, trunk. Dust film on all glass. Wheels are dusty.',
  5:  'Add moderate dirt uniformly across the ENTIRE car body: dust and brown mud splatters covering the hood, roof, trunk, all doors, all fenders, both bumpers, wheels, and all glass. The dirt is evenly distributed everywhere, not just the bottom.',
  6:  'Add heavy grey-brown road grime coating the ENTIRE car body uniformly — roof, hood, trunk, all doors, all fenders, bumpers, wheels. Dried dirty-water streaks on doors and windows. Heavy brown dust and mud splatter across every panel evenly.',
  7:  'Add very heavy dirt across the ENTIRE car: dense caked mud and thick grime on ALL panels — roof, hood, trunk, every door, every fender, both bumpers. All four wheels caked in mud. Every window has thick grime. Dirt is distributed evenly top to bottom.',
  8:  'Add extreme filth covering the ENTIRE car uniformly: thick heavy brown mud and grime encrusting ALL body panels from roof to ground — hood, roof, trunk, all doors, all fenders, bumpers, wheels. The entire car is uniformly coated in thick dirt and mud.',
  9:  'Add severe mud caking covering the ENTIRE car body uniformly from roof to bumpers: thick wet brown mud on the hood, roof, trunk, every door, every fender, both bumpers, all wheels. The original paint is barely visible anywhere. Every surface is equally filthy.',
  10: 'Add MAXIMUM filth: the ENTIRE car is COMPLETELY and UNIFORMLY encrusted in thick dripping dark brown mud from roof to ground — hood, roof, trunk, all doors, all fenders, bumpers, wheels, everything. It looks like the entire car was submerged in mud. Only headlights and tail lights faintly visible.',
};

function buildEditPrompt(dirtLevel: number): string {
  const desc = DIRT_PROMPTS[dirtLevel] ?? DIRT_PROMPTS[5];
  return (
    `Edit this car image: ${desc} ` +
    'CRITICAL RULES: ' +
    '1) Add the dirt, dust, and mud ONLY to the car\'s body panels, windows, wheels, bumpers, and trim — NOT on the background or ground surface. ' +
    '2) Change the background to a CLEAN, PLAIN WHITE background. The car should appear on a pure white studio backdrop. Remove any dark, black, or colored backgrounds and replace with solid white. ' +
    '3) The dirt must look photo-realistic — real road grime, real mud textures with proper shadows and depth. ' +
    '4) IMPORTANT: Distribute the dirt, dust, and mud EVENLY across the ENTIRE car body — top, middle, and bottom. The roof, hood, trunk, upper doors, and upper fenders must have just as much dirt as the lower panels. Do NOT concentrate dirt only on the lower half. ' +
    '5) Do NOT change the car\'s shape, model, or color underneath the dirt. ' +
    '6) REMOVE any watermarks, overlay text, or semi-transparent logos from the image completely. The output must be a clean photo with no text or branding overlaid on it. ' +
    '7) Output a single photo-realistic image with the same dimensions.'
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
