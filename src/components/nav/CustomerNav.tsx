'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Car, CalendarDays, User, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app/home', label: 'Home', icon: Home },
  { href: '/app/book', label: 'Book', icon: Car },
  { href: '/app/bookings', label: 'Washes', icon: CalendarDays },
  { href: '/app/notifications', label: 'Alerts', icon: Bell },
  { href: '/app/profile', label: 'Profile', icon: User },
];

export function CustomerNav() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Mobile top header ── */}
      <header className="md:hidden flex items-center justify-between px-5 pt-5 pb-3">
        <Link href="/app/home">
          <Image src="/Driveo-logo.png" alt="Driveo" width={100} height={36} className="h-8 w-auto" />
        </Link>
        <button className="w-9 h-9 flex items-center justify-center text-white/50">
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ── Desktop top nav ── */}
      <nav className="hidden md:flex items-center justify-between px-10 h-16 border-b border-white/[0.06] bg-[#050505] sticky top-0 z-50">
        <Link href="/app/home">
          <Image src="/Driveo-logo.png" alt="Driveo" width={120} height={40} className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-4 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-[#E23232]'
                    : 'text-white/35 hover:text-white/60'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#E23232]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#050505]/95 backdrop-blur-xl">
        <div className="flex justify-around items-center h-[56px] px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors',
                  isActive ? 'text-white' : 'text-white/25 active:text-white/40'
                )}
              >
                <item.icon className={cn('w-[20px] h-[20px]', isActive && 'stroke-[2px]')} />
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-white mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
