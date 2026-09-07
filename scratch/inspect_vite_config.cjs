const fs = require('fs');

const viteConfigPath = 'C:/Users/Rax/Desktop/Delivery_app_web/vite.config.js';
const pkgPath = 'C:/Users/Rax/Desktop/Delivery_app_web/package.json';

console.log('--- vite.config.js ---');
console.log(fs.readFileSync(viteConfigPath, 'utf8'));

console.log('--- package.json ---');
console.log(fs.readFileSync(pkgPath, 'utf8'));
