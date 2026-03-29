'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  UserCheck, UserX, Star, MapPin, MessageSquare, Mail,
  ChevronDown, ChevronUp, FileText, Shield, Clock,
  Briefcase, Home, Phone,
  ExternalLink,
} from 'lucide-react';
import type { Profile, WasherProfile } from '@/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface ApplicationData {
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  province: string;
  postalCode: string;
  experienceLevel: string;
  yearsExperience: string;
  maxWashesPerDay: string;
  governmentIdPath: string;
  insurancePath: string;
  governmentIdUrl?: string;
  insuranceUrl?: string;
  appliedAt: string;
}

interface WasherProfileExt extends WasherProfile {
  application_data?: ApplicationData | null;
}

interface WasherFull extends Profile {
  washer_profiles: WasherProfileExt;
}

export default function AdminWashersPage() {
  const [washers, setWashers] = useState<WasherFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [queryDialogOpen, setQueryDialogOpen] = useState(false);
  const [queryWasherId, setQueryWasherId] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [docPreview, setDocPreview] = useState<{ url: string; title: string } | null>(null);

  async function loadWashers() {
    const res = await fetch('/api/admin/washers');
    const data = await res.json();
    let list = (data.washers || []).filter((w: WasherFull) => w.washer_profiles);
    if (filter !== 'all') {
      list = list.filter((w: WasherFull) => w.washer_profiles.status === filter);
    }
    setWashers(list);
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    loadWashers();
  }, [filter]);

  async function updateWasherStatus(washerId: string, status: string, message?: string) {
    const res = await fetch('/api/admin/washers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ washerId, status, query_message: message }),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || 'Failed to update status');
    } else {
      toast.success(status === 'query' ? 'Query sent to washer' : `Washer ${status}`);
      loadWashers();
    }
  }

  function openQuery(washerId: string) {
    setQueryWasherId(washerId);
    setQueryMessage('');
    setQueryDialogOpen(true);
  }

  function submitQuery() {
    if (!queryMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    updateWasherStatus(queryWasherId, 'query', queryMessage);
    setQueryDialogOpen(false);
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 dark:text-yellow-400 border-yellow-500/30 bg-yellow-500/5';
      case 'approved': return 'text-green-600 dark:text-green-400 border-green-500/30 bg-green-500/5';
      case 'suspended': case 'rejected': return 'text-red-400 border-red-500/30 bg-red-500/5';
      case 'query': return 'text-blue-400 border-blue-500/30 bg-blue-500/5';
      default: return 'text-foreground/60 dark:text-foreground/55';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display text-foreground tracking-tight">Washers</h1>
          <p className="text-foreground/55 dark:text-foreground/50 text-sm mt-1">
            <span className="text-foreground/50 font-medium">{washers.length}</span> {filter === 'all' ? 'total' : filter}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="bg-surface rounded-full p-1 border border-border gap-1">
          {[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'suspended', label: 'Suspended' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="text-xs rounded-full px-4 py-1.5 data-[state=active]:bg-[#E23232] data-[state=active]:text-white transition-colors duration-200 text-foreground/60 dark:text-foreground/55 hover:text-foreground/80 dark:hover:text-foreground/60"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 bg-foreground/5 rounded-2xl" />)}
        </div>
      ) : washers.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-foreground/[0.06] dark:bg-foreground/[0.03] flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-7 h-7 text-foreground/30 dark:text-foreground/10" />
          </div>
          <p className="text-foreground/55 dark:text-foreground/50 text-sm">No washers found</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {washers.map((w) => {
            const wp = w.washer_profiles;
            const appData = wp.application_data;
            const isExpanded = expandedId === w.id;
            const bioText = appData ? null : wp.bio;

            return (
              <div key={w.id} className="bg-surface border border-border rounded-2xl overflow-hidden animate-fade-in-up">
                {/* Header row */}
                <div
                  className="p-3.5 sm:p-5 cursor-pointer hover:bg-foreground/[0.02] active:bg-foreground/[0.04] transition-colors duration-200"
                  onClick={() => setExpandedId(isExpanded ? null : w.id)}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-foreground/[0.10] dark:bg-foreground/[0.06] flex items-center justify-center text-foreground/50 font-display text-base sm:text-lg shrink-0">
                      {w.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <p className="text-foreground font-medium text-sm sm:text-base">{w.full_name}</p>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] rounded-full px-2.5 py-0.5', statusColor(wp.status))}
                        >
                          {wp.status}
                        </Badge>
                        {wp.is_online && (
                          <span className="text-[10px] text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            online
                          </span>
                        )}
                      </div>
                      <p className="text-foreground/55 dark:text-foreground/50 text-xs mt-1 font-mono">{w.email} · {w.phone}</p>
                      <div className="flex items-center gap-4 mt-2.5 text-foreground/55 dark:text-foreground/50 text-xs">
                        <span className="flex items-center gap-1.5 bg-card border border-border rounded-full px-2.5 py-1">
                          <Star className="w-3 h-3 text-yellow-500" /> {wp.rating_avg?.toFixed(1) || '--'}
                        </span>
                        <span className="bg-card border border-border rounded-full px-2.5 py-1">{wp.jobs_completed} washes</span>
                        {wp.service_zones && wp.service_zones.length > 0 && (
                          <span className="flex items-center gap-1 bg-card border border-border rounded-full px-2.5 py-1">
                            <MapPin className="w-3 h-3" /> {wp.service_zones.join(', ')}
                          </span>
                        )}
                        {appData?.appliedAt && (
                          <span className="flex items-center gap-1 bg-card border border-border rounded-full px-2.5 py-1">
                            <Clock className="w-3 h-3" /> Applied {new Date(appData.appliedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="hidden sm:flex gap-2 flex-wrap justify-end">
                        {(wp.status === 'pending' || wp.status === 'query') && (
                          <>
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'approved'); }}
                              className="bg-green-600 hover:bg-green-500 text-white text-xs rounded-xl transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'rejected'); }}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs rounded-xl"
                            >
                              <UserX className="w-3.5 h-3.5 mr-1.5" /> Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); openQuery(w.id); }}
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs rounded-xl"
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Query
                            </Button>
                          </>
                        )}
                        {wp.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'suspended'); }}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs rounded-xl"
                          >
                            Suspend
                          </Button>
                        )}
                        {(wp.status === 'suspended' || wp.status === 'rejected') && (
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'approved'); }}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs rounded-xl transition-colors"
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-foreground/[0.06] dark:bg-foreground/[0.03] flex items-center justify-center">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-foreground/55 dark:text-foreground/50" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-foreground/55 dark:text-foreground/50" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded details panel */}
                {isExpanded && (
                  <div className="border-t border-border bg-card">
                    {/* Mobile action buttons */}
                    <div className="sm:hidden flex gap-2 flex-wrap p-3.5 border-b border-border">
                      {(wp.status === 'pending' || wp.status === 'query') && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'approved'); }}
                            className="h-10 flex-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded-xl active:scale-[0.97]"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'rejected'); }}
                            className="h-10 flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs rounded-xl active:scale-[0.97]"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1.5" /> Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); openQuery(w.id); }}
                            className="h-10 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs rounded-xl active:scale-[0.97]"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Query
                          </Button>
                        </>
                      )}
                      {wp.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'suspended'); }}
                          className="h-10 flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs rounded-xl active:scale-[0.97]"
                        >
                          Suspend
                        </Button>
                      )}
                      {(wp.status === 'suspended' || wp.status === 'rejected') && (
                        <Button
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); updateWasherStatus(w.id, 'approved'); }}
                          className="h-10 flex-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded-xl active:scale-[0.97]"
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                    {appData ? (
                      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                        {/* Personal Info */}
                        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                          <h4 className="text-foreground/60 dark:text-foreground/55 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                            <Phone className="w-3 h-3" /> Personal Info
                          </h4>
                          <div className="space-y-2.5">
                            <DetailRow label="Full Name" value={appData.fullName} />
                            <DetailRow label="Phone" value={appData.phone} />
                            <DetailRow label="Email" value={w.email || '--'} />
                          </div>
                        </div>

                        {/* Location */}
                        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                          <h4 className="text-foreground/60 dark:text-foreground/55 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                            <Home className="w-3 h-3" /> Location
                          </h4>
                          <div className="space-y-2.5">
                            <DetailRow label="Address" value={appData.streetAddress} />
                            <DetailRow label="City" value={appData.city} />
                            <DetailRow label="Province" value={appData.province} />
                            <DetailRow label="Postal Code" value={appData.postalCode} />
                          </div>
                        </div>

                        {/* Experience */}
                        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
                          <h4 className="text-foreground/60 dark:text-foreground/55 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                            <Briefcase className="w-3 h-3" /> Experience
                          </h4>
                          <div className="space-y-2.5">
                            <DetailRow
                              label="Level"
                              value={appData.experienceLevel === 'trained' ? 'Trained Professional' : 'Fresher'}
                            />
                            {appData.yearsExperience && (
                              <DetailRow label="Years" value={`${appData.yearsExperience} years`} />
                            )}
                            <DetailRow label="Max Washes/Day" value={appData.maxWashesPerDay} />
                            <DetailRow
                              label="Applied"
                              value={new Date(appData.appliedAt).toLocaleDateString('en-CA', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            />
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="md:col-span-3 space-y-3 pt-2 border-t border-border">
                          <h4 className="text-foreground/60 dark:text-foreground/55 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Documents
                          </h4>
                          <div className="flex gap-4 flex-wrap">
                            {appData.governmentIdPath ? (
                              <button
                                onClick={() => setDocPreview({
                                  url: appData.governmentIdUrl || '',
                                  title: 'Government ID',
                                })}
                                className="flex items-center gap-3 bg-surface border border-border rounded-xl px-5 py-4 hover:border-border transition-colors duration-200 group"
                              >
                                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                  <Shield className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-foreground text-sm font-medium">Government ID</p>
                                  <p className="text-green-600 dark:text-green-400 text-[10px] uppercase tracking-wider">Uploaded</p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-foreground/50 dark:text-foreground/15 group-hover:text-[#E23232] ml-2 transition-colors" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-5 py-4 border-l-2 border-l-red-500/40">
                                <div className="w-11 h-11 rounded-xl bg-red-500/10 flex items-center justify-center">
                                  <Shield className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                  <p className="text-foreground text-sm font-medium">Government ID</p>
                                  <p className="text-red-400 text-[10px] uppercase tracking-wider">Not uploaded</p>
                                </div>
                              </div>
                            )}

                            {appData.insurancePath ? (
                              <button
                                onClick={() => setDocPreview({
                                  url: appData.insuranceUrl || '',
                                  title: 'Insurance Certificate',
                                })}
                                className="flex items-center gap-3 bg-surface border border-border rounded-xl px-5 py-4 hover:border-border transition-colors duration-200 group"
                              >
                                <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="text-left">
                                  <p className="text-foreground text-sm font-medium">Insurance Certificate</p>
                                  <p className="text-green-600 dark:text-green-400 text-[10px] uppercase tracking-wider">Uploaded</p>
                                </div>
                                <ExternalLink className="w-3.5 h-3.5 text-foreground/50 dark:text-foreground/15 group-hover:text-[#E23232] ml-2 transition-colors" />
                              </button>
                            ) : (
                              <div className="flex items-center gap-3 bg-surface border border-border rounded-xl px-5 py-4 opacity-40">
                                <div className="w-11 h-11 rounded-xl bg-foreground/5 flex items-center justify-center">
                                  <FileText className="w-5 h-5 text-foreground/55 dark:text-foreground/50" />
                                </div>
                                <div>
                                  <p className="text-foreground text-sm font-medium">Insurance Certificate</p>
                                  <p className="text-foreground/55 dark:text-foreground/50 text-[10px] uppercase tracking-wider">Not provided</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Legacy plain-text bio fallback */
                      <div className="p-6">
                        {bioText ? (
                          <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
                            <h4 className="text-foreground/60 dark:text-foreground/55 text-[10px] font-mono uppercase tracking-widest">Bio</h4>
                            <p className="text-foreground/60 text-sm leading-relaxed">{bioText}</p>
                          </div>
                        ) : (
                          <p className="text-foreground/50 dark:text-foreground/20 text-sm">No application details available</p>
                        )}
                        {wp.tools_owned && wp.tools_owned.length > 0 && (
                          <div className="mt-4 bg-surface border border-border rounded-xl p-4 space-y-2">
                            <h4 className="text-foreground/60 dark:text-foreground/55 text-[10px] font-mono uppercase tracking-widest">Tools Owned</h4>
                            <div className="flex gap-2 flex-wrap">
                              {wp.tools_owned.map((t: string) => (
                                <span key={t} className="text-xs bg-card border border-border rounded-full px-3 py-1 text-foreground/50">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {wp.vehicle_make && (
                          <div className="mt-4 bg-surface border border-border rounded-xl p-4 space-y-2">
                            <h4 className="text-foreground/60 dark:text-foreground/55 text-[10px] font-mono uppercase tracking-widest">Vehicle</h4>
                            <p className="text-foreground/60 text-sm">{wp.vehicle_year} {wp.vehicle_make} {wp.vehicle_model} · {wp.vehicle_plate}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Query Dialog */}
      <Dialog open={queryDialogOpen} onOpenChange={setQueryDialogOpen}>
        <DialogContent className="bg-surface border border-border text-foreground rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              Send Query to Washer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-foreground/60 dark:text-foreground/55 text-sm">This message will be sent to the washer via email.</p>
            <textarea
              value={queryMessage}
              onChange={(e) => setQueryMessage(e.target.value)}
              placeholder="e.g., Please provide a clearer photo of your government ID..."
              rows={4}
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm placeholder:text-foreground/50 dark:placeholder:text-foreground/20 focus:outline-none focus:border-border resize-none"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setQueryDialogOpen(false)} className="border-border text-foreground/50 rounded-xl hover:bg-foreground/[0.06] dark:hover:bg-foreground/[0.03]">
                Cancel
              </Button>
              <Button onClick={submitQuery} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
                Send Query
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog open={!!docPreview} onOpenChange={() => setDocPreview(null)}>
        <DialogContent className="bg-surface border border-border text-foreground max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{docPreview?.title}</DialogTitle>
          </DialogHeader>
          {docPreview?.url ? (
            <div className="space-y-3">
              {docPreview.url.match(/\.pdf/) ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-foreground/[0.06] dark:bg-foreground/[0.03] flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-foreground/50 dark:text-foreground/20" />
                  </div>
                  <a
                    href={docPreview.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E23232] hover:text-[#E23232]/80 text-sm inline-flex items-center gap-1.5 transition-colors"
                  >
                    Open PDF in new tab <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={docPreview.url}
                  alt={docPreview.title}
                  className="w-full rounded-xl border border-border max-h-[70vh] object-contain bg-black"
                />
              )}
            </div>
          ) : (
            <p className="text-foreground/50 dark:text-foreground/20 text-center py-12">Document not available. The storage bucket may not be configured.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-foreground/55 dark:text-foreground/50 text-xs">{label}</span>
      <span className="text-foreground/70 text-sm text-right">{value || '--'}</span>
    </div>
  );
}
