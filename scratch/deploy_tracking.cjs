const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const pagesDir = path.join(webRoot, 'src/pages/gift-delivery');

// -------------------------------------------------------------
// 1. GiftDeliveryTrackingPage.jsx
// -------------------------------------------------------------
const trackingJsx = `import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Gift,
  Shield,
  Copy,
  Check,
  Navigation,
  FileText,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Lock
} from 'lucide-react'
import {
  trackGiftDeliveryBooking,
  verifyGiftDeliveryOtp,
  updateGiftDeliveryStatus,
  cancelGiftDeliveryBooking
} from '@/features/gift-delivery/services/giftDeliveryService.js'
import styles from './GiftDeliveryTrackingPage.module.css'

export default function GiftDeliveryTrackingPage({ bookingId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedOtp, setCopiedOtp] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('')
  const [simulatedStatus, setSimulatedStatus] = useState('')

  const idToTrack = bookingId || 'DLVZ56874291'

  const loadTracking = async () => {
    try {
      setError('')
      const res = await trackGiftDeliveryBooking(idToTrack)
      setData(res)
    } catch (err) {
      setError(err.message || 'Failed to load tracking data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracking()
    const interval = setInterval(loadTracking, 10000)
    return () => clearInterval(interval)
  }, [idToTrack])

  const handleVerifyOtp = async () => {
    if (!otpInput.trim()) return
    setIsVerifyingOtp(true)
    try {
      await verifyGiftDeliveryOtp(idToTrack, { otp: otpInput.trim() })
      setOtpSuccessMsg('OTP verified successfully! Order marked as DELIVERED.')
      loadTracking()
    } catch (err) {
      alert(err.message || 'Invalid OTP. Please check and try again.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleSimulateStatus = async (newStatus) => {
    try {
      await updateGiftDeliveryStatus(idToTrack, { status: newStatus })
      loadTracking()
    } catch (err) {
      alert('Status simulation updated locally.')
    }
  }

  const handleCopyOtp = (code) => {
    navigator.clipboard.writeText(code)
    setCopiedOtp(true)
    setTimeout(() => setCopiedOtp(false), 2000)
  }

  if (loading && !data) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw size={32} className={styles.spinner} />
        <p>Connecting to live delivery telemetry...</p>
      </div>
    )
  }

  const tracking = data?.tracking
  const booking = data?.booking
  const partner = tracking?.partner
  const milestones = tracking?.milestones || []

  return (
    <div className={styles.trackingPage}>
      {/* Top Bar */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => {
            window.location.href = '/book/gift-delivery'
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerTitle}>
          <h2>Live Gift Tracking</h2>
          <span>Order: {tracking?.orderId || idToTrack}</span>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadTracking}>
          <RefreshCw size={18} />
        </button>
      </header>

      <main className={styles.mainContent}>
        {error && (
          <div className={styles.errorBanner}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Live Simulated Map Banner */}
        <div className={styles.mapContainer}>
          <div className={styles.mapOverlay}>
            <div className={styles.mapPinHub}>
              <Gift size={16} />
              <span>Bakery / Hub</span>
            </div>
            <div className={styles.mapRouteLine} />
            <div className={styles.mapPinPartner}>
              <Navigation size={18} className={styles.partnerNavIcon} />
              <span>{partner?.name || 'Delivery Partner'}</span>
            </div>
            <div className={styles.mapPinDest}>
              <MapPin size={18} />
              <span>{booking?.recipient?.name || 'Recipient'}</span>
            </div>
          </div>

          <div className={styles.mapEtaCard}>
            <Clock size={18} className={styles.etaIcon} />
            <div>
              <span className={styles.etaLabel}>Estimated Arrival</span>
              <strong className={styles.etaTime}>{tracking?.eta || '15–20 mins'}</strong>
            </div>
            <span className={styles.etaDist}>{tracking?.distanceKm || '2.8 km away'}</span>
          </div>
        </div>

        {/* Delivery OTP Card */}
        {tracking?.deliveryOtp && (
          <div className={styles.otpCard}>
            <div className={styles.otpLeft}>
              <div className={styles.otpIconCircle}>
                <Lock size={18} />
              </div>
              <div>
                <span className={styles.otpLabel}>Delivery Verification OTP</span>
                <strong className={styles.otpNumber}>{tracking.deliveryOtp}</strong>
                <p className={styles.otpHint}>Share this OTP with partner upon celebratory handover.</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.copyOtpBtn}
              onClick={() => handleCopyOtp(tracking.deliveryOtp)}
            >
              {copiedOtp ? <Check size={16} /> : <Copy size={16} />}
              {copiedOtp ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}

        {/* Delivery Partner Details Card */}
        <div className={styles.partnerCard}>
          <div className={styles.partnerAvatar}>
            <span>RV</span>
          </div>
          <div className={styles.partnerInfo}>
            <div className={styles.partnerNameRow}>
              <strong>{partner?.name || 'Rajesh Verma'}</strong>
              <div className={styles.starBadge}>
                <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                <span>{partner?.rating || '4.9'}</span>
              </div>
            </div>
            <span className={styles.partnerVehicle}>{partner?.vehicle || 'Hero Electric - KA 05 EV 4321'}</span>
            <span className={styles.partnerHub}>{partner?.hub || 'Indiranagar Delivery Hub'}</span>
          </div>

          <div className={styles.partnerActions}>
            <a href={\`tel:\${partner?.phone || '+919876543210'}\`} className={styles.partnerActionBtn}>
              <Phone size={18} />
            </a>
            <button
              type="button"
              className={styles.partnerActionBtn}
              onClick={() => alert('Live driver chat open!')}
            >
              <MessageCircle size={18} />
            </button>
          </div>
        </div>

        {/* Status Milestones Timeline */}
        <div className={styles.milestonesCard}>
          <h3 className={styles.cardHeading}>Delivery Milestones</h3>
          <div className={styles.milestonesList}>
            {milestones.map((m, idx) => (
              <div
                key={m.key || idx}
                className={\`\${styles.milestoneItem} \${m.completed ? styles.milestoneCompleted : ''}\`}
              >
                <div className={styles.milestoneIcon}>
                  {m.completed ? <CheckCircle2 size={20} color="#10B981" /> : <Clock size={20} color="#94A3B8" />}
                </div>
                <div className={styles.milestoneDetails}>
                  <strong>{m.label}</strong>
                  <p>{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gift & Recipient Summary */}
        <div className={styles.summaryCard}>
          <h3 className={styles.cardHeading}>Gift & Delivery Details</h3>
          <div className={styles.giftSummaryRow}>
            <img
              src={booking?.gift?.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop&q=80'}
              alt={booking?.gift?.name}
              className={styles.giftThumb}
            />
            <div className={styles.giftSummaryInfo}>
              <strong>{booking?.gift?.name || 'Chocolate Truffle Cake'}</strong>
              <span>Qty: {booking?.gift?.quantity || 1} • {booking?.gift?.weight || '1 kg'}</span>
              <span>For: {booking?.recipient?.name || 'Rahul Sharma'}</span>
            </div>
          </div>

          {booking?.gift?.message && (
            <div className={styles.giftMessageBox}>
              <span className={styles.msgLabel}>Gift Card Message:</span>
              <p className={styles.msgText}>"{booking.gift.message}"</p>
            </div>
          )}

          <div className={styles.addressBox}>
            <MapPin size={16} />
            <p>{booking?.recipient?.address || 'B-101, Green Park, New Delhi - 110016'}</p>
          </div>
        </div>

        {/* Demo Simulator Toolbar */}
        <div className={styles.simulatorCard}>
          <div className={styles.simHeader}>
            <Sparkles size={16} color="#F59E0B" />
            <strong>Demo Status Simulator</strong>
          </div>
          <p>Instantly transition order status to test live milestone updates:</p>
          <div className={styles.simBtnsGrid}>
            <button type="button" onClick={() => handleSimulateStatus('PREPARING_GIFT')}>
              Preparing
            </button>
            <button type="button" onClick={() => handleSimulateStatus('GIFT_PACKED')}>
              Packed
            </button>
            <button type="button" onClick={() => handleSimulateStatus('ON_THE_WAY')}>
              On The Way
            </button>
            <button type="button" onClick={() => handleSimulateStatus('ARRIVED')}>
              Arrived
            </button>
            <button type="button" onClick={() => handleSimulateStatus('DELIVERED')}>
              Delivered
            </button>
          </div>

          {/* Quick OTP verification simulator */}
          <div className={styles.simOtpRow}>
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              value={otpInput}
              onChange={e => setOtpInput(e.target.value)}
            />
            <button type="button" onClick={handleVerifyOtp} disabled={isVerifyingOtp}>
              Verify OTP
            </button>
          </div>
          {otpSuccessMsg && <span className={styles.successNote}>{otpSuccessMsg}</span>}
        </div>
      </main>
    </div>
  )
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryTrackingPage.jsx'), trackingJsx, 'utf8');
console.log('Created GiftDeliveryTrackingPage.jsx');

// -------------------------------------------------------------
// 2. GiftDeliveryTrackingPage.module.css
// -------------------------------------------------------------
const trackingCss = `.trackingPage {
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.backBtn, .refreshBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  color: #1E293B;
}

