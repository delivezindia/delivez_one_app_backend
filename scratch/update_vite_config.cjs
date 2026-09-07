const fs = require('fs');

const viteConfigPath = 'C:/Users/Rax/Desktop/Delivery_app_web/vite.config.js';
const newConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['react', 'react-dom'],
  },
})
`;

fs.writeFileSync(viteConfigPath, newConfig, 'utf8');
console.log('Updated vite.config.js with react dedupe');
