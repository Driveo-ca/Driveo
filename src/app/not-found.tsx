import Link from 'next/link';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-display text-[#E23232] mb-4">404</h1>
        <h2 className="text-xl font-display text-foreground mb-2">Page not found</h2>
        <p className="text-foreground/50 text-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#E23232] hover:bg-[#E23232]/80 text-white px-6 py-3 rounded-xl font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
