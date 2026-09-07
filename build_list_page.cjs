const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const pageDir = path.join(webRoot, 'src', 'pages', 'return-pickup');

const listJsx = `import React, { useState, useEffect } from 'react'
import {
  Undo2,
  Package,
  Search,
  Plus,
  ArrowRight,
  Truck,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Store,
  MapPin,
  Loader2,
  CalendarDays
} from 'lucide-react'
import { fetchReturnPickupBookings } from '@/features/return-pickup/services/returnPickupService.js'
import styles from './ReturnPickupListPage.module.css'

export default function ReturnPickupListPage() {
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  const loadBookings = async () => {
    setLoading(true)
    try {
      const res = await fetchReturnPickupBookings({ status: activeTab, search: searchQuery })
      if (res?.bookings) {
        setBookings(res.bookings)
      } else {
        setBookings([])
      }
    } catch (err) {
      console.warn('Could not fetch return bookings from API, using fallback sample:', err)
      setBookings([
        {
          id: 'DRVZ-RET-080525-00123',
          bookingNumber: 'DRVZ-RET-080525-00123',
          status: 'DELIVERED',
          destinationName: 'ABC Retail Returns Hub',
          itemDescription: 'Sony Wireless Headphones (Black)',
          itemQuantity: 1,
          totalAmount: 108.00,
          scheduledDate: '08 May 2026',
          scheduledTimeSlot: '11:00 AM - 1:00 PM',
          deliveryService: 'STANDARD',
          pickupCity: 'Bengaluru'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [activeTab])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadBookings()
  }

  return (
    <div className={styles.listPageWrapper}>
      {/* Header */}
      <header className={styles.listHeader}>
        <div className={styles.headerInner}>
          <div className={styles.titleCol}>
            <div className={styles.badgeRow}>
              <span className={styles.brandBadge}>DELIVEZ BACK</span>
              <span className={styles.secureTag}>
                <ShieldCheck size={13} /> 100% Damage Protected
              </span>
            </div>
            <h1>My Return Pickups</h1>
            <p>Track, manage, and download invoices for all your return shipments.</p>
          </div>

          <button
            type="button"
            className={styles.newReturnBtn}
            onClick={() => window.location.href = '/book/return-pickup'}
          >
            <Plus size={16} />
            <span>Book New Return</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.listContainer}>
        {/* Filter Tabs & Search Bar */}
        <div className={styles.controlsRow}>
          <div className={styles.tabsList}>
            {[
              { id: 'ALL', label: 'All Returns' },
              { id: 'ACTIVE', label: 'In Progress' },
              { id: 'COMPLETED', label: 'Delivered' },
              { id: 'CANCELLED', label: 'Cancelled' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={activeTab === tab.id ? styles.activeTab : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Search by ID, product, or store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className={styles.loadingBox}>
            <Loader2 className={styles.spinner} size={32} color="#d97706" />
            <span>Loading your returns...</span>
          </div>
        ) : bookings.length === 0 ? (
          <div className={styles.emptyBox}>
            <Package size={48} color="#cbd5e1" />
            <h3>No returns found</h3>
            <p>You haven't placed any return pickup requests under this filter.</p>
            <button
              type="button"
              className={styles.emptyActionBtn}
              onClick={() => window.location.href = '/book/return-pickup'}
            >
              <Plus size={16} />
              <span>Book a Return Pickup</span>
            </button>
          </div>
        ) : (
          <div className={styles.bookingCardsGrid}>
            {bookings.map(b => {
              const isDelivered = b.status === 'DELIVERED'
              const isCancelled = b.status === 'CANCELLED'
              return (
                <article key={b.id || b.bookingNumber} className={styles.returnCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <span className={styles.storeBadge}>
                        <Store size={14} /> {b.destinationName || 'Seller Hub'}
                      </span>
                      <strong className={styles.bookingNumberText}>{b.bookingNumber || b.id}</strong>
                    </div>
                    <span className={\`\${styles.statusBadge} \${styles[b.status] || ''}\`}>
                      {isDelivered ? 'Delivered' : isCancelled ? 'Cancelled' : b.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.itemTitleRow}>
                      <Package size={18} color="#d97706" />
                      <div>
                        <strong>{b.itemDescription || 'Electronic / Retail Item'}</strong>
                        <small>Qty: {b.itemQuantity || 1} • {b.deliveryService || 'Standard'} Speed</small>
                      </div>
                    </div>

                    <div className={styles.cardMetaGrid}>
                      <div className={styles.metaItem}>
                        <CalendarDays size={14} color="#64748b" />
                        <span>Pickup: {b.scheduledDate || 'Today'} ({b.scheduledTimeSlot || '11 AM - 1 PM'})</span>
                      </div>
                      <div className={styles.metaItem}>
                        <MapPin size={14} color="#64748b" />
                        <span>City: {b.pickupCity || 'Bengaluru'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.priceCol}>
                      <small>Total Amount</small>
                      <strong>₹{(Number(b.totalAmount) || 108).toFixed(2)}</strong>
                    </div>

                    <div className={styles.actionButtonsRow}>
                      <button
                        type="button"
                        className={styles.detailsBtn}
                        onClick={() => window.location.href = \`/return-pickup/details/\${b.bookingNumber || b.id}\`}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className={styles.trackBtn}
                        onClick={() => window.location.href = \`/track/return-pickup/\${b.bookingNumber || b.id}\`}
                      >
                        <span>Track Live</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
`;

