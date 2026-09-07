const fs = require('fs');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';
const code = fs.readFileSync(dashPath, 'utf8');

// Find navigation items definition
const navMatch = code.match(/const NAV_ITEMS[\s\S]*?\]/);
if (navMatch) console.log('NAV_ITEMS:', navMatch[0]);

// Find view render switch / condition
const renderMatch = code.match(/\{activeNav ===[\s\S]*?\}\s*<\/div>/g);
if (renderMatch) {
  renderMatch.slice(0, 5).forEach((m, idx) => console.log(`RENDER MATCH ${idx}:`, m.substring(0, 300)));
}
