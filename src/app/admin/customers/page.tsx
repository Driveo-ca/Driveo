'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Users, Search, Car, ClipboardList, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

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
  const supabase = createClient();

  useEffect(() => {
    async function fetchCustomers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, created_at, vehicles(id), bookings:bookings!bookings_customer_id_fkey(id)')
        .eq('role', 'customer')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setCustomers(data as CustomerRow[]);
      }
      setLoading(false);
    }

    fetchCustomers();
  }, [supabase]);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 md:pt-0 pt-14 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E23232]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E23232]" />
            </div>
            <div>
              <h1 className="text-3xl font-display text-white tracking-tight">Customers</h1>
              <p className="text-white/30 text-sm mt-0.5">
                <span className="text-white/50 font-medium">{customers.length}</span> registered customers
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in-up">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="bg-[#111] border border-white/[0.08] pl-11 h-12 rounded-xl text-sm text-white placeholder:text-white/25 focus:border-white/[0.15] focus:ring-0"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-white/5 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] text-white/25 uppercase tracking-widest mb-2">
            <div className="col-span-4">Customer</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2 text-center">Vehicles</div>
            <div className="col-span-2 text-center">Bookings</div>
            <div className="col-span-1 text-right">Joined</div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-white/10" />
              </div>
              <p className="text-white/30 text-sm">No customers found</p>
              <p className="text-white/15 text-xs mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="space-y-2 stagger-children">
              {filtered.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-[#111] border border-white/[0.08] rounded-2xl hover:border-white/[0.15] transition-colors duration-200 group"
                >
                  <div className="p-4">
                    {/* Desktop */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/40 font-display text-sm shrink-0 group-hover:bg-[#E23232]/10 group-hover:text-[#E23232] transition-colors">
                          {customer.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {customer.full_name}
                          </p>
                          {customer.phone && (
                            <p className="text-xs text-white/20 mt-0.5">{customer.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="col-span-3 text-sm text-white/40 truncate font-mono text-xs">
                        {customer.email}
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/50 bg-[#0a0a0a] border border-white/[0.06] rounded-full px-3 py-1">
                          <Car className="w-3 h-3 text-blue-400/60" />
                          {customer.vehicles.length}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/50 bg-[#0a0a0a] border border-white/[0.06] rounded-full px-3 py-1">
                          <ClipboardList className="w-3 h-3 text-purple-400/60" />
                          {customer.bookings.length}
                        </span>
                      </div>
                      <div className="col-span-1 text-right text-[10px] text-white/20 font-mono">
                        {new Date(customer.created_at).toLocaleDateString(
                          'en-CA',
                          { month: 'short', day: 'numeric' }
                        )}
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="md:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center text-white/40 font-display text-sm">
                            {customer.full_name.charAt(0)}
                          </div>
                          <p className="font-medium text-white text-sm">
                            {customer.full_name}
                          </p>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono">
                          {new Date(customer.created_at).toLocaleDateString(
                            'en-CA',
                            { month: 'short', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/30 mb-3 ml-12">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-12">
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/40 bg-[#0a0a0a] border border-white/[0.06] rounded-full px-3 py-1">
                          <Car className="w-3 h-3 text-blue-400/60" />
                          {customer.vehicles.length} vehicles
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/40 bg-[#0a0a0a] border border-white/[0.06] rounded-full px-3 py-1">
                          <ClipboardList className="w-3 h-3 text-purple-400/60" />
                          {customer.bookings.length} bookings
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
