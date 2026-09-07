const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const pageDir = path.join(webRoot, 'src', 'pages', 'user-dashboard');

const dashboardJsx = `import React, { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Gift,
  Headphones,
  Key,
  LayoutDashboard,
  LoaderCircle,
  Lock,
  LogOut,
  Luggage,
  Mail,
  MapPin,
  MapPinned,
  Menu,
  Package,
  PackageCheck,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Undo2,
  User,
  UserRound,
  X,
  Zap
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { clearUserSession, getStoredUser } from '@/features/auth/services/userAuthService.js'
import { fetchCourierBookings } from '@/features/personal-courier/services/personalCourierService.js'
import { fetchLuggageBookings } from '@/features/luggage-delivery/services/luggageDeliveryService.js'
import { fetchVaultBookings } from '@/features/confidential-delivery/services/confidentialDeliveryService.js'
import { fetchForgotSomethingBookings } from '@/features/forgot-something/services/forgotSomethingService.js'
import { fetchReturnPickupBookings } from '@/features/return-pickup/services/returnPickupService.js'
import { fetchPublicServices } from '@/features/services/services/publicServicesService.js'
import { mergeServiceCatalog, SERVICE_CATALOG } from '@/features/services/serviceCatalog.js'
import styles from './UserDashboardPage.module.css'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'services', label: 'Book a Service', icon: Package },
  { id: 'orders', label: 'My Bookings', icon: PackageCheck },
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'support', label: 'Help & Support', icon: Headphones },
]

const servicePresentation = {
  'courier-delivery': { icon: Truck, color: '#0284c7', tint: '#e0f2fe', tag: 'Everyday Transit' },
  'personal-courier': { icon: Truck, color: '#0284c7', tint: '#e0f2fe', tag: 'Everyday Transit' },
  'luggage-delivery': { icon: Luggage, color: '#d97706', tint: '#fef3c7', tag: 'Airport & Hotel' },
  'airport-luggage': { icon: Luggage, color: '#d97706', tint: '#fef3c7', tag: 'Airport & Hotel' },
  'confidential-delivery': { icon: ShieldCheck, color: '#dc2626', tint: '#fee2e2', tag: 'Delivez Vault', isVault: true },
  'confidential-courier': { icon: ShieldCheck, color: '#dc2626', tint: '#fee2e2', tag: 'Delivez Vault', isVault: true },
  'forgot-something': { icon: ShoppingBag, color: '#16a34a', tint: '#dcfce7', tag: 'Delivez Fetch', isFetch: true },
  'return-pickup': { icon: Undo2, color: '#ea580c', tint: '#ffedd5', tag: 'Delivez Back', isReturn: true },
  'personal-return-pickup': { icon: Undo2, color: '#ea580c', tint: '#ffedd5', tag: 'Delivez Back', isReturn: true },
  'gift-delivery': { icon: Gift, color: '#db2777', tint: '#fdf2f8', tag: 'Special Occasions' },
  'gift-and-surprise': { icon: Gift, color: '#db2777', tint: '#fdf2f8', tag: 'Special Occasions' },
}

function formatDate(value, long = true) {
  if (!value) return 'Not available'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available'
  return new Intl.DateTimeFormat('en-IN', long
    ? { day: '2-digit', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}

function formatMoney(value, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0))
}

function normalizeStatus(status = '') {
  return status.replaceAll('_', ' ').toLowerCase()
}

export default function UserDashboardPage() {
  const user = useMemo(() => getStoredUser() ?? {}, [])
  const firstName = user.fullName?.split(' ')[0] || 'Valued Customer'
  const initials = user.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'
  const mobile = \`\${user.countryCode ?? '+91'} \${user.mobileNumber ?? ''}\`.trim()

  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [serviceQuery, setServiceQuery] = useState('')
  const [servicesState, setServicesState] = useState({ services: SERVICE_CATALOG, loading: true, error: '' })
  const [shipments, setShipments] = useState({ loading: true, error: '', bookings: [], total: 0 })

  useEffect(() => {
    let active = true
    fetchPublicServices()
      .then((services) => active && setServicesState({ services: mergeServiceCatalog(services), loading: false, error: '' }))
      .catch(() => active && setServicesState({
        services: SERVICE_CATALOG,
        loading: false,
        error: 'Live images could not be refreshed. All services are available.',
      }))
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    Promise.allSettled([
      fetchCourierBookings({ limit: 10 }),
      fetchLuggageBookings({ limit: 10 }),
      fetchVaultBookings().then(bookings => ({ bookings, total: bookings?.length || 0 })),
      fetchForgotSomethingBookings({ limit: 10 }).catch(() => ({ bookings: [], total: 0 })),
      fetchReturnPickupBookings({ limit: 10 }).catch(() => ({ bookings: [], total: 0 })),
    ]).then((results) => {
      if (!active) return
      const successful = results.filter(({ status }) => status === 'fulfilled').map(({ value }) => value)
      if (successful.length === 0) {
        const message = results.find(({ status }) => status === 'rejected')?.reason?.message ?? 'Bookings could not be loaded.'
        setShipments({ loading: false, error: message, bookings: [], total: 0 })
        return
      }
      const bookings = successful
        .flatMap(({ bookings: items = [] }) => items)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      const total = successful.reduce((sum, current) => sum + (current.total ?? current.bookings?.length ?? 0), 0)
      setShipments({ loading: false, error: '', bookings, total })
    })

    return () => { active = false }
  }, [])

  const filteredServices = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase()
    if (!query) return servicesState.services
    return servicesState.services.filter((service) => (
      service.name.toLowerCase().includes(query) ||
      service.shortDescription.toLowerCase().includes(query)
    ))
  }, [servicesState.services, serviceQuery])

  const activeCount = useMemo(() => shipments.bookings.filter((b) => !['DELIVERED', 'CANCELLED'].includes(b.status)).length, [shipments.bookings])
  const completedCount = useMemo(() => shipments.bookings.filter((b) => b.status === 'DELIVERED').length, [shipments.bookings])

  const scrollTo = (id) => {
    setActiveNav(id)
    setSidebarOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSignOut = () => {
    clearUserSession()
    navigateTo('/#signin')
  }

  return (
    <div className={styles.dashboard}>
      {/* Fixed Left Sidebar */}
      <aside className={\`\${styles.sidebar} \${sidebarOpen ? styles.sidebarOpen : ''}\`}>
        <div className={styles.sidebarTop}>
          <button type="button" className={styles.brand} onClick={() => navigateTo('/')}>
            <span className={styles.brandMain}>DELIVEZ</span>
            <small className={styles.brandSub}>ONE</small>
          </button>
          <button
            type="button"
            className={styles.closeSidebar}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        <div className={styles.userCard}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userInfo}>
            <strong>{user.fullName || 'Valued Customer'}</strong>
            <small>{user.emailAddress || mobile || 'Personal Account'}</small>
          </div>
        </div>

        {/* Navigation Rail */}
        <nav className={styles.nav}>
          <div className={styles.navSectionLabel}>NAVIGATION</div>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = activeNav === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={\`\${styles.navItem} \${active ? styles.navActive : ''}\`}
                onClick={() => scrollTo(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                <ChevronRight size={14} className={styles.navArrow} />
              </button>
            )
          })}
        </nav>

        {/* Fast Action Quick Cards in Sidebar */}
        <div className={styles.sidebarFastActions}>
          <div className={styles.fetchPromoCard}>
            <div className={styles.fetchPromoHeader}>
              <Zap size={14} color="#dc2626" />
              <strong>Forgot Something?</strong>
            </div>
            <p>Need keys, laptop, or bag retrieved fast? Rapid 15–30 min retrieval is live!</p>
            <button
              type="button"
              className={styles.fetchPromoBtn}
              onClick={() => navigateTo('/book/forgot-something')}
            >
              Fetch Item Now
            </button>
          </div>

          <div className={styles.returnPromoCard}>
            <div className={styles.returnPromoHeader}>
              <Undo2 size={14} color="#ea580c" />
              <strong>Return Pickup</strong>
            </div>
            <p>Return Amazon, Flipkart, or retail items right from your doorstep.</p>
            <button
              type="button"
              className={styles.returnPromoBtn}
              onClick={() => navigateTo('/book/return-pickup')}
            >
              Book Return
            </button>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className={styles.sidebarFooter}>
          <button type="button" className={styles.logoutBtn} onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />}

      {/* Main Workspace Area */}
      <div className={styles.workspace}>
        {/* Topbar Header */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <div className={styles.pageInfo}>
              <h1>Welcome back, {firstName} 👋</h1>
              <p>Manage your live bookings, personal dispatches, and quick item retrievals in one place.</p>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <div className={styles.searchBar}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search services..."
                value={serviceQuery}
                onChange={(e) => setServiceQuery(e.target.value)}
              />
            </div>

            <div className={styles.notificationWrapper}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setNotificationsOpen((p) => !p)}
                aria-label="Notifications"
              >
                <Bell size={18} />
                {activeCount > 0 && <span className={styles.badge}>{activeCount}</span>}
              </button>

              {notificationsOpen && (
                <div className={styles.notificationFlyout}>
                  <div className={styles.notificationHeader}>
                    <strong>Active Shipments ({activeCount})</strong>
                    <button type="button" onClick={() => setNotificationsOpen(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className={styles.notificationBody}>
                    {shipments.bookings.filter((b) => !['DELIVERED', 'CANCELLED'].includes(b.status)).length === 0 ? (
                      <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No live shipments in transit.</p>
                    ) : (
                      shipments.bookings
                        .filter((b) => !['DELIVERED', 'CANCELLED'].includes(b.status))
                        .slice(0, 4)
                        .map((b) => (
                          <div key={b.id || b.bookingNumber} className={styles.flyoutItem}>
                            <div>
                              <strong>{b.bookingNumber || b.itemName || 'Booking'}</strong>
                              <small>{normalizeStatus(b.status)}</small>
                            </div>
                            <span>{formatMoney(b.totalAmount)}</span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.topUserCard}>
              <div className={styles.topAvatar}>{initials}</div>
              <div className={styles.topUserInfo}>
                <strong>{user.fullName || 'User'}</strong>
                <small>Personal account</small>
              </div>
              <button
                type="button"
                className={styles.topLogoutBtn}
                onClick={handleSignOut}
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className={styles.main}>
          {/* Overview Hero Section */}
          <section id="overview" className={styles.overviewSection}>
            {/* Stat Counters Row */}
            <div className={styles.statsGrid}>
              <article className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Clock3 size={22} />
                </div>
                <div className={styles.statInfo}>
                  <small>In transit</small>
                  <strong>{activeCount}</strong>
                  <span>Active deliveries right now</span>
                </div>
              </article>

              <article className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <CheckCircle2 size={22} />
                </div>
                <div className={styles.statInfo}>
                  <small>Delivered</small>
                  <strong>{completedCount}</strong>
                  <span>Completed dispatches</span>
                </div>
              </article>

              <article className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
                  <Sparkles size={22} />
                </div>
                <div className={styles.statInfo}>
                  <small>Verified Services</small>
                  <strong>{servicesState.services.length}</strong>
                  <span>On-demand logistics categories</span>
                </div>
              </article>
            </div>
          </section>

          {/* Quick Book Services Section */}
          <section id="services" className={styles.servicesSection}>
            <div className={styles.sectionTitle}>
              <div>
                <h2>Book a Delivery Service</h2>
                <p>Select any on-demand dispatch or specialized retrieval service.</p>
              </div>
              <div className={styles.serviceCountBadge}>
                {filteredServices.length} Services Available
              </div>
            </div>

            <div className={styles.servicesGrid}>
              {filteredServices.map((service) => {
                const isFetch = service.slug === 'forgot-something'
                const isReturn = service.slug === 'return-pickup' || service.slug === 'personal-return-pickup'
                const isVault = service.slug === 'confidential-delivery' || service.slug === 'confidential-courier'
                const meta = isReturn
                  ? servicePresentation['return-pickup']
                  : isFetch
                  ? servicePresentation['forgot-something']
                  : isVault
                  ? servicePresentation['confidential-delivery']
                  : servicePresentation[service.slug] || servicePresentation['courier-delivery']
                const ServiceIcon = meta.icon || Package

                const bookUrl = isReturn
                  ? '/book/return-pickup'
                  : isFetch
                  ? '/book/forgot-something'
                  : isVault
                  ? '/book/confidential-delivery'
                  : \`/book/\${service.slug}\`

                return (
                  <div
                    key={service.slug}
                    className={styles.serviceCard}
                    style={{
                      '--service-color': meta.color,
                      '--service-tint': meta.tint,
                    }}
                  >
                    <div>
                      <div className={styles.serviceVisual}>
                        <ServiceIcon size={24} />
                      </div>
                      <div className={styles.available}>
                        <i /> Available Now
                      </div>
                      <h3>{service.name}</h3>
                      <p>{service.shortDescription}</p>
                    </div>

                    <button type="button" onClick={() => navigateTo(bookUrl)}>
                      <span>Book Service</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Bookings Section */}
          <section id="orders" className={styles.ordersSection}>
            <div className={styles.sectionTitle}>
              <div>
                <h2>My Bookings & Retrievals</h2>
                <p>Live status updates, milestones, and OTP verification for all orders.</p>
              </div>
              <span className={styles.ordersCountPill}>
                {shipments.bookings.length} Total Orders
              </span>
            </div>

            {shipments.loading ? (
              <div className={styles.loadingBox}>
                <LoaderCircle className={styles.spinner} size={28} color="#d97706" />
                <span>Loading your bookings...</span>
              </div>
            ) : shipments.bookings.length === 0 ? (
              <div className={styles.emptyOrders}>
                <Package size={44} color="#94a3b8" />
                <strong>No bookings placed yet</strong>
                <small>Select any service above or start with Forgot Something to fetch an item.</small>
                <button type="button" onClick={() => navigateTo('/book/forgot-something')}>
                  <ShoppingBag size={15} /> Book Retrieval
                </button>
              </div>
            ) : (
              <div className={styles.orderList}>
                {shipments.bookings.map((booking) => {
                  const isReturn = !!booking.returnType || (booking.bookingNumber && (booking.bookingNumber.startsWith('DRVZ-RET') || booking.bookingNumber.startsWith('RBK')))
                  const isFetch = !isReturn && (!!booking.itemCategory || (booking.bookingNumber && booking.bookingNumber.startsWith('DZ')))
                  const isVault = !isReturn && !isFetch && (!!booking.documentType || (booking.bookingNumber && booking.bookingNumber.startsWith('DV')))
                  
                  const meta = isReturn
                    ? servicePresentation['return-pickup']
                    : isFetch
                    ? servicePresentation['forgot-something']
                    : isVault
                    ? servicePresentation['confidential-delivery']
                    : servicePresentation[booking.service?.slug] || servicePresentation['courier-delivery']
                  const ServiceIcon = meta.icon || Package

                  const trackUrl = isReturn
                    ? \`/track/return-pickup/\${booking.bookingNumber || booking.id}\`
                    : isFetch
                    ? \`/track/forgot-something/\${booking.bookingNumber || booking.id}\`
                    : isVault
                    ? \`/vault/track/\${booking.bookingNumber || booking.id}\`
                    : \`/track/\${booking.bookingNumber || booking.id}\`

                  const isCancelled = booking.status === 'CANCELLED'

                  return (
                    <article key={booking.id || booking.bookingNumber} className={styles.orderCard}>
                      <div
                        className={styles.orderIconWrap}
                        style={{ background: meta.tint, color: meta.color }}
                      >
                        <ServiceIcon size={20} />
                      </div>

                      <div className={styles.orderMain}>
                        <div className={styles.orderTitleRow}>
                          <strong>{booking.bookingNumber || booking.itemName || 'Booking'}</strong>
                          <span
                            className={styles.orderTag}
                            style={{ background: meta.tint, color: meta.color }}
                          >
                            {meta.tag}
                          </span>
                        </div>
                        <small className={styles.orderSub}>
                          {isReturn ? (
                            <>
                              <Undo2 size={12} /> {booking.itemDescription || 'Return Item'} • To {booking.destinationName || 'Seller Hub'}
                            </>
                          ) : isFetch ? (
                            <>
                              <MapPin size={12} /> {booking.itemName || booking.itemCategory} • {booking.locationType} to {booking.dropoff?.city || 'Destination'}
                            </>
                          ) : isVault ? (
                            <>
                              <Shield size={12} /> {booking.documentType} • {booking.securityLevel}
                            </>
                          ) : (
                            <>
                              <Truck size={12} /> {booking.package?.contentCategory || 'Standard parcel'}
                            </>
                          )}
                        </small>
                      </div>

                      <div className={styles.orderDate}>
                        <small>Booked on</small>
                        <strong>{formatDate(booking.createdAt, false)}</strong>
                      </div>

                      <div className={styles.orderMeta}>
                        <strong className={styles.orderAmount}>
                          {formatMoney(booking.totalAmount)}
                        </strong>
                        <span className={\`\${styles.statusBadge} \${isCancelled ? styles.cancelledBadge : ''}\`}>
                          {normalizeStatus(booking.status)}
                        </span>
                        <button
                          type="button"
                          className={styles.trackOrderBtn}
                          onClick={() => navigateTo(trackUrl)}
                        >
                          <span>Track Order</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          {/* Profile & Support Details Grid */}
          <div className={styles.detailGrid}>
            <div id="profile" className={styles.profileCard}>
              <div className={styles.sectionHeading}>
                <div className={styles.headingIconWrap}>
                  <User size={18} />
                </div>
                <h2>Personal Profile</h2>
              </div>
              <dl className={styles.profileDl}>
                <div>
                  <dt><User size={13} /> Full Name</dt>
                  <dd>{user.fullName || 'Not provided'}</dd>
                </div>
                <div>
                  <dt><Phone size={13} /> Mobile Number</dt>
                  <dd>{mobile || 'Not provided'}</dd>
                </div>
                <div>
                  <dt><Mail size={13} /> Email Address</dt>
                  <dd>{user.emailAddress || 'Not provided'}</dd>
                </div>
                <div>
                  <dt><CalendarDays size={13} /> Member Since</dt>
                  <dd>{formatDate(user.createdAt, false)}</dd>
                </div>
              </dl>
            </div>

            <div id="support" className={styles.supportCard}>
              <div>
                <p className={styles.supportKicker}>24/7 DEDICATED SUPPORT</p>
                <h2>Need help with an order?</h2>
                <small>
                  Our logistics assistance team is available round the clock. Connect for instant resolution or live partner contact.
                </small>
              </div>
              <button
                type="button"
                className={styles.supportBtn}
                onClick={() => alert('Support helpline: Call 1800-DELIVEZ (toll-free) or email support@delivez.com')}
              >
                <Headphones size={16} />
                <span>Contact Helpdesk</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
`;

