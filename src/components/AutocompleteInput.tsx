'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AutocompleteInputProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function AutocompleteInput({
  options,
  value,
  onChange,
  placeholder,
  className,
  id,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setFiltered(options.slice(0, 8));
    } else {
      const lower = value.toLowerCase();
      setFiltered(
        options.filter((o) => o.toLowerCase().includes(lower)).slice(0, 8)
      );
    }
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-[9999] mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-foreground/15 bg-popover shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5">
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                'w-full px-3 py-2.5 text-left text-sm transition-colors hover:bg-foreground/10 border-b border-foreground/[0.04] last:border-b-0',
                option === value ? 'text-[#E23232] font-medium bg-[#E23232]/5' : 'text-foreground'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
