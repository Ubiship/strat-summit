import { getServerToken } from '@/lib/actions';
import { StatsCard } from '@/components/StatsCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getStats(token: string) {
  try {
    const [propertiesRes, bookingsRes, jobsRes, contactsRes] = await Promise.all([
      fetch(`${API_URL}/api/v1/properties?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }),
      fetch(`${API_URL}/api/v1/bookings?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }),
      fetch(`${API_URL}/api/v1/jobs?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }),
      fetch(`${API_URL}/api/v1/contacts?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }),
    ]);

    // For now, just count based on if the requests succeeded
    // In a real implementation, the API would return total counts
    return {
      properties: propertiesRes.ok ? (await propertiesRes.json()).data?.length || 0 : 0,
      bookings: bookingsRes.ok ? (await bookingsRes.json()).data?.length || 0 : 0,
      jobs: jobsRes.ok ? (await jobsRes.json()).data?.length || 0 : 0,
      contacts: contactsRes.ok ? (await contactsRes.json()).data?.length || 0 : 0,
    };
  } catch {
    return { properties: 0, bookings: 0, jobs: 0, contacts: 0 };
  }
}

export default async function DashboardPage() {
  const token = await getServerToken();
  const stats = token ? await getStats(token) : { properties: 0, bookings: 0, jobs: 0, contacts: 0 };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-forest">Dashboard</h1>
        <p className="mt-1 text-sm text-stone-600">
          Welcome back. Here&apos;s an overview of your operations.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Properties"
          value={stats.properties}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819" />
            </svg>
          }
        />
        <StatsCard
          title="Bookings"
          value={stats.bookings}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
            </svg>
          }
        />
        <StatsCard
          title="Jobs"
          value={stats.jobs}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
          }
        />
        <StatsCard
          title="Contacts"
          value={stats.contacts}
          icon={
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
        />
      </div>
    </div>
  );
}
