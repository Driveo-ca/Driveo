import Script from 'next/script';
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://driveo.ca/#business',
      name: 'DRIVEO',
      alternateName: 'DRIVEO Auto Care Inc.',
      url: 'https://driveo.ca',
      logo: 'https://driveo.ca/Driveo-logo.png',
      image: 'https://driveo.ca/collage-1.jpeg',
      description: 'Professional mobile car detailing service in the Greater Toronto Area. We come to your door — driveways, condo parking, office lots. Book in 30 seconds.',
      telephone: '+1-416-555-DRIV',
      email: 'hello@driveo.ca',
      priceRange: '$$',
      currenciesAccepted: 'CAD',
      paymentAccepted: 'Credit Card, Debit Card',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '30 Eglinton Ave W',
        addressLocality: 'Mississauga',
        addressRegion: 'ON',
        postalCode: 'L5R 3E7',
        addressCountry: 'CA',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 43.6532,
        longitude: -79.3832,
      },
      areaServed: [
        { '@type': 'City', name: 'Toronto', sameAs: 'https://en.wikipedia.org/wiki/Toronto' },
        { '@type': 'City', name: 'Mississauga' },
        { '@type': 'City', name: 'Etobicoke' },
        { '@type': 'City', name: 'Brampton' },
        { '@type': 'City', name: 'Oakville' },
        { '@type': 'City', name: 'Port Credit' },
        { '@type': 'AdministrativeArea', name: 'Greater Toronto Area' },
      ],
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '07:00',
        closes: '21:00',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        bestRating: '5',
        ratingCount: '127',
        reviewCount: '98',
      },
      review: [
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Sarah L.' },
          datePublished: '2026-03-13',
          reviewBody: 'Live in a condo on Hurontario. DRIVEO came into my underground parking and washed my car while I was at work. No mess, no complaints. On the monthly plan now.',
          reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        },
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Michael T.' },
          datePublished: '2026-02-27',
          reviewBody: 'Called three other services before DRIVEO. Two never called back. DRIVEO confirmed in 30 seconds, showed up on time, sent before/after photos. Night and day.',
          reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        },
        {
          '@type': 'Review',
          author: { '@type': 'Person', name: 'Priya M.' },
          datePublished: '2026-03-20',
          reviewBody: 'Booked at 11pm, they came next morning. Got a text when they arrived, text when done, and 10 photos of my car looking brand new. This is how it should work.',
          reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
        },
      ],
      sameAs: [
        'https://www.instagram.com/driveo.ca',
        'https://www.tiktok.com/@driveo.ca',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://driveo.ca/#website',
      url: 'https://driveo.ca',
      name: 'DRIVEO',
      publisher: { '@id': 'https://driveo.ca/#business' },
    },
    {
      '@type': 'WebPage',
      '@id': 'https://driveo.ca/#webpage',
      url: 'https://driveo.ca',
      name: 'DRIVEO — Mobile Car Detailing Across the GTA | We Come to You',
      isPartOf: { '@id': 'https://driveo.ca/#website' },
      about: { '@id': 'https://driveo.ca/#business' },
      description: 'Pro hand-wash at your door. Book in 30 seconds. Before/after photo proof. No scratches. Ever. Serving Etobicoke, Mississauga, and the Greater Toronto Area.',
    },
    {
      '@type': 'Service',
      '@id': 'https://driveo.ca/#service',
      name: 'Mobile Car Detailing',
      serviceType: 'Mobile Car Wash & Detailing',
      provider: { '@id': 'https://driveo.ca/#business' },
      areaServed: { '@type': 'AdministrativeArea', name: 'Greater Toronto Area' },
      description: 'Professional hand car wash and detailing at your location. Waterless & rinseless products safe for condo underground parking. Three plans: Regular Wash, Interior & Exterior, and Full Detailing.',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Car Detailing Plans',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Regular Wash',
            description: 'Professional hand wash exterior',
            price: '18.00',
            priceCurrency: 'CAD',
          },
          {
            '@type': 'Offer',
            name: 'Interior & Exterior',
            description: 'Full interior vacuum + exterior hand wash',
            price: '25.00',
            priceCurrency: 'CAD',
          },
          {
            '@type': 'Offer',
            name: 'Full Detailing',
            description: 'Complete professional detailing inside and out',
            price: '189.00',
            priceCurrency: 'CAD',
          },
          {
            '@type': 'Offer',
            name: 'DRIVEO Go Subscription',
            description: '2 express hand washes per month',
            price: '49.00',
            priceCurrency: 'CAD',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '49.00',
              priceCurrency: 'CAD',
              billingDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
            },
          },
          {
            '@type': 'Offer',
            name: 'DRIVEO Plus Subscription',
            description: '1 full wash + 1 express wash per month',
            price: '79.00',
            priceCurrency: 'CAD',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '79.00',
              priceCurrency: 'CAD',
              billingDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
            },
          },
          {
            '@type': 'Offer',
            name: 'DRIVEO Full Subscription',
            description: '2 full washes + 1 interior clean + 1 express wash per month',
            price: '129.00',
            priceCurrency: 'CAD',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: '129.00',
              priceCurrency: 'CAD',
              billingDuration: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' },
            },
          },
        ],
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://driveo.ca/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Can you wash my car in a condo underground parking lot?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes — we built DRIVEO specifically for this. Our pros use professional waterless and rinseless products that require zero water hookup, leave zero water runoff, and violate zero building rules. We\'ve washed hundreds of vehicles in underground parking across Mississauga and Etobicoke. Your property manager won\'t hear a thing.',
          },
        },
        {
          '@type': 'Question',
          name: 'What if I\'m not happy with the wash?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We guarantee your satisfaction. If anything doesn\'t meet your expectations, we\'ll send a pro back to redo it at no charge. If you\'re still not satisfied, you get a full refund. We can offer this because every job is photo-documented — we hold ourselves to the same standard you see in the photos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to be present during the wash?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Most of our clients aren\'t. Just leave your car accessible — whether that\'s your driveway, a parking spot, or your condo\'s visitor parking. We\'ll text you when we arrive, when we\'re done, and send your before/after photos so you can see everything without being there.',
          },
        },
        {
          '@type': 'Question',
          name: 'What happens if it rains on the day of my appointment?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We reschedule for free — no fees, no hassle. If it\'s light rain, we can still do interior-only services. For subscription members, we\'ll automatically find the next available slot within your billing cycle so you never lose a service.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do you screen your wash pros?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Every DRIVEO provider has 2+ years of professional car care experience, passes a hands-on test scored by our quality team (minimum 7.5/10), carries $2M liability insurance, and undergoes a background check. We also run random quality audits and track customer satisfaction on every single job.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I skip a month or cancel my subscription?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Skip once per quarter with one tap in your account. Cancel anytime with 30 days\' notice — no penalty, no fees, no guilt trip. We don\'t do contracts because we\'d rather earn your business every month than lock you in.',
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <CursorProvider>
      <div className="dark custom-cursor bg-[#050505] text-white min-h-screen selection:bg-[#E23232] selection:text-white overflow-x-clip">
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
        <NoiseOverlay />
        <Navbar />
        <main>
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
        </main>
        <Footer />
      </div>
    </CursorProvider>
  );
}