const listCss = `/* ReturnPickupListPage.module.css */
.listPageWrapper {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
}

.listHeader {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.headerInner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badgeRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.brandBadge {
  background: #fef3c7;
  color: #b45309;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
}

.secureTag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #ecfdf5;
  color: #059669;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
}

.titleCol h1 {
  font-size: 1.6rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 4px;
}

.titleCol p {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0;
}

.newReturnBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(217, 119, 6, 0.25);
}

/* List Container */
.listContainer {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 24px 80px;
}

.controlsRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.tabsList {
  display: flex;
  gap: 8px;
}

.tabsList button {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
}

.tabsList button.activeTab {
  background: #d97706;
  color: #ffffff;
  border-color: #d97706;
}

.searchForm {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 14px;
  width: 300px;
}

.searchForm input {
  border: none;
  outline: none;
  font-size: 0.85rem;
  color: #0f172a;
  width: 100%;
}

.loadingBox,
.emptyBox {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 60px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
}

.emptyBox h3 {
  font-size: 1.15rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.emptyBox p {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0;
}

.emptyActionBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  margin-top: 8px;
  cursor: pointer;
}

.bookingCardsGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.returnCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.cardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 14px;
}

.cardHeaderLeft {
  display: flex;
  align-items: center;
  gap: 10px;
}

.storeBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #fef3c7;
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.bookingNumberText {
  font-size: 0.95rem;
  color: #0f172a;
}

.statusBadge {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  background: #fef3c7;
  color: #b45309;
}

.statusBadge.DELIVERED {
  background: #dcfce7;
  color: #166534;
}

.statusBadge.CANCELLED {
  background: #fee2e2;
  color: #991b1b;
}

.cardBody {
  margin-bottom: 16px;
}

.itemTitleRow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.itemTitleRow strong {
  display: block;
  font-size: 0.95rem;
  color: #0f172a;
}

.itemTitleRow small {
  font-size: 0.8rem;
  color: #64748b;
}

.cardMetaGrid {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.metaItem {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.82rem;
  color: #64748b;
}

.cardFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.priceCol small {
  display: block;
  font-size: 0.7rem;
  color: #64748b;
}

.priceCol strong {
  font-size: 1.05rem;
  color: #0f172a;
}

.actionButtonsRow {
  display: flex;
  gap: 8px;
}

.detailsBtn {
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.trackBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .headerInner,
  .controlsRow,
  .cardHeader,
  .cardFooter {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .searchForm {
    width: 100%;
  }
}
`;

fs.writeFileSync(path.join(pageDir, 'ReturnPickupListPage.jsx'), listJsx);
fs.writeFileSync(path.join(pageDir, 'ReturnPickupListPage.module.css'), listCss);
console.log('✓ ReturnPickupListPage.jsx & CSS written');
