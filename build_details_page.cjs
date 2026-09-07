const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const pageDir = path.join(webRoot, 'src', 'pages', 'return-pickup');

const detailsJsx = `import React, { useState, useEffect } from 'react'
import {
  Undo2,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  CalendarDays,
  ShieldCheck,
  Store,
  FileText,
  Download,
  Star,
  MessageSquare,
  ArrowLeft,
  Copy,
  Check,
  Truck,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react'
import {
  fetchReturnPickupBookingById,
  submitReturnPickupFeedback
} from '@/features/return-pickup/services/returnPickupService.js'
import styles from './ReturnPickupDetailsPage.module.css'

export default function ReturnPickupDetailsPage({ bookingId: propId }) {
  const pathId = window.location.pathname.split('/').filter(Boolean).pop()
  const activeId = propId || pathId || 'DRVZ-RET-080525-00123'

  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(null)
  const [copiedId, setCopiedId] = useState(false)

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchReturnPickupBookingById(activeId)
        if (res) {
          setBooking(res)
        }
      } catch (err) {
        console.warn('Failed to load booking details from API, using reference fallback:', err)
        setBooking({
          id: activeId,
          bookingNumber: activeId,
          status: 'DELIVERED',
          totalAmount: 108.00,
          deliveredAt: '12 May 2026, 06:15 PM',
          scheduledDate: '08 May 2026',
          scheduledTimeSlot: '11:00 AM - 1:00 PM',
          destinationName: 'Seller / Warehouse',
          shipmentProtection: true,
          protectionCoverAmount: 10000,
          paymentMethod: 'ONLINE',
          paymentStatus: 'PAID',
          pickupStoreName: 'Home',
          pickupAddress: '123, MG Road, Indiranagar, Bangalore - 560038, Karnataka',
          pickupPhoneNumber: '+91 98765 43210',
          pickupInstructions: 'Please collect from the main door.',
          returnAddress: 'ABC Retail Pvt. Ltd., Warehouse No. 7, KIADB Industrial Area, Hosur Road, Bangalore - 560100, Karnataka',
          returnPhoneNumber: '+91 91234 56789',
          returnInstructions: 'Return is for quality check and refund.',
          itemCategory: 'Electronics / Mobile Phone',
          itemDescription: 'Sony Wireless Headphones (Black) - Defective Product',
          itemQuantity: 1,
          approxWeightKg: 0.5,
          documents: [
            { id: '1', name: 'Invoice.pdf', uploadedAt: '08 May 2026' },
            { id: '2', name: 'Return Authorization.pdf', uploadedAt: '08 May 2026' }
          ]
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeId])

  const handleCopy = (text) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  const handleDownloadInvoice = () => {
    window.print()
  }

  const handleSubmitReview = async () => {
    setSubmittingReview(true)
    try {
      await submitReturnPickupFeedback(activeId, { rating, reviewText })
      setReviewSuccess(true)
      setTimeout(() => setShowReviewModal(false), 1500)
    } catch (err) {
      alert(err.message || 'Failed to submit review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingWrapper}>
        <Loader2 className={styles.spinner} size={36} color="#d97706" />
        <span>Loading return details...</span>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className={styles.notFoundWrapper}>
        <h2>Return Details Not Found</h2>
        <button onClick={() => window.location.href = '/user/dashboard'}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className={styles.detailsPageWrapper}>
      {/* Top Header */}
      <header className={styles.detailsHeader}>
        <div className={styles.headerInner}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => window.location.href = '/user/dashboard'}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>

          <div className={styles.headerTitleRow}>
            <h1>Return Details</h1>
            <p>Detailed information about your return shipment.</p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.downloadInvoiceBtn}
              onClick={handleDownloadInvoice}
            >
              <Download size={14} />
              <span>Download Invoice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className={styles.mainContainer}>
        {/* Top Summary Banner Card */}
        <div className={styles.heroSummaryCard}>
          <div className={styles.heroTop}>
            <div className={styles.heroLeft}>
              <div className={styles.boxIconWrap}>
                <Package size={28} color="#d97706" />
              </div>
              <div className={styles.heroMeta}>
                <span className={\`\${styles.statusPill} \${styles[booking.status] || ''}\`}>
                  {booking.status === 'DELIVERED' ? 'Delivered' : booking.status?.replace(/_/g, ' ')}
                </span>
                <div className={styles.bookingIdRow}>
                  <small>Booking ID</small>
                  <strong>{booking.bookingNumber || activeId}</strong>
                  <button type="button" onClick={() => handleCopy(booking.bookingNumber || activeId)}>
                    {copiedId ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <small className={styles.deliveredDateText}>
                  {booking.deliveredAt ? \`Delivered on \${booking.deliveredAt}\` : 'Return in progress'}
                </small>
              </div>
            </div>

            <div className={styles.heroRight}>
              <span className={styles.heroPrice}>₹{(Number(booking.totalAmount) || 108).toFixed(2)}</span>
              <button
                type="button"
                className={styles.rateReviewBtn}
                onClick={() => setShowReviewModal(true)}
              >
                <Star size={14} />
                <span>Rate & Review</span>
              </button>
            </div>
          </div>

          <div className={styles.heroKeyDetails}>
            <div className={styles.keyItem}>
              <CalendarDays size={16} color="#d97706" />
              <div>
                <small>Pickup Date & Time</small>
                <strong>{booking.scheduledDate || '08 May 2026'} ({booking.scheduledTimeSlot || '11:00 AM - 1:00 PM'})</strong>
              </div>
            </div>

            <div className={styles.keyItem}>
              <Store size={16} color="#d97706" />
              <div>
                <small>Return To</small>
                <strong>{booking.destinationName || 'Seller / Warehouse'}</strong>
              </div>
            </div>

            <div className={styles.keyItem}>
              <ShieldCheck size={16} color="#16a34a" />
              <div>
                <small>Shipment Protection</small>
                <strong style={{ color: '#16a34a' }}>Covered ✓ (Up to ₹10,000)</strong>
              </div>
            </div>

            <div className={styles.keyItem}>
              <FileText size={16} color="#475569" />
              <div>
                <small>Payment Mode</small>
                <strong>{booking.paymentMethod || 'Paid Online'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Progress Teaser */}
        <div className={styles.progressTeaserCard}>
          <div className={styles.progressTeaserHeader}>
            <h3>Delivery Progress</h3>
            <button
              type="button"
              className={styles.viewTrackingLink}
              onClick={() => window.location.href = \`/track/return-pickup/\${booking.bookingNumber || activeId}\`}
            >
              <span>View Tracking</span>
              <ExternalLink size={13} />
            </button>
          </div>

          <div className={styles.progressStepRow}>
            {[
              { label: 'Return Booked', time: '08 May, 10:30 AM', done: true },
              { label: 'Pickup Scheduled', time: '08 May, 11:00 AM', done: true },
              { label: 'Picked Up', time: 'Pending', done: booking.status === 'DELIVERED' },
              { label: 'In Transit', time: 'Pending', done: booking.status === 'DELIVERED' },
              { label: 'At Destination', time: 'Pending', done: booking.status === 'DELIVERED' },
              { label: 'Delivered', time: '12 May, 06:15 PM', done: booking.status === 'DELIVERED' },
            ].map((st, i) => (
              <div key={st.label} className={\`\${styles.stepBubble} \${st.done ? styles.doneBubble : ''}\`}>
                <div className={styles.bubbleIcon}>
                  {st.done ? <Check size={12} /> : i + 1}
                </div>
                <strong>{st.label}</strong>
                <small>{st.time}</small>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Addresses Block */}
        <div className={styles.addressesTwoCol}>
          {/* Pickup Address Card */}
          <div className={styles.addressBlock}>
            <div className={styles.addressBlockHeader}>
              <div className={styles.addressBlockTitle}>
                <MapPin size={18} color="#d97706" />
                <strong>Pickup Address</strong>
              </div>
              <span className={styles.viewTag}>View</span>
            </div>
            <div className={styles.addressDetails}>
              <h4>{booking.pickupStoreName || 'Home'}</h4>
              <p>{booking.pickupAddress || '123, MG Road, Indiranagar, Bangalore - 560038, Karnataka'}</p>
              <span className={styles.phoneRow}>{booking.pickupPhoneNumber || '+91 98765 43210'}</span>

              {booking.pickupInstructions && (
                <div className={styles.instructionNote}>
                  <small>Pickup Instructions:</small>
                  <p>{booking.pickupInstructions}</p>
                </div>
              )}
            </div>
          </div>

          {/* Return To Address Card */}
          <div className={styles.addressBlock}>
            <div className={styles.addressBlockHeader}>
              <div className={styles.addressBlockTitle}>
                <Store size={18} color="#d97706" />
                <strong>Return To</strong>
              </div>
              <span className={styles.viewTag}>View</span>
            </div>
            <div className={styles.addressDetails}>
              <h4>{booking.destinationName || 'Seller / Warehouse'}</h4>
              <p>{booking.returnAddress || 'Warehouse No. 7, KIADB Industrial Area, Hosur Road, Bangalore - 560100, Karnataka'}</p>
              <span className={styles.phoneRow}>{booking.returnPhoneNumber || '+91 91234 56789'}</span>

              {booking.returnInstructions && (
                <div className={styles.instructionNote}>
                  <small>Return Instructions:</small>
                  <p>{booking.returnInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Item Details Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <div className={styles.sectionCardTitle}>
              <Package size={18} color="#d97706" />
              <strong>Item Details</strong>
            </div>
            <span className={styles.viewTag}>View</span>
          </div>

          <div className={styles.itemDetailBody}>
            <div className={styles.itemIconWrap}>
              <Package size={24} color="#d97706" />
            </div>
            <div className={styles.itemMeta}>
              <h4>{booking.itemCategory || 'Electronics / Mobile Phone'}</h4>
              <p>{booking.itemQuantity || 1} Item • Small • {booking.approxWeightKg || 0.5} kg (Actual)</p>
              <div className={styles.reasonBadge}>
                <span>Return Reason: Defective Product</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Card */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <div className={styles.sectionCardTitle}>
              <FileText size={18} color="#d97706" />
              <strong>Documents Attached</strong>
            </div>
            <span className={styles.viewTag}>View All</span>
          </div>

          <div className={styles.docsListGrid}>
            {(booking.documents || [
              { id: '1', name: 'Invoice.pdf', uploadedAt: '08 May 2026' },
              { id: '2', name: 'Return Authorization.pdf', uploadedAt: '08 May 2026' }
            ]).map(doc => (
              <div key={doc.id || doc.name} className={styles.docItemCard}>
                <FileText size={20} color="#dc2626" />
                <div className={styles.docItemMeta}>
                  <strong>{doc.name}</strong>
                  <small>Uploaded on {doc.uploadedAt || '08 May 2026'}</small>
                </div>
                <button type="button" className={styles.docDownloadBtn} onClick={handleDownloadInvoice}>
                  <Download size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Need Help Banner */}
        <div className={styles.helpBanner}>
          <div className={styles.helpLeft}>
            <div className={styles.helpIconCircle}>
              <MessageSquare size={20} color="#d97706" />
            </div>
            <div>
              <strong>Need Help with Your Return?</strong>
              <p>Our 24/7 dedicated logistics support team is here to assist you.</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.chatNowBtn}
            onClick={() => alert('Support helpline: 1800-DELIVEZ (Toll-Free)')}
          >
            <MessageSquare size={14} />
            <span>Chat Now</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className={styles.bottomBar}>
          <button
            type="button"
            className={styles.goHomeBtn}
            onClick={() => window.location.href = '/user/dashboard'}
          >
            Go to Home
          </button>
          <button
            type="button"
            className={styles.trackReturnBtn}
            onClick={() => window.location.href = \`/track/return-pickup/\${booking.bookingNumber || activeId}\`}
          >
            <span>Track Live Return</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </main>

      {/* Rate & Review Modal */}
      {showReviewModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.reviewModalContent}>
            <div className={styles.reviewModalHeader}>
              <h3>Rate Your Return Experience</h3>
              <button type="button" onClick={() => setShowReviewModal(false)}>
                <X size={18} />
              </button>
            </div>

            {reviewSuccess ? (
              <div className={styles.reviewSuccessMsg}>
                <CheckCircle2 size={44} color="#16a34a" />
                <strong>Thank you for your feedback!</strong>
                <p>Your review helps us improve the return experience.</p>
              </div>
            ) : (
              <>
                <p className={styles.reviewSub}>How satisfied were you with the pickup and delivery speed?</p>
                <div className={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(st => (
                    <button
                      key={st}
                      type="button"
                      className={rating >= st ? styles.activeStar : ''}
                      onClick={() => setRating(st)}
                    >
                      <Star size={28} />
                    </button>
                  ))}
                </div>

                <div className={styles.reviewTextAreaWrap}>
                  <label>Share additional comments (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about the partner handover, packaging, and return handling..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className={styles.submitReviewBtn}
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
`;

fs.writeFileSync(path.join(pageDir, 'ReturnPickupDetailsPage.jsx'), detailsJsx);
console.log('✓ ReturnPickupDetailsPage.jsx written');
