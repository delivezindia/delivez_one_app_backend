const fs = require('fs');

const servicePath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/features/admin-gift-delivery/services/adminGiftDeliveryService.js';
console.log('--- adminGiftDeliveryService.js ---');
console.log(fs.readFileSync(servicePath, 'utf8'));
