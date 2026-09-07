const fs = require('fs');

const cssPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/components/AdminGiftDeliveryView.module.css';
const css = fs.readFileSync(cssPath, 'utf8');

const lines = css.split('\n');
lines.forEach((l, i) => {
  if (l.includes('catActions') || l.includes('editBtn') || l.includes('deleteBtn') || l.includes('categoriesGrid')) {
    console.log(`Line ${i + 1}: ${l}`);
  }
});