.headerTitle {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.headerTitle h2 {
  font-size: 16px;
  font-weight: 800;
  margin: 0;
}

.headerTitle span {
  font-size: 11px;
  color: #64748B;
}

.mainContent {
  max-width: 680px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
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

.spinner {
  animation: spin 1s linear infinite;
  color: #E11D48;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.errorBanner {
  background: #FEE2E2;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

/* Map simulation */
.mapContainer {
  position: relative;
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #1E293B, #0F172A);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
}

.mapOverlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 20px;
}

.mapRouteLine {
  position: absolute;
  top: 50%;
  left: 20%;
  right: 20%;
  height: 3px;
  background: repeating-linear-gradient(90deg, #F59E0B, #F59E0B 8px, transparent 8px, transparent 16px);
  z-index: 1;
}

.mapPinHub, .mapPinDest, .mapPinPartner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 700;
  z-index: 2;
}

.mapPinPartner {
  background: #E11D48;
  padding: 8px 12px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.partnerNavIcon {
  color: #FFFFFF;
}

.mapEtaCard {
  position: absolute;
  bottom: 12px;
  left: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 5;
}

.etaIcon {
  color: #E11D48;
}

.etaLabel {
  font-size: 11px;
  color: #64748B;
  display: block;
}

.etaTime {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.etaDist {
  margin-left: auto;
  font-size: 12px;
  font-weight: 700;
  color: #10B981;
}

/* OTP Card */
.otpCard {
  background: #FEF3C7;
  border: 1.5px dashed #F59E0B;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.otpLeft {
  display: flex;
  align-items: center;
  gap: 14px;
}

.otpIconCircle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #FDE68A;
  color: #B45309;
  display: flex;
  align-items: center;
  justify-content: center;
}

.otpLabel {
  font-size: 11px;
  font-weight: 700;
  color: #92400E;
  display: block;
}

.otpNumber {
  font-size: 22px;
  font-weight: 900;
  color: #78350F;
  letter-spacing: 2px;
}

.otpHint {
  font-size: 11px;
  color: #B45309;
  margin: 2px 0 0 0;
}

.copyOtpBtn {
  background: #FFFFFF;
  border: 1px solid #FCD34D;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #92400E;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

/* Partner Card */
.partnerCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.partnerAvatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #0F172A;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 15px;
}

.partnerInfo {
  flex: 1;
}

.partnerNameRow {
  display: flex;
  align-items: center;
  gap: 8px;
}

.partnerNameRow strong {
  font-size: 15px;
  color: #0F172A;
}

.starBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #FEF3C7;
  color: #B45309;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.partnerVehicle {
  font-size: 12px;
  color: #64748B;
  display: block;
}

.partnerHub {
  font-size: 11px;
  color: #94A3B8;
  display: block;
}

.partnerActions {
  display: flex;
  gap: 8px;
}

.partnerActionBtn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #F1F5F9;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0F172A;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.partnerActionBtn:hover {
  background: #E2E8F0;
}

/* Milestones Card */
.milestonesCard, .summaryCard, .simulatorCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
}

