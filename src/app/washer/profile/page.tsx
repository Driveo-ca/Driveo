'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Star, MapPin, Wrench, Briefcase, Car } from 'lucide-react';

interface WasherProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  washer_profiles: {
    status: string;
    bio: string | null;
    service_zones: string[] | null;
    vehicle_make: string | null;
    vehicle_model: string | null;
    vehicle_year: number | null;
    tools_owned: string[] | null;
    rating_avg: number;
    jobs_completed: number;
    is_online: boolean;
  } | null;
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  approved: 'bg-green-500/10 text-green-400 border-green-500/20',
  suspended: 'bg-red-500/10 text-red-400 border-red-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function WasherProfilePage() {
  const [profile, setProfile] = useState<WasherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*, washer_profiles(*)')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as WasherProfile);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [supabase]);

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-48 rounded-lg bg-[#111]" />
        <div className="h-72 w-full rounded-2xl bg-[#111]" />
      </div>
    );
  }

  const wp = profile?.washer_profiles;

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in-up">
      <h1 className="text-2xl font-display text-white tracking-tight mb-6">Washer Profile</h1>

      {/* Header Card */}
      <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-6 mb-5">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#0a0a0a] border border-white/[0.08] flex items-center justify-center">
              <User className="w-9 h-9 text-white/30" />
            </div>
            {wp?.is_online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#111] flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-lg font-display text-white">{profile?.full_name}</p>
            <div className="flex items-center gap-3 mt-2">
              {wp && (
                <Badge
                  variant="outline"
                  className={`${statusColor[wp.status] || 'border-white/20'} rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider`}
                >
                  {wp.status}
                </Badge>
              )}
              {wp?.is_online && (
                <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Online
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        {wp && (
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold text-xl">
                  {Number(wp.rating_avg).toFixed(1)}
                </span>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Rating</p>
            </div>
            <div className="stat-card bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Briefcase className="w-4 h-4 text-white/40" />
                <span className="text-white font-bold text-xl">{wp.jobs_completed}</span>
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Jobs Done</p>
            </div>
          </div>
        )}
      </div>

      {/* Bio */}
      {wp?.bio && (
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5 mb-4">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium mb-3">Bio</p>
          <p className="text-sm text-white/60 leading-relaxed">{wp.bio}</p>
        </div>
      )}

      {/* Service Zones */}
      {wp?.service_zones && wp.service_zones.length > 0 && (
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-white/40" />
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Service Zones</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {wp.service_zones.map((zone) => (
              <span
                key={zone}
                className="bg-[#0a0a0a] px-3 py-1.5 rounded-full text-xs text-white/60 border border-white/[0.08] font-medium"
              >
                {zone}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle */}
      {wp?.vehicle_make && (
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-3.5 h-3.5 text-white/40" />
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Vehicle</p>
          </div>
          <p className="text-white/60 text-sm font-medium">
            {wp.vehicle_year} {wp.vehicle_make} {wp.vehicle_model}
          </p>
        </div>
      )}

      {/* Tools */}
      {wp?.tools_owned && wp.tools_owned.length > 0 && (
        <div className="bg-[#111] border border-white/[0.08] rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-3.5 h-3.5 text-white/40" />
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">Tools Owned</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {wp.tools_owned.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#E23232]/10 text-[#E23232]/70 border border-[#E23232]/20"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
