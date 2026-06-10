import Link from 'next/link';
import { getServerToken } from '@/lib/actions';
import type { Contact } from '@repo/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function getContacts(token: string): Promise<Contact[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/contacts`, {
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

export default async function ContactsPage() {
  const token = await getServerToken();
  const contacts = token ? await getContacts(token) : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Contacts</h1>
          <p className="mt-1 text-sm text-stone-600">
            Manage owners, cleaners, clients, and subcontractors
          </p>
        </div>
        <button className="rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-white hover:bg-forest/90">
          Add Contact
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="rounded-lg border border-stone-200 bg-white p-8 text-center">
          <p className="text-stone-500">No contacts found. Add your first contact to get started.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white">
          <table className="min-w-full divide-y divide-stone-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className="cursor-pointer hover:bg-stone-50">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-forest">
                    <Link href={`/contacts/${contact.id}`}>
                      {contact.first_name} {contact.last_name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {contact.email || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {contact.phone || '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm">
                    <span className="inline-flex rounded-full bg-stone-100 px-2 py-1 text-xs font-medium capitalize text-stone-700">
                      {contact.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-stone-900">
                    {contact.company_name || '-'}
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
