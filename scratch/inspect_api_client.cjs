const fs = require('fs');

const apiClientPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/services/api/apiClient.js';
const code = fs.readFileSync(apiClientPath, 'utf8');

console.log(code.split('\n').slice(0, 40).join('\n'));
