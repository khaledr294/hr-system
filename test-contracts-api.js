import fetch from 'node-fetch';

async function testContractsAPI() {
  try {
    const response = await fetch('http://localhost:3005/api/contracts?workerId=1&month=2024-09');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
}

testContractsAPI();