.cardHeading {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 14px 0;
}

.milestonesList {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.milestoneItem {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  opacity: 0.5;
}

.milestoneCompleted {
  opacity: 1;
}

.milestoneIcon {
  margin-top: 2px;
}

.milestoneDetails strong {
  font-size: 14px;
  color: #0F172A;
  display: block;
}

.milestoneDetails p {
  font-size: 12px;
  color: #64748B;
  margin: 2px 0 0 0;
}

/* Summary Card */
.giftSummaryRow {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.giftThumb {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
}

.giftSummaryInfo {
  display: flex;
  flex-direction: column;
}

.giftSummaryInfo strong {
  font-size: 15px;
  color: #0F172A;
}

.giftSummaryInfo span {
  font-size: 12px;
  color: #64748B;
}

.giftMessageBox {
  background: #FFF1F2;
  border-left: 3px solid #E11D48;
  padding: 8px 12px;
  border-radius: 0 8px 8px 0;
  margin-bottom: 12px;
}

.msgLabel {
  font-size: 11px;
  font-weight: 700;
  color: #BE185D;
}

.msgText {
  font-size: 12px;
  font-style: italic;
  color: #881337;
  margin: 2px 0 0 0;
}

.addressBox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #475569;
}

/* Simulator Card */
.simHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.simulatorCard p {
  font-size: 12px;
  color: #64748B;
  margin: 0 0 12px 0;
}

.simBtnsGrid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-bottom: 12px;
}

@media (max-width: 520px) {
  .simBtnsGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.simBtnsGrid button {
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px 4px;
  font-size: 11px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.simBtnsGrid button:hover {
  background: #E2E8F0;
}

.simOtpRow {
  display: flex;
  gap: 8px;
}

.simOtpRow input {
  flex: 1;
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
}

.simOtpRow button {
  background: #10B981;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.successNote {
  font-size: 12px;
  font-weight: 700;
  color: #10B981;
  margin-top: 6px;
  display: block;
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryTrackingPage.module.css'), trackingCss, 'utf8');
console.log('Created GiftDeliveryTrackingPage.module.css');
