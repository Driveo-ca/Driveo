import { Providers } from '@/lib/providers';
import { CustomerNav } from '@/components/nav/CustomerNav';

export const metadata = {
  title: 'Driveo — Book a Wash',
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-[#050505] text-white page-bg">
        <CustomerNav />
        <main className="pb-24 md:pb-0">{children}</main>
      </div>
    </Providers>
  );
}
