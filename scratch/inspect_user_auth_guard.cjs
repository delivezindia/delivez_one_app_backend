const fs = require('fs');

const path = 'C:/Users/Rax/Desktop/Delivery_app_web/src/features/auth/components/UserAuthGuard.jsx';
const code = fs.readFileSync(path, 'utf8');

console.log(code);
