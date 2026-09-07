const fs = require('fs');
const path = require('path');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';
let code = fs.readFileSync(dashPath, 'utf8');

console.log('Dashboard content preview:');
console.log(code.substring(0, 1000));
