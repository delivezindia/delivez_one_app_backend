const fs = require('fs');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';
const code = fs.readFileSync(dashPath, 'utf8');

const lines = code.split('\n');
console.log(lines.slice(520).join('\n'));
