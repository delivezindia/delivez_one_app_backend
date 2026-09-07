const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const pagesDir = path.join(webRoot, 'src/pages/gift-delivery');

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
  updateGiftDeliveryStatus
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
        <div className={styles.headerContainer}>
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
            <span>Order ID: {tracking?.orderId || idToTrack}</span>
          </div>
          <button type="button" className={styles.refreshBtn} onClick={loadTracking} title="Refresh Live GPS">
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        {error && (
          <div className={styles.errorBanner}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Desktop Left Column: Live Map & Partner */}
        <div className={styles.leftTrackingCol}>
          {/* Live Simulated Map Banner */}
          <div className={styles.mapContainer}>
            <div className={styles.mapOverlay}>
              <div className={styles.mapPinHub}>
                <Gift size={18} />
                <span>Artisan Hub</span>
              </div>
              <div className={styles.mapRouteLine} />
              <div className={styles.mapPinPartner}>
                <Navigation size={20} className={styles.partnerNavIcon} />
                <span>{partner?.name || 'Delivery Partner'}</span>
              </div>
              <div className={styles.mapPinDest}>
                <MapPin size={20} />
                <span>{booking?.recipient?.name || 'Recipient'}</span>
              </div>
            </div>

            <div className={styles.mapEtaCard}>
              <Clock size={20} className={styles.etaIcon} />
              <div>
                <span className={styles.etaLabel}>Estimated Arrival</span>
                <strong className={styles.etaTime}>{tracking?.eta || '15–20 mins'}</strong>
              </div>
              <span className={styles.etaDist}>{tracking?.distanceKm || '2.8 km away'}</span>
            </div>
          </div>

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
              <a href={\`tel:\${partner?.phone || '+919876543210'}\`} className={styles.partnerActionBtn} title="Call Driver">
                <Phone size={18} />
              </a>
              <button
                type="button"
                className={styles.partnerActionBtn}
                onClick={() => alert('Live driver chat is open!')}
                title="Message Partner"
              >
                <MessageCircle size={18} />
              </button>
            </div>
          </div>

          {/* Gift & Recipient Summary Card */}
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
                <span>Recipient: {booking?.recipient?.name || 'Rahul Sharma'}</span>
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
        </div>

        {/* Desktop Right Column: OTP, Milestones & Simulator */}
        <div className={styles.rightTrackingCol}>
          {/* Delivery OTP Card */}
          {tracking?.deliveryOtp && (
            <div className={styles.otpCard}>
              <div className={styles.otpLeft}>
                <div className={styles.otpIconCircle}>
                  <Lock size={20} />
                </div>
                <div>
                  <span className={styles.otpLabel}>Delivery Verification OTP</span>
                  <strong className={styles.otpNumber}>{tracking.deliveryOtp}</strong>
                  <p className={styles.otpHint}>Share with partner upon celebratory handover.</p>
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

          {/* Status Milestones Timeline */}
          <div className={styles.milestonesCard}>
            <h3 className={styles.cardHeading}>Live Delivery Milestones</h3>
            <div className={styles.milestonesList}>
              {milestones.map((m, idx) => (
                <div
                  key={m.key || idx}
                  className={\`\${styles.milestoneItem} \${m.completed ? styles.milestoneCompleted : ''}\`}
                >
                  <div className={styles.milestoneIcon}>
                    {m.completed ? <CheckCircle2 size={22} color="#10B981" /> : <Clock size={22} color="#94A3B8" />}
                  </div>
                  <div className={styles.milestoneDetails}>
                    <strong>{m.label}</strong>
                    <p>{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Simulator Toolbar */}
          <div className={styles.simulatorCard}>
            <div className={styles.simHeader}>
              <Sparkles size={16} color="#F59E0B" />
              <strong>Demo Status Simulator</strong>
            </div>
            <p>Advance order status to test live driver telemetry:</p>
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
        </div>
      </main>
    </div>
  )
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryTrackingPage.jsx'), trackingJsx, 'utf8');
console.log('Updated GiftDeliveryTrackingPage.jsx with 2-column desktop layout');
