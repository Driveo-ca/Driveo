import type {Metadata} from 'next';
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['400', '500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Taskly.ca — Home Services, Reimagined',
  description: 'The premium managed home services marketplace for Toronto & the GTA. Vetted professionals. Fixed prices. Effortless booking.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-cream text-rich-black antialiased overflow-x-hidden" suppressHydrationWarning>{children}</body>
    </html>
  );
}
