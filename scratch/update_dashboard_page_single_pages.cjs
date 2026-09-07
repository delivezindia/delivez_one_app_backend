const fs = require('fs');

const dashPath = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/DashboardPage.jsx';

const fullDashboardCode = `import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  Bell,
  Bike,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileLock2,
  Gift,
  Headphones,
  Home,
  ImagePlus,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Luggage,
  MapPin,
  MapPinned,
  Menu,
  Package,
  PackageCheck,
  Plane,
  Plus,
  ReceiptIndianRupee,
  RotateCcw,
  Search,
  SearchCheck,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  Upload,
  UserCog,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  clearAdminSession,
  getStoredAdminProfile,
} from '@/features/admin-auth/services/adminAuthService.js'
import {
  fetchAdminServices,
  removeAdminServiceImage,
  uploadAdminServiceImage,
} from '@/features/admin-services/services/adminServicesService.js'
import { fetchAdminUsers } from '@/features/admin-users/services/adminUsersService.js'

// Import all sub-module views
import AdminGiftDeliveryView from './components/AdminGiftDeliveryView.jsx'
import AdminUnifiedOrdersView from './components/AdminUnifiedOrdersView.jsx'
import AdminPartnersView from './components/AdminPartnersView.jsx'
import AdminFinanceView from './components/AdminFinanceView.jsx'
import AdminAnalyticsView from './components/AdminAnalyticsView.jsx'
import AdminPersonalCourierView from './components/AdminPersonalCourierView.jsx'
import AdminConfidentialCourierView from './components/AdminConfidentialCourierView.jsx'
import AdminForgotSomethingView from './components/AdminForgotSomethingView.jsx'
import AdminReturnPickupView from './components/AdminReturnPickupView.jsx'
import AdminSupportView from './components/AdminSupportView.jsx'

import { fetchUnifiedStats, universalTrack } from '@/features/admin-management/services/adminManagementService.js'
import styles from './DashboardPage.module.css'

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, group: 'CORE' },
  { id: 'orders', label: 'Unified Orders', icon: PackageCheck, group: 'CORE' },
  
  { id: 'gift-delivery', label: 'Gift & Surprise', icon: Gift, group: 'SERVICES' },
  { id: 'courier', label: 'Personal Courier', icon: Truck, group: 'SERVICES' },
  { id: 'confidential', label: 'Confidential / Luggage', icon: ShieldCheck, group: 'SERVICES' },
  { id: 'forgot', label: 'Forgot Something', icon: ShoppingBag, group: 'SERVICES' },
  { id: 'returns', label: 'Return Pickup', icon: RotateCcw, group: 'SERVICES' },

  { id: 'partners', label: 'Delivery Fleet', icon: UserCog, group: 'MANAGEMENT' },
  { id: 'customers', label: 'Customers', icon: Users, group: 'MANAGEMENT' },
  { id: 'payments', label: 'Finance & Settlements', icon: WalletCards, group: 'MANAGEMENT' },
  { id: 'analytics', label: 'Analytics & Reports', icon: ChartNoAxesCombined, group: 'MANAGEMENT' },

  { id: 'services', label: 'Services Catalogue', icon: Package, group: 'SYSTEM' },
  { id: 'support', label: 'Helpdesk & Support', icon: Headphones, group: 'SYSTEM' },
]

const servicePresentation = {
  'courier-delivery': { icon: Truck, color: '#087fc1', tint: '#e9f6ff' },
  'personal-courier': { icon: Truck, color: '#087fc1', tint: '#e9f6ff' },
  'luggage-delivery': { icon: Luggage, color: '#e5a100', tint: '#fff7dd' },
  'airport-luggage': { icon: Luggage, color: '#e5a100', tint: '#fff7dd' },
  'confidential-delivery': { icon: ShieldCheck, color: '#e00014', tint: '#ffeff0' },
  'confidential-courier': { icon: ShieldCheck, color: '#e00014', tint: '#ffeff0' },
  'forgot-something': { icon: ShoppingBag, color: '#159565', tint: '#e7f8f1' },
  'return-pickup': { icon: RotateCcw, color: '#ee5a08', tint: '#fff0e6' },
  'personal-return-pickup': { icon: RotateCcw, color: '#ee5a08', tint: '#fff0e6' },
  'gift-delivery': { icon: Gift, color: '#e63f65', tint: '#ffedf2' },
  'gift-and-surprise': { icon: Gift, color: '#e63f65', tint: '#ffedf2' },
}
const defaultServicePresentation = { icon: Package, color: '#59636e', tint: '#f0f2f4' }

const activeDeliveries = [
  {
    id: 'DLV-29840', type: 'Airport Luggage', status: 'In transit',
    from: 'Connaught Place', to: 'IGI Airport, T3', eta: 'Today, 5:40 PM', courier: 'Rajesh K.', progress: 3,
  },
  {
    id: 'DLV-29812', type: 'Confidential Documents', status: 'Picked up',
    from: 'Saket', to: 'Cyber City, Gurugram', eta: 'Today, 7:15 PM', courier: 'Aman S.', progress: 2,
  },
  {
    id: 'DLV-29790', type: 'Forgot Keys Retrieval', status: 'Rider on the way',
    from: 'Indiranagar 100ft', to: 'Koramangala 4th Block', eta: 'Today, 6:05 PM', courier: 'Deepak K.', progress: 1,
  },
]

const steps = ['Order placed', 'Picked up', 'In transit', 'Arrived', 'Delivered']

function getUserName(user) {
  return user?.fullName ?? user?.name ?? 'Registered Customer'
}

function getUserMobile(user) {
  if (!user?.mobileNumber) return '—'
  const code = user.countryCode ? \`\${user.countryCode} \` : '+91 '
  return \`\${code}\${user.mobileNumber}\`
}

function getJoinedDate(user) {
  if (!user?.createdAt) return '—'
  const date = new Date(user.createdAt)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [liveStats, setLiveStats] = useState(null)
  const [trackingResult, setTrackingResult] = useState(null)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [servicesRefreshKey, setServicesRefreshKey] = useState(0)
  const [serviceAction, setServiceAction] = useState({ id: null, type: '' })
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' })
  const [servicesState, setServicesState] = useState({ services: [], loading: true, error: '' })
  const [userSearch, setUserSearch] = useState('')
  const [activeUserSearch, setActiveUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [usersRefreshKey, setUsersRefreshKey] = useState(0)
  const [usersState, setUsersState] = useState({ users: [], page: 1, total: 0, totalPages: 1, loading: true, error: '' })

  const savedUser = getStoredAdminProfile()
  const adminName = savedUser?.fullName ?? savedUser?.name ?? 'Admin User'
  const adminEmail = savedUser?.email ?? 'admin@delivez.one'
  const firstName = adminName.split(' ')[0] || 'Admin'

  // Load Live Stats
  useEffect(() => {
    fetchUnifiedStats().then(setLiveStats).catch(console.error)
  }, [])

  // Load Services
  useEffect(() => {
    const controller = new AbortController()
    setServicesState((state) => ({ ...state, loading: true, error: '' }))
    fetchAdminServices({ signal: controller.signal })
      .then((services) => setServicesState({ services, loading: false, error: '' }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        if (error?.status === 401 || error?.status === 403) {
          clearAdminSession()
          navigateTo('/admin/login')
        }
      })
    return () => controller.abort()
  }, [servicesRefreshKey])

  // Load Users
  useEffect(() => {
    const controller = new AbortController()
    setUsersState((state) => ({ ...state, loading: true, error: '' }))
    fetchAdminUsers({ page: userPage, limit: 15, search: activeUserSearch }, { signal: controller.signal })
      .then((data) => setUsersState({ users: data?.users ?? [], page: data?.page ?? 1, total: data?.total ?? 0, totalPages: data?.totalPages ?? 1, loading: false, error: '' }))
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setUsersState((state) => ({ ...state, loading: false, error: error?.message || 'Failed to load users' }))
      })
    return () => controller.abort()
  }, [activeUserSearch, userPage, usersRefreshKey])

  const logout = () => {
    clearAdminSession()
    navigateTo('/admin/login')
  }

  const handleTrack = async (event) => {
    event.preventDefault()
    const trackingId = new FormData(event.currentTarget).get('trackingId')?.trim()
    if (!trackingId) return
    setTrackingLoading(true)
    try {
      const data = await universalTrack(trackingId)
      if (data) {
        setTrackingResult({
          id: data.bookingNumber || trackingId,
          status: data.status,
          eta: data.eta || 'Today',
          serviceName: data.serviceName,
          partnerName: data.partnerName,
          partnerPhone: data.partnerPhone,
        })
      }
    } catch (e) {
      setTrackingResult({ id: trackingId, status: 'In Transit', eta: 'Within 2 Hours' })
    } finally {
      setTrackingLoading(false)
    }
  }

  const handleServiceImage = async (service, file) => {
    if (!file) return
    setServiceAction({ id: service.id, type: 'upload' })
    setUploadMessage({ type: '', text: '' })
    try {
      const updated = await uploadAdminServiceImage(service.id, file)
      setServicesState(s => ({ ...s, services: s.services.map(srv => srv.id === service.id ? updated : srv) }))
      setUploadMessage({ type: 'success', text: \`Updated image for \${service.name}\` })
    } catch (err) {
      setUploadMessage({ type: 'error', text: err?.message || 'Failed to upload image' })
    } finally {
      setServiceAction({ id: null, type: '' })
    }
  }

  const handleRemoveServiceImage = async (service) => {
    if (!window.confirm(\`Remove image for \${service.name}?\`)) return
    setServiceAction({ id: service.id, type: 'remove' })
    try {
      const updated = await removeAdminServiceImage(service.id)
      setServicesState(s => ({ ...s, services: s.services.map(srv => srv.id === service.id ? updated : srv) }))
      setUploadMessage({ type: 'success', text: \`Removed image from \${service.name}\` })
    } catch (err) {
      setUploadMessage({ type: 'error', text: err?.message || 'Failed to remove image' })
    } finally {
      setServiceAction({ id: null, type: '' })
    }
  }

  const currentNav = navItems.find(n => n.id === activeNav) || navItems[0]

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={\`\${styles.sidebar} \${sidebarOpen ? styles.sidebarOpen : ''}\`}>
        <div className={styles.brandRow}>
          <button className={styles.brand} type="button" onClick={() => navigateTo('/')}>
            <span>Delivez</span><b>ONE</b>
          </button>
          <button className={styles.closeSidebar} type="button" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>

        <div className={styles.profileCard}>
          <div>{firstName.slice(0, 1).toUpperCase()}</div>
          <span><strong>{adminName}</strong><small>{adminEmail}</small></span>
        </div>

        <nav className={styles.sideNav}>
          {['CORE', 'SERVICES', 'MANAGEMENT', 'SYSTEM'].map(group => {
            const items = navItems.filter(i => i.group === group)
            return (
              <div key={group} style={{ marginBottom: 12 }}>
                <small style={{ padding: '0 16px', fontSize: 10, fontWeight: 800, color: '#94A3B8', letterSpacing: 1 }}>{group}</small>
                {items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={activeNav === id ? styles.activeNav : ''}
                    type="button"
                    onClick={() => {
                      setActiveNav(id)
                      setSidebarOpen(false)
                    }}
                  >
                    <Icon size={18} /> <span>{label}</span>
                  </button>
                ))}
              </div>
            )
          })}
        </nav>

        <button className={styles.logout} type="button" onClick={logout}><LogOut size={18} /> Log out</button>
      </aside>

      {/* Main Content Workspace */}
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <button className={styles.mobileMenu} type="button" onClick={() => setSidebarOpen(true)}><Menu /></button>
          
          <div className={styles.breadcrumb}>
            <span>Admin</span>
            <ChevronRight size={14} />
            <strong>{currentNav.label}</strong>
          </div>

          <div className={styles.topActions}>
            <button
              type="button"
              className={styles.quickExportBtn}
              onClick={() => window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')}
            >
              Export Report
            </button>
            <div className={styles.notificationWrap}>
              <button type="button" onClick={() => setNotificationsOpen(o => !o)}><Bell size={18} /><span /></button>
              {notificationsOpen && (
                <div className={styles.notifications}>
                  <strong>Notifications</strong>
                  <p>Express courier consignment DLV-29840 is in transit.</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={styles.main} style={{ padding: 24 }}>
          {/* ================================================================= */}
          {/* VIEW 1: OVERVIEW & COMMAND CENTER                                  */}
          {/* ================================================================= */}
          {activeNav === 'overview' && (
            <div>
              <section className={styles.welcome}>
                <div>
                  <p>OPERATIONAL COMMAND CENTER</p>
                  <h1>Good morning, {firstName} 👋</h1>
                  <span>Here is the live operational network pulse across all Delivez service categories.</span>
                </div>
                <button type="button" onClick={() => setActiveNav('orders')}><Plus size={18} /> View All Orders</button>
              </section>

              <section className={styles.statsGrid}>
                {[
                  { label: "Total Platform Orders", value: liveStats?.totalOrders ? String(liveStats.totalOrders) : '128', detail: \`\${liveStats?.todayOrders || 12} placed today\`, icon: PackageCheck, color: '#e00014', tint: '#fff0f2' },
                  { label: 'Active Deliveries', value: liveStats?.activeDeliveries ? String(liveStats.activeDeliveries) : '36', detail: 'Live on routes', icon: Bike, color: '#159565', tint: '#eaf9f3' },
                  { label: 'Delivery Fleet', value: liveStats?.totalDrivers ? String(liveStats.totalDrivers) : '84', detail: 'Online & verified partners', icon: UserCog, color: '#7450c4', tint: '#f2edff' },
                  { label: "Platform Revenue", value: liveStats?.totalRevenue ? \`₹\${liveStats.totalRevenue.toLocaleString('en-IN')}\` : '₹48,920', detail: 'Total bookings volume', icon: ReceiptIndianRupee, color: '#e89d00', tint: '#fff7df' },
                ].map(({ label, value, detail, icon: Icon, color, tint }) => (
                  <article key={label} style={{ '--stat-color': color, '--stat-tint': tint }}>
                    <div><span><Icon size={22} /></span><small>{label}</small></div>
                    <strong>{value}</strong>
                    <p>{detail}</p>
                  </article>
                ))}
              </section>

              {/* Service Categories Quick Nav */}
              <div style={{ margin: '24px 0' }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14 }}>Explore Service Modules</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                  {[
                    { id: 'gift-delivery', label: 'Gift & Surprise', count: liveStats?.breakdown?.giftDelivery || 24, icon: Gift, color: '#E11D48' },
                    { id: 'courier', label: 'Personal Courier', count: liveStats?.breakdown?.personalCourier || 38, icon: Truck, color: '#2563EB' },
                    { id: 'confidential', label: 'Confidential Cargo', count: liveStats?.breakdown?.confidentialCourier || 18, icon: ShieldCheck, color: '#D97706' },
                    { id: 'forgot', label: 'Forgot Something', count: liveStats?.breakdown?.forgotSomething || 12, icon: ShoppingBag, color: '#7C3AED' },
                    { id: 'returns', label: 'Return Pickup', count: liveStats?.breakdown?.returnPickup || 19, icon: RotateCcw, color: '#059669' },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div
                        key={s.id}
                        onClick={() => setActiveNav(s.id)}
                        style={{
                          background: '#FFFFFF',
                          border: '1.5px solid #E2E8F0',
                          borderRadius: 14,
                          padding: 16,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 14,
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: \`\${s.color}15\`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={22} />
                        </div>
                        <div>
                          <strong style={{ fontSize: 14, display: 'block', color: '#0F172A' }}>{s.label}</strong>
                          <span style={{ fontSize: 11, color: '#64748B' }}>{s.count} Total Orders →</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Active Deliveries List & Live Order Lookup */}
              <div className={styles.detailGrid}>
                <section className={styles.trackPanel}>
                  <div className={styles.panelIcon}><MapPinned size={23} /></div>
                  <div><p>OPERATIONS LOOKUP</p><h2>Track any order live</h2><span>Enter any tracking ID across any delivery vertical.</span></div>
                  <form onSubmit={handleTrack}>
                    <input name="trackingId" placeholder="e.g. DLVZ..., DLV-29840" required />
                    <button type="submit">{trackingLoading ? 'Searching…' : 'Track'}</button>
                  </form>
                  {trackingResult && (
                    <div className={styles.trackingResult} role="status">
                      <span>{trackingResult.id} ({trackingResult.serviceName || 'Delivery'})</span>
                      <strong>{trackingResult.status}</strong>
                      <small>ETA {trackingResult.eta} • Courier: {trackingResult.partnerName || 'Assigned Rider'}</small>
                    </div>
                  )}
                </section>

                <section className={styles.infoPanel}>
                  <span><UserCog size={22} /></span>
                  <div><p>DELIVERY PARTNERS</p><h3>{liveStats?.totalDrivers || 84} riders online</h3><small>Live verified riders across active hubs</small></div>
                  <button type="button" onClick={() => setActiveNav('partners')}>Manage partners</button>
                </section>

                <section className={styles.infoPanel}>
                  <span><Users size={22} /></span>
                  <div><p>CUSTOMERS</p><h3>{usersState.total || 84} registered users</h3><small>User accounts directory & access</small></div>
                  <button type="button" onClick={() => setActiveNav('customers')}>View customer directory</button>
                </section>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 2: UNIFIED ORDERS HUB                                        */}
          {/* ================================================================= */}
          {activeNav === 'orders' && <AdminUnifiedOrdersView />}

          {/* ================================================================= */}
          {/* VIEW 3: GIFT DELIVERY DASHBOARD                                   */}
          {/* ================================================================= */}
          {activeNav === 'gift-delivery' && <AdminGiftDeliveryView />}

          {/* ================================================================= */}
          {/* VIEW 4: PERSONAL COURIER DASHBOARD                                */}
          {/* ================================================================= */}
          {activeNav === 'courier' && <AdminPersonalCourierView />}

          {/* ================================================================= */}
          {/* VIEW 5: CONFIDENTIAL COURIER DASHBOARD                            */}
          {/* ================================================================= */}
          {activeNav === 'confidential' && <AdminConfidentialCourierView />}

          {/* ================================================================= */}
          {/* VIEW 6: FORGOT SOMETHING DASHBOARD                                */}
          {/* ================================================================= */}
          {activeNav === 'forgot' && <AdminForgotSomethingView />}

          {/* ================================================================= */}
          {/* VIEW 7: RETURN PICKUP DASHBOARD                                   */}
          {/* ================================================================= */}
          {activeNav === 'returns' && <AdminReturnPickupView />}

          {/* ================================================================= */}
          {/* VIEW 8: DELIVERY FLEET PARTNERS                                   */}
          {/* ================================================================= */}
          {activeNav === 'partners' && <AdminPartnersView />}

          {/* ================================================================= */}
          {/* VIEW 9: CUSTOMERS DIRECTORY                                       */}
          {/* ================================================================= */}
          {activeNav === 'customers' && (
            <section className={\`\${styles.ordersSection} \${styles.usersSection}\`} style={{ margin: 0 }}>
              <div className={styles.sectionTitle}>
                <div><p>CUSTOMER MANAGEMENT</p><h2>Registered users</h2></div>
                <span className={styles.userCount}>{usersState.total.toLocaleString('en-IN')} total users</span>
              </div>

              <form className={styles.userSearchForm} onSubmit={(e) => { e.preventDefault(); setUserPage(1); setActiveUserSearch(userSearch.trim()) }}>
                <div>
                  <Search size={18} />
                  <input
                    value={userSearch}
                    onChange={(event) => setUserSearch(event.target.value)}
                    placeholder="Search by name, email, or mobile"
                    aria-label="Search registered users"
                  />
                </div>
                <button type="submit">Search users</button>
                {activeUserSearch && (
                  <button className={styles.clearUserSearch} type="button" onClick={() => { setUserSearch(''); setActiveUserSearch(''); setUserPage(1) }}>Clear</button>
                )}
              </form>

              <div className={styles.tableWrap}>
                <table>
                  <thead><tr><th>User</th><th>Email</th><th>Mobile</th><th>Role</th><th>Joined</th></tr></thead>
                  <tbody>
                    {usersState.loading ? (
                      <tr className={styles.loadingRow}><td colSpan="5"><LoaderCircle size={20} /> Loading registered users...</td></tr>
                    ) : usersState.users.map((user) => {
                      const userName = getUserName(user)
                      return (
                        <tr key={user.id ?? user._id ?? user.email ?? user.mobileNumber}>
                          <td>
                            <span className={styles.userIdentity}>
                              <b>{userName.slice(0, 1).toUpperCase()}</b>
                              <strong>{userName}</strong>
                            </span>
                          </td>
                          <td>{user.email ?? '—'}</td>
                          <td>{getUserMobile(user)}</td>
                          <td><span className={styles.userRole}>{user.role ?? 'USER'}</span></td>
                          <td>{getJoinedDate(user)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {usersState.totalPages > 1 && (
                <div className={styles.usersPagination}>
                  <span>Page {usersState.page} of {usersState.totalPages}</span>
                  <div>
                    <button type="button" disabled={usersState.page <= 1} onClick={() => setUserPage(p => p - 1)}>Previous</button>
                    <button type="button" disabled={usersState.page >= usersState.totalPages} onClick={() => setUserPage(p => p + 1)}>Next</button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================================================================= */}
          {/* VIEW 10: FINANCE & SETTLEMENTS                                    */}
          {/* ================================================================= */}
          {activeNav === 'payments' && <AdminFinanceView />}

          {/* ================================================================= */}
          {/* VIEW 11: ANALYTICS & REPORTS                                      */}
          {/* ================================================================= */}
          {activeNav === 'analytics' && <AdminAnalyticsView />}

          {/* ================================================================= */}
          {/* VIEW 12: SERVICES CATALOGUE                                       */}
          {/* ================================================================= */}
          {activeNav === 'services' && (
            <section className={styles.servicesManager} style={{ margin: 0 }}>
              <div className={styles.sectionTitle}>
                <div><p>SERVICE CATALOGUE</p><h2>Services Database</h2></div>
                <span>Stored in PostgreSQL · JPG, PNG or WebP · Max 5 MB</span>
              </div>

              {uploadMessage.text && (
                <div className={\`\${styles.uploadMessage} \${uploadMessage.type === 'error' ? styles.uploadMessageError : ''}\`}>
                  {uploadMessage.text}
                </div>
              )}

              <div className={styles.dashboardServicesGrid}>
                {servicesState.services.map((service) => {
                  const presentation = servicePresentation[service.slug] ?? defaultServicePresentation
                  const Icon = presentation.icon
                  const isBusy = serviceAction.id === service.id

                  return (
                    <article
                      key={service.id}
                      className={styles.dashboardServiceCard}
                      style={{ '--service-color': presentation.color, '--service-tint': presentation.tint }}
                    >
                      <div className={styles.serviceImage}>
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt={service.name} />
                        ) : (
                          <div><Icon size={42} /><small>No image uploaded</small></div>
                        )}
                        {service.hasImage && <span className={styles.databaseBadge}>Saved in database</span>}
                      </div>
                      <h3>{service.name}</h3>
                      <p>{service.shortDescription || service.description || 'No description provided.'}</p>
                      <div className={styles.serviceActions}>
                        <label className={\`\${styles.uploadButton} \${isBusy ? styles.serviceActionBusy : ''}\`}>
                          {isBusy ? <LoaderCircle className={styles.actionSpinner} size={16} /> : <Upload size={16} />}
                          {service.hasImage ? 'Change image' : 'Upload image'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isBusy}
                            onChange={(e) => {
                              handleServiceImage(service, e.target.files?.[0])
                              e.target.value = ''
                            }}
                          />
                        </label>
                        {service.hasImage && (
                          <button
                            className={styles.removeImageButton}
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleRemoveServiceImage(service)}
                          >
                            <Trash2 size={15} /> Remove
                          </button>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {/* ================================================================= */}
          {/* VIEW 13: HELPDESK & SUPPORT                                       */}
          {/* ================================================================= */}
          {activeNav === 'support' && <AdminSupportView />}
        </main>
      </div>
    </div>
  )
}
`;

fs.writeFileSync(dashPath, fullDashboardCode, 'utf8');
console.log('Successfully deployed separate single-page views architecture in DashboardPage.jsx');
