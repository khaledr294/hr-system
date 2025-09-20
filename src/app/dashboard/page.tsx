import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import HomeClient from '../home-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/auth/login');
  return <HomeClient />;
}
