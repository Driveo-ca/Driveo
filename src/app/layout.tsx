import type { Metadata } from 'next';
import Script from 'next/script';
import { Anton, Inter, JetBrains_Mono, Playfair_Display, Poppins, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";
import { Providers } from '@/lib/providers';

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://driveo.ca'),
  title: {
    default: 'DRIVEO — Mobile Car Detailing Across the GTA | We Come to You',
    template: '%s | DRIVEO',
  },
  description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever. Serving Etobicoke, Mississauga, Brampton, Oakville, and the Greater Toronto Area. From $18.',
  keywords: [
    'mobile car wash', 'mobile car detailing', 'car detailing GTA', 'car detailing Toronto',
    'car detailing Mississauga', 'car detailing Etobicoke', 'car detailing Brampton',
    'car detailing Oakville', 'mobile auto detailing', 'condo car wash', 'condo parking car wash',
    'waterless car wash', 'hand car wash near me', 'car wash at home', 'interior car detailing',
    'exterior car detailing', 'car wash subscription', 'monthly car wash plan',
    'on demand car wash', 'doorstep car wash', 'professional car cleaning',
    'car wash Uber drivers', 'mobile detailing near me', 'best car detailing GTA',
    'DRIVEO', 'driveo car wash',
  ],
  authors: [{ name: 'DRIVEO Auto Care Inc.' }],
  creator: 'DRIVEO',
  publisher: 'DRIVEO Auto Care Inc.',
  formatDetection: { telephone: true, email: true, address: true },
  icons: {
    icon: [
      { url: '/Driveo-logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/Driveo-logo.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://driveo.ca',
    siteName: 'DRIVEO',
    title: 'DRIVEO — Mobile Car Detailing Across the GTA | We Come to You',
    description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever. Serving the Greater Toronto Area.',
    images: [
      {
        url: '/collage.jpg',
        width: 1200,
        height: 630,
        alt: 'DRIVEO Mobile Car Detailing — Before and After',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DRIVEO — Mobile Car Detailing Across the GTA',
    description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever.',
    images: ['/collage.jpg'],
    creator: '@driveoca',
  },
  alternates: {
    canonical: 'https://driveo.ca',
  },
  category: 'automotive',
  other: {
    'geo.region': 'CA-ON',
    'geo.placename': 'Greater Toronto Area',
    'geo.position': '43.6532;-79.3832',
    'ICBM': '43.6532, -79.3832',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, anton.variable, jetbrainsMono.variable, playfairDisplay.variable, poppins.variable, "font-sans", geist.variable)}>
      <body>
        <Providers>
        {children}
        </Providers>
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`}
            strategy="afterInteractive"
          />
        )}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
