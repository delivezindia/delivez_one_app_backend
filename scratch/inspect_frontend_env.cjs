const fs = require('fs');

const envPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/config/env.js';
const code = fs.readFileSync(envPath, 'utf8');

console.log(code);
