# DRIVEO Design System

**Version:** 1.0
**Last Updated:** March 2026
**Brand:** DRIVEO Auto Care Inc.

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animation & Motion](#animation--motion)
7. [Iconography](#iconography)
8. [Interactive States](#interactive-states)
9. [Responsive Breakpoints](#responsive-breakpoints)
10. [Design Principles](#design-principles)

---

## Brand Identity

### Brand Essence
DRIVEO represents premium mobile car detailing with a focus on reliability, transparency, and convenience. The brand conveys professionalism, trust, and modern service delivery.

### Brand Voice
- **Tone:** Direct, confident, slightly edgy
- **Language:** Clear, no-nonsense, benefit-driven
- **Examples:**
  - "Your car wash is destroying your paint."
  - "If it's not the best car wash you've ever had, it's free."
  - "30 seconds — instant confirm"

### Target Audience
- Condo dwellers in GTA
- Urban professionals
- Uber/Lyft drivers
- Families with busy schedules
- Lease holders and car enthusiasts

---

## Color System

### Primary Colors

```css
/* Brand Red - Primary Action Color */
--color-primary: #E23232;
--color-primary-hover: #c72828;
--color-primary-light: rgba(226, 50, 50, 0.1);
--color-primary-medium: rgba(226, 50, 50, 0.3);
--color-primary-glow: rgba(226, 50, 50, 0.2);

/* Background - Deep Black */
--color-bg-primary: #050505;
--color-bg-secondary: #0a0a0a;
--color-bg-tertiary: #111111;
--color-bg-card: #0a0a0a;

/* Text - White with Opacity Variants */
--color-text-primary: #ffffff;
--color-text-secondary: rgba(255, 255, 255, 0.80);
--color-text-tertiary: rgba(255, 255, 255, 0.70);
--color-text-muted: rgba(255, 255, 255, 0.50);
--color-text-subtle: rgba(255, 255, 255, 0.40);
--color-text-ghost: rgba(255, 255, 255, 0.10);
```

### Semantic Colors

```css
/* Borders & Dividers */
--color-border-primary: rgba(255, 255, 255, 0.10);
--color-border-secondary: rgba(255, 255, 255, 0.06);
--color-border-hover: rgba(226, 50, 50, 0.30);

/* Accents */
--color-accent-red: #E23232;
--color-accent-dark: #222222;

/* Overlays */
--color-overlay-dark: rgba(0, 0, 0, 0.7);
--color-overlay-darker: rgba(0, 0, 0, 0.9);
```

### Color Usage Guidelines

| Element | Color Token | Use Case |
|---------|-------------|----------|
| Primary CTA | `--color-primary` | Main action buttons, accent text |
| Backgrounds | `--color-bg-*` | Cards, sections, containers |
| Body Text | `--color-text-secondary` | Main content, descriptions |
| Labels | `--color-text-muted` | Input labels, metadata |
| Borders | `--color-border-primary` | Dividers, card outlines |
| Hover States | `--color-primary-hover` | Interactive elements |

---

## Typography

### Font Families

```css
/* Display - Anton (Headings, Bold Statements) */
--font-display: var(--font-anton), sans-serif;
font-weight: 400; /* Anton only comes in 400 */

/* Body - Inter (General Text) */
--font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
font-weight: 400 | 500 | 600;

/* Mono - JetBrains Mono (Labels, Metadata, Technical Info) */
--font-mono: var(--font-jetbrains), monospace;
font-weight: 400 | 500 | 600 | 700;

/* Serif - Playfair Display (Italicized Quotes, Emphasis) */
--font-serif: var(--font-playfair), serif;
font-weight: 400;
font-style: italic; /* Always use italic for serif */

/* Poppins (Reviews Section Only) */
--font-poppins: var(--font-poppins), sans-serif;
font-weight: 400 | 500 | 600;
```

### Type Scale

```css
/* Display Headings - Anton */
.display-hero {
  font-family: var(--font-display);
  font-size: 8rem; /* 128px */
  line-height: 0.9;
  text-transform: uppercase;
}

.display-xxl {
  font-family: var(--font-display);
  font-size: 7rem; /* 112px */
  line-height: 0.9;
  text-transform: uppercase;
}

.display-xl {
  font-family: var(--font-display);
  font-size: 6rem; /* 96px */
  line-height: 0.9;
  text-transform: uppercase;
}

.display-lg {
  font-family: var(--font-display);
  font-size: 5rem; /* 80px */
  line-height: 0.9;
  text-transform: uppercase;
}

.display-md {
  font-family: var(--font-display);
  font-size: 3rem; /* 48px */
  line-height: 0.9;
  text-transform: uppercase;
}

.display-sm {
  font-family: var(--font-display);
  font-size: 2rem; /* 32px */
  line-height: 0.9;
  text-transform: uppercase;
}

/* Body Text - Inter */
.text-xl {
  font-family: var(--font-sans);
  font-size: 1.25rem; /* 20px */
  line-height: 1.6;
}

.text-lg {
  font-family: var(--font-sans);
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
}

.text-base {
  font-family: var(--font-sans);
  font-size: 1rem; /* 16px */
  line-height: 1.6;
}

.text-sm {
  font-family: var(--font-sans);
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
}

/* Mono Text - JetBrains Mono */
.mono-label {
  font-family: var(--font-mono);
  font-size: 0.625rem; /* 10px */
  text-transform: uppercase;
  letter-spacing: 0.3em;
}

.mono-sm {
  font-family: var(--font-mono);
  font-size: 0.6875rem; /* 11px */
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.mono-base {
  font-family: var(--font-mono);
  font-size: 0.75rem; /* 12px */
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Serif Text - Playfair Display */
.serif-emphasis {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.5rem; /* 24px */
  line-height: 1.6;
}

.serif-quote {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
}
```

### Typography Usage Guidelines

| Context | Font | Size | Weight | Transform | Letter Spacing |
|---------|------|------|--------|-----------|----------------|
| Hero Headings | Anton | 8rem | 400 | uppercase | normal |
| Section Headings | Anton | 5-7rem | 400 | uppercase | normal |
| Card Titles | Anton | 2-3rem | 400 | uppercase | normal |
| Body Text | Inter | 1rem | 400 | none | normal |
| Descriptive Text | Playfair | 1.125-1.5rem | 400 | none (italic) | normal |
| Labels | JetBrains Mono | 0.625rem | 400 | uppercase | 0.3em |
| Metadata | JetBrains Mono | 0.6875rem | 400 | uppercase | 0.08em |
| CTAs | JetBrains Mono | 0.75rem | 400 | uppercase | 0.1em |

---

## Spacing & Layout

### Spacing Scale

```css
/* Base Unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
--space-32: 8rem;     /* 128px */
```

### Layout Containers

```css
/* Max Widths */
--max-width-sm: 640px;
--max-width-md: 768px;
--max-width-lg: 1024px;
--max-width-xl: 1280px;
--max-width-2xl: 1400px;
--max-width-3xl: 1600px;

/* Section Padding */
--section-padding-y: 8rem; /* py-32 */
--section-padding-x: 1.5rem; /* px-6 on mobile */
--section-padding-x-md: 3rem; /* px-12 on desktop */
```

### Grid System

```css
/* Card Grids */
.grid-3-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem; /* 20px */
}

.grid-2-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .grid-3-col,
  .grid-2-col {
    grid-template-columns: 1fr;
  }
}
```

---

## Components

### Buttons

#### Primary Button

```css
.btn-primary {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: #E23232;
  color: #ffffff;
  border: 1px solid #E23232;
  padding: 1rem 2rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #ffffff;
  color: #000000;
  border-color: #ffffff;
  transform: scale(1.05);
}
```

#### Secondary Button

```css
.btn-secondary {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 1rem 2rem;
  border-radius: 9999px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #ffffff;
  color: #000000;
  transform: scale(1.05);
}
```

#### CTA Button (Large)

```css
.btn-cta {
  font-family: var(--font-display);
  font-size: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #E23232;
  color: #ffffff;
  padding: 1.25rem 2rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.btn-cta:hover {
  background: #ffffff;
  color: #000000;
  transform: scale(1.02);
}
```

### Cards

#### Standard Card

```css
.card {
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1.5rem;
  padding: 3rem;
  transition: all 0.5s ease;
}

.card:hover {
  border-color: rgba(226, 50, 50, 0.3);
  transform: translateY(-6px);
}
```

#### Pricing Card

```css
.card-pricing {
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 3rem;
  min-height: 580px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.card-pricing:hover {
  transform: scale(1.03) translateY(-8px);
}
```

#### Step Card (How It Works)

```css
.card-step {
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 1rem;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
}

.card-step::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right,
    rgba(226, 50, 50, 0.4),
    #E23232,
    rgba(226, 50, 50, 0.4));
  opacity: 0.3;
  transition: opacity 0.5s ease;
}

.card-step:hover {
  border-color: rgba(226, 50, 50, 0.3);
  transform: translateY(-6px);
}

.card-step:hover::before {
  opacity: 1;
}
```

### Form Elements

#### Input Field

```css
.input {
  width: 100%;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: #ffffff;
  transition: border-color 0.3s ease;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.input:focus {
  outline: none;
  border-color: #E23232;
}
```

#### Label

```css
.label {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  display: block;
}
```

#### Select Dropdown

```css
.select {
  width: 100%;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: #ffffff;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.select:focus {
  outline: none;
  border-color: #E23232;
}
```

#### Textarea

```css
.textarea {
  width: 100%;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: #ffffff;
  resize: none;
  transition: border-color 0.3s ease;
}

.textarea:focus {
  outline: none;
  border-color: #E23232;
}
```

### Navigation

#### Navbar

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  transition: all 0.5s ease;
}

/* Scrolled State */
.navbar-scrolled {
  padding: 0.75rem 1.5rem;
  background: rgba(5, 5, 5, 0.9);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
}

/* Non-scrolled State */
.navbar-default {
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Nav Link

```css
.nav-link {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #ffffff;
  position: relative;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: #E23232;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background: #E23232;
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}
```

### Badges & Tags

#### Most Popular Badge

```css
.badge-popular {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: #E23232;
  color: #ffffff;
  padding: 0.375rem 1rem;
  border-radius: 9999px;
}
```

#### Status Badge

```css
.badge-status {
  font-family: var(--font-mono);
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background: rgba(226, 50, 50, 0.1);
  color: #E23232;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}
```

### Dividers

```css
.divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}

.divider-solid {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## Animation & Motion

### Easing Functions

```css
/* Primary Easing - Smooth, Natural Feel */
--ease-primary: cubic-bezier(0.16, 1, 0.3, 1);

/* Standard Easing */
--ease-in: ease-in;
--ease-out: ease-out;
--ease-in-out: ease-in-out;
```

### Animation Durations

```css
--duration-fast: 0.3s;
--duration-normal: 0.5s;
--duration-slow: 0.7s;
--duration-slower: 1s;
```

### Common Animations

#### Fade In Up

```javascript
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  }
};
```

#### Scale In

```javascript
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};
```

#### Slide In (Left/Right)

```javascript
const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};
```

#### Hover Effects

```css
/* Card Lift */
.hover-lift:hover {
  transform: translateY(-6px);
  transition: transform 0.3s ease;
}

/* Button Scale */
.hover-scale:hover {
  transform: scale(1.05);
  transition: transform 0.3s ease;
}

/* Glow Effect */
.hover-glow:hover {
  box-shadow: 0 0 40px rgba(226, 50, 50, 0.3);
  transition: box-shadow 0.5s ease;
}
```

### Scroll Animations

```javascript
// Use Framer Motion's whileInView
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-80px' }}
  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
>
```

### Stagger Children

```javascript
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2
    }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};
