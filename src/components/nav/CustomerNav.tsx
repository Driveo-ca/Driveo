'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Car, CalendarDays, User, Bell, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';

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
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button className="w-9 h-9 flex items-center justify-center text-foreground/50">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ── Desktop top nav ── */}
      <nav className="hidden md:flex items-center justify-between px-10 h-16 border-b border-border bg-background sticky top-0 z-50">
        <Link href="/app/home">
          <Image src="/Driveo-logo.png" alt="Driveo" width={120} height={40} className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-4 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'text-[#E23232]'
                    : 'text-foreground/70 hover:text-foreground/90'
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
          <ThemeToggle className="ml-2" />
        </div>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around items-center h-[56px] px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href + '/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[44px] py-1.5 rounded-xl transition-colors active:bg-foreground/[0.06]',
                  isActive ? 'text-foreground' : 'text-foreground/70 dark:text-foreground/50'
                )}
              >
                <item.icon className={cn('w-[22px] h-[22px]', isActive && 'stroke-[2.5px]')} />
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-foreground mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
