const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';

// Read the generated source
const content = fs.readFileSync('c:/Users/Rax/Desktop/Delivery_app_site_backend/apply_desktop_booking_ui.cjs', 'utf8');

// Extract the CSS and JSX blocks cleanly
const cssMatch = content.match(/\/\/ 1\. CSS\s+const desktopCss = `([\s\S]*?)`;\s+writeFile/);
const bookingJsxMatch = content.match(/\/\/ 2\. Booking Page JSX\s+const bookingJsx = `([\s\S]*?)`;\s+writeFile/);
const trackingJsxMatch = content.match(/\/\/ 3\. Tracking Page JSX[\s\S]*?const trackingJsx = `([\s\S]*?)`;\s+writeFile/);

if (cssMatch && bookingJsxMatch && trackingJsxMatch) {
  const css = cssMatch[1].trim();
  const bookingJsx = bookingJsxMatch[1].trim();
  const trackingJsx = trackingJsxMatch[1].trim();

  fs.writeFileSync(path.join(webRoot, 'src/pages/forgot-something/ForgotSomethingBookingPage.module.css'), css + '\n', 'utf8');
  fs.writeFileSync(path.join(webRoot, 'src/pages/forgot-something/ForgotSomethingTrackingPage.module.css'), css + '\n', 'utf8');
  fs.writeFileSync(path.join(webRoot, 'src/pages/forgot-something/ForgotSomethingBookingPage.jsx'), bookingJsx + '\n', 'utf8');
  fs.writeFileSync(path.join(webRoot, 'src/pages/forgot-something/ForgotSomethingTrackingPage.jsx'), trackingJsx + '\n', 'utf8');

  console.log('Successfully written desktop friendly files!');
} else {
  console.error('Failed to parse blocks.');
}
