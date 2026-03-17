'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff, CheckCheck } from 'lucide-react';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data as Notification[]);
      }
      setLoading(false);
    }

    fetchNotifications();
  }, [supabase]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display text-white tracking-tight">Notifications</h1>
            <p className="text-white/40 text-sm mt-1">Stay updated on your washes</p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <div className="bg-[#E23232]/10 border border-[#E23232]/20 rounded-full px-3 py-1.5">
              <span className="text-xs text-[#E23232] font-semibold">
                {notifications.filter((n) => !n.is_read).length} unread
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="mt-12">
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl">
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
                  <BellOff className="w-7 h-7 text-white/15" />
                </div>
                <p className="text-white/40 text-sm font-medium">No notifications yet</p>
                <p className="text-white/20 text-xs mt-1.5">We will notify you about your washes</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="stagger-children space-y-2.5">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  if (!notification.is_read) markAsRead(notification.id);
                }}
                className={`bg-[#111] border border-white/[0.08] rounded-2xl cursor-pointer transition-all duration-300 hover:border-white/[0.12] ${
                  !notification.is_read
                    ? 'border-l-2 border-l-[#E23232]'
                    : 'opacity-60 hover:opacity-80'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3.5">
                    {/* Icon */}
                    <div
                      className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        !notification.is_read
                          ? 'bg-[#E23232]/15 text-[#E23232]'
                          : 'bg-white/[0.03] text-white/25'
                      }`}
                    >
                      {notification.is_read ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <Bell className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={`text-sm font-medium leading-snug ${
                            !notification.is_read ? 'text-white' : 'text-white/60'
                          }`}
                        >
                          {notification.title}
                        </p>
                        <span className={`text-[11px] shrink-0 mt-0.5 font-medium ${
                          !notification.is_read ? 'text-white/40' : 'text-white/20'
                        }`}>
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <p className={`text-sm mt-1.5 line-clamp-2 leading-relaxed ${
                        !notification.is_read ? 'text-white/40' : 'text-white/25'
                      }`}>
                        {notification.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
