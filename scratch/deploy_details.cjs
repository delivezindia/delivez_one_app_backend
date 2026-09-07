const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const pagesDir = path.join(webRoot, 'src/pages/gift-delivery');

// -------------------------------------------------------------
// 1. GiftDeliveryDetailsPage.jsx
// -------------------------------------------------------------
const detailsJsx = `import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Printer,
  Gift,
  MapPin,
  Calendar,
  Shield,
  Clock,
  User,
  CreditCard,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  Navigation
} from 'lucide-react'
import {
  fetchGiftDeliveryBookingById,
  fetchGiftDeliveryInvoice
} from '@/features/gift-delivery/services/giftDeliveryService.js'
import styles from './GiftDeliveryDetailsPage.module.css'

export default function GiftDeliveryDetailsPage({ bookingId }) {
  const [booking, setBooking] = useState(null)
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const b = await fetchGiftDeliveryBookingById(bookingId)
        setBooking(b)
        try {
          const inv = await fetchGiftDeliveryInvoice(bookingId)
          setInvoice(inv)
        } catch {
          // invoice optional
        }
      } catch (err) {
        console.error('Failed to load gift details:', err)
      } finally {
        setLoading(false)
      }
    }
    if (bookingId) loadData()
  }, [bookingId])

  const handlePrint = () => {
    window.print()
  }

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Gift size={32} className={styles.pulse} />
        <p>Loading gift order details...</p>
      </div>
    )
  }

  return (
    <div className={styles.detailsPage}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => (window.location.href = '/user/dashboard')}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>Gift Order Details</h2>
        <button type="button" className={styles.printBtn} onClick={handlePrint} title="Print Invoice">
          <Printer size={18} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {/* Order Header Card */}
        <div className={styles.card}>
          <div className={styles.orderHeaderRow}>
            <div>
              <span className={styles.metaLabel}>Order Number</span>
              <div className={styles.orderNumberRow}>
                <strong className={styles.orderNumber}>{booking?.bookingNumber || bookingId}</strong>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopyId(booking?.bookingNumber || bookingId)}
                >
                  {copiedId ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <span className={\`\${styles.statusBadge} \${styles['status_' + (booking?.status || 'CONFIRMED')]}\`}>
              {booking?.status || 'CONFIRMED'}
            </span>
          </div>
        </div>

        {/* Gift Product Summary */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Item Information</h3>
          <div className={styles.giftRow}>
            <img
              src={booking?.gift?.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80'}
              alt={booking?.gift?.name}
              className={styles.giftImg}
            />
            <div className={styles.giftInfo}>
              <strong>{booking?.gift?.name || 'Chocolate Truffle Cake'}</strong>
              <p>{booking?.gift?.description}</p>
              <div className={styles.tagsRow}>
                <span>Qty: {booking?.gift?.quantity || 1}</span>
                {booking?.gift?.weight && <span>Weight: {booking.gift.weight}</span>}
                {booking?.gift?.serves && <span>Serves: {booking.gift.serves}</span>}
              </div>
              <strong className={styles.giftPrice}>₹{booking?.gift?.price}</strong>
            </div>
          </div>

          {booking?.gift?.message && (
            <div className={styles.greetingCardBox}>
              <div className={styles.cardThemeHeader}>
                <Gift size={16} />
                <span>Greeting Card: {booking.gift.greetingCard?.name || 'Happy Birthday Celebration'}</span>
              </div>
              <p className={styles.cardMessageText}>"{booking.gift.message}"</p>
            </div>
          )}
        </div>

        {/* Delivery & Schedule */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Recipient & Delivery Schedule</h3>
          <div className={styles.infoRow}>
            <User size={16} />
            <div>
              <span className={styles.infoLabel}>Deliver to:</span>
              <strong>{booking?.recipient?.name || 'Rahul Sharma'} ({booking?.recipient?.phone})</strong>
            </div>
          </div>
          <div className={styles.infoRow}>
            <MapPin size={16} />
            <div>
              <span className={styles.infoLabel}>Delivery Address:</span>
              <p>{booking?.recipient?.address}, {booking?.recipient?.city} - {booking?.recipient?.postalCode}</p>
            </div>
          </div>
          <div className={styles.infoRow}>
            <Calendar size={16} />
            <div>
              <span className={styles.infoLabel}>Scheduled Date & Time:</span>
              <p>{booking?.scheduledDate} ({booking?.scheduledTimeSlot}) • {booking?.deliveryType}</p>
            </div>
          </div>
        </div>

        {/* Itemized Bill / Invoice */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <h3 className={styles.cardTitle}>Payment Receipt & Tax Invoice</h3>
            <span className={styles.sacBadge}>SAC: 996812</span>
          </div>

          <div className={styles.receiptLine}>
            <span>Item Total</span>
            <span>₹{booking?.itemTotal || 699}</span>
          </div>
          <div className={styles.receiptLine}>
            <span>Delivery Charges ({booking?.deliveryType || 'Standard'})</span>
            <span>₹{booking?.deliveryCharge || 49}</span>
          </div>
          <div className={styles.receiptLine}>
            <span>Packaging & Premium Box</span>
            <span>₹{booking?.packagingCharge || 20}</span>
          </div>
          {booking?.addonsTotal > 0 && (
            <div className={styles.receiptLine}>
              <span>Add-ons & Premium Setup</span>
              <span>₹{booking.addonsTotal}</span>
            </div>
          )}
          {booking?.discountAmount > 0 && (
            <div className={\`\${styles.receiptLine} \${styles.discountText}\`}>
              <span>Discount</span>
              <span>-₹{booking.discountAmount}</span>
            </div>
          )}
          <div className={styles.receiptLine}>
            <span>Taxes (GST 18%)</span>
            <span>₹{booking?.taxAmount || 38}</span>
          </div>
          <div className={\`\${styles.receiptLine} \${styles.totalRow}\`}>
            <strong>Grand Total</strong>
            <strong>₹{booking?.totalAmount || 806}</strong>
          </div>
          <div className={styles.paymentMethodLine}>
            <span>Paid via: <strong>{booking?.paymentMethod || 'UPI'}</strong></span>
            <span>Ref: {booking?.paymentReference || 'PAY-GIFT-1234'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actionsGrid}>
          <button
            type="button"
            className={styles.trackBtn}
            onClick={() => {
              window.location.href = \`/gift-delivery/track/\${booking?.bookingNumber || bookingId}\`
            }}
          >
            <Navigation size={16} /> Track Live Delivery
          </button>
        </div>
      </main>
    </div>
  )
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryDetailsPage.jsx'), detailsJsx, 'utf8');
console.log('Created GiftDeliveryDetailsPage.jsx');

// -------------------------------------------------------------
// 2. GiftDeliveryDetailsPage.module.css
// -------------------------------------------------------------
const detailsCss = `.detailsPage {
  min-height: 100vh;
  background-color: #F8FAFC;
  color: #0F172A;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 60px;
}

