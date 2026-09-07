const fs = require('fs');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';
let code = fs.readFileSync(dashPath, 'utf8');

// 1. Add import for AdminGiftDeliveryView
if (!code.includes('AdminGiftDeliveryView')) {
  code = code.replace(
    `import styles from './DashboardPage.module.css'`,
    `import AdminGiftDeliveryView from './components/AdminGiftDeliveryView.jsx'\nimport styles from './DashboardPage.module.css'`
  );
}

// 2. Add 'gift-delivery' to navItems
if (!code.includes("id: 'gift-delivery'")) {
  code = code.replace(
    `const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },`,
    `const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'gift-delivery', label: 'Gift Delivery', icon: Gift },`
  );
}

// 3. Add <section id="gift-delivery"> into the main body
if (!code.includes('<AdminGiftDeliveryView')) {
  code = code.replace(
    `<section id="services" className={styles.servicesManager}>`,
    `<section id="gift-delivery" style={{ margin: '30px 0', width: '100%' }}>
            <AdminGiftDeliveryView />
          </section>

          <section id="services" className={styles.servicesManager}>`
  );
}

fs.writeFileSync(dashPath, code, 'utf8');
console.log('Successfully integrated AdminGiftDeliveryView into DashboardPage.jsx');
