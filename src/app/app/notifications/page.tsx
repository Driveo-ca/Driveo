'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Bell, BellOff, CheckCheck, Car, CreditCard, UserCheck,
  MapPin, AlertTriangle, Sparkles, XCircle, Clock,
} from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

/* ─── Notification type → icon + accent ─── */
const TYPE_CONFIG: Record<string, { icon: typeof Bell; accent: string; bg: string }> = {
  booking_confirmed:  { icon: Sparkles,       accent: 'text-[#E23232]',                              bg: 'bg-[#E23232]/10' },
  washer_assigned:    { icon: UserCheck,       accent: 'text-blue-600 dark:text-blue-400',            bg: 'bg-blue-500/10' },
  washer_en_route:    { icon: MapPin,          accent: 'text-blue-600 dark:text-blue-400',            bg: 'bg-blue-500/10' },
  washer_arrived:     { icon: MapPin,          accent: 'text-violet-600 dark:text-violet-400',        bg: 'bg-violet-500/10' },
  wash_started:       { icon: Car,             accent: 'text-violet-600 dark:text-violet-400',        bg: 'bg-violet-500/10' },
  wash_completed:     { icon: CheckCheck,      accent: 'text-emerald-600 dark:text-emerald-400',      bg: 'bg-emerald-500/10' },
  payment_captured:   { icon: CreditCard,      accent: 'text-emerald-600 dark:text-emerald-400',      bg: 'bg-emerald-500/10' },
  booking_cancelled:  { icon: XCircle,         accent: 'text-red-600 dark:text-red-400',              bg: 'bg-red-500/10' },
  dispute_opened:     { icon: AlertTriangle,   accent: 'text-orange-600 dark:text-orange-400',        bg: 'bg-orange-500/10' },
};

const DEFAULT_CONFIG = { icon: Bell, accent: 'text-[#E23232]', bg: 'bg-[#E23232]/10' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setNotifications(data as Notification[]);
      setLoading(false);
    }
    fetchNotifications();
  }, [supabase]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (!error) setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    const { error } = await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds);
    if (!error) setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  // Group notifications: today, this week, older
  const groupNotifications = () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    const today: Notification[] = [];
    const thisWeek: Notification[] = [];
    const older: Notification[] = [];

    notifications.forEach(n => {
      const d = new Date(n.created_at);
      if (d >= todayStart) today.push(n);
      else if (d >= weekStart) thisWeek.push(n);
      else older.push(n);
    });

    return [
      { label: 'Today', items: today },
      { label: 'This Week', items: thisWeek },
      { label: 'Earlier', items: older },
    ].filter(g => g.items.length > 0);
  };

  const groups = groupNotifications();

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[#E23232] text-sm font-medium mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs font-medium text-foreground/50 hover:text-foreground/70 px-3 py-1.5 rounded-lg hover:bg-foreground/[0.05] transition-all"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full bg-foreground/[0.04] rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-foreground/[0.05] border border-border/50 flex items-center justify-center mx-auto mb-5">
              <BellOff className="w-7 h-7 text-foreground/50" />
            </div>
            <p className="text-foreground/70 text-sm font-medium">No notifications yet</p>
            <p className="text-foreground/60 text-xs mt-1.5">We&apos;ll notify you about your washes</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(group => (
              <div key={group.label}>
                {/* Group label */}
                <div className="flex items-center gap-3 mb-2.5 px-1">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground/55">{group.label}</span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                {/* Notification items */}
                <div className="space-y-1.5">
                  {group.items.map(notification => {
                    const cfg = TYPE_CONFIG[notification.type] || DEFAULT_CONFIG;
                    const Icon = cfg.icon;
                    const isUnread = !notification.is_read;

                    return (
                      <button
                        key={notification.id}
                        onClick={() => { if (isUnread) markAsRead(notification.id); }}
                        className={cn(
                          'w-full text-left rounded-xl transition-all duration-200 group relative',
                          isUnread
                            ? 'bg-foreground/[0.03] hover:bg-foreground/[0.05]'
                            : 'opacity-55 hover:opacity-75 hover:bg-foreground/[0.02]'
                        )}
                      >
                        <div className="flex items-start gap-3.5 px-4 py-3.5">
                          {/* Icon */}
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                            isUnread ? cfg.bg : 'bg-foreground/[0.05]'
                          )}>
                            <Icon className={cn('w-[18px] h-[18px]', isUnread ? cfg.accent : 'text-foreground/55')} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <p className={cn(
                                'text-sm font-semibold leading-snug',
                                isUnread ? 'text-foreground' : 'text-foreground/70'
                              )}>
                                {notification.title}
                              </p>
                              <span className="text-[11px] text-foreground/55 shrink-0 mt-0.5 tabular-nums">
                                {formatTime(notification.created_at)}
                              </span>
                            </div>
                            <p className={cn(
                              'text-[13px] mt-0.5 line-clamp-2 leading-relaxed',
                              isUnread ? 'text-foreground/55' : 'text-foreground/60'
                            )}>
                              {notification.body}
                            </p>
                          </div>

                          {/* Unread dot */}
                          {isUnread && (
                            <div className="absolute top-4 right-3.5">
                              <div className="w-2 h-2 rounded-full bg-[#E23232]" />
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
