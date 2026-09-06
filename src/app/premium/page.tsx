'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import AuthModal from '@/components/auth/auth-modal';

export default function PremiumPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-dvh bg-[var(--bg-root)] flex items-center justify-center">
        <div className="text-[var(--text-muted)] text-sm">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-dvh bg-[var(--bg-root)] tv-grid-bg flex flex-col items-center justify-center p-4">
        <AuthModal open canDismiss={false} onClose={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-root)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4 tv-grid-bg">
      <Link href="/" className="absolute top-4 left-4 p-2 rounded-xl hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors">
        <ArrowLeft size={18} />
      </Link>
      <div className="size-14 rounded-2xl bg-[var(--accent-subtle)] border hairline border-[var(--accent-dim)] flex items-center justify-center mb-4">
        <Lock size={24} className="text-[var(--accent)]" />
      </div>
      <h1 className="text-xl font-bold tracking-tight mb-2">Premium Features</h1>
      <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
        Coming soon. Advanced analytics, AI signals, and more.
      </p>
    </div>
  );
}
