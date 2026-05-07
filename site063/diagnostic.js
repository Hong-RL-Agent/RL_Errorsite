import fetch from 'node-fetch';

async function check() {
  try {
    const res = await fetch('http://localhost:9172/api/health');
    const data = await res.json();
    console.log('Health Check:', data);
    
    const res2 = await fetch('http://localhost:9172/');
    console.log('Index.html Status:', res2.status);
  } catch (e) {
    console.error('Failed to connect:', e.message);
  }
}

check();
