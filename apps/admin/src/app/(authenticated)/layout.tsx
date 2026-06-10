import { redirect } from 'next/navigation';
import { getServerUser, getServerToken } from '@/lib/actions';
import { Sidebar } from '@/components/Sidebar';
import { HeaderServer } from '@/components/HeaderServer';

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect('/login');
  }

  const token = await getServerToken();

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="lg:ml-64">
        <HeaderServer user={user} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
