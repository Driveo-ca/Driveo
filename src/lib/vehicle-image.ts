/**
 * Generate a photo-realistic car image URL using Imagin Studio CDN.
 * Uses VEHICLE_IMAGE_API_KEY env var as customer key (paid = no watermark).
 * Falls back to 'img' demo key (has watermark) if no key is set.
 */
export function getVehicleImageUrl(
  make: string,
  model: string,
  year: number,
  options?: {
    angle?: 'side' | 'front' | 'rear' | 'front-side' | 'rear-side';
    width?: number;
    color?: string;
  }
): string {
  const { angle = 'side', width = 800, color } = options || {};

  const cleanMake = make.toLowerCase().trim().replace(/\s+/g, '-');
  const cleanModel = model.toLowerCase().trim().replace(/\s+/g, '-');

  const angleMap: Record<string, number> = {
    'side': 9,
    'front': 1,
    'rear': 5,
    'front-side': 2,
    'rear-side': 4,
  };

  // Use paid customer key if available, otherwise demo key (watermarked)
  const customerKey = process.env.NEXT_PUBLIC_VEHICLE_IMAGE_KEY || 'img';

  const params = new URLSearchParams({
    customer: customerKey,
    make: cleanMake,
    modelFamily: cleanModel,
    modelYear: String(year),
    angle: String(angleMap[angle] || 9),
    width: String(width),
    zoomType: 'fullscreen',
  });

  if (color) {
    params.set('paintId', color);
  }

  return `https://cdn.imagin.studio/getimage?${params.toString()}`;
}
