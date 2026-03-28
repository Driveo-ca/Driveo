import { WasherNav } from '@/components/nav/WasherNav';
import { JobAlertListener } from '@/components/washer/JobAlertListener';

export const metadata = {
  title: 'Driveo Washer — Dashboard',
};

export default function WasherLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <WasherNav />
      <main className="pb-24 md:pb-0">{children}</main>
      <JobAlertListener />
    </div>
  );
}
