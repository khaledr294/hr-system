"use client";
import HomeClient from "./home-client";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Home() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/auth/login';
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // سيتم إعادة التوجيه من useEffect
  }

  return <HomeClient />;
}
