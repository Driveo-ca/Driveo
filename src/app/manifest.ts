import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DRIVEO — Mobile Car Detailing',
    short_name: 'DRIVEO',
    description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. Serving the Greater Toronto Area.',
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#E23232',
    icons: [
      {
        src: '/Driveo-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/Driveo-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
