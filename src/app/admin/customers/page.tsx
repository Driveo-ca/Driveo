'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Users, Search, Car, ClipboardList, Mail, TrendingUp, Crown, Calendar } from 'lucide-react';

interface CustomerRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  created_at: string;
  vehicles: { id: string }[];
  bookings: { id: string }[];
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, created_at, vehicles(id), bookings:bookings!bookings_customer_id_fkey(id)')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });
      if (!error && data) setCustomers(data as CustomerRow[]);
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(
    (c) => c.full_name.toLowerCase().includes(search.toLowerCase()) || (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  // Stats
  const totalVehicles = customers.reduce((s, c) => s + c.vehicles.length, 0);
  const totalBookings = customers.reduce((s, c) => s + c.bookings.length, 0);
  const thisMonth = customers.filter((c) => {
    const d = new Date(c.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const topCustomer = [...customers].sort((a, b) => b.bookings.length - a.bookings.length)[0];

  return (
    <div className="space-y-8 md:pt-0 pt-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#E23232]" />
          </div>
          <div>
            <h1 className="text-3xl font-display text-foreground tracking-tight">Customers</h1>
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="bg-surface border border-border pl-11 h-12 rounded-xl text-sm text-foreground placeholder:text-foreground/40 focus:border-[#E23232]/30 focus:ring-0"
            />
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 bg-foreground/5 rounded-2xl" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center">
              <Users className="w-8 h-8 text-foreground/10 mx-auto mb-3" />
              <p className="text-foreground/40 text-sm">No customers found</p>
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border text-[10px] text-foreground/40 uppercase tracking-widest">
                <div className="col-span-4">Customer</div>
                <div className="col-span-3">Contact</div>
                <div className="col-span-2 text-center">Vehicles</div>
                <div className="col-span-2 text-center">Bookings</div>
                <div className="col-span-1 text-right">Joined</div>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((customer) => (
                  <div key={customer.id} className="p-4 hover:bg-foreground/[0.03] transition-colors group">
                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 font-display text-sm shrink-0 group-hover:bg-[#E23232]/10 group-hover:text-[#E23232] transition-colors">
                          {customer.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{customer.full_name}</p>
                          {customer.phone && <p className="text-[10px] text-foreground/25 mt-0.5">{customer.phone}</p>}
                        </div>
                      </div>
                      <div className="col-span-3 text-foreground/40 truncate font-mono text-xs">{customer.email}</div>
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                          <Car className="w-3 h-3 text-blue-400/60" />{customer.vehicles.length}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                          <ClipboardList className="w-3 h-3 text-violet-400/60" />{customer.bookings.length}
                        </span>
                      </div>
                      <div className="col-span-1 text-right text-[10px] text-foreground/25 font-mono">
                        {new Date(customer.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    {/* Mobile */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground/40 font-display text-sm">
                            {customer.full_name.charAt(0)}
                          </div>
                          <p className="font-medium text-foreground text-sm">{customer.full_name}</p>
                        </div>
                        <span className="text-[10px] text-foreground/25 font-mono">
                          {new Date(customer.created_at).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-foreground/40 ml-12 mb-2">
                        <Mail className="w-3 h-3" /><span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-12">
                        <span className="inline-flex items-center gap-1 text-xs text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                          <Car className="w-3 h-3 text-blue-400/60" />{customer.vehicles.length}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-foreground/40 bg-card border border-border rounded-full px-3 py-1">
                          <ClipboardList className="w-3 h-3 text-violet-400/60" />{customer.bookings.length}
                        </span>
                      </div>
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
              <Users className="w-4 h-4 text-[#E23232]" />
              <span className="text-[10px] text-foreground/40 uppercase tracking-widest">Total Customers</span>
            </div>
            <p className="text-2xl font-bold text-[#E23232]">{customers.length}</p>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h3 className="text-[10px] text-foreground/40 uppercase tracking-widest mb-4">Quick Stats</h3>
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
                <span className="text-[10px] text-foreground/40 uppercase tracking-widest">Top Customer</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-display text-sm">
                  {topCustomer.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{topCustomer.full_name}</p>
                  <p className="text-[10px] text-foreground/30 mt-0.5">{topCustomer.bookings.length} bookings · {topCustomer.vehicles.length} vehicles</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