.header {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}

.backBtn, .printBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  color: #1E293B;
}

.header h2 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}

.mainContent {
  max-width: 680px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
}

.orderHeaderRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.metaLabel {
  font-size: 11px;
  color: #94A3B8;
  display: block;
}

.orderNumberRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.orderNumber {
  font-size: 17px;
  font-weight: 900;
  color: #0F172A;
}

.copyBtn {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.statusBadge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.status_CONFIRMED, .status_DELIVERED {
  background: #DCFCE7;
  color: #15803D;
}

.cardTitle {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 12px 0;
}

.cardTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sacBadge {
  background: #F1F5F9;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.giftRow {
  display: flex;
  gap: 14px;
  margin-bottom: 12px;
}

.giftImg {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
}

.giftInfo {
  display: flex;
  flex-direction: column;
}

.giftInfo strong {
  font-size: 15px;
  color: #0F172A;
}

.giftInfo p {
  font-size: 12px;
  color: #64748B;
  margin: 2px 0 6px 0;
}

.tagsRow {
  display: flex;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
}

.giftPrice {
  font-size: 15px;
  font-weight: 800;
  color: #E11D48;
}

.greetingCardBox {
  background: #FFF1F2;
  border: 1px dashed #FECDD3;
  border-radius: 12px;
  padding: 12px;
}

.cardThemeHeader {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #BE185D;
  margin-bottom: 4px;
}

.cardMessageText {
  font-size: 13px;
  font-style: italic;
  color: #881337;
  margin: 0;
}

.infoRow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
}

.infoLabel {
  font-size: 11px;
  color: #94A3B8;
  display: block;
}

.receiptLine {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #475569;
  margin-bottom: 8px;
}

.discountText {
  color: #10B981;
  font-weight: 600;
}

.totalRow {
  border-top: 1px dashed #E2E8F0;
  padding-top: 10px;
  margin-top: 6px;
  font-size: 16px;
  color: #0F172A;
}

.paymentMethodLine {
  display: flex;
  justify-content: space-between;
  background: #F8FAFC;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #64748B;
  margin-top: 10px;
}

.actionsGrid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trackBtn {
  background: #0F172A;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.loadingContainer {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748B;
}

.pulse {
  animation: pulse 1.5s infinite;
  color: #E11D48;
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryDetailsPage.module.css'), detailsCss, 'utf8');
console.log('Created GiftDeliveryDetailsPage.module.css');
