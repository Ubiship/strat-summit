import Link from 'next/link';
import { getServerToken } from '@/lib/actions';
import type { Booking } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getBookings(token: string): Promise<Booking[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA');
}

export default async function BookingsPage() {
  const token = await getServerToken();
  const bookings = token ? await getBookings(token) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Bookings</h1>
          <p className="mt-1 text-sm text-stone-600">
            View and manage guest reservations
          </p>
        </div>
        <button className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90">
          Add Booking
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
          <p className="text-stone-500">No bookings found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Guest</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Property</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Check In</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Check Out</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Nights</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="cursor-pointer hover:bg-stone-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-forest">
                    <Link href={`/bookings/${booking.id}`}>{booking.guest_name || 'Guest'}</Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {booking.property?.name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {formatDate(booking.check_in)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {formatDate(booking.check_out)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">{booking.nights}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className="capitalize">{booking.source.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
