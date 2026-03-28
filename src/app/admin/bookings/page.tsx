'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { centsToDisplay, PLAN_LABELS } from '@/lib/pricing';
import { toast } from 'sonner';
import {
  CalendarDays, Car, DollarSign, Clock, Zap,
  CheckCircle2, XCircle, MapPin, User,
  ChevronDown, Loader2, UserCheck, Search,
} from 'lucide-react';
import type { Booking, Vehicle, Profile, WasherProfile } from '@/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface BookingFull extends Booking {
  vehicles: Vehicle;
  profiles: Profile | null;
}

interface WasherOption {
  id: string;
  full_name: string;
  phone: string | null;
  washer_profiles: {
    rating_avg: number;
    jobs_completed: number;
    service_zones: string[];
    is_online: boolean;
  };
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    pending: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    assigned: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    en_route: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    arrived: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    washing: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
    completed: 'text-green-400 border-green-500/30 bg-green-500/10',
    paid: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    cancelled: 'text-red-400 border-red-500/30 bg-red-500/10',
    disputed: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  };
  return map[status] || 'text-foreground/50 border-border';
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Dialog state for accept flow
  const [reviewBooking, setReviewBooking] = useState<BookingFull | null>(null);
  const [washers, setWashers] = useState<WasherOption[]>([]);
  const [loadingWashers, setLoadingWashers] = useState(false);
  const [selectedWasher, setSelectedWasher] = useState<string | null>(null);
  const [washerSearch, setWasherSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let query = supabase
        .from('bookings')
        .select('*, vehicles(*), profiles:customer_id(id, full_name, phone, email)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (filter === 'active') query = query.in('status', ['assigned', 'en_route', 'arrived', 'washing']);
      else if (filter !== 'all') query = query.eq('status', filter);
      const { data } = await query;
      if (data) setBookings(data as BookingFull[]);
      setLoading(false);
    }
    setLoading(true);
    load();
  }, [filter]);

  // Fetch approved washers when dialog opens
  async function fetchWashers() {
    setLoadingWashers(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, phone, washer_profiles(rating_avg, jobs_completed, service_zones, is_online)')
      .eq('role', 'washer')
      .not('washer_profiles', 'is', null);

    if (data) {
      // Supabase returns washer_profiles as array from join — flatten to single object
      const approved = (data as unknown as WasherOption[]).filter(
        (w) => w.washer_profiles
      );
      setWashers(approved);
    }
    setLoadingWashers(false);
  }

  function openAcceptDialog(booking: BookingFull) {
    setReviewBooking(booking);
    setSelectedWasher(null);
    setWasherSearch('');
    fetchWashers();
  }

  async function handleAccept() {
    if (!reviewBooking || !selectedWasher) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: reviewBooking.id,
          action: 'accept',
          washerId: selectedWasher,
        }),
      });

      if (res.ok) {
        toast.success('Booking accepted & washer assigned');
        setBookings((prev) =>
          prev.map((b) =>
            b.id === reviewBooking.id
              ? { ...b, status: 'assigned' as Booking['status'], washer_id: selectedWasher }
              : b,
          ),
        );
        setReviewBooking(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to accept booking');
      }
    } catch {
      toast.error('Network error');
    }
    setSubmitting(false);
  }

  async function handleReject(bookingId: string) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, action: 'reject' }),
      });

      if (res.ok) {
        toast.success('Booking rejected');
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as Booking['status'] } : b,
          ),
        );
        setExpandedId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to reject');
      }
    } catch {
      toast.error('Network error');
    }
    setSubmitting(false);
  }

  // Stats
  const totalRev = bookings.filter((b) => ['completed', 'paid'].includes(b.status)).reduce((s, b) => s + (b.total_price || 0), 0);
  const activeCount = bookings.filter((b) => ['assigned', 'en_route', 'arrived', 'washing'].includes(b.status)).length;
  const completedCount = bookings.filter((b) => ['completed', 'paid'].includes(b.status)).length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  const filteredWashers = washers.filter((w) =>
    w.full_name?.toLowerCase().includes(washerSearch.toLowerCase()),
  );

  return (
    <div className="space-y-8 md:pt-0 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#E23232]" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-foreground tracking-tight">Bookings</h1>
            <p className="text-foreground/50 text-sm mt-0.5">{bookings.length} total bookings</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Table */}
        <div className="space-y-5">
          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList className="bg-surface rounded-full p-1 border border-border gap-0.5">
              {[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
                { value: 'paid', label: 'Paid' },
                { value: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs rounded-full px-4 py-1.5 data-[state=active]:bg-[#E23232] data-[state=active]:text-white transition-colors text-foreground/50 hover:text-foreground/70"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 bg-foreground/5 rounded-2xl" />)}</div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest font-medium">Booking</th>
                      <th className="text-left p-4 text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest font-medium">Customer</th>
                      <th className="text-left p-4 text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest font-medium">Plan</th>
                      <th className="text-left p-4 text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest font-medium hidden md:table-cell">Vehicle</th>
                      <th className="text-left p-4 text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest font-medium">Status</th>
                      <th className="text-right p-4 text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest font-medium">Amount</th>
                      <th className="text-right p-4 text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest font-medium hidden md:table-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((b) => {
                      const isExpanded = expandedId === b.id;
                      return (
                        <tr
                          key={b.id}
                          className={cn(
                            'transition-colors group',
                            b.status === 'pending'
                              ? 'hover:bg-amber-500/[0.03] cursor-pointer'
                              : 'hover:bg-foreground/[0.03]',
                          )}
                          onClick={() => {
                            if (b.status === 'pending') {
                              setExpandedId(isExpanded ? null : b.id);
                            }
                          }}
                        >
                          <td className="p-4">
                            <span className="text-foreground/60 dark:text-foreground/40 font-mono text-xs">#{b.id.slice(0, 8)}</span>
                            <p className="text-[10px] text-foreground/50 dark:text-foreground/25 mt-0.5 hidden md:block">{b.is_instant ? 'Instant' : 'Scheduled'}</p>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-foreground/[0.06] flex items-center justify-center shrink-0">
                                <User className="w-3.5 h-3.5 text-foreground/60 dark:text-foreground/40" />
                              </div>
                              <div>
                                <p className="text-foreground/80 text-xs font-medium truncate max-w-[120px]">
                                  {(b.profiles as Profile | null)?.full_name || 'Unknown'}
                                </p>
                                <p className="text-[10px] text-foreground/55 dark:text-foreground/30 truncate max-w-[120px]">
                                  {(b.profiles as Profile | null)?.phone || (b.profiles as Profile | null)?.email || ''}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-foreground/80 font-medium text-xs">{PLAN_LABELS[b.wash_plan]}</span>
                            <p className="text-[10px] text-foreground/50 dark:text-foreground/25 mt-0.5">Dirt: {b.dirt_level}/10</p>
                          </td>
                          <td className="p-4 text-foreground/60 dark:text-foreground/40 text-xs hidden md:table-cell">
                            {b.vehicles?.year} {b.vehicles?.make} {b.vehicles?.model}
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-[10px] rounded-full px-2.5 py-0.5 ${statusBadge(b.status)}`}>
                              {b.status === 'en_route' ? 'en route' : b.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-foreground font-semibold text-xs">{centsToDisplay(b.total_price)}</span>
                          </td>
                          <td className="p-4 text-right hidden md:table-cell">
                            {b.status === 'pending' ? (
                              <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  className="h-7 px-3 text-[10px] bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                  onClick={() => openAcceptDialog(b)}
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-3 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                                  onClick={() => handleReject(b.id)}
                                  disabled={submitting}
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-foreground/50 dark:text-foreground/25 text-[10px] font-mono">
                                {new Date(b.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <CalendarDays className="w-8 h-8 text-foreground/30 dark:text-foreground/10 mx-auto mb-3" />
                          <p className="text-foreground/60 dark:text-foreground/40 text-sm">No bookings found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile action cards for pending bookings */}
              <div className="md:hidden">
                {bookings.filter((b) => b.status === 'pending').map((b) => (
                  <div key={`mobile-${b.id}`} className="border-t border-border p-4 bg-amber-500/[0.02]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-foreground/60 dark:text-foreground/40" />
                        <span className="text-xs text-foreground/60">
                          {(b.profiles as Profile | null)?.full_name || 'Unknown'}
                        </span>
                      </div>
                      <span className="text-foreground font-semibold text-xs">{centsToDisplay(b.total_price)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        onClick={() => openAcceptDialog(b)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                        onClick={() => handleReject(b.id)}
                        disabled={submitting}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats sidebar */}
        <div className="space-y-4 hidden lg:block">
          <div className="bg-surface border border-border rounded-2xl p-5 border-l-4 border-l-[#E23232]">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-[#E23232]" />
              <span className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest">Revenue</span>
            </div>
            <p className="text-2xl font-bold text-[#E23232]">{centsToDisplay(totalRev)}</p>
            <p className="text-[10px] text-foreground/55 dark:text-foreground/30 mt-1">{completedCount} completed bookings</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest mb-4">Status Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Active', count: activeCount, icon: Zap, color: 'text-violet-400 bg-violet-500/10' },
                { label: 'Pending', count: pendingCount, icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
                { label: 'Completed', count: completedCount, icon: CheckCircle2, color: 'text-green-400 bg-green-500/10' },
                { label: 'Cancelled', count: cancelledCount, icon: XCircle, color: 'text-red-400 bg-red-500/10' },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color.split(' ')[1]}`}>
                    <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
                  </div>
                  <span className="text-sm text-foreground/60 flex-1">{s.label}</span>
                  <span className="text-sm font-bold text-foreground">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest mb-4">Plan Mix</h3>
            <div className="space-y-2">
              {(['regular', 'interior_exterior', 'detailing'] as const).map((plan) => {
                const count = bookings.filter((b) => b.wash_plan === plan).length;
                const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
                return (
                  <div key={plan}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground/50">{PLAN_LABELS[plan]}</span>
                      <span className="text-[10px] text-foreground/55 dark:text-foreground/30 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#E23232] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Accept + Assign Washer Dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={(open) => !open && setReviewBooking(null)}>
        <DialogContent className="sm:max-w-lg bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">Accept Booking</DialogTitle>
            <DialogDescription className="text-foreground/50 text-sm">
              Review details and assign a washer to confirm this booking.
            </DialogDescription>
          </DialogHeader>

          {reviewBooking && (
            <div className="space-y-5 mt-2">
              {/* Booking Summary */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground/50 font-mono">#{reviewBooking.id.slice(0, 8)}</span>
                  <span className="text-sm font-bold text-foreground">{centsToDisplay(reviewBooking.total_price)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-foreground/60 dark:text-foreground/40 mb-0.5">Customer</p>
                    <p className="text-foreground/80 font-medium">
                      {(reviewBooking.profiles as Profile | null)?.full_name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/60 dark:text-foreground/40 mb-0.5">Plan</p>
                    <p className="text-foreground/80 font-medium">{PLAN_LABELS[reviewBooking.wash_plan]}</p>
                  </div>
                  <div>
                    <p className="text-foreground/60 dark:text-foreground/40 mb-0.5">Vehicle</p>
                    <p className="text-foreground/80 font-medium">
                      {reviewBooking.vehicles?.year} {reviewBooking.vehicles?.make} {reviewBooking.vehicles?.model}
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/60 dark:text-foreground/40 mb-0.5">Dirt Level</p>
                    <p className="text-foreground/80 font-medium">{reviewBooking.dirt_level}/10</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-foreground/60 dark:text-foreground/40 mt-0.5 shrink-0" />
                  <p className="text-xs text-foreground/60">{reviewBooking.service_address}</p>
                </div>
                {reviewBooking.location_notes && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80">{reviewBooking.location_notes}</p>
                  </div>
                )}
              </div>

              {/* Washer Selection */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-foreground/60 dark:text-foreground/40 font-medium mb-3">Assign a Washer</p>

                {/* Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-foreground/55 dark:text-foreground/30" />
                  <input
                    type="text"
                    placeholder="Search washers..."
                    value={washerSearch}
                    onChange={(e) => setWasherSearch(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-[#E23232]/50 transition-colors placeholder:text-foreground/55 dark:text-foreground/30"
                  />
                </div>

                {loadingWashers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 text-foreground/55 dark:text-foreground/30 animate-spin" />
                  </div>
                ) : filteredWashers.length === 0 ? (
                  <div className="text-center py-6">
                    <UserCheck className="w-6 h-6 text-foreground/15 mx-auto mb-2" />
                    <p className="text-xs text-foreground/60 dark:text-foreground/40">No washers found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {filteredWashers.map((w) => {
                      const wp = w.washer_profiles;
                      const isSelected = selectedWasher === w.id;
                      return (
                        <button
                          key={w.id}
                          onClick={() => setSelectedWasher(isSelected ? null : w.id)}
                          className={cn(
                            'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                            isSelected
                              ? 'border-[#E23232]/40 bg-[#E23232]/5'
                              : 'border-border bg-card hover:border-foreground/20',
                          )}
                        >
                          <div className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                            isSelected ? 'bg-[#E23232] text-white' : 'bg-foreground/[0.06] text-foreground/50',
                          )}>
                            {w.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-foreground font-medium truncate">{w.full_name}</span>
                              {wp.is_online && (
                                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] text-foreground/60 dark:text-foreground/40">
                                {wp.rating_avg > 0 ? `${wp.rating_avg.toFixed(1)} rating` : 'New'}
                              </span>
                              <span className="text-[10px] text-foreground/60 dark:text-foreground/40">{wp.jobs_completed} jobs</span>
                              {wp.service_zones?.length > 0 && (
                                <span className="text-[10px] text-foreground/55 dark:text-foreground/30 truncate">
                                  {wp.service_zones.slice(0, 2).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#E23232] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground/60 hover:text-foreground"
                  onClick={() => setReviewBooking(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={!selectedWasher || submitting}
                  onClick={handleAccept}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Assigning...</>
                  ) : (
                    <><UserCheck className="w-4 h-4 mr-2" /> Accept & Assign</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
