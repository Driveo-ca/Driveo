'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, Users, Car, CreditCard, Calendar, AlertTriangle, Scale, ShieldCheck, RefreshCw, MessageSquare } from 'lucide-react';

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const sections: { icon: React.ComponentType<{ className?: string }>; number: string; title: string; content: { subtitle?: string; text: string }[] }[] = [
  {
    icon: FileText,
    number: '01',
    title: 'Acceptance of Terms',
    content: [
      {
        text: 'By accessing or using the Driveo platform — including our website, mobile applications, and related services — you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services. Driveo is operated by TASKLY Technology, based in Ontario, Canada.',
      },
    ],
  },
  {
    icon: Users,
    number: '02',
    title: 'User Accounts',
    content: [
      {
        subtitle: 'Registration',
        text: 'You must create an account to book services. You agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
      },
      {
        subtitle: 'Account Types',
        text: 'Driveo supports three account types: Customers (who book car wash services), Wash Professionals (independent contractors who perform services), and Administrators. Each account type has specific permissions and responsibilities.',
      },
      {
        subtitle: 'Age Requirement',
        text: 'You must be at least 18 years old to create an account and use Driveo services.',
      },
    ],
  },
  {
    icon: Car,
    number: '03',
    title: 'Services & Bookings',
    content: [
      {
        subtitle: 'Service Description',
        text: 'Driveo is a platform connecting customers with independent wash professionals for mobile car detailing services across the Greater Toronto Area. We facilitate bookings, payments, and quality assurance but are not the direct service provider.',
      },
      {
        subtitle: 'Booking Types',
        text: 'Customers may book Instant services (next available washer) or Scheduled services (specific date and time). All bookings are subject to wash professional availability and service zone coverage.',
      },
      {
        subtitle: 'Booking Lifecycle',
        text: 'Bookings follow a defined lifecycle: pending, assigned, en route, arrived, washing, completed, and paid. Cancellations are permitted until a washer is en route. Late cancellations may incur a fee.',
      },
      {
        subtitle: 'Before & After Documentation',
        text: 'Wash professionals are required to take before and after photos of every service. These photos serve as proof of work quality and are visible to the customer via their booking history.',
      },
    ],
  },
  {
    icon: CreditCard,
    number: '04',
    title: 'Pricing & Payments',
    content: [
      {
        subtitle: 'Pricing Structure',
        text: 'Service pricing is calculated using the formula: Base Plan Price × Vehicle Type Multiplier × Dirt Level Multiplier. Vehicle type and dirt level are determined at time of booking. Final pricing is displayed before you confirm a booking.',
      },
      {
        subtitle: 'Subscription Plans',
        text: 'Driveo offers three subscription tiers: Regular ($18/wash), Interior & Exterior ($25/wash), and Detailing ($189/wash). Subscriptions include up to 8 washes per month on the selected plan. Unused washes do not roll over.',
      },
      {
        subtitle: 'Payment Processing',
        text: 'All payments are processed securely through Stripe. A pre-authorization hold is placed when you book a service. Your card is charged only after the wash is completed and confirmed. We accept major credit and debit cards.',
      },
      {
        subtitle: 'Washer Payouts',
        text: 'Wash professionals are compensated via Stripe Connect. Standard payout rates are $11 per wash for Regular and Interior & Exterior plans, and $22 per wash for Detailing services.',
      },
    ],
  },
  {
    icon: Calendar,
    number: '05',
    title: 'Subscriptions & Cancellations',
    content: [
      {
        subtitle: 'Subscription Management',
        text: 'You may manage your subscription through your account settings. Subscriptions renew automatically on a monthly basis unless cancelled before the renewal date.',
      },
      {
        subtitle: 'Cancellation Policy',
        text: 'You may cancel your subscription at any time. Upon cancellation, you retain access to remaining washes for the current billing period. No partial refunds are issued for unused washes within a billing cycle.',
      },
      {
        subtitle: 'Booking Cancellations',
        text: 'Individual bookings may be cancelled free of charge if no washer has been dispatched. Once a washer is en route, a cancellation fee equal to 50% of the service cost may apply.',
      },
    ],
  },
  {
    icon: ShieldCheck,
    number: '06',
    title: 'Insurance & Liability',
    content: [
      {
        text: 'Driveo carries $2,000,000 in commercial general liability insurance. All wash professionals operating on the platform are covered under this policy during active service. In the event of damage to your vehicle during a Driveo service, you must report it within 24 hours with supporting photos. Claims are reviewed and resolved within 7 business days.',
      },
    ],
  },
  {
    icon: Users,
    number: '07',
    title: 'Wash Professional Terms',
    content: [
      {
        subtitle: 'Independent Contractor Status',
        text: 'Wash professionals are independent contractors, not employees of Driveo or TASKLY Technology. They set their own availability, provide their own equipment and supplies, and are responsible for their own taxes and insurance beyond Driveo\'s coverage.',
      },
      {
        subtitle: 'Professional Standards',
        text: 'Wash professionals must maintain a minimum quality rating, complete before/after photo documentation for every job, arrive within the estimated time window, and conduct themselves professionally at all times. Failure to meet these standards may result in account suspension or termination.',
      },
    ],
  },
  {
    icon: AlertTriangle,
    number: '08',
    title: 'Prohibited Conduct',
    content: [
      {
        text: 'You agree not to: use Driveo for any unlawful purpose; misrepresent your identity or vehicle information; interfere with the platform\'s operation; circumvent the payment system to transact directly with wash professionals; harass or threaten any user, washer, or Driveo staff; submit false damage claims; create multiple accounts to abuse promotional offers; scrape, crawl, or data-mine the platform.',
      },
    ],
  },
  {
    icon: RefreshCw,
    number: '09',
    title: 'Modifications & Termination',
    content: [
      {
        subtitle: 'Changes to Terms',
        text: 'We reserve the right to modify these Terms of Service at any time. Material changes will be communicated via email or in-app notification at least 14 days before taking effect. Continued use after changes constitutes acceptance.',
      },
      {
        subtitle: 'Account Termination',
        text: 'We may suspend or terminate your account for violation of these terms, fraudulent activity, or at our discretion with reasonable notice. You may delete your account at any time through Privacy & Security settings.',
      },
    ],
  },
  {
    icon: Scale,
    number: '10',
    title: 'Governing Law & Disputes',
    content: [
      {
        text: 'These terms are governed by the laws of the Province of Ontario and the federal laws of Canada applicable therein. Any disputes arising from these terms or your use of Driveo shall be resolved through binding arbitration in the Greater Toronto Area, except where prohibited by law. Nothing in these terms limits your rights under applicable consumer protection legislation.',
      },
    ],
  },
  {
    icon: MessageSquare,
    number: '11',
    title: 'Contact',
    content: [
      {
        text: 'For questions about these Terms of Service, contact us at legal@driveo.ca. TASKLY Technology, Greater Toronto Area, Ontario, Canada.',
      },
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="dark bg-[#050505] text-white min-h-screen selection:bg-[#E23232] selection:text-white">
      {/* Subtle grain overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }} />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="fixed top-0 left-0 w-full z-40 px-6 py-4 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-[900px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
            </div>
            <Image src="/Driveo-logo.png" alt="DRIVEO" width={90} height={30} className="opacity-80 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/privacy"
            className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/40 hover:text-[#E23232] transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-[#E23232]" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E23232]">Legal</span>
            </div>
            <h1 className="font-[var(--font-anton)] text-5xl md:text-7xl tracking-tight leading-[0.95] uppercase">
              Terms of<br />
              <span className="text-white/20">Service</span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mt-8 flex flex-wrap items-center gap-6 text-[11px] font-mono uppercase tracking-[0.1em] text-white/30"
          >
            <span>Effective: March 25, 2026</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>TASKLY Technology</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Ontario, Canada</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-8 text-[15px] leading-relaxed text-white/50 max-w-[600px]"
          >
            These terms govern your use of the Driveo platform. By using our service, you agree to
            these terms. Please read them carefully before booking your first wash.
          </motion.p>
        </div>
      </div>

      {/* Sections */}
      <div className="px-6 pb-32">
        <div className="max-w-[900px] mx-auto space-y-2">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.03, ease }}
              className="group"
            >
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.035] hover:border-white/[0.1] transition-all duration-500 p-6 md:p-8">
                {/* Section Header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center shrink-0 group-hover:bg-[#E23232]/15 transition-colors">
                    <section.icon className="w-4.5 h-4.5 text-[#E23232]/70" />
                    <span className="absolute -top-1 -right-1 text-[8px] font-mono font-bold text-[#E23232]/40 bg-[#050505] px-1 rounded">
                      {section.number}
                    </span>
                  </div>
                  <h2 className="font-[var(--font-anton)] text-xl md:text-2xl uppercase tracking-tight text-white/90 pt-1.5">
                    {section.title}
                  </h2>
                </div>

                {/* Section Content */}
                <div className="space-y-4 pl-14">
                  {section.content.map((block, j) => (
                    <div key={j}>
                      {block.subtitle && (
                        <h3 className="text-[11px] font-mono font-semibold uppercase tracking-[0.12em] text-white/50 mb-2">
                          {block.subtitle}
                        </h3>
                      )}
                      <p className="text-[14px] leading-[1.8] text-white/40">
                        {block.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-[900px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25">
            &copy; 2026 TASKLY Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 hover:text-[#E23232] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/" className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 hover:text-[#E23232] transition-colors">
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
