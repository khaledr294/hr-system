import { requireSession } from '@/lib/require';
import HomeClient from '../home-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  await requireSession(); // This will redirect if not authenticated
  return <HomeClient />;
}
