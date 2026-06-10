import Link from 'next/link';
import { getServerToken } from '@/lib/actions';
import type { Property } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getProperties(token: string): Promise<Property[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/properties`, {
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

export default async function PropertiesPage() {
  const token = await getServerToken();
  const properties = token ? await getProperties(token) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Properties</h1>
          <p className="mt-1 text-sm text-stone-600">
            Manage vacation rental properties
          </p>
        </div>
        <button className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90">
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
          <p className="text-stone-500">No properties found. Add your first property to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Address</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {properties.map((property) => (
                <tr key={property.id} className="cursor-pointer hover:bg-stone-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-forest">
                    <Link href={`/properties/${property.id}`}>{property.name}</Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">{property.address}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {tierLabels[property.tier] || property.tier}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                      property.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                    }`}>
                      {property.active ? 'Active' : 'Inactive'}
                    </span>
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
