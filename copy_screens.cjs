const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/Rax/Desktop/return-pickup';
const destDir = 'C:/Users/Rax/.gemini/antigravity-ide/brain/39deb360-0e87-43f2-a6c6-1fc6c8e281e6/.tempmediaStorage';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
files.sort();

console.log(`Found ${files.length} files in return-pickup:`);

const copied = [];
files.forEach((f, idx) => {
  const srcFile = path.join(srcDir, f);
  const cleanName = `return_${idx + 1}_` + f.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destFile = path.join(destDir, cleanName);
  fs.copyFileSync(srcFile, destFile);
  copied.push({ index: idx + 1, original: f, target: cleanName, path: destFile });
  console.log(`[${idx + 1}] ${f} -> ${cleanName}`);
});

fs.writeFileSync('return_screens_manifest.json', JSON.stringify(copied, null, 2), 'utf8');
