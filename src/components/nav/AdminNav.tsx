'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserCheck,
  DollarSign,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/washers', label: 'Washers', icon: UserCheck },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/payouts', label: 'Payouts', icon: DollarSign },
  { href: '/admin/pricing', label: 'Pricing', icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (item: (typeof navItems)[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 pb-8 flex items-center gap-2.5">
        <Image src="/Driveo-logo.png" alt="Driveo" width={30} height={30} />
        <span className="font-display text-lg text-white tracking-wide">DRIVEO</span>
        <span className="text-[8px] uppercase tracking-[0.2em] text-[#E23232] font-semibold bg-[#E23232]/10 px-2 py-0.5 rounded-md border border-[#E23232]/20 ml-0.5">Admin</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 relative group',
              isActive(item)
                ? 'bg-[#E23232]/10 text-[#E23232]'
                : 'text-white/45 hover:text-white hover:bg-white/[0.04]'
            )}
          >
            {isActive(item) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#E23232] rounded-r-full" />
            )}
            <item.icon className={cn('w-[18px] h-[18px] transition-colors', isActive(item) ? 'text-[#E23232]' : 'text-white/30 group-hover:text-white/60')} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-[#0a0a0a] border border-white/[0.06]">
        <p className="text-[10px] text-white/25 uppercase tracking-wider">Driveo Admin v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-[#0a0a0a] border-r border-white/[0.06] z-40">
        {navContent}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/[0.06] px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Image src="/Driveo-logo.png" alt="Driveo" width={26} height={26} />
          <span className="font-display text-base text-white">DRIVEO</span>
          <span className="text-[8px] uppercase tracking-widest text-[#E23232] font-semibold">Admin</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/50 hover:text-white transition-colors p-1">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/70 animate-fade-in" onClick={() => setMobileOpen(false)}>
          <aside
            className="w-72 h-full bg-[#0a0a0a] border-r border-white/[0.06] pt-16 animate-slide-in-right"
            onClick={(e) => e.stopPropagation()}
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
