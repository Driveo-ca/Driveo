import { AdminNav } from '@/components/nav/AdminNav';

export const metadata = {
  title: 'Driveo Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <AdminNav />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">{children}</main>
    </div>
  );
}
