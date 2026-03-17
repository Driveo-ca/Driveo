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
  title: 'DRIVEO — Mobile Car Detailing Across the GTA | We Come to You',
  description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever. Serving Etobicoke, Mississauga, and the Greater Toronto Area.',
  keywords: ['car detailing', 'mobile car wash', 'GTA', 'Etobicoke', 'Mississauga', 'condo car wash'],
  icons: {
    icon: '/Driveo-logo.png',
    apple: '/Driveo-logo.png',
  },
  openGraph: {
    title: 'DRIVEO — Mobile Car Detailing Across the GTA',
    description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn(inter.variable, anton.variable, jetbrainsMono.variable, playfairDisplay.variable, poppins.variable, "font-sans", geist.variable)}>
      <body style={{ backgroundColor: '#050505', color: '#ffffff' }}>
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
