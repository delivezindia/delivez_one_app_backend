const fs = require('fs');
const path = require('path');

const target = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/forgot-something/ForgotSomethingTrackingPage.jsx';

const trackingJsx = `import { useEffect, useState } from 'react'
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Bike,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Headphones,
  Home,
  Loader2,
  Lock,
  MapPin,
  MapPinned,
  Package,
  Phone,
  Play,
  RotateCcw,
  Shield,
  ShieldCheck,
  Star,
  User,
  X,
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import {
  cancelForgotSomethingBooking,
  trackForgotSomethingBooking,
  updateForgotSomethingStatus,
  verifyForgotSomethingOtp,
} from '@/features/forgot-something/services/forgotSomethingService.js'
import styles from './ForgotSomethingTrackingPage.module.css'

export default function ForgotSomethingTrackingPage({ bookingId: initialId }) {
  const [identifier, setIdentifier] = useState(initialId || '')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)
  const [otpInput, setOtpInput] = useState('')
  const [otpType, setOtpType] = useState('PICKUP')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('Found the item at home')

  useEffect(() => {
    let id = initialId
    if (!id) {
      const match = window.location.pathname.match(/\\/(?:track\\/forgot-something|forgot-something\\/track|track)\\/([a-zA-Z0-9-]+)/)
      if (match) id = match[1]
    }
    if (id) {
      setIdentifier(id)
      loadTrackingData(id)
    } else {
      setLoading(false)
      setErrorMsg('No retrieval request ID provided.')
    }
  }, [initialId])

  const loadTrackingData = async (id) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await trackForgotSomethingBooking(id)
      setData(res)
    } catch (err) {
      console.error('Failed to load tracking data:', err)
      setErrorMsg(err?.message || 'Unable to retrieve tracking details.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyId = () => {
    if (data?.tracking?.bookingId) {
      navigator.clipboard.writeText(data.tracking.bookingId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSimulateStatus = async (nextStatus) => {
    try {
      await updateForgotSomethingStatus(identifier, nextStatus)
      loadTrackingData(identifier)
    } catch (err) {
      console.error('Simulation error:', err)
    }
  }

  const handleCancel = async () => {
    setCancelling(true)
    setErrorMsg('')
    try {
      await cancelForgotSomethingBooking(data?.booking?.id || identifier, cancelReason)
      setCancelModalOpen(false)
      loadTrackingData(identifier)
    } catch (err) {
      setErrorMsg(err?.message || 'Unable to cancel this request.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <div style={{ maxWidth: '600px', margin: '4rem auto', background: '#fff', padding: '3rem', borderRadius: '24px', textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="#d32f2f" style={{ margin: '0 auto' }} />
          <div style={{ marginTop: '1rem', fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
            Connecting to Delivez Live Telemetry...
          </div>
        </div>
      </div>
    )
  }

  const booking = data?.booking
  const tracking = data?.tracking
  const milestones = tracking?.milestones || []
  const currentStatus = booking?.status || 'CONFIRMED'
  const isDelivered = currentStatus === 'DELIVERED'
  const isCancelled = currentStatus === 'CANCELLED'

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.desktopContainer}>
        {/* Top Navbar */}
        <header className={styles.topNav}>
          <div className={styles.navLeft}>
            <button className={styles.backIconBtn} onClick={() => navigateTo('/user/dashboard')} aria-label="Go Back">
              <ArrowLeft size={20} />
            </button>
            <div className={styles.brandGroup} onClick={() => navigateTo('/')} style={{ cursor: 'pointer' }}>
              <div className={styles.brandTitle}>
                DELIVE<span className={styles.brandAccent}>Z</span>
              </div>
              <div className={styles.brandSub}>LIVE RETRIEVAL TELEMETRY</div>
            </div>
          </div>

          <div className={styles.navRight}>
            <button className={styles.supportBtn} onClick={() => loadTrackingData(identifier)}>
              <RotateCcw size={16} />
              <span>Refresh Status</span>
            </button>
          </div>
        </header>

        {/* 2-Column Split Tracking Layout */}
        <div className={styles.splitLayout}>
          {/* Left Column: Milestones & Progress */}
          <div className={styles.formPanel}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div
                className={styles.confirmBadge}
                style={{
                  margin: 0,
                  background: isCancelled ? '#ef4444' : isDelivered ? '#10b981' : '#f59e0b',
                }}
              >
                {isCancelled ? <X size={32} /> : isDelivered ? <Check size={32} /> : <Bike size={32} />}
              </div>
              <div>
                <h1 className={styles.panelTitle} style={{ fontSize: '1.6rem' }}>
                  {isCancelled ? 'Retrieval Cancelled' : isDelivered ? 'Delivered Safely' : 'Retrieval In Progress'}
                </h1>
                <p className={styles.panelSubtitle}>
                  {isCancelled
                    ? 'This order has been cancelled.'
                    : isDelivered
                    ? 'Your item has been securely handed over.'
                    : 'Our verified partner is actively fulfilling your request.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className={styles.confirmInfoGrid}>
              <div className={styles.confirmInfoCard} onClick={handleCopyId} style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>BOOKING ID</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {tracking?.bookingId || identifier} <Copy size={12} />
                </span>
              </div>
              <div className={styles.confirmInfoCard}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>PICKUP ETA</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#d97706' }}>{tracking?.eta || '15–20 min'}</span>
              </div>
              <div className={styles.confirmInfoCard}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>SPEED</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>{booking?.speed || 'Instant'}</span>
              </div>
              <div className={styles.confirmInfoCard}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>STATUS</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#10b981' }}>{currentStatus}</span>
              </div>
            </div>

            {/* Milestone Progress Rail */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>Milestones</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803d', background: '#dcfce7', padding: '0.2rem 0.6rem', borderRadius: '8px' }}>
                  LIVE TRACKING
                </span>
              </div>

              <div className={styles.milestoneTrack}>
                <div className={styles.milestoneLine} />
                {milestones.map((m) => (
                  <div key={m.key} className={\`\${styles.milestoneNode} \${m.completed ? styles.milestoneNodeDone : ''}\`}>
                    {m.completed && <Check size={14} color="#fff" />}
                  </div>
                ))}
              </div>

              <div className={styles.milestoneLabels}>
                {milestones.map((m) => (
                  <div key={m.key}>
                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: m.completed ? '#0f172a' : '#94a3b8' }}>
                      {m.label}
                    </div>
                    {m.timestamp && (
                      <small style={{ color: '#64748b' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* OTP Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div className={styles.otpDisplayBox}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Pickup OTP</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Give to partner at pickup</div>
                </div>
                <div className={styles.otpCodeBadge}>{tracking?.pickupOtp || booking?.pickupOtp || '4821'}</div>
              </div>

              <div className={styles.otpDisplayBox}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Delivery OTP</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Give to partner at delivery</div>
                </div>
                <div className={styles.otpCodeBadge} style={{ borderColor: '#cbd5e1', color: '#0f172a' }}>
                  {tracking?.deliveryOtp || booking?.deliveryOtp || '7592'}
                </div>
              </div>
            </div>

            {/* Simulator Demo */}
            {!isDelivered && !isCancelled && (
              <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '16px', border: '1.5px dashed #cbd5e1' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Play size={14} color="#f59e0b" /> Live Demo Simulator (Advance Milestone)
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {['PARTNER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleSimulateStatus(st)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Set {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Partner & Summary */}
          <aside className={styles.summarySidebar}>
            {/* Assigned Partner Card */}
            {tracking?.partner && (
              <div className={styles.liveSummaryCard}>
                <div className={styles.summaryHeader}>
                  <span className={styles.summaryTitle}>Assigned Partner</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef8ee', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{tracking.partner.rating || 4.9}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.2rem' }}>
                    {tracking.partner.name?.[0] || 'R'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{tracking.partner.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{tracking.partner.vehicle}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <a
                    href={\`tel:\${tracking.partner.phone}\`}
                    className={styles.backBtn}
                    style={{ flex: 1, textDecoration: 'none', justifyContent: 'center', fontSize: '0.85rem' }}
                  >
                    <Phone size={15} /> Call
                  </a>
                  <button
                    className={styles.backBtn}
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.85rem' }}
                    onClick={() => alert('Support helpline 1800-DELIVEZ is connected.')}
                  >
                    <Headphones size={15} /> Support
                  </button>
                </div>
              </div>
            )}

            {/* Shipment Summary */}
            <div className={styles.liveSummaryCard}>
              <div className={styles.summaryHeader}>
                <span className={styles.summaryTitle}>Shipment Snapshot</span>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>
                  <strong>Item:</strong> {booking?.itemName || 'Forgotten Item'} ({booking?.itemCategory})
                </div>
                <div>
                  <strong>Pickup:</strong> {booking?.pickup?.contactName}, {booking?.pickup?.city}
                </div>
                <div>
                  <strong>Deliver To:</strong> {booking?.dropoff?.recipientName}, {booking?.dropoff?.city}
                </div>
                <div>
                  <strong>Total Paid:</strong> ₹{Number(booking?.totalAmount || 0).toFixed(2)} ({booking?.paymentMethod})
                </div>
              </div>

              {!isDelivered && !isCancelled && (
                <button
                  onClick={() => setCancelModalOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '0.5rem 0 0',
                    textAlign: 'left',
                  }}
                >
                  Cancel this retrieval request
                </button>
              )}
            </div>

            <button
              className={styles.backBtn}
              style={{ width: '100%', justifyContent: 'center', padding: '0.9rem' }}
              onClick={() => navigateTo('/user/dashboard')}
            >
              Back to Dashboard
            </button>
          </aside>
        </div>
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '24px',
              maxWidth: '420px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem' }}>
              Cancel Retrieval?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 1rem', lineHeight: 1.4 }}>
              Are you sure you want to cancel this retrieval request?
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                Reason for cancellation
              </label>
              <select
                className={styles.selectField}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              >
                <option value="Found the item at home">Found the item at home</option>
                <option value="Someone else is bringing it">Someone else is bringing it</option>
                <option value="Entered incorrect pickup address">Entered incorrect pickup address</option>
                <option value="No longer needed">No longer needed</option>
                <option value="Other reason">Other reason</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                className={styles.backBtn}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setCancelModalOpen(false)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                className={styles.continueRedBtn}
                style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

fs.writeFileSync(target, trackingJsx, 'utf8');
console.log('ForgotSomethingTrackingPage.jsx updated with desktop design!');
