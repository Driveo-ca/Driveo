import { Providers } from '@/lib/providers';
import { WasherNav } from '@/components/nav/WasherNav';

export const metadata = {
  title: 'Driveo Washer — Dashboard',
};

export default function WasherLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-[#050505] text-white">
        <WasherNav />
        <main className="pb-24 md:pb-0">{children}</main>
      </div>
    </Providers>
  );
}
