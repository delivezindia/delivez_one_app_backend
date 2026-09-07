const fs = require('fs');

const cssPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/components/AdminGiftDeliveryView.module.css';
const css = fs.readFileSync(cssPath, 'utf8');

console.log(css.split('\n').slice(580, 630).join('\n'));
