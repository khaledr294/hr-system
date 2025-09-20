import HomeClient from "./home-client";
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const session = await getSession();
  if (!session) {
    redirect('/auth/login');
  }
  return <HomeClient />;
}