```

---

## Iconography

### Icon Library
**Primary:** Lucide React

### Icon Sizes

```css
--icon-xs: 1rem;    /* 16px */
--icon-sm: 1.25rem; /* 20px */
--icon-md: 1.5rem;  /* 24px */
--icon-lg: 2rem;    /* 32px */
--icon-xl: 2.5rem;  /* 40px */
```

### Icon Colors

```css
/* Default Icons */
.icon-default {
  color: rgba(255, 255, 255, 0.4);
}

/* Accent Icons */
.icon-accent {
  color: #E23232;
}

/* Icon with Opacity Transition */
.icon-hover {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.3s ease;
}

.icon-hover:hover {
  color: #E23232;
}
```

### Common Icons

| Context | Icon | Size | Color |
|---------|------|------|-------|
| Navigation | Menu | 24px | White |
| Action | ArrowRight | 20px | White/Red |
| Confirmation | Check, BadgeCheck | 24px | Red |
| Location | MapPin | 20px | Red |
| Photo | Camera | 20px | Red |
| Trust | ShieldCheck | 24px | Red |
| Features | Sparkles, Droplets | 20px | Red |
| Reviews | MessageSquareHeart | 32px | Red |
| Steps | Car, CalendarCheck, Navigation | 28px | Red/60% |

---

## Interactive States

### Hover States

```css
/* Text Hover */
.text-hover {
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease;
}

