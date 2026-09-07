const fs = require('fs');

const uiPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/components/AdminGiftDeliveryView.jsx';
const code = fs.readFileSync(uiPath, 'utf8');

const lines = code.split('\n');
console.log('Total lines:', lines.length);

lines.forEach((line, idx) => {
  if (line.includes('activeTab === \'categories\'') || line.includes('handleDeleteCategory') || line.includes('createAdminGiftCategory')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
