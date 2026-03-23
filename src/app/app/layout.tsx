import { Providers } from '@/lib/providers';
import { CustomerNav } from '@/components/nav/CustomerNav';

export const metadata = {
  title: 'Driveo — Book a Wash',
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-background text-foreground">
        <CustomerNav />
        <main className="pb-24 md:pb-0">{children}</main>
      </div>
    </Providers>
  );
}
