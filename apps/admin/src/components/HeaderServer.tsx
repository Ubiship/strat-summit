import { LogoutButton } from './LogoutButton';
import { NotificationBell } from './NotificationBell';

type User = {
  id: string;
  role: string;
  contactId: string;
};

export function HeaderServer({ user }: { user: User }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-stone-200 bg-white px-6">
      <div className="flex items-center gap-4 lg:hidden">
        <span className="text-lg font-semibold text-forest">
          Strathcona Summit
        </span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-medium text-white">
            {user.role.charAt(0).toUpperCase()}
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
