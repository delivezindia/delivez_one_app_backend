const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outDir = path.resolve('C:/Users/Rax/Desktop/Delivery_app_site_backend/public/icons/courier');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const icons = {
  documents: {
    title: 'Documents & Certificates',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7" />
      <stop offset="100%" stop-color="#FEF3C7" />
    </linearGradient>
    <linearGradient id="docGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F8FAFC" />
    </linearGradient>
    <linearGradient id="foldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#D97706" flood-opacity="0.18" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#FDE68A" stroke-width="8" />
  
  <!-- Document Sheet -->
  <g filter="url(#shadow)">
    <!-- Base Paper with folded corner -->
    <path d="M 136 100 L 316 100 L 376 160 L 376 412 A 16 16 0 0 1 360 428 L 136 428 A 16 16 0 0 1 120 412 L 120 116 A 16 16 0 0 1 136 100 Z" fill="url(#docGrad)" stroke="#E2E8F0" stroke-width="4" />
    <!-- Folded Flap -->
    <path d="M 316 100 L 316 148 A 12 12 0 0 0 328 160 L 376 160 Z" fill="url(#foldGrad)" />
  </g>

  <!-- Accent Top Bar -->
  <rect x="156" y="148" width="130" height="14" rx="7" fill="#2563EB" />

  <!-- Content Lines -->
  <rect x="156" y="196" width="200" height="12" rx="6" fill="#D97706" />
  <rect x="156" y="232" width="200" height="10" rx="5" fill="#CBD5E1" />
  <rect x="156" y="264" width="170" height="10" rx="5" fill="#CBD5E1" />
  <rect x="156" y="296" width="190" height="10" rx="5" fill="#CBD5E1" />
  <rect x="156" y="328" width="120" height="10" rx="5" fill="#94A3B8" />

  <!-- Verification Seal Badge -->
  <g transform="translate(320, 360)">
    <circle cx="0" cy="0" r="38" fill="#F59E0B" stroke="#D97706" stroke-width="4" />
    <circle cx="0" cy="0" r="30" fill="#FEF3C7" />
    <!-- Ribbon tails -->
    <path d="M -16 26 L -24 54 L -6 44 L 0 54 L 6 44 L 24 54 L 16 26 Z" fill="#D97706" opacity="0.85" />
    <!-- Checkmark -->
    <path d="M -14 0 L -4 10 L 14 -8" stroke="#16A34A" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </g>
</svg>`
  },

  electronics: {
    title: 'Electronics & Devices',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#DBEAFE" />
    </linearGradient>
    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="50%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#7C3AED" />
    </linearGradient>
    <linearGradient id="laptopScreen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#2563EB" flood-opacity="0.22" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#BFDBFE" stroke-width="8" />

  <g filter="url(#shadow)">
    <!-- Laptop Body Behind -->
    <!-- Screen -->
    <rect x="180" y="130" width="220" height="150" rx="12" fill="#334155" stroke="#475569" stroke-width="4" />
    <rect x="192" y="142" width="196" height="124" rx="6" fill="url(#laptopScreen)" />
    <!-- Laptop Code / UI lines -->
    <circle cx="210" cy="156" r="4" fill="#EF4444" />
    <circle cx="224" cy="156" r="4" fill="#F59E0B" />
    <circle cx="238" cy="156" r="4" fill="#10B981" />
    <rect x="210" y="174" width="90" height="8" rx="4" fill="#38BDF8" opacity="0.8" />
    <rect x="210" y="194" width="130" height="6" rx="3" fill="#64748B" />
    <rect x="210" y="210" width="110" height="6" rx="3" fill="#64748B" />
    <!-- Laptop Base -->
    <path d="M 150 280 L 430 280 L 440 294 A 8 8 0 0 1 432 302 L 148 302 A 8 8 0 0 1 140 294 Z" fill="#64748B" />
    <rect x="260" y="280" width="60" height="6" rx="3" fill="#94A3B8" />

    <!-- Smartphone In Front -->
    <rect x="104" y="160" width="124" height="240" rx="24" fill="#0F172A" stroke="#334155" stroke-width="5" />
    <!-- Phone Screen -->
    <rect x="114" y="178" width="104" height="204" rx="16" fill="url(#screenGrad)" />
    <!-- Dynamic Island / Speaker -->
    <rect x="146" y="168" width="40" height="6" rx="3" fill="#334155" />
    <!-- Screen content -->
    <circle cx="166" cy="240" r="28" fill="#FFFFFF" opacity="0.25" />
    <path d="M 154 240 L 163 249 L 180 231" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <rect x="134" y="290" width="64" height="8" rx="4" fill="#FFFFFF" opacity="0.9" />
    <rect x="142" y="308" width="48" height="6" rx="3" fill="#FFFFFF" opacity="0.6" />
    <!-- Home Bar -->
    <rect x="146" y="366" width="40" height="4" rx="2" fill="#FFFFFF" opacity="0.75" />
  </g>

  <!-- Wi-Fi Signals in top-right -->
  <g transform="translate(370, 90)" stroke="#2563EB" stroke-width="6" stroke-linecap="round" fill="none">
    <path d="M -24 -6 A 36 36 0 0 1 24 -6" />
    <path d="M -16 6 A 24 24 0 0 1 16 6" />
    <circle cx="0" cy="18" r="4" fill="#2563EB" />
  </g>
</svg>`
  },

  clothing: {
    title: 'Clothing & Fashion',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFAFF" />
      <stop offset="100%" stop-color="#EDE9FE" />
    </linearGradient>
    <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#6D28D9" />
    </linearGradient>
    <linearGradient id="tagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E" />
      <stop offset="100%" stop-color="#BE123C" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#7C3AED" flood-opacity="0.22" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#DDD6FE" stroke-width="8" />

  <!-- Hanger Hook Top -->
  <path d="M 256 126 C 256 100 274 86 288 100 C 300 112 284 126 270 136 L 256 150" stroke="#7C3AED" stroke-width="8" stroke-linecap="round" fill="none" />

  <g filter="url(#shadow)">
    <!-- T-shirt Body -->
    <path d="M 196 156 Q 256 186 316 156 L 388 196 L 344 266 L 310 248 L 310 404 A 12 12 0 0 1 298 416 L 214 416 A 12 12 0 0 1 202 404 L 202 248 L 168 266 L 124 196 Z" fill="url(#shirtGrad)" stroke="#5B21B6" stroke-width="4" />
    
    <!-- Collar Line -->
    <path d="M 196 156 Q 256 206 316 156" stroke="#5B21B6" stroke-width="6" fill="#EDE9FE" />
  </g>

  <!-- Folded Pocket with Delivez Star -->
  <rect x="218" y="228" width="40" height="46" rx="6" fill="#7C3AED" stroke="#C4B5FD" stroke-width="3" />
  <circle cx="238" cy="248" r="6" fill="#FDE047" />

  <!-- Swing Tag Hanging from Sleeve -->
  <g transform="translate(348, 252) rotate(18)">
    <line x1="0" y1="0" x2="0" y2="24" stroke="#94A3B8" stroke-width="3" stroke-dasharray="3 3" />
    <path d="M -16 24 L 16 24 L 20 68 L -20 68 Z" fill="url(#tagGrad)" rx="4" />
    <circle cx="0" cy="32" r="3" fill="#FFFFFF" />
    <text x="0" y="56" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">NEW</text>
  </g>
</svg>`
  },

  medicine: {
    title: 'Pharmacy & Medicine',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDF4" />
      <stop offset="100%" stop-color="#D1FAE5" />
    </linearGradient>
    <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#DC2626" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#059669" flood-opacity="0.22" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#A7F3D0" stroke-width="8" />

  <!-- Heartbeat ECG pulse wave in background -->
  <path d="M 60 256 L 140 256 L 160 200 L 180 310 L 200 230 L 220 270 L 235 256 L 452 256" stroke="#6EE7B7" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.65" />

  <g filter="url(#shadow)">
    <!-- Medicine Bottle -->
    <!-- Cap -->
    <rect x="180" y="116" width="100" height="28" rx="8" fill="#F8FAFC" stroke="#059669" stroke-width="4" />
    <rect x="194" y="144" width="72" height="14" fill="#047857" />
    <!-- Bottle Body -->
    <rect x="156" y="158" width="148" height="220" rx="20" fill="url(#bottleGrad)" stroke="#047857" stroke-width="4" />
    <!-- Label -->
    <rect x="168" y="196" width="124" height="144" rx="8" fill="#FFFFFF" />
    <!-- Medical Cross on Bottle -->
    <rect x="218" y="228" width="24" height="70" rx="4" fill="#059669" />
    <rect x="195" y="251" width="70" height="24" rx="4" fill="#059669" />

    <!-- Two-tone Pharma Capsule In Front -->
    <g transform="translate(320, 320) rotate(-35)">
      <!-- Red Half -->
      <path d="M -30 -60 A 30 30 0 0 1 30 -60 L 30 0 L -30 0 Z" fill="url(#pillGrad)" stroke="#B91C1C" stroke-width="3" />
      <!-- White Half -->
      <path d="M -30 0 L 30 0 L 30 60 A 30 30 0 0 1 -30 60 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3" />
      <!-- Middle divider line -->
      <line x1="-30" y1="0" x2="30" y2="0" stroke="#B91C1C" stroke-width="3" />
      <!-- Pill Shine highlight -->
      <path d="M -16 -60 A 16 16 0 0 1 0 -72 L 0 50" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity="0.6" fill="none" />
    </g>
  </g>
</svg>`
  },

  household: {
    title: 'Household & Daily Essentials',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF5F5" />
      <stop offset="100%" stop-color="#FFE4E6" />
    </linearGradient>
    <linearGradient id="houseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E" />
      <stop offset="100%" stop-color="#BE123C" />
    </linearGradient>
    <linearGradient id="bagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB923C" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#E11D48" flood-opacity="0.22" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#FECDD3" stroke-width="8" />

  <g filter="url(#shadow)">
    <!-- House Outline Behind -->
    <!-- Chimney -->
    <rect x="236" y="128" width="28" height="60" fill="#9F1239" />
    <!-- Roof -->
    <path d="M 96 210 L 190 120 A 16 16 0 0 1 214 120 L 308 210 A 8 8 0 0 1 302 222 L 102 222 A 8 8 0 0 1 96 210 Z" fill="url(#houseGrad)" />
    <!-- House Walls -->
    <rect x="114" y="222" width="176" height="150" fill="#FFE4E6" stroke="#BE123C" stroke-width="4" />
    <!-- Door -->
    <path d="M 148 372 L 148 296 A 12 12 0 0 1 160 284 L 180 284 A 12 12 0 0 1 192 296 L 192 372 Z" fill="#BE123C" />
    <circle cx="184" cy="332" r="3" fill="#FDE047" />
    <!-- Lit Attic Window -->
    <circle cx="202" cy="180" r="16" fill="#FDE047" stroke="#BE123C" stroke-width="3" />
    <line x1="202" y1="164" x2="202" y2="196" stroke="#BE123C" stroke-width="2" />
    <line x1="186" y1="180" x2="218" y2="180" stroke="#BE123C" stroke-width="2" />

    <!-- Grocery Delivery Bag In Front -->
    <!-- Handle -->
    <path d="M 284 250 C 284 216 348 216 348 250" stroke="#C2410C" stroke-width="6" fill="none" stroke-linecap="round" />
    <!-- Bag Body -->
    <path d="M 264 250 L 368 250 L 380 400 A 10 10 0 0 1 370 412 L 262 412 A 10 10 0 0 1 252 400 Z" fill="url(#bagGrad)" stroke="#C2410C" stroke-width="4" />
    <!-- Green Leaf Groceries sticking out -->
    <path d="M 330 250 C 330 200 370 210 366 244 Z" fill="#10B981" />
    <path d="M 310 250 C 300 210 280 220 290 250 Z" fill="#34D399" />
    <!-- Delivez Smile on bag -->
    <path d="M 292 320 Q 316 344 340 320" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" fill="none" />
  </g>
</svg>`
  },

  commercial: {
    title: 'Commercial & Cargo Freight',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC" />
      <stop offset="100%" stop-color="#E2E8F0" />
    </linearGradient>
    <linearGradient id="crateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B45309" />
      <stop offset="100%" stop-color="#78350F" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#334155" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#CBD5E1" stroke-width="8" />

  <g filter="url(#shadow)">
    <!-- Wooden Cargo Crate -->
    <rect x="110" y="130" width="292" height="240" rx="12" fill="url(#crateGrad)" stroke="#451A03" stroke-width="6" />

    <!-- Cross Bracing Slats -->
    <line x1="110" y1="130" x2="402" y2="370" stroke="#92400E" stroke-width="18" />
    <line x1="110" y1="370" x2="402" y2="130" stroke="#92400E" stroke-width="18" />
    <rect x="110" y="130" width="292" height="240" rx="12" fill="none" stroke="#451A03" stroke-width="12" />

    <!-- Steel Corner Brackets with Rivets -->
    <!-- Top-left -->
    <path d="M 110 170 L 110 130 L 150 130" stroke="#334155" stroke-width="14" fill="none" />
    <circle cx="122" cy="142" r="3" fill="#F8FAFC" />
    <!-- Top-right -->
    <path d="M 402 170 L 402 130 L 362 130" stroke="#334155" stroke-width="14" fill="none" />
    <circle cx="390" cy="142" r="3" fill="#F8FAFC" />
    <!-- Bottom-left -->
    <path d="M 110 330 L 110 370 L 150 370" stroke="#334155" stroke-width="14" fill="none" />
    <circle cx="122" cy="358" r="3" fill="#F8FAFC" />
    <!-- Bottom-right -->
    <path d="M 402 330 L 402 370 L 362 370" stroke="#334155" stroke-width="14" fill="none" />
    <circle cx="390" cy="358" r="3" fill="#F8FAFC" />

    <!-- Forklift Pallet Base -->
    <rect x="94" y="376" width="324" height="24" rx="4" fill="#92400E" stroke="#451A03" stroke-width="4" />
    <rect x="120" y="400" width="40" height="24" fill="#451A03" />
    <rect x="236" y="400" width="40" height="24" fill="#451A03" />
    <rect x="352" y="400" width="40" height="24" fill="#451A03" />
    <rect x="94" y="420" width="324" height="12" rx="2" fill="#78350F" />

    <!-- Commercial B2B Stamp Label -->
    <g transform="translate(256, 250) rotate(-12)">
      <rect x="-70" y="-24" width="140" height="48" rx="6" fill="#F8FAFC" stroke="#DC2626" stroke-width="4" stroke-dasharray="8 4" />
      <text x="0" y="4" fill="#DC2626" font-family="Arial, sans-serif" font-size="18" font-weight="900" text-anchor="middle">B2B CARGO</text>
    </g>
  </g>
</svg>`
  },

  express_delivery: {
    title: 'Hyperlocal Express Delivery',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB" />
      <stop offset="100%" stop-color="#FEE2E2" />
    </linearGradient>
    <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#EA580C" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#DC2626" flood-opacity="0.28" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#FECACA" stroke-width="8" />

  <!-- Speed Motion Trails -->
  <g stroke="#EF4444" stroke-width="8" stroke-linecap="round" opacity="0.7">
    <line x1="60" y1="180" x2="140" y2="180" />
    <line x1="40" y1="230" x2="160" y2="230" stroke-width="12" />
    <line x1="80" y1="280" x2="150" y2="280" />
    <line x1="50" y1="330" x2="170" y2="330" stroke-width="10" />
  </g>

  <g filter="url(#shadow)">
    <!-- Speeding Parcel Box -->
    <g transform="translate(180, 150) skewX(-14)">
      <!-- Box Top -->
      <polygon points="40,20 180,20 220,70 80,70" fill="#D97706" />
      <!-- Box Front -->
      <polygon points="40,70 180,70 180,200 40,200" fill="#B45309" />
      <!-- Box Right -->
      <polygon points="180,70 220,20 220,150 180,200" fill="#78350F" />
      <!-- Tape -->
      <polygon points="100,20 120,20 120,200 100,200" fill="#F59E0B" />
    </g>

    <!-- Bold Vibrant Lightning Bolt -->
    <polygon points="310,90 200,260 270,260 210,430 370,230 290,230" fill="url(#boltGrad)" stroke="#B45309" stroke-width="6" stroke-linejoin="round" />
  </g>
</svg>`
  },

  standard_delivery: {
    title: 'Standard Pan-India Transport',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FF" />
      <stop offset="100%" stop-color="#DBEAFE" />
    </linearGradient>
    <linearGradient id="truckCab" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563EB" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
    <linearGradient id="truckBox" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="100%" stop-color="#F1F5F9" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#1D4ED8" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#BFDBFE" stroke-width="8" />

  <!-- Road Base -->
  <rect x="60" y="380" width="392" height="12" rx="6" fill="#94A3B8" />
  <line x1="80" y1="410" x2="160" y2="410" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <line x1="200" y1="410" x2="280" y2="410" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />
  <line x1="320" y1="410" x2="400" y2="410" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round" />

  <g filter="url(#shadow)">
    <!-- Cargo Box (White container with Delivez branding) -->
    <rect x="90" y="160" width="220" height="190" rx="12" fill="url(#truckBox)" stroke="#64748B" stroke-width="5" />
    <!-- Delivez Arrow on Cargo Box -->
    <g transform="translate(140, 230)">
      <rect x="0" y="16" width="100" height="24" rx="12" fill="#2563EB" />
      <polygon points="100,8 130,28 100,48" fill="#F59E0B" />
      <circle cx="20" cy="28" r="6" fill="#FFFFFF" />
    </g>

    <!-- Truck Cab -->
    <path d="M 310 200 L 370 200 L 416 260 L 416 350 L 310 350 Z" fill="url(#truckCab)" stroke="#1E40AF" stroke-width="5" />
    <!-- Windshield -->
    <path d="M 324 214 L 366 214 L 402 260 L 324 260 Z" fill="#93C5FD" stroke="#1E40AF" stroke-width="3" />
    <!-- Headlight -->
    <path d="M 416 310 L 426 310 A 6 6 0 0 1 426 330 L 416 330 Z" fill="#FDE047" stroke="#D97706" stroke-width="2" />

    <!-- Wheels -->
    <!-- Rear Wheel 1 -->
    <circle cx="160" cy="360" r="34" fill="#0F172A" stroke="#334155" stroke-width="4" />
    <circle cx="160" cy="360" r="16" fill="#94A3B8" />
    <!-- Front Wheel -->
    <circle cx="360" cy="360" r="34" fill="#0F172A" stroke="#334155" stroke-width="4" />
    <circle cx="360" cy="360" r="16" fill="#94A3B8" />
  </g>
</svg>`
  },

  bike_delivery: {
    title: 'Bike Priority Courier',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDFA" />
      <stop offset="100%" stop-color="#CCFBF1" />
    </linearGradient>
    <linearGradient id="scooterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14B8A6" />
      <stop offset="100%" stop-color="#0D9488" />
    </linearGradient>
    <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#0D9488" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#99F6E4" stroke-width="8" />

  <!-- Ground Line -->
  <rect x="60" y="394" width="392" height="8" rx="4" fill="#5EEAD4" />

  <g filter="url(#shadow)">
    <!-- Delivery Backpack / Carrier Box Mounted on Back -->
    <rect x="110" y="166" width="104" height="114" rx="16" fill="url(#boxGrad)" stroke="#B45309" stroke-width="4" />
    <!-- Straps & Delivez Emblem on Box -->
    <line x1="110" y1="210" x2="214" y2="210" stroke="#FEF3C7" stroke-width="6" />
    <circle cx="162" cy="244" r="14" fill="#FFFFFF" />
    <path d="M 154 244 L 160 250 L 170 240" stroke="#0D9488" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Scooter Body Frame -->
    <path d="M 180 270 L 250 270 L 300 330 L 350 220 L 330 200" stroke="url(#scooterGrad)" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <!-- Handlebar & Headlight -->
    <line x1="316" y1="186" x2="364" y2="200" stroke="#1E293B" stroke-width="12" stroke-linecap="round" />
    <path d="M 364 214 A 12 12 0 0 1 376 226 L 364 238 Z" fill="#FDE047" stroke="#D97706" stroke-width="2" />
    <!-- Footrest Floorboard -->
    <rect x="230" y="334" width="70" height="14" rx="6" fill="#1E293B" />

    <!-- Seat -->
    <path d="M 190 260 Q 230 250 270 270" stroke="#1E293B" stroke-width="16" stroke-linecap="round" fill="none" />

    <!-- Wheels -->
    <!-- Rear Wheel -->
    <circle cx="160" cy="354" r="42" fill="#0F172A" stroke="#334155" stroke-width="6" />
    <circle cx="160" cy="354" r="20" fill="#CCFBF1" stroke="#0D9488" stroke-width="4" />
    <!-- Front Wheel -->
    <circle cx="360" cy="354" r="42" fill="#0F172A" stroke="#334155" stroke-width="6" />
    <circle cx="360" cy="354" r="20" fill="#CCFBF1" stroke="#0D9488" stroke-width="4" />
  </g>
</svg>`
  },

  truck_delivery: {
    title: 'Commercial Freight Truck',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED" />
      <stop offset="100%" stop-color="#FFEDD5" />
    </linearGradient>
    <linearGradient id="cargoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EA580C" />
      <stop offset="100%" stop-color="#C2410C" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#EA580C" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#FED7AA" stroke-width="8" />

  <rect x="60" y="380" width="392" height="12" rx="6" fill="#78350F" opacity="0.3" />

  <g filter="url(#shadow)">
    <!-- Large Heavy Cargo Box -->
    <rect x="80" y="140" width="240" height="210" rx="14" fill="url(#cargoGrad)" stroke="#9A3412" stroke-width="6" />
    <!-- Container Ridges -->
    <line x1="120" y1="150" x2="120" y2="340" stroke="#9A3412" stroke-width="5" />
    <line x1="160" y1="150" x2="160" y2="340" stroke="#9A3412" stroke-width="5" />
    <line x1="200" y1="150" x2="200" y2="340" stroke="#9A3412" stroke-width="5" />
    <line x1="240" y1="150" x2="240" y2="340" stroke="#9A3412" stroke-width="5" />
    <line x1="280" y1="150" x2="280" y2="340" stroke="#9A3412" stroke-width="5" />

    <!-- Big Rig Truck Cab -->
    <path d="M 320 190 L 376 190 L 420 250 L 420 350 L 320 350 Z" fill="#1E293B" stroke="#0F172A" stroke-width="5" />
    <!-- Windshield -->
    <path d="M 334 204 L 374 204 L 406 250 L 334 250 Z" fill="#67E8F9" stroke="#0F172A" stroke-width="3" />
    <!-- Chrome Grille & Headlight -->
    <rect x="410" y="280" width="16" height="50" rx="4" fill="#CBD5E1" stroke="#475569" stroke-width="2" />
    <circle cx="418" cy="316" r="6" fill="#FDE047" />

    <!-- Exhaust Smoke Stack -->
    <rect x="326" y="130" width="14" height="60" rx="4" fill="#94A3B8" />

    <!-- Triple Wheels -->
    <circle cx="130" cy="360" r="32" fill="#0F172A" stroke="#475569" stroke-width="4" />
    <circle cx="130" cy="360" r="14" fill="#FED7AA" />
    <circle cx="210" cy="360" r="32" fill="#0F172A" stroke="#475569" stroke-width="4" />
    <circle cx="210" cy="360" r="14" fill="#FED7AA" />
    <circle cx="370" cy="360" r="32" fill="#0F172A" stroke="#475569" stroke-width="4" />
    <circle cx="370" cy="360" r="14" fill="#FED7AA" />
  </g>
</svg>`
  },

  secure_shield: {
    title: 'Delivez Vault Security',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ECFDF5" />
      <stop offset="100%" stop-color="#D1FAE5" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="50%" stop-color="#059669" />
      <stop offset="100%" stop-color="#047857" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#059669" flood-opacity="0.3" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#A7F3D0" stroke-width="8" />

  <g filter="url(#shadow)">
    <!-- Security Shield Outline -->
    <path d="M 256 90 Q 360 110 390 190 Q 390 320 256 420 Q 122 320 122 190 Q 152 110 256 90 Z" fill="url(#shieldGrad)" stroke="#064E3B" stroke-width="8" />

    <!-- Inner Shield Rim -->
    <path d="M 256 120 Q 340 136 364 200 Q 364 300 256 384 Q 148 300 148 200 Q 172 136 256 120 Z" fill="#ECFDF5" opacity="0.18" />

    <!-- Brass Padlock in Center -->
    <!-- Padlock Shackle -->
    <path d="M 224 230 L 224 190 A 32 32 0 0 1 288 190 L 288 230" stroke="url(#goldGrad)" stroke-width="16" stroke-linecap="round" fill="none" />
    <!-- Padlock Body -->
    <rect x="206" y="230" width="100" height="84" rx="16" fill="url(#goldGrad)" stroke="#92400E" stroke-width="4" />
    <!-- Keyhole -->
    <circle cx="256" cy="264" r="8" fill="#451A03" />
    <polygon points="252,264 260,264 264,288 248,288" fill="#451A03" />

    <!-- Green Guarantee Verification Check -->
    <circle cx="340" cy="326" r="30" fill="#16A34A" stroke="#FFFFFF" stroke-width="5" />
    <path d="M 326 326 L 336 336 L 354 316" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </g>
</svg>`
  },

  tracking_live: {
    title: 'Live GPS Telemetry & Radar',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0F9FF" />
      <stop offset="100%" stop-color="#E0F2FE" />
    </linearGradient>
    <linearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#0369A1" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#0284C7" flood-opacity="0.28" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#BAE6FD" stroke-width="8" />

  <!-- Concentric Live Radar Waves -->
  <circle cx="256" cy="260" r="190" stroke="#38BDF8" stroke-width="4" stroke-dasharray="8 8" opacity="0.4" fill="none" />
  <circle cx="256" cy="260" r="140" stroke="#0284C7" stroke-width="5" stroke-dasharray="12 8" opacity="0.6" fill="none" />
  <circle cx="256" cy="260" r="90" stroke="#0369A1" stroke-width="6" opacity="0.8" fill="none" />

  <!-- Target Crosshairs -->
  <line x1="256" y1="60" x2="256" y2="452" stroke="#BAE6FD" stroke-width="4" stroke-dasharray="6 6" />
  <line x1="60" y1="260" x2="452" y2="260" stroke="#BAE6FD" stroke-width="4" stroke-dasharray="6 6" />

  <g filter="url(#shadow)">
    <!-- GPS Pin Silhouette -->
    <path d="M 256 120 C 204 120 162 162 162 214 C 162 284 256 394 256 394 C 256 394 350 284 350 214 C 350 162 308 120 256 120 Z" fill="url(#pinGrad)" stroke="#0C4A6E" stroke-width="6" />

    <!-- Center White Dot with Pulse Center -->
    <circle cx="256" cy="214" r="40" fill="#FFFFFF" />
    <circle cx="256" cy="214" r="22" fill="#0284C7" />
  </g>
</svg>`
  },

  order_box: {
    title: 'Parcel Package Box',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFDF7" />
      <stop offset="100%" stop-color="#FEF3C7" />
    </linearGradient>
    <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
    <linearGradient id="boxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="boxRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B45309" />
      <stop offset="100%" stop-color="#92400E" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#B45309" flood-opacity="0.25" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#FDE68A" stroke-width="8" />

  <g filter="url(#shadow)">
    <!-- 3D Isometric Cardboard Box -->
    <!-- Top Face -->
    <polygon points="256,100 396,170 256,240 116,170" fill="url(#boxTop)" stroke="#78350F" stroke-width="4" />

    <!-- Left Face -->
    <polygon points="116,170 256,240 256,380 116,310" fill="url(#boxLeft)" stroke="#78350F" stroke-width="4" />

    <!-- Right Face -->
    <polygon points="256,240 396,170 396,310 256,380" fill="url(#boxRight)" stroke="#78350F" stroke-width="4" />

    <!-- Sealing Tape Across Top -->
    <polygon points="230,113 282,139 282,227 230,201" fill="#FDE68A" opacity="0.8" />
    <polygon points="256,240 256,380 236,370 236,230" fill="#FDE68A" opacity="0.8" />

    <!-- Shipping Barcode Label on Right Face -->
    <g transform="translate(290, 230) skewY(26)">
      <rect x="0" y="0" width="70" height="50" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" />
      <!-- Barcode Lines -->
      <line x1="8" y1="10" x2="8" y2="36" stroke="#0F172A" stroke-width="3" />
      <line x1="16" y1="10" x2="16" y2="36" stroke="#0F172A" stroke-width="2" />
      <line x1="22" y1="10" x2="22" y2="36" stroke="#0F172A" stroke-width="4" />
      <line x1="30" y1="10" x2="30" y2="36" stroke="#0F172A" stroke-width="2" />
      <line x1="36" y1="10" x2="36" y2="36" stroke="#0F172A" stroke-width="3" />
      <line x1="44" y1="10" x2="44" y2="36" stroke="#0F172A" stroke-width="4" />
      <line x1="52" y1="10" x2="52" y2="36" stroke="#0F172A" stroke-width="2" />
      <line x1="60" y1="10" x2="60" y2="36" stroke="#0F172A" stroke-width="3" />
    </g>

    <!-- Handle With Care Arrow on Left Face -->
    <g transform="translate(160, 240) skewY(-26)">
      <path d="M 20 40 L 20 16 M 12 24 L 20 14 L 28 24" stroke="#451A03" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <path d="M 40 40 L 40 16 M 32 24 L 40 14 L 48 24" stroke="#451A03" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </g>
  </g>
</svg>`
  },

  success_check: {
    title: 'Verified & Dispatched',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDF4" />
      <stop offset="100%" stop-color="#DCFCE7" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22C55E" />
      <stop offset="100%" stop-color="#16A34A" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#16A34A" flood-opacity="0.32" />
    </filter>
  </defs>
  <!-- Background Card -->
  <rect x="20" y="20" width="472" height="472" rx="100" fill="url(#bg)" stroke="#BBF7D0" stroke-width="8" />

  <!-- Confetti / Sparkle Accents -->
  <polygon points="120,120 126,134 140,140 126,146 120,160 114,146 100,140 114,134" fill="#F59E0B" />
  <polygon points="380,110 384,122 396,126 384,130 380,142 376,130 364,126 376,122" fill="#3B82F6" />
  <polygon points="390,370 395,382 408,388 395,394 390,406 385,394 372,388 385,382" fill="#EC4899" />
  <polygon points="110,360 114,370 124,374 114,378 110,388 106,378 96,374 106,370" fill="#10B981" />

  <g filter="url(#shadow)">
    <!-- Big Glowing Circular Badge -->
    <circle cx="256" cy="256" r="140" fill="url(#badgeGrad)" stroke="#15803D" stroke-width="8" />
    <!-- Inner Ring -->
    <circle cx="256" cy="256" r="122" stroke="#86EFAC" stroke-width="4" stroke-dasharray="10 8" fill="none" />

    <!-- Bold Smooth White Checkmark -->
    <path d="M 186 256 L 234 306 L 326 204" stroke="#FFFFFF" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </g>
</svg>`
  }
};

console.log('Writing SVGs and generating 512x512 PNGs...');

for (const [key, icon] of Object.entries(icons)) {
  const svgPath = path.join(outDir, `${key}.svg`);
  const pngPath = path.join(outDir, `${key}.png`);

  fs.writeFileSync(svgPath, icon.svg, 'utf8');

  const fileUrl = `file:///${svgPath.replace(/\\/g, '/')}`;
  const cmd = `"${edgePath}" --headless --disable-gpu --screenshot="${pngPath}" --window-size=512,512 --default-background-color=00000000 "${fileUrl}"`;

  try {
    execSync(cmd, { stdio: 'pipe' });
    const stat = fs.statSync(pngPath);
    console.log(`✓ ${key}: SVG + PNG (${stat.size} bytes)`);
  } catch (err) {
    console.error(`✗ Error generating PNG for ${key}:`, err.message);
  }
}

console.log('All 14 icons generated successfully!');
