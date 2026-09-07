const fs = require('fs');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';
const code = fs.readFileSync(dashPath, 'utf8');

const lines = code.split('\n');
lines.forEach((line, index) => {
  if (line.includes('activeNav') || line.includes('AdminReturnPickupView') || line.includes('AdminPersonalCourierView') || line.includes('AdminConfidentialCourierView') || line.includes('AdminForgotSomethingView')) {
    console.log(`${index + 1}: ${line}`);
  }
});
