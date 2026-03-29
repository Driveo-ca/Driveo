'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Users, Search, Car, ClipboardList, Mail, TrendingUp, Crown, Calendar,
  Trash2, ShieldBan, ShieldCheck, RotateCcw, Loader2, AlertTriangle,
  DollarSign, ChevronDown, ChevronUp, MoreHorizontal,
} from 'lucide-react';
import { centsToDisplay } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface CustomerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  banned_until: string | null;
  vehicles: { id: string }[];
  bookings: { id: string; status: string; total_price: number; stripe_payment_intent_id: string | null; payment_status: string }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<CustomerRow | null>(null);

  // Refund dialog
  const [refundTarget, setRefundTarget] = useState<CustomerRow | null>(null);
  const [refundingId, setRefundingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at, banned_until, vehicles(id), bookings:bookings!bookings_customer_id_fkey(id, status, total_price, stripe_payment_intent_id, payment_status)')
      .eq('role', 'customer')
      .order('created_at', { ascending: false });
    if (!error && data) setCustomers(data as unknown as CustomerRow[]);
    setLoading(false);
  }

  const filtered = customers.filter(
    (c) => c.full_name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase())),
  );

  // ── Actions ──

  async function handleBlock(customerId: string, block: boolean) {
    setActionLoading(customerId);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, action: block ? 'block' : 'unblock' }),
      });
      if (res.ok) {
        toast.success(block ? 'Customer blocked' : 'Customer unblocked');
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customerId
              ? { ...c, banned_until: block ? '2126-01-01T00:00:00Z' : null }
              : c,
          ),
        );
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed');
      }
    } catch {
      toast.error('Network error');
    }
    setActionLoading(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: deleteTarget.id }),
      });
      if (res.ok) {
        toast.success('Customer deleted');
        setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error');
    }
    setActionLoading(null);
  }

  async function handleRefund(bookingId: string) {
    setRefundingId(bookingId);
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        toast.success('Refund issued successfully');
        // Update local state
        setCustomers((prev) =>
          prev.map((c) => ({
            ...c,
            bookings: c.bookings.map((b) =>
              b.id === bookingId ? { ...b, payment_status: 'refunded', status: 'cancelled' } : b,
            ),
          })),
        );
      } else {
        const err = await res.json();
        toast.error(err.error || 'Refund failed');
      }
    } catch {
      toast.error('Network error');
    }
    setRefundingId(null);
  }

  // Stats
  const totalVehicles = customers.reduce((s, c) => s + c.vehicles.length, 0);
  const totalBookings = customers.reduce((s, c) => s + c.bookings.length, 0);
  const thisMonth = customers.filter((c) => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const topCustomer = [...customers].sort((a, b) => b.bookings.length - a.bookings.length)[0];

  function isBlocked(c: CustomerRow) {
    return c.banned_until && new Date(c.banned_until) > new Date();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#E23232]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display text-foreground tracking-tight">Customers</h1>
            <p className="text-foreground/50 text-sm mt-0.5">{customers.length} registered customers</p>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Customer list */}
        <div className="space-y-5">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/55 dark:text-foreground/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="bg-surface border border-border pl-11 h-12 rounded-xl text-sm text-foreground placeholder:text-foreground/60 dark:text-foreground/40 focus:border-[#E23232]/30 focus:ring-0"
            />
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 bg-foreground/5 rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center">
              <Users className="w-8 h-8 text-foreground/30 dark:text-foreground/10 mx-auto mb-3" />
              <p className="text-foreground/60 dark:text-foreground/40 text-sm">No customers found</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest">
                <div className="col-span-3">Customer</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-1 text-center">Vehicles</div>
                <div className="col-span-1 text-center">Bookings</div>
                <div className="col-span-1 text-center">Status</div>
                <div className="col-span-1 text-right">Joined</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((customer) => {
                  const blocked = isBlocked(customer);
                  const expanded = expandedId === customer.id;
                  return (
                    <div key={customer.id}>
                      <div
                        className={cn(
                          'p-4 transition-colors group cursor-pointer',
                          blocked ? 'bg-red-500/[0.02]' : 'hover:bg-foreground/[0.03]',
                        )}
                        onClick={() => setExpandedId(expanded ? null : customer.id)}
                      >
                        {/* Desktop */}
                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-3 flex items-center gap-3">
                            <div className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center font-display text-sm shrink-0 transition-colors',
                              blocked
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-foreground/5 text-foreground/60 dark:text-foreground/40 group-hover:bg-[#E23232]/10 group-hover:text-[#E23232]',
                            )}>
                              {customer.full_name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground text-sm">{customer.full_name}</p>
                              </div>
                              {customer.phone && <p className="text-[10px] text-foreground/50 dark:text-foreground/25 mt-0.5">{customer.phone}</p>}
                            </div>
                          </div>
                          <div className="col-span-2 text-foreground/60 dark:text-foreground/40 truncate font-mono text-xs">{customer.email}</div>
                          <div className="col-span-1 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground/60 dark:text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                              <Car className="w-3 h-3 text-blue-400/60" />{customer.vehicles.length}
                            </span>
                          </div>
                          <div className="col-span-1 text-center">
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground/60 dark:text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                              <ClipboardList className="w-3 h-3 text-violet-400/60" />{customer.bookings.length}
                            </span>
                          </div>
                          <div className="col-span-1 text-center">
                            {blocked ? (
                              <Badge variant="outline" className="text-[10px] rounded-full px-2.5 py-0.5 text-red-400 border-red-500/30 bg-red-500/10">
                                Blocked
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] rounded-full px-2.5 py-0.5 text-green-400 border-green-500/30 bg-green-500/10">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="col-span-1 text-right text-[10px] text-foreground/50 dark:text-foreground/25 font-mono">
                            {new Date(customer.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                          </div>
                          <div className="col-span-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {blocked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[10px] border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-lg"
                                onClick={() => handleBlock(customer.id, false)}
                                disabled={actionLoading === customer.id}
                              >
                                {actionLoading === customer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3 mr-1" />}
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-[10px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-lg"
                                onClick={() => handleBlock(customer.id, true)}
                                disabled={actionLoading === customer.id}
                              >
                                {actionLoading === customer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldBan className="w-3 h-3 mr-1" />}
                                Block
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-[10px] border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                              onClick={() => setRefundTarget(customer)}
                              disabled={customer.bookings.filter((b) => b.payment_status === 'captured').length === 0}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Refund
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2.5 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg"
                              onClick={() => setDeleteTarget(customer)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-9 h-9 rounded-xl flex items-center justify-center font-display text-sm',
                                blocked ? 'bg-red-500/10 text-red-400' : 'bg-foreground/5 text-foreground/60 dark:text-foreground/40',
                              )}>
                                {customer.full_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{customer.full_name}</p>
                                {blocked && (
                                  <Badge variant="outline" className="text-[8px] rounded-full px-2 py-0 text-red-400 border-red-500/30 bg-red-500/10 mt-0.5">
                                    Blocked
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {expanded ? <ChevronUp className="w-4 h-4 text-foreground/55 dark:text-foreground/30" /> : <ChevronDown className="w-4 h-4 text-foreground/55 dark:text-foreground/30" />}
                          </div>
                          {expanded && (
                            <div className="ml-12 mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2 text-xs text-foreground/60 dark:text-foreground/40">
                                <Mail className="w-3 h-3" /><span className="truncate">{customer.email}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="inline-flex items-center gap-1 text-xs text-foreground/60 dark:text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                                  <Car className="w-3 h-3 text-blue-400/60" />{customer.vehicles.length}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-foreground/60 dark:text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                                  <ClipboardList className="w-3 h-3 text-violet-400/60" />{customer.bookings.length}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {blocked ? (
                                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] border-green-500/30 text-green-400 rounded-lg" onClick={() => handleBlock(customer.id, false)} disabled={actionLoading === customer.id}>
                                    <ShieldCheck className="w-3 h-3 mr-1" />Unblock
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] border-amber-500/30 text-amber-400 rounded-lg" onClick={() => handleBlock(customer.id, true)} disabled={actionLoading === customer.id}>
                                    <ShieldBan className="w-3 h-3 mr-1" />Block
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] border-blue-500/30 text-blue-400 rounded-lg" onClick={() => setRefundTarget(customer)} disabled={customer.bookings.filter((b) => b.payment_status === 'captured').length === 0}>
                                  <RotateCcw className="w-3 h-3 mr-1" />Refund
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] border-red-500/30 text-red-400 rounded-lg" onClick={() => setDeleteTarget(customer)}>
                                  <Trash2 className="w-3 h-3 mr-1" />Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Stats sidebar */}
        <div className="space-y-4 hidden lg:block">
          <div className="bg-surface border border-border rounded-2xl p-5 border-l-4 border-l-[#E23232]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-[#E23232]" />
              <span className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest">Total Customers</span>
            </div>
            <p className="text-2xl font-bold text-[#E23232]">{customers.length}</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-green-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">New this month</span>
                <span className="text-sm font-bold text-foreground">{thisMonth}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Car className="w-4 h-4 text-blue-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">Total vehicles</span>
                <span className="text-sm font-bold text-foreground">{totalVehicles}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><ClipboardList className="w-4 h-4 text-violet-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">Total bookings</span>
                <span className="text-sm font-bold text-foreground">{totalBookings}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><Calendar className="w-4 h-4 text-amber-400" /></div>
                <span className="text-sm text-foreground/60 flex-1">Avg bookings</span>
                <span className="text-sm font-bold text-foreground">{customers.length > 0 ? (totalBookings / customers.length).toFixed(1) : 0}</span>
              </div>
            </div>
          </div>

          {topCustomer && (
            <div className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] text-foreground/60 dark:text-foreground/40 uppercase tracking-widest">Top Customer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-display text-sm">
                  {topCustomer.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{topCustomer.full_name}</p>
                  <p className="text-[10px] text-foreground/55 dark:text-foreground/30 mt-0.5">{topCustomer.bookings.length} bookings · {topCustomer.vehicles.length} vehicles</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Delete Customer
            </DialogTitle>
            <DialogDescription className="text-foreground/50 text-sm">
              This will permanently delete the customer account, their vehicles, and all associated data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget && (
            <div className="space-y-4 mt-2">
              <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 font-display">
                  {deleteTarget.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{deleteTarget.full_name}</p>
                  <p className="text-xs text-foreground/60 dark:text-foreground/40 font-mono">{deleteTarget.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-foreground/60"
                  onClick={() => setDeleteTarget(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDelete}
                  disabled={actionLoading === deleteTarget.id}
                >
                  {actionLoading === deleteTarget.id ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                  ) : (
                    <><Trash2 className="w-4 h-4 mr-2" /> Delete</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Refund Dialog ── */}
      <Dialog open={!!refundTarget} onOpenChange={(open) => !open && setRefundTarget(null)}>
        <DialogContent className="sm:max-w-md bg-surface border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-blue-400" />
              Refund Customer
            </DialogTitle>
            <DialogDescription className="text-foreground/50 text-sm">
              Select a booking to refund. The full amount will be refunded to the customer&apos;s payment method.
            </DialogDescription>
          </DialogHeader>
          {refundTarget && (
            <div className="space-y-4 mt-2">
              <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-display text-sm">
                  {refundTarget.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{refundTarget.full_name}</p>
                  <p className="text-[10px] text-foreground/60 dark:text-foreground/40 font-mono">{refundTarget.email}</p>
                </div>
              </div>

              {/* Bookings eligible for refund */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {refundTarget.bookings.filter((b) => b.payment_status === 'captured' && b.stripe_payment_intent_id).length === 0 ? (
                  <div className="text-center py-6">
                    <DollarSign className="w-6 h-6 text-foreground/15 mx-auto mb-2" />
                    <p className="text-xs text-foreground/60 dark:text-foreground/40">No refundable bookings</p>
                  </div>
                ) : (
                  refundTarget.bookings
                    .filter((b) => b.payment_status === 'captured' && b.stripe_payment_intent_id)
                    .map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-3 bg-card border border-border rounded-xl"
                      >
                        <div>
                          <span className="text-xs text-foreground/60 dark:text-foreground/40 font-mono">#{b.id.slice(0, 8)}</span>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{centsToDisplay(b.total_price)}</p>
                        </div>
                        <Button
                          size="sm"
                          className="h-7 px-3 text-[10px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          disabled={refundingId === b.id}
                          onClick={() => handleRefund(b.id)}
                        >
                          {refundingId === b.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <RotateCcw className="w-3 h-3 mr-1" />
                              Refund
                            </>
                          )}
                        </Button>
                      </div>
                    ))
                )}

                {/* Already refunded bookings */}
                {refundTarget.bookings.filter((b) => b.payment_status === 'refunded').length > 0 && (
                  <>
                    <p className="text-[10px] uppercase tracking-widest text-foreground/55 dark:text-foreground/30 font-medium pt-2">Already Refunded</p>
                    {refundTarget.bookings
                      .filter((b) => b.payment_status === 'refunded')
                      .map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center justify-between p-3 bg-card border border-border rounded-xl opacity-50"
                        >
                          <div>
                            <span className="text-xs text-foreground/60 dark:text-foreground/40 font-mono">#{b.id.slice(0, 8)}</span>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{centsToDisplay(b.total_price)}</p>
                          </div>
                          <Badge variant="outline" className="text-[10px] rounded-full px-2.5 py-0.5 text-green-400 border-green-500/30 bg-green-500/10">
                            Refunded
                          </Badge>
                        </div>
                      ))}
                  </>
                )}
              </div>

              <Button
                variant="outline"
                className="w-full border-border text-foreground/60"
                onClick={() => setRefundTarget(null)}
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
