import { CursorProvider } from '@/components/CursorProvider';
import { NoiseOverlay } from '@/components/NoiseOverlay';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { Marquee } from '@/components/Marquee';
import { USPGrid } from '@/components/USPGrid';
import { GoogleReviews } from '@/components/GoogleReviews';
import { CondoSection } from '@/components/CondoSection';
import { PainCollage } from '@/components/PainCollage';
import { HowItWorks } from '@/components/HowItWorks';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';
import { PricingCards } from '@/components/PricingCards';
import { BookingForm } from '@/components/BookingForm';
import { FAQAccordion } from '@/components/FAQAccordion';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <CursorProvider>
      <div className="custom-cursor bg-[#050505] text-white min-h-screen selection:bg-[#E23232] selection:text-white overflow-x-clip">
        <NoiseOverlay />
        <Navbar />
        <HeroSection />
        <Marquee />
        <BeforeAfterSlider />
        <GoogleReviews />
        <CondoSection />
        <PainCollage />
        <USPGrid />
        <HowItWorks />
        <PricingCards />
        <BookingForm />
        <FAQAccordion />
        <Footer />
      </div>
    </CursorProvider>
  );
}
