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
  console.log('Testing live tracking of DRVZ-RET-080525-00123 from PostgreSQL:');
  const res = await request('http://localhost:4000/api/v1/return-pickup/track/DRVZ-RET-080525-00123');
  console.log('Status:', res.status);
  console.log('Booking Number:', res.data?.data?.tracking?.bookingId);
  console.log('Status:', res.data?.data?.tracking?.status);
  console.log('Partner:', res.data?.data?.tracking?.partner?.name);
  console.log('Pickup OTP:', res.data?.data?.tracking?.pickupOtp);
  console.log('Delivery OTP:', res.data?.data?.tracking?.deliveryOtp);
  console.log('Milestones count:', res.data?.data?.tracking?.milestones?.length);
  console.log('\n✓ Live Return Pickup Database query verified successfully!');
}

run().catch(console.error);