.text-hover:hover {
  color: #E23232;
}

/* Border Hover */
.border-hover {
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease;
}

.border-hover:hover {
  border-color: rgba(226, 50, 50, 0.3);
}

/* Background Hover */
.bg-hover {
  background: transparent;
  transition: background 0.3s ease;
}

.bg-hover:hover {
  background: rgba(226, 50, 50, 0.08);
}
```

### Focus States

```css
.focus-state:focus {
  outline: none;
  border-color: #E23232;
  box-shadow: 0 0 0 3px rgba(226, 50, 50, 0.1);
}
```

### Active States

```css
.active-state:active {
  transform: scale(0.97);
  transition: transform 0.1s ease;
}
```

### Disabled States

```css
.disabled-state {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

---

## Responsive Breakpoints

```css
/* Mobile First Approach */

/* Extra Small (Mobile) */
@media (min-width: 0px) {
  /* Default styles */
}

/* Small (Large Mobile) */
@media (min-width: 640px) {
  /* sm: */
}

/* Medium (Tablet) */
@media (min-width: 768px) {
  /* md: */
}

/* Large (Desktop) */
@media (min-width: 1024px) {
  /* lg: */
}

/* Extra Large (Large Desktop) */
@media (min-width: 1280px) {
  /* xl: */
}

/* 2XL (Ultra Wide) */
@media (min-width: 1536px) {
  /* 2xl: */
}
```

### Responsive Typography

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Hero Heading | 3.75rem | 5rem | 8rem |
| Section Heading | 3rem | 4.5rem | 7rem |
| Card Title | 1.5rem | 2rem | 3rem |
| Body Text | 1rem | 1rem | 1.125rem |
| Labels | 0.625rem | 0.625rem | 0.6875rem |

### Responsive Spacing

| Element | Mobile | Desktop |
|---------|--------|---------|
| Section Padding | px-6 py-32 | px-12 py-32 |
| Container Max Width | 100% | 1400px/1600px |
| Grid Gap | 1rem | 1.25rem |
| Card Padding | 2rem | 3rem |

### Responsive Layout Patterns

```css
/* Stack on Mobile, Grid on Desktop */
.responsive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .responsive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

---

## Design Principles

### 1. **Bold & Unapologetic**
- Use large, impactful typography (Anton display font)
- Don't shy away from strong statements
- Red accent color should command attention
- High contrast between elements

### 2. **Premium Yet Accessible**
- Dark, sophisticated background
- Clean, modern interface
- Professional without being stuffy
- Clear pricing and value communication

### 3. **Motion with Purpose**
- Every animation serves a function
- Smooth, natural-feeling transitions
- Stagger animations for visual hierarchy
- Hover states provide clear feedback

### 4. **Trust Through Transparency**
- Before/after photos prominently displayed
- Clear service descriptions
- No hidden fees or fine print
- Explicit guarantees and policies

### 5. **Mobile-First Thinking**
- Touch-friendly interface elements
- Readable text on small screens
- Simplified navigation on mobile
- Responsive images and layouts

### 6. **Consistency Everywhere**
- Reusable component patterns
- Consistent spacing system
- Predictable interactions
- Unified color palette

---

## Implementation Notes

### CSS Variables Setup

```css
:root {
  /* Colors */
  --color-primary: #E23232;
  --color-bg: #050505;
  --color-text: #ffffff;

  /* Fonts */
  --font-display: var(--font-anton), sans-serif;
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains), monospace;
  --font-serif: var(--font-playfair), serif;

  /* Spacing */
  --space-unit: 0.25rem;

  /* Animations */
  --ease-primary: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-normal: 0.5s;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#E23232',
        'bg-primary': '#050505',
        'bg-secondary': '#0a0a0a',
        'bg-tertiary': '#111111',
      },
      fontFamily: {
        display: ['var(--font-anton)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui'],
        mono: ['var(--font-jetbrains)', 'monospace'],
        serif: ['var(--font-playfair)', 'serif'],
      },
    },
  },
};
```

### Framer Motion Presets

```javascript
// lib/animations.ts
export const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