const dashboardCss = `/* UserDashboardPage.module.css */
/* Reset & Layout Container */
.dashboard {
  min-height: 100vh;
  display: flex;
  background-color: #f8fafc;
  color: #0f172a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Fixed Left Sidebar */
.sidebar {
  width: 270px;
  background: #ffffff;
  border-right: 1.5px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
  padding: 20px 16px;
  overflow-y: auto;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.02);
}

.sidebarTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.brand {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 0;
  outline: none;
}

.brandMain {
  font-size: 1.45rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  color: #0f172a;
}

.brandSub {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 1px;
  background: #fef3c7;
  color: #b45309;
  padding: 2px 6px;
  border-radius: 4px;
}

.closeSidebar {
  display: none;
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
}

/* User Profile Mini Card in Sidebar */
.userCard {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin: 16px 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 800;
  flex-shrink: 0;
}

.userInfo {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.userInfo strong {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.userInfo small {
  font-size: 0.74rem;
  color: #64748b;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Navigation List */
.nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
}

.navSectionLabel {
  font-size: 0.68rem;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 0.5px;
  padding: 4px 12px;
  margin-bottom: 2px;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  width: 100%;
  outline: none;
}

.navItem:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.navActive {
  background: #fffbeb !important;
  color: #d97706 !important;
  font-weight: 800;
}

.navArrow {
  margin-left: auto;
  opacity: 0.4;
  transition: transform 0.2s ease;
}

.navActive .navArrow {
  opacity: 1;
  transform: translateX(2px);
}

/* Sidebar Fast Action Cards */
.sidebarFastActions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.fetchPromoCard {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 12px;
}

.fetchPromoHeader {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #166534;
  margin-bottom: 4px;
}

.fetchPromoCard p {
  font-size: 0.72rem;
  color: #15803d;
  margin: 0 0 8px;
  line-height: 1.35;
}

.fetchPromoBtn {
  width: 100%;
  background: #16a34a;
  color: #ffffff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
}

.returnPromoCard {
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  padding: 12px;
}

.returnPromoHeader {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 800;
  color: #9a3412;
  margin-bottom: 4px;
}

.returnPromoCard p {
  font-size: 0.72rem;
  color: #c2410c;
  margin: 0 0 8px;
  line-height: 1.35;
}

.returnPromoBtn {
  width: 100%;
  background: #ea580c;
  color: #ffffff;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
}

/* Sidebar Footer */
.sidebarFooter {
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
}

.logoutBtn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.logoutBtn:hover {
  background: #fef2f2;
}

/* Backdrop */
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 45;
}

/* Main Workspace Area */
.workspace {
  flex: 1;
  margin-left: 270px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Topbar Header */
.topbar {
  height: 76px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 30;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.topbarLeft {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menuToggle {
  display: none;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  padding: 8px;
  border-radius: 10px;
  color: #0f172a;
  cursor: pointer;
}

.pageInfo h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 900;
  color: #0f172a;
}

.pageInfo p {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: #64748b;
  font-weight: 500;
}

.topbarRight {
  display: flex;
  align-items: center;
  gap: 14px;
}

.searchBar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 8px 14px;
  width: 240px;
  color: #64748b;
}

.searchBar input {
  border: none;
  background: transparent;
  font-size: 0.82rem;
  color: #0f172a;
  outline: none;
  width: 100%;
}

.notificationWrapper {
  position: relative;
}

.iconBtn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}

.iconBtn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #dc2626;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #ffffff;
}

.notificationFlyout {
  position: absolute;
  top: 48px;
  right: 0;
  width: 300px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 16px;
  z-index: 40;
}

.notificationHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.notificationHeader strong {
  font-size: 0.9rem;
  font-weight: 800;
}

.notificationHeader button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.flyoutItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
}

.flyoutItem strong {
  display: block;
  font-size: 0.82rem;
  color: #0f172a;
}

.flyoutItem small {
  font-size: 0.72rem;
  color: #64748b;
  text-transform: capitalize;
}

.flyoutItem span {
  font-size: 0.78rem;
  font-weight: 800;
  color: #d97706;
}

/* User Pill in Topbar */
.topUserCard {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.topAvatar {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #d97706;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.topUserInfo {
  display: flex;
  flex-direction: column;
}

.topUserInfo strong {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0f172a;
}

.topUserInfo small {
  font-size: 0.68rem;
  color: #64748b;
}

.topLogoutBtn {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Main Dashboard Body */
.main {
  padding: 28px 32px 60px;
  max-width: 1200px;
  width: 100%;
}

/* Overview Section & Stats */
.overviewSection {
  margin-bottom: 28px;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.statCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.statIcon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.statInfo small {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.statInfo strong {
  display: block;
  font-size: 1.6rem;
  font-weight: 900;
  color: #0f172a;
  margin: 2px 0;
}

.statInfo span {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 500;
}

/* Services Section */
.servicesSection {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.sectionTitle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sectionTitle h2 {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 2px;
}

.sectionTitle p {
  font-size: 0.82rem;
  color: #64748b;
  margin: 0;
}

.serviceCountBadge {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
}

.servicesGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.serviceCard {
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.serviceCard:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.serviceVisual {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--service-tint);
  color: var(--service-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.available {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 800;
  color: #16a34a;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.available i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

.serviceCard h3 {
  margin: 0 0 4px;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
}

.serviceCard p {
  margin: 0 0 16px;
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.4;
  flex: 1;
}

.serviceCard button {
  width: 100%;
  padding: 10px 14px;
  background: var(--service-tint);
  color: var(--service-color);
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
}

.serviceCard button:hover {
  filter: brightness(0.95);
}

/* Orders Section */
.ordersSection {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px;
  margin-bottom: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.ordersCountPill {
  background: #f1f5f9;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
}

.orderList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.orderCard {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.orderIconWrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.orderMain {
  display: flex;
  flex-direction: column;
}

.orderTitleRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.orderTitleRow strong {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
}

.orderTag {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.orderSub {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #64748b;
  font-size: 0.78rem;
}

.orderDate {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.orderDate small {
  font-size: 0.7rem;
  color: #94a3b8;
  font-weight: 600;
}

.orderDate strong {
  font-size: 0.85rem;
  color: #334155;
}

.orderMeta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.orderAmount {
  font-size: 1rem;
  font-weight: 900;
  color: #0f172a;
}

.statusBadge {
  padding: 3px 8px;
  border-radius: 9999px;
  background: #dcfce7;
  color: #166534;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: capitalize;
}

.cancelledBadge {
  background: #fee2e2;
  color: #991b1b;
}

.trackOrderBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
}

.loadingBox {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px;
  color: #64748b;
  font-weight: 600;
}

.emptyOrders {
  text-align: center;
  padding: 40px 20px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.emptyOrders strong {
  font-size: 1rem;
  color: #0f172a;
}

.emptyOrders small {
  font-size: 0.82rem;
  color: #64748b;
}

.emptyOrders button {
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

/* Detail Grid (Profile + Support) */
.detailGrid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}

.profileCard,
.supportCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.sectionHeading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.headingIconWrap {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: #fef3c7;
  color: #d97706;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sectionHeading h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.profileDl {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 0;
}

.profileDl div {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px 14px;
  border-radius: 10px;
}

.profileDl dt {
  font-size: 0.72rem;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.profileDl dd {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
}

.supportCard {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: #fffbeb;
  border-color: #fef3c7;
}

.supportKicker {
  color: #b45309;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin: 0 0 4px;
}

.supportCard h2 {
  margin: 0 0 6px;
  font-size: 1.15rem;
  font-weight: 800;
  color: #92400e;
}

.supportCard small {
  color: #78350f;
  font-size: 0.82rem;
  line-height: 1.4;
  display: block;
}

.supportBtn {
  margin-top: 16px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 800;
  font-size: 0.85rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Rules */
@media (max-width: 1024px) {
  .servicesGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  .detailGrid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebarOpen {
    transform: translateX(0);
  }
  .closeSidebar {
    display: block;
  }
  .menuToggle {
    display: flex;
  }
  .workspace {
    margin-left: 0;
  }
  .topbar {
    padding: 0 16px;
  }
  .searchBar {
    display: none;
  }
  .main {
    padding: 20px 16px 40px;
  }
  .servicesGrid {
    grid-template-columns: 1fr;
  }
  .statsGrid {
    grid-template-columns: 1fr;
  }
  .orderCard {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .orderDate {
    text-align: left;
  }
  .orderMeta {
    align-items: flex-start;
  }
}
`;

fs.writeFileSync(path.join(pageDir, 'UserDashboardPage.jsx'), dashboardJsx);
fs.writeFileSync(path.join(pageDir, 'UserDashboardPage.module.css'), dashboardCss);
console.log('✓ UserDashboardPage.jsx and CSS rewritten cleanly');
`;

fs.writeFileSync(path.join(__dirname, 'fix_dashboard_css.cjs'), dashboardJsx);
console.log('fix_dashboard_css.cjs created');
