const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const cssContent = fs.readFileSync('c:/Users/Rax/Desktop/Delivery_app_site_backend/write_desktop_css.cjs', 'utf8');

fs.writeFileSync(path.join(webRoot, 'src/pages/forgot-something/ForgotSomethingBookingPage.module.css'), cssContent, 'utf8');
fs.writeFileSync(path.join(webRoot, 'src/pages/forgot-something/ForgotSomethingTrackingPage.module.css'), cssContent, 'utf8');
console.log('CSS updated successfully!');