export const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease }
  }
};
```

---

## Custom Cursor

```css
/* Desktop Only */
@media (min-width: 768px) {
  * {
    cursor: none !important;
  }
}

.cursor-dot {
  width: 8px;
  height: 8px;
  background-color: #E23232;
  border-radius: 50%;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
}

.cursor-outline {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9998;
  will-change: transform;
}
```

---

## Special Effects

### Noise Overlay

```css
.noise {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9997;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,...");
}
```

### Marquee Banner

```css
.marquee-content {
  display: flex;
  animation: marquee 20s linear infinite;
  min-width: 100%;
  flex-shrink: 0;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}
```

### Grayscale Hover (Images)

```css
.image-grayscale {
  filter: grayscale(0);
  transition: filter 0.5s ease;
}

/* Desktop Only */
@media (min-width: 1024px) {
  .image-grayscale {
    filter: grayscale(1);
  }

  .image-grayscale:hover {
    filter: grayscale(0);
  }
}
```

---

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 for normal text)
- Primary red (#E23232) on black (#050505) meets contrast requirements
- White text on black backgrounds exceeds standards

### Focus Indicators
- All interactive elements must have visible focus states
- Use red accent color for focus rings
- Maintain 3px minimum focus ring width

### Motion
- Respect `prefers-reduced-motion` media query
- Provide alternatives to parallax effects
- Allow users to pause/stop animations

### Touch Targets
- Minimum 44x44px touch targets on mobile
- Adequate spacing between interactive elements
- Large, easy-to-tap buttons

---

## Component Library Structure

```
components/
├── ui/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Badge.tsx
│   └── Divider.tsx
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── Section.tsx
├── sections/
│   ├── HeroSection.tsx
│   ├── HowItWorks.tsx
│   ├── PricingCards.tsx
│   ├── BookingForm.tsx
│   └── etc.
└── shared/
    ├── CursorProvider.tsx
    └── ScrollReveal.tsx
```

---

## File Naming Conventions

- **Components:** PascalCase (e.g., `HeroSection.tsx`)
- **Utilities:** camelCase (e.g., `useCountUp.ts`)
- **Styles:** kebab-case (e.g., `global-styles.css`)
- **Data:** camelCase (e.g., `data.ts`)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | March 2026 | Initial design system documentation |

---

## Resources

- **Design Tool:** Next.js + Tailwind CSS v4
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Fonts:** Google Fonts (Anton, Inter, JetBrains Mono, Playfair Display, Poppins)
- **Deployment:** Vercel

---

**End of Design System Documentation**
