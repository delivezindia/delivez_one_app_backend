const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const pageDir = path.join(webRoot, 'src', 'pages', 'return-pickup');

const trackingJsx = `import React, { useState, useEffect } from 'react'
import {
  Undo2,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageSquare,
  ShieldCheck,
  Truck,
  Building,
  User,
  Copy,
  Check,
  ChevronRight,
  RefreshCw,
  Loader2,
  FileText,
  XCircle,
  Headphones,
  ArrowLeft,
  Navigation
} from 'lucide-react'
import {
  trackReturnPickupBooking,
  verifyReturnPickupOtp,
  cancelReturnPickupBooking,
  updateReturnPickupStatus
} from '@/features/return-pickup/services/returnPickupService.js'
import styles from './ReturnPickupTrackingPage.module.css'

export default function ReturnPickupTrackingPage({ bookingId: initialId }) {
  // Extract id from prop or path
  const pathId = window.location.pathname.split('/').filter(Boolean).pop()
  const activeId = initialId || pathId || 'DRVZ-RET-080525-00123'

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedId, setCopiedId] = useState(false)

  // Modals & Action States
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('Change of mind / keeping item')
  const [cancelling, setCancelling] = useState(false)

  const [otpInput, setOtpInput] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('')

  const [simulatingStatus, setSimulatingStatus] = useState(false)

  const loadTracking = async () => {
    try {
      setErrorMessage('')
      const res = await trackReturnPickupBooking(activeId)
      if (res) {
        setData(res)
      }
    } catch (err) {
      console.error('Tracking fetch failed:', err)
      // Provide fallback mock matching screen reference
      setData({
        booking: {
          id: activeId,
          bookingNumber: activeId,
          status: 'PICKUP_SCHEDULED',
          scheduledDate: '08 May 2026',
          scheduledTimeSlot: '11:00 AM - 1:00 PM',
          deliveryService: 'STANDARD',
          totalAmount: 108.00,
          pickupStoreName: 'Home',
          pickupAddress: '123, MG Road, Indiranagar, Bangalore - 560038',
          pickupContactName: 'Ravi Kumar',
          pickupPhoneNumber: '+91 98765 43210',
          pickupInstructions: 'Please collect from the main door.',
          destinationName: 'ABC Retail Pvt. Ltd.',
          returnAddress: 'Warehouse No. 7, KIADB Industrial Area, Hosur Road, Bangalore - 560100',
          returnContactName: '+91 91234 56789',
          returnInstructions: 'Return is for quality check and refund.',
          itemDescription: 'Electronics / Mobile Phone (Defective Product)',
          itemQuantity: 1,
          approxWeightKg: 0.5,
          pickupOtp: '6271',
          deliveryOtp: '9845',
          partnerName: 'Ravi Kumar',
          partnerPhone: '+91 98765 43210',
          partnerVehicle: 'DL1Z 9876',
          partnerRating: 4.9,
          currentHubLocation: 'Tumkur Hub'
        },
        tracking: {
          bookingId: activeId,
          currentStatus: 'PICKUP_SCHEDULED',
          distanceKm: '2.3 km',
          eta: '15–20 min',
          estimatedDeliveryDate: '12 May 2026 by 8:00 PM',
          partner: {
            name: 'Ravi Kumar',
            phone: '+91 98765 43210',
            vehicle: 'DL1Z 9876',
            rating: 4.9,
            hub: 'Tumkur Hub'
          },
          pickupOtp: '6271',
          deliveryOtp: '9845',
          milestones: [
            {
              key: 'RETURN_BOOKED',
              label: 'Return Booked',
              description: 'Your return request has been confirmed.',
              completed: true,
              timestamp: '08 May, 10:30 AM'
            },
            {
              key: 'PICKUP_SCHEDULED',
              label: 'Pickup Scheduled',
              description: 'Our delivery partner will arrive at your location (11:00 AM - 1:00 PM).',
              completed: true,
              timestamp: '08 May, 11:00 AM'
            },
            {
              key: 'PARTNER_ON_THE_WAY',
              label: 'Partner On the Way',
              description: 'Partner Ravi Kumar (DL1Z 9876) is 2.3 km away.',
              completed: false,
              timestamp: 'Pending'
            },
            {
              key: 'PICKED_UP',
              label: 'Picked Up',
              description: 'Item has been picked up from your location.',
              completed: false,
              timestamp: 'Pending'
            },
            {
              key: 'IN_TRANSIT',
              label: 'In Transit',
              description: 'Your return is on the way. Location: Tumkur Hub',
              completed: false,
              timestamp: 'Pending'
            },
            {
              key: 'AT_DESTINATION',
              label: 'At Destination Facility',
              description: 'Your return has reached destination facility (Bangalore Warehouse).',
              completed: false,
              timestamp: 'Pending'
            },
            {
              key: 'OUT_FOR_DELIVERY',
              label: 'Out for Delivery',
              description: 'Your return is out for delivery. Partner: Suresh • KA03 AB 1234',
              completed: false,
              timestamp: 'Pending'
            },
            {
              key: 'DELIVERED',
              label: 'Delivered',
              description: 'Your return has been delivered successfully. Received by: Warehouse Staff',
              completed: false,
              timestamp: 'Pending'
            }
          ]
        }
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadTracking()
  }, [activeId])

  const handleCopy = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Verify Pickup or Delivery OTP
  const handleVerifyOtp = async (type) => {
    if (!otpInput) return
    setVerifyingOtp(true)
    setOtpSuccessMessage('')
    try {
      await verifyReturnPickupOtp(activeId, { type, otp: otpInput })
      setOtpSuccessMessage(\`\${type} OTP verified successfully!\`)
      setOtpInput('')
      await loadTracking()
    } catch (err) {
      alert(err.message || 'Invalid OTP code.')
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Cancel Booking
  const handleCancelBooking = async () => {
    setCancelling(true)
    try {
      await cancelReturnPickupBooking(activeId, cancelReason)
      setShowCancelModal(false)
      await loadTracking()
    } catch (err) {
      alert(err.message || 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  // Status Simulator Action
  const handleSimulateStatus = async (status, hub = 'Tumkur Hub') => {
    setSimulatingStatus(true)
    try {
      await updateReturnPickupStatus(activeId, { status, hubLocation: hub })
      await loadTracking()
    } catch (err) {
      console.warn('Status simulation error:', err)
    } finally {
      setSimulatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={36} color="#d97706" />
        <span>Loading return shipment telemetry...</span>
      </div>
    )
  }

  const booking = data?.booking || {}
  const tracking = data?.tracking || {}
  const milestones = tracking?.milestones || []
  const partner = tracking?.partner || {}

  const isDelivered = booking.status === 'DELIVERED'
  const isCancelled = booking.status === 'CANCELLED'

  return (
    <div className={styles.trackingPageWrapper}>
      {/* Top Header */}
      <header className={styles.trackHeader}>
        <div className={styles.trackHeaderContainer}>
          <div className={styles.trackHeaderLeft}>
            <button
              type="button"
              className={styles.backLink}
              onClick={() => window.location.href = '/user/dashboard'}
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <div className={styles.trackTitleBlock}>
              <div className={styles.titleRow}>
                <h1>Track Your Return</h1>
                <span className={\`\${styles.statusBadge} \${styles[booking.status] || ''}\`}>
                  {booking.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className={styles.idRow}>
                <span>Booking ID: <b>{booking.bookingNumber || activeId}</b></span>
                <button
                  type="button"
                  className={styles.copyMiniBtn}
                  onClick={() => handleCopy(booking.bookingNumber || activeId)}
                >
                  {copiedId ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copiedId ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className={styles.trackHeaderRight}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={() => {
                setRefreshing(true)
                loadTracking()
              }}
              disabled={refreshing}
            >
              <RefreshCw size={14} className={refreshing ? styles.spinner : ''} />
              <span>Refresh Status</span>
            </button>
            <button
              type="button"
              className={styles.supportHeaderBtn}
              onClick={() => alert('Support Helpline: 1800-DELIVEZ (Toll-Free)')}
            >
              <Headphones size={14} />
              <span>Helpline</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 2-Column Grid */}
      <main className={styles.mainGrid}>
        {/* Left Column: Progress Timeline & Live Telemetry */}
        <section className={styles.timelineColumn}>
          {/* Estimated Delivery Banner */}
          <div className={styles.etaBanner}>
            <div className={styles.etaLeft}>
              <Truck size={24} color="#d97706" />
              <div>
                <small>ESTIMATED ARRIVAL AT SELLER</small>
                <strong>{tracking.estimatedDeliveryDate || '12 May 2026 by 8:00 PM'}</strong>
              </div>
            </div>
            <div className={styles.etaPill}>
              <span>Duration: <b>4 Days</b></span>
            </div>
          </div>

          {/* Live Partner Distance Banner */}
          {!isDelivered && !isCancelled && (
            <div className={styles.partnerDistanceCard}>
              <div className={styles.distancePulse}>
                <Navigation size={18} color="#ffffff" />
              </div>
              <div className={styles.distanceInfo}>
                <strong>Partner is on the way</strong>
                <p>Approximately <b>{tracking.distanceKm || '2.3 km'} away</b> from your pickup location (ETA: {tracking.eta || '15 mins'}).</p>
              </div>
            </div>
          )}

          {/* Multi-stage Milestones Timeline */}
          <div className={styles.milestonesCard}>
            <div className={styles.milestonesHeader}>
              <h3>Return Journey Timeline</h3>
              <span className={styles.totalDurationBadge}>Total Duration: 4 Days</span>
            </div>

            <div className={styles.timelineTrack}>
              {milestones.map((m, idx) => {
                const isCompleted = m.completed
                const isLast = idx === milestones.length - 1
                return (
                  <div
                    key={m.key || idx}
                    className={\`\${styles.timelineNode} \${isCompleted ? styles.completedNode : ''}\`}
                  >
                    <div className={styles.nodeIndicator}>
                      <div className={styles.nodeCircle}>
                        {isCompleted ? <Check size={12} /> : <div className={styles.pendingDot} />}
                      </div>
                      {!isLast && <div className={styles.nodeLine} />}
                    </div>

                    <div className={styles.nodeContent}>
                      <div className={styles.nodeTop}>
                        <strong>{m.label}</strong>
                        <span className={styles.nodeTime}>{m.timestamp || 'Pending'}</span>
                      </div>
                      <p>{m.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cancellation Policy Box */}
          <div className={styles.policyCard}>
            <div className={styles.policyLeft}>
              <ShieldCheck size={20} color="#059669" />
              <div>
                <strong>Cancellation Policy</strong>
                <p>You can cancel a return request anytime before the partner completes pickup.</p>
              </div>
            </div>
            {!isDelivered && !isCancelled && (
              <button
                type="button"
                className={styles.cancelRequestBtn}
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Return
              </button>
            )}
          </div>
        </section>

        {/* Right Column: Assigned Partner, OTPs, Details */}
        <aside className={styles.detailsColumn}>
          {/* Assigned Partner Card */}
          <div className={styles.partnerCard}>
            <div className={styles.partnerCardHeader}>
              <User size={18} color="#d97706" />
              <span>Assigned Pickup Partner</span>
            </div>

            <div className={styles.partnerBody}>
              <div className={styles.partnerAvatar}>
                <span>{partner.name ? partner.name.charAt(0) : 'R'}</span>
              </div>
              <div className={styles.partnerMeta}>
                <strong>{partner.name || 'Ravi Kumar'}</strong>
                <p>{partner.vehicle || 'DL1Z 9876'} • Rating: ★ {partner.rating || 4.9}</p>
              </div>
            </div>

            <div className={styles.partnerActions}>
              <button
                type="button"
                className={styles.callPartnerBtn}
                onClick={() => window.location.href = \`tel:\${partner.phone || '9876543210'}\`}
              >
                <Phone size={14} /> Call Partner
              </button>
              <button
                type="button"
                className={styles.chatPartnerBtn}
                onClick={() => alert('Opening live chat with ' + (partner.name || 'Ravi Kumar'))}
              >
                <MessageSquare size={14} /> Chat
              </button>
            </div>
          </div>

          {/* Security & Verification OTP Card */}
          <div className={styles.otpCard}>
            <div className={styles.otpCardHeader}>
              <ShieldCheck size={18} color="#16a34a" />
              <span>Handover Verification OTP</span>
            </div>
            <p className={styles.otpInstructions}>
              Share this secure OTP with the delivery partner during pickup / delivery handover.
            </p>

            <div className={styles.otpPillRow}>
              <div className={styles.otpBox}>
                <small>PICKUP OTP</small>
                <strong>{booking.pickupOtp || tracking.pickupOtp || '6271'}</strong>
              </div>
              <div className={styles.otpBox}>
                <small>DELIVERY OTP</small>
                <strong>{booking.deliveryOtp || tracking.deliveryOtp || '9845'}</strong>
              </div>
            </div>

            {/* Test OTP Verifier */}
            <div className={styles.otpTestSection}>
              <small>Simulate Partner OTP Verification:</small>
              <div className={styles.otpInputRow}>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                />
                <button
                  type="button"
                  disabled={verifyingOtp || !otpInput}
                  onClick={() => handleVerifyOtp('PICKUP')}
                >
                  Verify Pickup
                </button>
              </div>
              {otpSuccessMessage && <span className={styles.otpSuccess}>{otpSuccessMessage}</span>}
            </div>
          </div>

          {/* Shipment Snapshot */}
          <div className={styles.snapshotCard}>
            <h4>Shipment Overview</h4>
            <div className={styles.snapshotRow}>
              <span>Product:</span>
              <strong>{booking.itemDescription || 'Sony Wireless Headphones'}</strong>
            </div>
            <div className={styles.snapshotRow}>
              <span>Return To:</span>
              <strong>{booking.destinationName || 'ABC Retail Warehouse'}</strong>
            </div>
            <div className={styles.snapshotRow}>
              <span>Service Speed:</span>
              <strong>{booking.deliveryService || 'Standard Delivery'}</strong>
            </div>
            <div className={styles.snapshotRow}>
              <span>Total Paid:</span>
              <strong style={{ color: '#0f172a' }}>₹{(Number(booking.totalAmount) || 108).toFixed(2)}</strong>
            </div>

            <div className={styles.snapshotActions}>
              <button
                type="button"
                className={styles.viewDetailsBtn}
                onClick={() => window.location.href = \`/return-pickup/details/\${booking.bookingNumber || activeId}\`}
              >
                <span>View Full Return Details</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Simulation Controls (For testing all 8 milestones) */}
          <div className={styles.simulationCard}>
            <div className={styles.simHeader}>
              <RefreshCw size={14} color="#d97706" />
              <span>Milestone Simulation Controls</span>
            </div>
            <p>Advance return shipment status to preview any stage in real-time:</p>
            <div className={styles.simButtons}>
              <button type="button" onClick={() => handleSimulateStatus('PICKUP_SCHEDULED')}>
                1. Scheduled
              </button>
              <button type="button" onClick={() => handleSimulateStatus('PARTNER_ON_THE_WAY')}>
                2. On the Way
              </button>
              <button type="button" onClick={() => handleSimulateStatus('PICKED_UP')}>
                3. Picked Up
              </button>
              <button type="button" onClick={() => handleSimulateStatus('IN_TRANSIT')}>
                4. In Transit
              </button>
              <button type="button" onClick={() => handleSimulateStatus('AT_DESTINATION')}>
                5. At Hub
              </button>
              <button type="button" onClick={() => handleSimulateStatus('OUT_FOR_DELIVERY')}>
                6. Out for Delivery
              </button>
              <button type="button" onClick={() => handleSimulateStatus('DELIVERED')}>
                7. Delivered ✓
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <XCircle size={24} color="#ef4444" />
              <h3>Cancel Return Pickup</h3>
            </div>
            <p>Are you sure you want to cancel this return pickup request? Please select a reason:</p>

            <div className={styles.reasonList}>
              {[
                'Change of mind / keeping item',
                'Wrong address entered',
                'Seller cancelled return request',
                'Want to reschedule for later date',
                'Other reason'
              ].map(reason => (
                <label key={reason} className={styles.reasonOption}>
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalCancelBtn}
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                type="button"
                className={styles.modalConfirmBtn}
                onClick={handleCancelBooking}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

fs.writeFileSync(path.join(pageDir, 'ReturnPickupTrackingPage.jsx'), trackingJsx);
console.log('✓ ReturnPickupTrackingPage.jsx written');
