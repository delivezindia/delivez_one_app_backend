const fs = require('fs');

const cssPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.module.css';
const css = fs.readFileSync(cssPath, 'utf8');

console.log('--- FIRST 80 LINES OF CSS ---');
console.log(css.split('\n').slice(0, 80).join('\n'));
