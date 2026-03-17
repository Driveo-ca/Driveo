import { Star } from 'lucide-react';

export function Marquee() {
  return (
    <div className="py-8 border-y border-white/10 overflow-hidden bg-[#E23232] text-black flex">
      <div className="marquee-content flex gap-10 items-center">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="contents">
            <span className="text-4xl md:text-6xl font-display uppercase whitespace-nowrap tracking-wide">We Come To You. Condo. Driveway. Office. Anywhere.</span>
            <Star className="w-8 h-8 fill-black shrink-0" />
          </span>
        ))}
      </div>
      <div className="marquee-content flex gap-10 items-center" aria-hidden="true">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="contents">
            <span className="text-4xl md:text-6xl font-display uppercase whitespace-nowrap tracking-wide">We Come To You. Condo. Driveway. Office. Anywhere.</span>
            <Star className="w-8 h-8 fill-black shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
