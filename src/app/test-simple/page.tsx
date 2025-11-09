import { requireSession } from '@/lib/require';

export default async function TestSimplePage() {
  await requireSession();
  
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>✅ Test Page</h1>
      <p>If you see this, the server is working!</p>
      <p>Time: {new Date().toLocaleTimeString('ar-SA')}</p>
    </div>
  );
}

