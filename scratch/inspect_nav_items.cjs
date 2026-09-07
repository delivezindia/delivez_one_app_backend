const fs = require('fs');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';
const code = fs.readFileSync(dashPath, 'utf8');

const lines = code.split('\n');
lines.forEach((l, i) => {
  if (l.includes('navItems') || l.includes('NAV_ITEMS') || (i > 150 && i < 220)) {
    console.log(`${i+1}: ${l}`);
  }
});
