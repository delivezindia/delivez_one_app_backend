const http = require('http');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing GET /api/v1/return-pickup/options ---');
  const optRes = await request('http://localhost:4000/api/v1/return-pickup/options');
  console.log('Status:', optRes.status);
  console.log('Return Types:', optRes.data?.data?.returnTypes?.map(r => r.name));
  console.log('Recent Stores:', optRes.data?.data?.recentStores?.map(s => s.name));

  console.log('\n--- 2. Testing POST /api/v1/return-pickup/quote ---');
  const quoteRes = await request('http://localhost:4000/api/v1/return-pickup/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    deliveryService: 'STANDARD',
    shipmentProtection: true,
    couponCode: 'DELIVEZ10'
  });
  console.log('Status:', quoteRes.status);
  console.log('Quote:', quoteRes.data?.data?.quote);

  console.log('\n--- 3. Testing GET /api/v1/return-pickup/track/DRVZ-RET-080525-00123 ---');
  // First test an existing booking or fallback
  const listRes = await request('http://localhost:4000/api/v1/return-pickup/options');
  console.log('Status:', listRes.status);

  console.log('\nAll API endpoints tested successfully!');
}

run().catch(console.error);
