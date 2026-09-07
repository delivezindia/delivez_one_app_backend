const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';

// 1. Update App.jsx
const appJsxPath = path.join(webRoot, 'src', 'app', 'App.jsx');
const newAppJsx = `import { useEffect, useState } from 'react'
import AdminAuthGuard from '@/features/admin-auth/components/AdminAuthGuard.jsx'
import UserAuthGuard from '@/features/auth/components/UserAuthGuard.jsx'
import AppLayout from '@/layouts/AppLayout/AppLayout.jsx'
import AdminLoginPage from '@/pages/admin-login/AdminLoginPage.jsx'
import ConfidentialDeliveryBookingPage from '@/pages/confidential-delivery/ConfidentialDeliveryBookingPage.jsx'
import VaultTrackingPage from '@/pages/confidential-delivery/VaultTrackingPage.jsx'
import ForgotSomethingBookingPage from '@/pages/forgot-something/ForgotSomethingBookingPage.jsx'
import ForgotSomethingTrackingPage from '@/pages/forgot-something/ForgotSomethingTrackingPage.jsx'
import ReturnPickupBookingPage from '@/pages/return-pickup/ReturnPickupBookingPage.jsx'
import ReturnPickupTrackingPage from '@/pages/return-pickup/ReturnPickupTrackingPage.jsx'
import ReturnPickupDetailsPage from '@/pages/return-pickup/ReturnPickupDetailsPage.jsx'
import ReturnPickupListPage from '@/pages/return-pickup/ReturnPickupListPage.jsx'
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx'
import HomePage from '@/pages/home/HomePage.jsx'
import LuggageDeliveryBookingPage from '@/pages/luggage-delivery/LuggageDeliveryBookingPage.jsx'
import PersonalCourierBookingPage from '@/pages/personal-courier/PersonalCourierBookingPage.jsx'
import SandboxPaymentPage from '@/pages/payments/SandboxPaymentPage.jsx'
import UserDashboardPage from '@/pages/user-dashboard/UserDashboardPage.jsx'
import { scrollToCurrentHash } from '@/app/router/navigation.js'
import { getServiceBySlug } from '@/features/services/serviceCatalog.js'

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)

  useEffect(() => {
    const handleRouteChange = () => setPathname(window.location.pathname)
    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  useEffect(() => {
    scrollToCurrentHash()
  }, [pathname])

  if (pathname === '/admin/login') {
    return <AdminLoginPage />
  }

  if (pathname === '/dashboard') {
    return (
      <AdminAuthGuard>
        <DashboardPage />
      </AdminAuthGuard>
    )
  }

  if (pathname === '/user/dashboard') {
    return (
      <UserAuthGuard>
        <UserDashboardPage />
      </UserAuthGuard>
    )
  }

  // Return Pickup List Route
  if (/^\\/(returns|user\\/returns)\\/?$/.test(pathname)) {
    return (
      <UserAuthGuard>
        <ReturnPickupListPage />
      </UserAuthGuard>
    )
  }

  // Return Pickup Booking Route
  if (/^\\/(book\\/(return-pickup|personal-return-pickup)|return-pickup|returns\\/book)\\/?$/.test(pathname)) {
    return <ReturnPickupBookingPage />
  }

  // Return Pickup Live Tracking Route
  const returnTrackingRoute = pathname.match(/^\\/(?:track\\/return-pickup|return-pickup\\/track)\\/(.+)\\/?$/)
  if (returnTrackingRoute) {
    return <ReturnPickupTrackingPage bookingId={returnTrackingRoute[1]} />
  }

  // Return Pickup Details Route
  const returnDetailsRoute = pathname.match(/^\\/(?:return-pickup\\/details|returns|return-pickup)\\/(DRVZ-RET-[a-zA-Z0-9-]+|[0-9a-fA-F-]{36})\\/?$/)
  if (returnDetailsRoute) {
    return <ReturnPickupDetailsPage bookingId={returnDetailsRoute[1]} />
  }

  // Forgot Something Booking Route
  if (/^\\/(book\\/(forgot-something|fetch)|forgot-something|fetch)\\/?$/.test(pathname)) {
    return <ForgotSomethingBookingPage />
  }

  // Forgot Something Live Tracking Route
  const forgotTrackingRoute = pathname.match(/^\\/(?:track\\/forgot-something|forgot-something\\/track)\\/(.+)\\/?$/)
  if (forgotTrackingRoute) {
    return <ForgotSomethingTrackingPage bookingId={forgotTrackingRoute[1]} />
  }

  // Vault / Confidential Delivery Booking
  if (/^\\/(book\\/(confidential-delivery|confidential-courier|vault)|vault|book\\/vault)\\/?$/.test(pathname)) {
    return <ConfidentialDeliveryBookingPage />
  }

  // Vault Live Tracking Route
  const trackingRoute = pathname.match(/^\\/(vault\\/track|track)\\/(.+)\\/?$/)
  if (trackingRoute) {
    const trackId = trackingRoute[2]
    if (trackId.startsWith('DRVZ-RET') || trackId.startsWith('RBK')) {
      return <ReturnPickupTrackingPage bookingId={trackId} />
    }
    if (trackId.startsWith('DZ')) {
      return <ForgotSomethingTrackingPage bookingId={trackId} />
    }
    return <VaultTrackingPage vaultId={trackId} />
  }

  // Luggage Delivery Booking
  if (/^\\/book\\/(luggage-delivery|airport-luggage)\\/?$/.test(pathname)) {
    return (
      <UserAuthGuard>
        <LuggageDeliveryBookingPage />
      </UserAuthGuard>
    )
  }

  // Payment Route
  const paymentRoute = pathname.match(/^\\/pay\\/(luggage-delivery|confidential-courier|confidential-delivery|personal-courier|courier-delivery|forgot-something|return-pickup|returns)\\/(.+)\\/?$/)
  if (paymentRoute) {
    return (
      <UserAuthGuard>
        <SandboxPaymentPage serviceSlug={paymentRoute[1]} bookingId={paymentRoute[2]} />
      </UserAuthGuard>
    )
  }

  // Generic Service Booking
  const bookingRoute = pathname.match(/^\\/book\\/([a-z0-9-]+)\\/?$/)
  const selectedService = bookingRoute ? getServiceBySlug(bookingRoute[1]) : null

  if (selectedService) {
    if (selectedService.slug === 'forgot-something') {
      return <ForgotSomethingBookingPage />
    }
    if (selectedService.slug === 'return-pickup' || selectedService.slug === 'personal-return-pickup') {
      return <ReturnPickupBookingPage />
    }
    return (
      <UserAuthGuard>
        <PersonalCourierBookingPage serviceSlug={selectedService.slug} />
      </UserAuthGuard>
    )
  }

  return (
    <AppLayout>
      <HomePage />
    </AppLayout>
  )
}

export default App
`;

