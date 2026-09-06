'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { LogOut, ChevronDown, User } from 'lucide-react';
import AuthModal from './auth-modal';

export default function UserButton() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="px-3 py-1.5 min-h-[32px] rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-white border hairline border-[var(--border)] hover:border-[var(--accent-dim)] hover:bg-[var(--accent-subtle)] transition-all touch-manipulation"
        >
          Sign In
        </button>
        <AuthModal open={showModal} onClose={() => setShowModal(false)} canDismiss />
      </>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown((v) => !v)}
        className="flex items-center gap-1.5 px-2 py-1 min-h-[32px] rounded-lg hover:bg-white/5 transition-colors touch-manipulation"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt={user.name ?? 'User'}
            className="size-6 rounded-full ring-1 ring-[var(--accent-dim)] object-cover"
          />
        ) : (
          <div className="size-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[9px] font-bold text-white">
            {initials}
          </div>
        )}
        <span className="text-xs text-[var(--text-secondary)] hidden sm:block max-w-24 truncate">
          {user.name ?? user.email}
        </span>
        <ChevronDown size={12} className="text-[var(--text-muted)] flex-shrink-0" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-[var(--bg-elevated)] border hairline border-[var(--border-bright)] py-1 shadow-xl z-50 animate-dropIn">
          <div className="px-3 py-2 border-b hairline border-[var(--border)]">
            <div className="flex items-center gap-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? 'User'}
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <div className="size-7 rounded-full bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                {user.name && (
                  <div className="text-xs font-semibold truncate">{user.name}</div>
                )}
                <div className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 w-full px-1 pt-1">
            <button
              onClick={() => { signOut(); setShowDropdown(false); }}
              className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--bear)] hover:bg-[var(--bear)]/10 transition-colors touch-manipulation"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarUserSection() {
  const { data: session, status } = useSession();
  const [showModal, setShowModal] = useState(false);

  if (status === 'loading') return null;

  if (!session?.user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs touch-manipulation"
        >
          <User size={14} />
          Sign In
        </button>
        <AuthModal open={showModal} onClose={() => setShowModal(false)} canDismiss />
      </>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user.email?.[0] ?? '?').toUpperCase();

  return (
    <div className="px-2.5 pt-1.5 pb-2 border-t hairline border-[var(--border)]">
      <div className="flex items-center gap-2 px-2 py-2">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="size-6 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="size-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium truncate">{user.name ?? user.email}</div>
          <div className="text-[9px] text-[var(--text-muted)] truncate">{user.email}</div>
        </div>
        <button
          onClick={() => signOut()}
          title="Sign out"
          className="p-1 rounded-lg hover:bg-[var(--bear)]/10 hover:text-[var(--bear)] text-[var(--text-muted)] transition-colors flex-shrink-0 touch-manipulation"
        >
          <LogOut size={12} />
        </button>
      </div>
    </div>
  );
}
