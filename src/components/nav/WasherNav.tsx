'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, DollarSign, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/washer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/washer/jobs', label: 'Jobs', icon: ClipboardList },
  { href: '/washer/earnings', label: 'Earnings', icon: DollarSign },
  { href: '/washer/availability', label: 'Schedule', icon: Clock },
  { href: '/washer/profile', label: 'Profile', icon: User },
];

export function WasherNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex items-center justify-between px-8 py-4 border-b border-white/[0.08] bg-[#0a0a0a] sticky top-0 z-50">
        <Link href="/washer/dashboard" className="flex items-center gap-2.5 group">
          <Image src="/Driveo-logo.png" alt="Driveo" width={34} height={34} />
          <span className="font-display text-xl text-white tracking-wide">DRIVEO</span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-[#E23232] font-semibold bg-[#E23232]/10 px-2.5 py-1 rounded-lg border border-[#E23232]/20">Washer</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200',
                  isActive
                    ? 'bg-[#E23232]/10 text-[#E23232]'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <item.icon className={cn('w-4 h-4', isActive && 'stroke-[2.5px]')} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-[#0a0a0a] border-t border-white/[0.08] px-2 py-2 flex justify-around">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors duration-200',
                  isActive ? 'text-[#E23232]' : 'text-white/40 active:scale-95'
                )}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
