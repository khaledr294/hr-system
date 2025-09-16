'use client';
import { useEffect, useState } from 'react';

export default function TestPage() {
  const [testResults, setTestResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      try {
        console.log('🔄 بدء اختبار APIs...');

        // Test workers API
        const workersResponse = await fetch('/api/workers');
        const workersData = await workersResponse.json();
        console.log('👥 Workers API response:', workersData);

        // Test contracts API with specific worker
        const contractsResponse = await fetch('/api/contracts?workerId=1&month=2024-09');
        console.log('📋 Contracts API response status:', contractsResponse.status);
        
        let contractsData = null;
        if (contractsResponse.ok) {
          contractsData = await contractsResponse.json();
          console.log('📋 Contracts data:', contractsData);
        } else {
          const errorText = await contractsResponse.text();
          console.log('📋 Contracts error:', errorText);
        }

        // Test test-data API
        const testDataResponse = await fetch('/api/test-data');
        const testData = await testDataResponse.json();
        console.log('🧪 Test data:', testData);

        setTestResults({
          workers: {
            status: workersResponse.status,
            data: workersData,
            count: Array.isArray(workersData) ? workersData.length : 'Not an array'
          },
          contracts: {
            status: contractsResponse.status,
            data: contractsData,
            count: Array.isArray(contractsData) ? contractsData.length : 'Not an array'
          },
          testData: {
            status: testDataResponse.status,
            data: testData
          }
        });

      } catch (error) {
        console.error('❌ Test error:', error);
        setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    runTests();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">اختبار APIs</h1>
        <p>جاري تشغيل الاختبارات...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">نتائج اختبار APIs</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>
    </div>
  );
}