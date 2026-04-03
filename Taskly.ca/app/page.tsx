import { NavBar } from '@/components/NavBar';
import { Hero } from '@/components/Hero';
import { MarqueeBanner } from '@/components/Marquee';
import { TheProblem } from '@/components/TheProblem';
import { BeforeAfterReveal } from '@/components/BeforeAfterReveal';
import { WhyTaskly } from '@/components/WhyTaskly';
import { Services } from '@/components/Services';
import { BuiltForGTA } from '@/components/BuiltForGTA';
import { HowItWorks } from '@/components/HowItWorks';
import { Trust } from '@/components/Trust';
import { Pricing } from '@/components/Pricing';
import { Cta } from '@/components/Cta';
import { Footer } from '@/components/Footer';
import { CursorProvider } from '@/components/CursorProvider';

export default function Home() {
  return (
    <main className="min-h-screen bg-cream text-rich-black noise-overlay">
      <CursorProvider />
      <NavBar />

      {/* ACT 1: THE HOOK */}
      <Hero />
      <MarqueeBanner />

      {/* ACT 2: THE PROBLEM */}
      <TheProblem />

      {/* ACT 3: THE SOLUTION REVEAL */}
      <BeforeAfterReveal />
      <WhyTaskly />

      {/* ACT 4: THE PRODUCT */}
      <Services />
      <BuiltForGTA />
      <HowItWorks />

      {/* ACT 5: TRUST & CONVERT */}
      <Trust />
      <Pricing />
      <Cta />
      <Footer />
    </main>
  );
}
