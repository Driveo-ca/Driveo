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
        <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-white/10 bg-[#0a0a0a] shadow-xl">
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
                'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-white/10',
                option === value ? 'text-[#E23232]' : 'text-white/80'
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
