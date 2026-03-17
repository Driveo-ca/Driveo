export const vehiclePrices: Record<string, number> = {
  'Sedan': 99,
  'SUV': 119,
  'Pickup': 129,
  'Minivan': 129,
  'Large SUV': 149,
};

export const pricingCards = [
  {
    price: "$49",
    label: "/month",
    title: "DRIVEO Go",
    desc: "2 express hand washes per month. Built for Uber/Lyft drivers who can't afford bad ratings — and commuters who want a clean car without losing half a Saturday. We come to your parking lot, driveway, wherever you are.",
    services: "2x Express Wash (30 min each)",
    bg: "bg-[#111]",
    text: "text-white",
    accent: "text-[#E23232]",
  },
  {
    price: "$79",
    label: "/month",
    title: "DRIVEO Plus",
    desc: "1 full wash + 1 express wash per month. The plan condo dwellers and downtown professionals choose when they want clean inside and out, handled completely on autopilot. No scheduling. No thinking. Just a clean car, always.",
    services: "1x Full Wash + 1x Express Wash",
    bg: "bg-[#111]",
    text: "text-white",
    accent: "text-[#E23232]",
    popular: true,
  },
  {
    price: "$129",
    label: "/month",
    title: "DRIVEO Full",
    desc: "2 full washes + 1 interior clean + 1 express wash every single month. For families with kid chaos in the backseat, lease holders who need return-condition cars, and anyone who refuses to let their car look anything less than perfect.",
    services: "2x Full Wash + 1x Interior + 1x Express",
    bg: "bg-[#111]",
    text: "text-white",
    accent: "text-[#E23232]",
  },
];

export const faqItems = [
  {
    q: "Can you wash my car in a condo underground parking lot?",
    a: "Yes — we built DRIVEO specifically for this. Our pros use professional waterless and rinseless products that require zero water hookup, leave zero water runoff, and violate zero building rules. We've washed hundreds of vehicles in underground parking across Mississauga and Etobicoke. Your property manager won't hear a thing.",
  },
  {
    q: "What if I'm not happy with the wash?",
    a: "We guarantee your satisfaction. If anything doesn't meet your expectations, we'll send a pro back to redo it at no charge. If you're still not satisfied, you get a full refund. We can offer this because every job is photo-documented — we hold ourselves to the same standard you see in the photos.",
  },
  {
    q: "Do I need to be present during the wash?",
    a: "No. Most of our clients aren't. Just leave your car accessible — whether that's your driveway, a parking spot, or your condo's visitor parking. We'll text you when we arrive, when we're done, and send your before/after photos so you can see everything without being there.",
  },
  {
    q: "What happens if it rains on the day of my appointment?",
    a: "We reschedule for free — no fees, no hassle. If it's light rain, we can still do interior-only services. For subscription members, we'll automatically find the next available slot within your billing cycle so you never lose a service.",
  },
  {
    q: "How do you screen your wash pros?",
    a: "Every DRIVEO provider has 2+ years of professional car care experience, passes a hands-on test scored by our quality team (minimum 7.5/10), carries $2M liability insurance, and undergoes a background check. We also run random quality audits and track customer satisfaction on every single job.",
  },
  {
    q: "Can I skip a month or cancel my subscription?",
    a: "Skip once per quarter with one tap in your account. Cancel anytime with 30 days' notice — no penalty, no fees, no guilt trip. We don't do contracts because we'd rather earn your business every month than lock you in.",
  },
];

export const reviews = [
  { name: "Sarah L.", text: "Live in a condo on Hurontario. DRIVEO came into my underground parking and washed my car while I was at work. No mess, no complaints. On the monthly plan now.", time: "2 weeks ago" },
  { name: "Michael T.", text: "Called three other services before DRIVEO. Two never called back. DRIVEO confirmed in 30 seconds, showed up on time, sent before/after photos. Night and day.", time: "1 month ago" },
  { name: "David K.", text: "I drive Uber 10 hours a day. Dirty car = bad ratings. DRIVEO's driver plan keeps my car spotless twice a month for $49. Pays for itself in tips alone.", time: "3 weeks ago" },
  { name: "Priya M.", text: "Booked at 11pm, they came next morning. Got a text when they arrived, text when done, and 10 photos of my car looking brand new. This is how it should work.", time: "1 week ago" },
];

export const buildings = [
  'M City Towers',
  'Absolute World',
  'Erin Square',
  'Sherway Gate',
  'Port Credit',
  'Square One District',
  'Lakeview Village',
  'Exchange District',
];
