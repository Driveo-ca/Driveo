'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PLAN_LABELS, centsToDisplay } from '@/lib/pricing';
import { Star, ArrowLeft, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Booking, Profile, WasherProfile, Vehicle } from '@/types';

interface BookingWithRelations extends Booking {
  vehicles: Vehicle;
}

export default function ReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [washer, setWasher] = useState<(Profile & { washer_profiles: WasherProfile }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');

  const ratingLabels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Amazing!'];

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data } = await supabase
        .from('bookings')
        .select('*, vehicles(*)')
        .eq('id', id)
        .single();

      if (data) {
        setBooking(data);
        if (data.washer_id) {
          const { data: washerData } = await supabase
            .from('profiles')
            .select('*, washer_profiles(*)')
            .eq('id', data.washer_id)
            .single();
          if (washerData) setWasher(washerData);
        }

        // Check if already reviewed
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id, rating, comment')
          .eq('booking_id', data.id)
          .maybeSingle();

        if (existingReview) {
          setRating(existingReview.rating);
          setComment(existingReview.comment || '');
          setSubmitted(true);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSubmit() {
    if (!booking || !rating) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Not logged in');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      customer_id: user.id,
      washer_id: booking.washer_id,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      console.error('Review insert error:', error);
      if (error.code === '23505') {
        toast.error('You already reviewed this wash');
      } else {
        toast.error(`Failed to submit review: ${error.message}`);
      }
      setSubmitting(false);
      return;
    }

    // Update washer's average rating
    if (booking.washer_id) {
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('washer_id', booking.washer_id);

      if (allReviews && allReviews.length > 0) {
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await supabase
          .from('washer_profiles')
          .update({ rating_avg: Math.round(avg * 100) / 100 })
          .eq('id', booking.washer_id);
      }
    }

    setSubmitted(true);
    setSubmitting(false);
    toast.success('Thank you for your review!');
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48 bg-white/5" />
        <Skeleton className="h-48 w-full bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="px-4 pt-20 text-center">
        <p className="text-white/40">Booking not found</p>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
        <div>
          <h2 className="text-white text-xl font-display">Thank you!</h2>
          <p className="text-white/40 text-sm mt-2">
            Your {rating}-star review has been submitted.
          </p>
        </div>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <Star
              key={s}
              className={cn(
                'w-6 h-6',
                s <= rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'
              )}
            />
          ))}
        </div>
        {comment && (
          <p className="text-white/30 text-sm italic">&quot;{comment}&quot;</p>
        )}
        <Button
          onClick={() => router.push('/app/bookings')}
          className="bg-[#E23232] hover:bg-[#c92a2a] text-white font-semibold rounded-xl px-8"
        >
          Back to Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#050505] border-b border-white/[0.06] px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white/60" />
        </button>
        <span className="text-white text-sm font-medium">Rate your wash</span>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Washer info */}
        {washer && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-[#E23232]/10 flex items-center justify-center border-2 border-[#E23232]/30">
              {washer.avatar_url ? (
                <img src={washer.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-[#E23232] font-display text-2xl">{washer.full_name.charAt(0)}</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">{washer.full_name}</p>
              <p className="text-white/30 text-xs mt-0.5">
                {PLAN_LABELS[booking.wash_plan]} · {centsToDisplay(booking.total_price)}
              </p>
            </div>
          </div>
        )}

        {/* Star rating */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-white/50 text-sm">How was your wash?</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHoveredStar(s)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(s)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'w-10 h-10 transition-colors',
                    s <= (hoveredStar || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-white/10 hover:text-white/20'
                  )}
                />
              </button>
            ))}
          </div>
          {(hoveredStar || rating) > 0 && (
            <p className={cn(
              'text-sm font-medium',
              (hoveredStar || rating) >= 4 ? 'text-amber-400' :
              (hoveredStar || rating) >= 3 ? 'text-white/50' :
              'text-red-400'
            )}>
              {ratingLabels[hoveredStar || rating]}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us more about your experience (optional)"
            rows={4}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 resize-none focus:outline-none focus:border-[#E23232]/40 transition-colors"
          />
        </div>

        {/* Quick tags */}
        {rating > 0 && (
          <div className="flex flex-wrap gap-2">
            {(rating >= 4
              ? ['Super clean', 'On time', 'Friendly', 'Great detail', 'Would rebook']
              : ['Late arrival', 'Missed spots', 'Needs improvement', 'Poor communication']
            ).map(tag => {
              const isSelected = comment.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => {
                    if (isSelected) {
                      setComment(c => c.replace(tag, '').replace(/\s{2,}/g, ' ').trim());
                    } else {
                      setComment(c => (c ? `${c} ${tag}` : tag));
                    }
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                    isSelected
                      ? 'bg-[#E23232]/10 border-[#E23232]/30 text-[#E23232]'
                      : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:border-white/[0.14]'
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!rating || submitting}
          className={cn(
            'w-full py-3.5 rounded-xl font-semibold text-sm transition-all',
            rating
              ? 'bg-[#E23232] hover:bg-[#c92a2a] text-white'
              : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
          )}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Submit Review</>
          )}
        </Button>
      </div>
    </div>
  );
}
