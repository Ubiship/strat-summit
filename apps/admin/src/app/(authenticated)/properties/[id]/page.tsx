import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerToken } from '@/lib/actions';
import type { Property, Booking } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getProperty(token: string, id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/properties/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

async function getBookings(token: string, propertyId: string): Promise<Booking[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/bookings?property_id=${propertyId}`, {
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

const tierLabels: Record<string, string> = {
  '1': 'Basic Cleaning',
  '2': 'Cleaning',
  '3': 'Full PM',
};

const sourceColors: Record<string, string> = {
  airbnb: 'bg-[#FF5A5F] text-white',
  vrbo: 'bg-[#3B5998] text-white',
  direct: 'bg-forest text-white',
  owner_use: 'bg-stone-500 text-white',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const token = await getServerToken();

  if (!token) {
    notFound();
  }

  const property = await getProperty(token, id);
  if (!property) {
    notFound();
  }

  const bookings = await getBookings(token, id);
  const now = new Date();

  const upcomingBookings = bookings
    .filter(b => new Date(b.check_in) >= now)
    .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());

  const pastBookings = bookings
    .filter(b => new Date(b.check_in) < now)
    .sort((a, b) => new Date(b.check_in).getTime() - new Date(a.check_in).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/properties" className="text-sm text-forest hover:underline mb-2 inline-block">
            &larr; Back to Properties
          </Link>
          <h1 className="text-2xl font-bold text-forest">{property.name}</h1>
          <p className="mt-1 text-stone-600">{property.address}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
            property.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
          }`}>
            {property.active ? 'Active' : 'Inactive'}
          </span>
          <span className="inline-flex rounded-full bg-forest/10 px-3 py-1 text-sm font-medium text-forest">
            {tierLabels[property.tier] || `Tier ${property.tier}`}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Cards */}
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-forest mb-4">Property Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-stone-500">Commission Rate</dt>
                <dd className="font-medium text-stone-900">{(property.commission_rate * 100).toFixed(0)}%</dd>
              </div>
              <div>
                <dt className="text-stone-500">Cleaning Fee</dt>
                <dd className="font-medium text-stone-900">${property.cleaning_fee}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Hot Tub</dt>
                <dd className="font-medium text-stone-900">
                  {property.hot_tub ? `Yes (${property.hot_tub_temp_f}°F)` : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">WiFi Password</dt>
                <dd className="font-medium text-stone-900 font-mono">{property.wifi_password || '—'}</dd>
              </div>
            </dl>
            {property.notes && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <dt className="text-sm text-stone-500 mb-1">Notes</dt>
                <dd className="text-sm text-stone-700">{property.notes}</dd>
              </div>
            )}
          </div>

          {/* Upcoming Bookings */}
          <div className="rounded-lg border border-stone-200 bg-white">
            <div className="border-b border-stone-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-forest">Upcoming Bookings ({upcomingBookings.length})</h2>
            </div>
            {upcomingBookings.length === 0 ? (
              <div className="p-6 text-center text-stone-500">No upcoming bookings</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {upcomingBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{booking.guest_name || 'Guest'}</p>
                      <p className="text-sm text-stone-500">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                        <span className="mx-2">·</span>
                        {booking.nights} nights
                      </p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${sourceColors[booking.source] || 'bg-stone-100 text-stone-600'}`}>
                      {booking.source}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          <div className="rounded-lg border border-stone-200 bg-white">
            <div className="border-b border-stone-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-forest">Past Bookings ({pastBookings.length})</h2>
            </div>
            {pastBookings.length === 0 ? (
              <div className="p-6 text-center text-stone-500">No past bookings</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {pastBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{booking.guest_name || 'Guest'}</p>
                      <p className="text-sm text-stone-500">
                        {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                        <span className="mx-2">·</span>
                        {booking.nights} nights
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${sourceColors[booking.source] || 'bg-stone-100 text-stone-600'}`}>
                        {booking.source}
                      </span>
                      {booking.revenue_excl_cleaning_fee && (
                        <p className="text-sm font-medium text-stone-900 mt-1">
                          ${booking.revenue_excl_cleaning_fee.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h3 className="text-sm font-medium text-stone-500 mb-4">Statistics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-forest">{bookings.length}</p>
                <p className="text-sm text-stone-500">Total Bookings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-forest">{upcomingBookings.length}</p>
                <p className="text-sm text-stone-500">Upcoming</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-forest">
                  ${bookings.reduce((sum, b) => sum + (b.revenue_excl_cleaning_fee || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-stone-500">Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Access Codes */}
          {property.access_codes && Object.keys(property.access_codes).length > 0 && (
            <div className="rounded-lg border border-stone-200 bg-white p-6">
              <h3 className="text-sm font-medium text-stone-500 mb-4">Access Codes</h3>
              <dl className="space-y-3">
                {Object.entries(property.access_codes).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs text-stone-500 uppercase">{key.replace('_', ' ')}</dt>
                    <dd className="font-mono font-medium text-stone-900">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
