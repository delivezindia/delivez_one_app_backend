const fs = require('fs');
const path = require('path');

const homePagePath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/home/HomePage.jsx';
let content = fs.readFileSync(homePagePath, 'utf8');

content = content.replace(
  `  const trackOrder = (event) => {
    event.preventDefault()
    const trackingId = new FormData(event.currentTarget).get('trackingId').trim().toUpperCase()
    if (trackingId.startsWith('DZ') || trackingId.startsWith('FS-')) {
      navigateTo(\`/track/forgot-something/\${trackingId}\`)
      return
    }`,
  `  const trackOrder = (event) => {
    event.preventDefault()
    const trackingId = new FormData(event.currentTarget).get('trackingId').trim().toUpperCase()
    if (trackingId.startsWith('DLVZ')) {
      navigateTo(\`/gift-delivery/track/\${trackingId}\`)
      return
    }
    if (trackingId.startsWith('DRVZ-RET') || trackingId.startsWith('RBK')) {
      navigateTo(\`/return-pickup/track/\${trackingId}\`)
      return
    }
    if (trackingId.startsWith('DZ') || trackingId.startsWith('FS-')) {
      navigateTo(\`/track/forgot-something/\${trackingId}\`)
      return
    }`
);

fs.writeFileSync(homePagePath, content, 'utf8');
console.log('Updated HomePage.jsx with DLVZ and DRVZ tracking handlers');
