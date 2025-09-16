'use client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function SessionTestPage() {
  const { data: session, status } = useSession();
  const [apiTest, setApiTest] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        const response = await fetch('/api/workers');
        const data = await response.json();
        setApiTest({
          status: response.status,
          data: data,
          error: !response.ok ? data : null
        });
      } catch (error) {
        setApiTest({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };

    testAPI();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">معلومات الجلسة</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Session Status</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>User:</strong> {session?.user?.name || 'No user'}</p>
        <p><strong>Email:</strong> {session?.user?.email || 'No email'}</p>
        <p><strong>Role:</strong> {(session?.user as { role?: string })?.role || 'No role'}</p>
      </div>

      <div className="mb-6 p-4 bg-blue-100 rounded">
        <h2 className="text-lg font-semibold mb-2">API Test</h2>
        {apiTest ? (
          <div>
            <p><strong>API Status:</strong> {String(apiTest.status)}</p>
            <pre className="text-sm bg-white p-2 rounded mt-2">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        ) : (
          <p>جاري الاختبار...</p>
        )}
      </div>
    </div>
  );
}