import Link from 'next/link';
import { getServerToken } from '@/lib/actions';
import type { CleaningJob } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getJobs(token: string): Promise<CleaningJob[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/jobs`, {
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

const statusStyles: Record<string, string> = {
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  complete: 'bg-green-100 text-green-700',
  flagged: 'bg-red-100 text-red-700',
};

export default async function JobsPage() {
  const token = await getServerToken();
  const jobs = token ? await getJobs(token) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Cleaning Jobs</h1>
          <p className="mt-1 text-sm text-stone-600">
            Manage cleaning assignments and schedules
          </p>
        </div>
        <button className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90">
          Create Job
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
          <p className="text-stone-500">No jobs scheduled.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Property</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {jobs.map((job) => (
                <tr key={job.id} className="cursor-pointer hover:bg-stone-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-forest">
                    <Link href={`/jobs/${job.id}`}>{job.property?.name || 'Unknown'}</Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {formatDate(job.scheduled_date)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {job.scheduled_time || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${
                      statusStyles[job.status] || 'bg-stone-100 text-stone-600'
                    }`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {job.checklist_completion_pct}%
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
