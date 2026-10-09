import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerToken } from '@/lib/actions';
import type { Booking, CleaningJob } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getBooking(token: string, id: string): Promise<Booking | null> {
  try {
    const res = await fetch(`${API_URL}/api/v1/bookings/${id}`, {
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

async function getJobsForBooking(token: string, bookingId: string): Promise<CleaningJob[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/jobs?booking_id=${bookingId}`, {
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

const sourceColors: Record<string, string> = {
  airbnb: 'bg-[#FF5A5F] text-white',
  vrbo: 'bg-[#3B5998] text-white',
  direct: 'bg-forest text-white',
  owner_use: 'bg-stone-500 text-white',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-stone-100 text-stone-600',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return '—';
  return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  const token = await getServerToken();

  if (!token) {
    notFound();
  }

  const booking = await getBooking(token, id);
  if (!booking) {
    notFound();
  }

  const jobs = await getJobsForBooking(token, id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/bookings" className="text-sm text-forest hover:underline mb-2 inline-block">
            &larr; Back to Bookings
          </Link>
          <h1 className="text-2xl font-bold text-forest">
            {booking.guest_name || 'Guest Booking'}
          </h1>
          <p className="mt-1 text-stone-600">
            {booking.property?.name || 'Unknown Property'}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${sourceColors[booking.source] || 'bg-stone-100 text-stone-600'}`}>
          {booking.source.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stay Details */}
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-forest mb-4">Stay Details</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-stone-500">Check In</dt>
                <dd className="font-medium text-stone-900">{formatDate(booking.check_in)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Check Out</dt>
                <dd className="font-medium text-stone-900">{formatDate(booking.check_out)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Nights</dt>
                <dd className="font-medium text-stone-900">{booking.nights}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Guests</dt>
                <dd className="font-medium text-stone-900">{booking.guest_count || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* Financial Details */}
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-forest mb-4">Financial Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Gross Revenue</dt>
                <dd className="font-medium text-stone-900">{formatCurrency(booking.gross_revenue)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Platform Fee</dt>
                <dd className="font-medium text-stone-900">{formatCurrency(booking.platform_fee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Cleaning Fee</dt>
                <dd className="font-medium text-stone-900">{formatCurrency(booking.cleaning_fee)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Taxes Collected</dt>
                <dd className="font-medium text-stone-900">{formatCurrency(booking.taxes_collected)}</dd>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-3 mt-3">
                <dt className="text-stone-700 font-medium">Net Revenue</dt>
                <dd className="font-bold text-forest">{formatCurrency(booking.revenue_excl_cleaning_fee)}</dd>
              </div>
            </dl>
          </div>

          {/* Cleaning Jobs */}
          <div className="rounded-lg border border-stone-200 bg-white">
            <div className="border-b border-stone-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-forest">Cleaning Jobs ({jobs.length})</h2>
            </div>
            {jobs.length === 0 ? (
              <div className="p-6 text-center text-stone-500">No cleaning jobs scheduled</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block px-6 py-4 hover:bg-stone-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-900 capitalize">
                          {job.job_type.replace('_', ' ')} Clean
                        </p>
                        <p className="text-sm text-stone-500">
                          {formatDate(job.scheduled_date)}
                          {job.assigned_to && (
                            <span className="ml-2">• Assigned to {job.assigned_to.first_name}</span>
                          )}
                        </p>
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[job.status] || 'bg-stone-100 text-stone-600'}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Guest Info */}
          <div className="rounded-lg border border-stone-200 bg-white p-6">
            <h3 className="text-sm font-medium text-stone-500 mb-4">Guest Information</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-stone-500">Name</dt>
                <dd className="font-medium text-stone-900">{booking.guest_name || '—'}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Email</dt>
                <dd className="font-medium text-stone-900">{booking.guest_email || '—'}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Phone</dt>
                <dd className="font-medium text-stone-900">{booking.guest_phone || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* External Reference */}
          {booking.external_id && (
            <div className="rounded-lg border border-stone-200 bg-white p-6">
              <h3 className="text-sm font-medium text-stone-500 mb-4">External Reference</h3>
              <p className="font-mono text-sm text-stone-900 break-all">{booking.external_id}</p>
            </div>
          )}

          {/* Property Link */}
          {booking.property && (
            <div className="rounded-lg border border-stone-200 bg-white p-6">
              <h3 className="text-sm font-medium text-stone-500 mb-4">Property</h3>
              <Link
                href={`/properties/${booking.property_id}`}
                className="text-forest hover:underline font-medium"
              >
                {booking.property.name} &rarr;
              </Link>
              <p className="text-sm text-stone-500 mt-1">{booking.property.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
