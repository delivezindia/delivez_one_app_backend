const fs = require('fs');

const uiPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/components/AdminGiftDeliveryView.jsx';
const code = fs.readFileSync(uiPath, 'utf8');

console.log(code.split('\n').slice(790, 870).join('\n'));
