'use client';

import { logout } from '@/lib/actions';

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-stone-600 hover:text-forest"
      >
        Sign out
      </button>
    </form>
  );
}
