import { ReactNode } from 'react';
import { NovuProvider } from '@/providers/NovuProvider';
import { NotificationBell } from '@/components/NotificationBell';

// This would come from your auth context/session
async function getCurrentUser() {
  // TODO: Implement actual auth
  return {
    id: 'placeholder-user-id',
    name: 'Admin User',
  };
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <NovuProvider subscriberId={user.id}>
      <div className="min-h-screen bg-stone-50">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-forest">
                Strathcona Summit
              </span>
              <nav className="hidden md:flex md:gap-6">
                <a href="/properties" className="text-sm text-stone-600 hover:text-forest">
                  Properties
                </a>
                <a href="/bookings" className="text-sm text-stone-600 hover:text-forest">
                  Bookings
                </a>
                <a href="/jobs" className="text-sm text-stone-600 hover:text-forest">
                  Jobs
                </a>
                <a href="/contacts" className="text-sm text-stone-600 hover:text-forest">
                  Contacts
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <div className="h-8 w-8 rounded-full bg-forest text-white flex items-center justify-center text-sm font-medium">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
      </div>
    </NovuProvider>
  );
}
