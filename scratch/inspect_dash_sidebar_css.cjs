const fs = require('fs');

const cssPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.module.css';
const css = fs.readFileSync(cssPath, 'utf8');

const lines = css.split('\n');
console.log('Total lines:', lines.length);
lines.forEach((line, index) => {
  if (line.includes('.dashboard') || line.includes('.sidebar') || line.includes('.sideNav') || line.includes('.logout')) {
    console.log(`Line ${index + 1}: ${line.slice(0, 100)}`);
  }
});
