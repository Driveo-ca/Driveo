'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, ClipboardList, DollarSign, Clock, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/washer/dashboard',    label: 'Dashboard', icon: LayoutDashboard },
  { href: '/washer/jobs',         label: 'Jobs',      icon: ClipboardList },
  { href: '/washer/earnings',     label: 'Earnings',  icon: DollarSign },
  { href: '/washer/availability', label: 'Schedule',  icon: Clock },
  { href: '/washer/profile',      label: 'Profile',   icon: User },
  { href: '/washer/notifications', label: 'Alerts',   icon: Bell },
];

export function WasherNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnread(count ?? 0);
    }
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <>
      {/* ── Mobile top header ── */}
      <header className="md:hidden flex items-center justify-between px-5 pt-5 pb-3">
        <Link href="/washer/dashboard" className="flex items-center gap-2">
          <Image src="/Driveo-logo.png" alt="Driveo" width={100} height={36} className="h-8 w-auto" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#E23232] bg-[#E23232]/10 px-2 py-0.5 rounded-md">Washer</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* ── Desktop top nav ── */}
      <nav className="hidden md:flex items-center justify-between px-10 h-16 border-b border-border bg-background sticky top-0 z-50">
        <Link href="/washer/dashboard" className="flex items-center gap-2.5">
          <Image src="/Driveo-logo.png" alt="Driveo" width={120} height={40} className="h-9 w-auto" />
          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#E23232] bg-[#E23232]/10 px-2 py-0.5 rounded-md">Washer</span>
        </Link>
        <div className="flex items-center gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isAlerts = item.href === '/washer/notifications';
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
                {isAlerts && unread > 0 && (
                  <span className="absolute top-2 right-1 w-4 h-4 rounded-full bg-[#E23232] text-white text-[9px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl">
        <div className="flex justify-around items-center h-[56px] px-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const isAlerts = item.href === '/washer/notifications';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-0.5 min-w-[48px] py-1 transition-colors',
                  isActive ? 'text-foreground' : 'text-foreground/70 dark:text-foreground/50 active:text-foreground/80 dark:active:text-foreground/60'
                )}
              >
                <item.icon className={cn('w-[20px] h-[20px]', isActive && 'stroke-[2px]')} />
                {isAlerts && unread > 0 && (
                  <span className="absolute top-0 right-0.5 w-3.5 h-3.5 rounded-full bg-[#E23232] text-white text-[8px] font-bold flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
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
