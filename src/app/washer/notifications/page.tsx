'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Car, DollarSign, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const notifIcon: Record<string, React.ElementType> = {
  booking_assigned: Car,
  payment_captured: DollarSign,
  booking_completed: CheckCircle2,
  booking_cancelled: AlertCircle,
};

const notifColor: Record<string, string> = {
  booking_assigned: 'bg-blue-500/10 text-blue-400',
  payment_captured: 'bg-emerald-500/10 text-emerald-400',
  booking_completed: 'bg-green-500/10 text-green-400',
  booking_cancelled: 'bg-red-500/10 text-red-400',
};

const notifLabel: Record<string, string> = {
  booking_assigned: 'Job Assigned',
  payment_captured: 'Payment',
  booking_completed: 'Completed',
  booking_cancelled: 'Cancelled',
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function WasherNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  }

  async function markAllRead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function markRead(id: string) {
    const supabase = createClient();
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Type breakdown for sidebar
  const typeCounts = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const unreadByType = notifications.filter((n) => !n.is_read).reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-[1280px] mx-auto px-5 pt-4 pb-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-foreground/55 text-xs mt-0.5 font-mono">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl bg-foreground/[0.05] flex items-center justify-center">
            <Bell className="w-[18px] h-[18px] text-foreground/55" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E23232] text-white text-[9px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={markAllRead}
              variant="outline"
              className="rounded-xl h-9 px-4 text-xs border-border/60 font-medium"
            >
              Mark all read
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

        {/* ── LEFT: Notification List ── */}
        <div className="min-w-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-foreground/[0.04] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-dashed border-border/50 rounded-2xl p-16 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-foreground/[0.04] flex items-center justify-center mx-auto mb-4">
                <BellOff className="w-6 h-6 text-foreground/30" />
              </div>
              <p className="text-foreground/55 font-medium">No notifications yet</p>
              <p className="text-foreground/35 text-sm mt-1">Job assignments and updates will appear here</p>
            </motion.div>
          ) : (
            <div className="space-y-2.5">
              {notifications.map((notif, i) => {
                const Icon = notifIcon[notif.type] || Zap;
                const iconColor = notifColor[notif.type] || 'bg-foreground/[0.05] text-foreground/55';
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => !notif.is_read && markRead(notif.id)}
                    className={cn(
                      'relative flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200',
                      notif.is_read
                        ? 'border-border/40 opacity-60'
                        : 'border-border/50 hover:border-border'
                    )}
                  >
                    {!notif.is_read && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#E23232]" />
                    )}
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconColor)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <p className={cn('text-sm font-semibold', notif.is_read ? 'text-foreground/60' : 'text-foreground')}>
                        {notif.title}
                      </p>
                      <p className="text-foreground/55 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-foreground/35 text-[10px] mt-1.5 font-mono">{timeAgo(notif.created_at)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Stats Sidebar ── */}
        <div className="hidden lg:block space-y-5">

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-border/50 rounded-2xl p-5"
          >
            <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.1em] font-semibold">Summary</span>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Total', value: String(notifications.length), color: 'text-foreground/60' },
                { label: 'Unread', value: String(unreadCount), color: unreadCount > 0 ? 'text-[#E23232]' : 'text-foreground/40' },
                { label: 'Read', value: String(notifications.length - unreadCount), color: 'text-foreground/40' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-wider">{s.label}</span>
                  <span className={cn('text-lg font-bold', s.color)}>{s.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* By Type */}
          {Object.keys(typeCounts).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="border border-border/50 rounded-2xl p-5"
            >
              <span className="font-mono text-[10px] text-foreground/40 uppercase tracking-[0.1em] font-semibold">By Type</span>
              <div className="mt-4 space-y-3">
                {Object.entries(typeCounts).map(([type, count]) => {
                  const Icon = notifIcon[type] || Zap;
                  const iconColor = notifColor[type] || 'bg-foreground/[0.05] text-foreground/55';
                  const unread = unreadByType[type] || 0;
                  return (
                    <div key={type} className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconColor)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground/60 font-medium">{notifLabel[type] || type}</p>
                        <p className="text-[10px] text-foreground/30 font-mono">{count} total{unread > 0 ? ` · ${unread} unread` : ''}</p>
                      </div>
                      <span className="text-sm font-bold text-foreground/50">{count}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
