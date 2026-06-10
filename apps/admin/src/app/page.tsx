import { redirect } from 'next/navigation';
import { getServerToken } from '@/lib/actions';

export default async function RootPage() {
  const token = await getServerToken();

  if (token) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
