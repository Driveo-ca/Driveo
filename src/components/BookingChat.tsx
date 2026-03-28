'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Send, MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface BookingChatProps {
  bookingId: string;
  currentUserId: string;
  otherPersonName: string;
  otherPersonAvatar?: string | null;
  open: boolean;
  onClose: () => void;
  role?: 'customer' | 'washer';
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function BookingChat({
  bookingId,
  currentUserId,
  otherPersonName,
  otherPersonAvatar,
  open,
  onClose,
  role = 'customer',
}: BookingChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  // Load messages + subscribe to realtime
  useEffect(() => {
    if (!open) return;
    const supabase = createClient();
    setLoading(true);

    supabase
      .from('booking_messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 50);
      });

    const channel = supabase
      .channel(`chat:${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'booking_messages',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
        setTimeout(() => scrollToBottom(true), 30);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open, bookingId, scrollToBottom]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);
    const supabase = createClient();
    await supabase.from('booking_messages').insert({
      booking_id: bookingId,
      sender_id: currentUserId,
      content: text,
    });
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Group messages by day
  const grouped: { day: string; msgs: Message[] }[] = [];
  for (const msg of messages) {
    const day = formatDay(msg.created_at);
    if (!grouped.length || grouped[grouped.length - 1].day !== day) {
      grouped.push({ day, msgs: [msg] });
    } else {
      grouped[grouped.length - 1].msgs.push(msg);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-card border-t border-border rounded-t-3xl shadow-2xl"
        style={{ maxHeight: '85dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-foreground/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <div className="w-9 h-9 rounded-full bg-[#E23232]/10 border border-[#E23232]/20 flex items-center justify-center shrink-0 overflow-hidden">
            {otherPersonAvatar ? (
              <img src={otherPersonAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#E23232] text-sm font-semibold">
                {otherPersonName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-foreground font-semibold text-sm truncate">{otherPersonName}</p>
            <p className="text-foreground/50 text-[11px]">{role === 'washer' ? 'Customer' : 'Your washer'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-foreground/[0.07] hover:bg-foreground/[0.12] transition-colors"
          >
            <X className="w-4 h-4 text-foreground/70" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 text-foreground/55 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <MessageCircle className="w-8 h-8 text-foreground/50" />
              <p className="text-foreground/60 text-sm">No messages yet</p>
              <p className="text-foreground/50 text-xs">{role === 'washer' ? 'Send a message to the customer' : 'Say hello to your washer!'}</p>
            </div>
          ) : (
            grouped.map(({ day, msgs }) => (
              <div key={day}>
                {/* Day separator */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-mono text-foreground/55 uppercase tracking-widest">{day}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {msgs.map((msg, i) => {
                  const isMe = msg.sender_id === currentUserId;
                  const prevMsg = i > 0 ? msgs[i - 1] : null;
                  const sameSenderAsPrev = prevMsg?.sender_id === msg.sender_id;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex items-end gap-2',
                        isMe ? 'justify-end' : 'justify-start',
                        sameSenderAsPrev ? 'mt-0.5' : 'mt-2'
                      )}
                    >
                      {/* Avatar (other person only, last in group) */}
                      {!isMe && (
                        <div className={cn(
                          'w-6 h-6 rounded-full shrink-0 bg-[#E23232]/10 border border-[#E23232]/20 flex items-center justify-center overflow-hidden',
                          sameSenderAsPrev ? 'opacity-0' : 'opacity-100'
                        )}>
                          {otherPersonAvatar ? (
                            <img src={otherPersonAvatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[#E23232] text-[9px] font-semibold">
                              {otherPersonName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      )}

                      <div className={cn('max-w-[72%] flex flex-col', isMe ? 'items-end' : 'items-start')}>
                        <div
                          className={cn(
                            'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                            isMe
                              ? 'bg-[#E23232] text-white rounded-br-sm'
                              : 'bg-foreground/[0.08] dark:bg-foreground/[0.06] text-foreground rounded-bl-sm'
                          )}
                        >
                          {msg.content}
                        </div>
                        {/* Timestamp — only show on last msg in group or last overall */}
                        {(i === msgs.length - 1 || msgs[i + 1]?.sender_id !== msg.sender_id) && (
                          <span className="text-[10px] text-foreground/55 mt-1 px-1">
                            {formatTime(msg.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-card">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={role === 'washer' ? 'Message customer…' : 'Message your washer…'}
            maxLength={1000}
            className="flex-1 bg-foreground/[0.06] dark:bg-foreground/[0.04] border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/55 outline-none focus:border-[#E23232]/50 transition-colors"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className={cn(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all',
              input.trim()
                ? 'bg-[#E23232] text-white hover:bg-[#c92a2a] active:scale-95'
                : 'bg-foreground/[0.07] text-foreground/50 cursor-not-allowed'
            )}
          >
            {sending
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Bottom safe area */}
        <div className="h-safe-b bg-card" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} />
      </div>
    </>
  );
}
