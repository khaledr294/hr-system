import { NextResponse } from 'next/server';

export async function POST() {
  console.log('PDF API: Received request');
  
  // Temporarily disabled due to build issues - will be implemented later
  return NextResponse.json(
    { error: 'PDF generation is temporarily disabled during deployment setup' }, 
    { status: 503 }
  );
}
