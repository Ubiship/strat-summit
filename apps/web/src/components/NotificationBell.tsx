'use client';

import { useCounts } from '@novu/react';
import clsx from 'clsx';

interface NotificationBellProps {
  colorScheme?: 'light' | 'dark';
  className?: string;
  onClick?: () => void;
}

/**
 * NotificationBell component displays a bell icon with an unseen notification count badge.
 * Must be used within a NovuProvider context.
 *
 * @example
 * ```tsx
 * <NovuProvider subscriberId={userId}>
 *   <NotificationBell colorScheme="dark" onClick={() => setInboxOpen(true)} />
 * </NovuProvider>
 * ```
 */
export function NotificationBell({
  colorScheme = 'light',
  className,
  onClick,
}: NotificationBellProps) {
  const { counts } = useCounts({
    filters: [{ seen: false }],
  });

  const unseenCount = counts?.[0]?.count ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'relative inline-flex items-center justify-center rounded-full p-2 transition-colors',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        colorScheme === 'dark'
          ? 'text-stone hover:text-cream focus-visible:ring-stone'
          : 'text-forest hover:text-forest/80 focus-visible:ring-forest',
        className
      )}
      aria-label={
        unseenCount > 0
          ? `Notifications (${unseenCount} unread)`
          : 'Notifications'
      }
    >
      {/* Bell Icon SVG */}
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
        />
      </svg>

      {/* Badge for unseen count */}
      {unseenCount > 0 && (
        <span
          className={clsx(
            'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center',
            'rounded-full px-1 text-xs font-semibold',
            'bg-copper text-white'
          )}
          aria-hidden="true"
        >
          {unseenCount > 99 ? '99+' : unseenCount}
        </span>
      )}
    </button>
  );
}