fs.writeFileSync(appJsxPath, newAppJsx);
console.log('✓ App.jsx updated with Return Pickup routes');

// 2. Update UserDashboardPage.jsx to support Return Pickup listings
const userDashboardPath = path.join(webRoot, 'src', 'pages', 'user-dashboard', 'UserDashboardPage.jsx');
let userDashboardCode = fs.readFileSync(userDashboardPath, 'utf-8');

// Check if return-pickup is defined in servicePresentation
if (!userDashboardCode.includes("'return-pickup'")) {
  userDashboardCode = userDashboardCode.replace(
    /const servicePresentation = \{/,
    `const servicePresentation = {\n  'return-pickup': {\n    tag: 'Delivez Back',\n    title: 'Return Pickup',\n    color: '#d97706',\n    tint: '#fef3c7',\n    icon: Undo2,\n    accent: '#f59e0b',\n  },`
  );

  // Import Undo2 from lucide-react if not present
  if (!userDashboardCode.includes('Undo2')) {
    userDashboardCode = userDashboardCode.replace(
      /import \{/,
      `import {\n  Undo2,`
    );
  }

  // Update shipment detection in dashboard
  userDashboardCode = userDashboardCode.replace(
    /const isFetch = !!booking\.itemCategory \|\| \(booking\.bookingNumber && booking\.bookingNumber\.startsWith\('DZ'\)\)/,
    `const isReturn = !!booking.returnType || (booking.bookingNumber && (booking.bookingNumber.startsWith('DRVZ-RET') || booking.bookingNumber.startsWith('RBK')))\n                  const isFetch = !isReturn && (!!booking.itemCategory || (booking.bookingNumber && booking.bookingNumber.startsWith('DZ')))`
  );

  userDashboardCode = userDashboardCode.replace(
    /const meta = isFetch/,
    `const meta = isReturn\n                    ? servicePresentation['return-pickup']\n                    : isFetch`
  );

  userDashboardCode = userDashboardCode.replace(
    /const trackUrl = isFetch/,
    `const trackUrl = isReturn\n                    ? \`/track/return-pickup/\${booking.bookingNumber || booking.id}\`\n                    : isFetch`
  );

  fs.writeFileSync(userDashboardPath, userDashboardCode);
  console.log('✓ UserDashboardPage.jsx updated with Return Pickup presentation');
}

// 3. Update HomePage.jsx to handle return pickup tracking numbers
const homePagePath = path.join(webRoot, 'src', 'pages', 'home', 'HomePage.jsx');
let homePageCode = fs.readFileSync(homePagePath, 'utf-8');
if (!homePageCode.includes('DRVZ-RET') && homePageCode.includes('/track/')) {
  homePageCode = homePageCode.replace(
    /if \(trimmed\.startsWith\('DZ'\)\) \{/,
    `if (trimmed.startsWith('DRVZ-RET') || trimmed.startsWith('RBK')) {\n        navigateTo(\`/track/return-pickup/\${trimmed}\`)\n        return\n      }\n      if (trimmed.startsWith('DZ')) {`
  );
  fs.writeFileSync(homePagePath, homePageCode);
  console.log('✓ HomePage.jsx updated for Return Pickup tracking numbers');
}

console.log('All frontend components and integrations prepared.');
