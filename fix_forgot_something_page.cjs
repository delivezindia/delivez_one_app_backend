const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const forgotDir = path.join(webRoot, 'src', 'pages', 'forgot-something');

const forgotJsx = `import React, { useEffect, useMemo, useState } from 'react'
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Bell,
  Bike,
  BookOpen,
  Building,
  Building2,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Crosshair,
  ExternalLink,
  FileText,
  Glasses,
  Headphones,
  HelpCircle,
  Home,
  Hotel,
  Key,
  Laptop,
  Lightbulb,
  Loader2,
  Lock,
  MapPin,
  MapPinned,
  Package,
  PackageCheck,
  PenTool,
  Phone,
  PhoneCall,
  Plug,
  QrCode,
  Rocket,
  Shield,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
  UploadCloud,
  User,
  UserPlus,
  Users,
  Utensils,
  Wallet,
  X,
  Zap
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { getStoredUser, getUserAccessToken } from '@/features/auth/services/userAuthService.js'
import {
  createForgotSomethingBooking,
  fetchForgotSomethingOptions,
  fetchForgotSomethingQuote,
  DEFAULT_FORGOT_SOMETHING_OPTIONS
} from '@/features/forgot-something/services/forgotSomethingService.js'
import { fetchSavedAddresses } from '@/features/personal-courier/services/personalCourierService.js'
import AuthModal from '@/features/auth/components/AuthModal.jsx'
import styles from './ForgotSomethingBookingPage.module.css'

const CATEGORY_ICONS = {
  KEYS: Key,
  LAPTOP: Laptop,
  PHONE: Smartphone,
  DOCUMENTS: FileText,
  BAG: ShoppingBag,
  CHARGER: Plug,
  WALLET: Wallet,
  GLASSES: Glasses,
  CLOTHING: Shirt,
  HEADPHONES: Headphones,
  BOOK_DIARY: BookOpen,
  OTHER: Package,
}

const LOCATION_ICONS = {
  HOME: Home,
  OFFICE: Building2,
  HOTEL: Hotel,
  RESTAURANT: Utensils,
  VEHICLE: Car,
  SOMEONES_PLACE: Users,
  OTHER: MapPin,
}

const HANDOVER_ICONS = {
  RECEPTION: Building,
  SECURITY_GUARD: ShieldCheck,
  COLLEAGUE_STAFF: User,
  LOST_AND_FOUND: Archive,
  SOMEONE_ELSE: Users,
  CUSTOM_CONTACT: UserPlus,
}

const STEP_TITLES = [
  'Item Details',
  'Location & Handover',
  'Pickup & Delivery',
  'Speed & Protection',
  'Review & Pay'
]

export default function ForgotSomethingBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [options, setOptions] = useState(DEFAULT_FORGOT_SOMETHING_OPTIONS)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)
  const [copiedId, setCopiedId] = useState(false)

  // Booking Form State
  const [formData, setFormData] = useState({
    itemCategory: 'KEYS',
    itemName: 'Office & Flat Keys with Keychain',
    description: 'Set of 3 keys with red tag',
    approxValue: '500',

    locationType: 'OFFICE',
    placeName: 'WeWork Galaxy',
    handoverType: 'RECEPTION',
    contactPersonName: 'Front Desk Security',
    contactPersonPhone: '+91 98765 43210',
    roomOrDeskNumber: 'Desk 412, 4th Floor',
    handoverNotes: 'Item is in reception drawer under name Ravi.',

    pickupFlatBuilding: 'WeWork Galaxy, 43 Residency Road',
    pickupStreet: 'Shanthala Nagar, Ashok Nagar',
    pickupArea: 'Residency Road',
    pickupCity: 'Bengaluru',
    pickupState: 'Karnataka',
    pickupPostalCode: '560025',
    pickupContactName: 'Front Desk Reception',
    pickupPhoneNumber: '+91 98765 43210',

    dropoffAddressType: 'Home',
    dropoffAddressLine1: '123, 4th Cross, Indiranagar 1st Stage',
    dropoffArea: 'Indiranagar',
    dropoffCity: 'Bengaluru',
    dropoffState: 'Karnataka',
    dropoffPostalCode: '560038',
    dropoffRecipientName: 'Ravi Kishan',
    dropoffPhoneNumber: '+91 63861 89353',

    deliverySpeed: 'INSTANT', // 'INSTANT', 'EXPRESS', 'SAME_DAY', 'PRECISE_TIME'
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeSlot: '15–30 Mins (Fastest)',
    secureOtpHandover: true,
    shipmentProtection: true,
    photoProofRequired: true,
    couponCode: '',
    paymentMethod: 'PAY_ON_DELIVERY'
  })

  // Live Pricing Quote State with safe defaults
  const [quote, setQuote] = useState({
    currency: 'INR',
    retrievalFee: 149,
    deliveryFee: 129,
    secureHandlingFee: 39,
    discountAmount: 0,
    taxAmount: 23.02,
    totalAmount: 340.02,
    speedName: 'Instant Flash (15–30 Mins)'
  })

  // Load config & saved addresses
  useEffect(() => {
    async function loadData() {
      try {
        const [optRes, addrRes] = await Promise.allSettled([
          fetchForgotSomethingOptions(),
          fetchSavedAddresses()
        ])
        if (optRes.status === 'fulfilled' && optRes.value) {
          setOptions(optRes.value)
        }
        if (addrRes.status === 'fulfilled' && addrRes.value) {
          setSavedAddresses(addrRes.value)
        }
      } catch (err) {
        console.warn('Using default options fallback:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Auto calculate quote when speed/protection/coupon changes
  useEffect(() => {
    async function updateQuote() {
      try {
        const res = await fetchForgotSomethingQuote({
          speed: formData.deliverySpeed,
          tamperProofPackaging: formData.shipmentProtection,
          declaredValue: Number(formData.approxValue) || 0,
        })
        if (res) {
          const rFee = Number(res.retrievalFee ?? 149)
          const dFee = Number(res.deliveryFee ?? 129)
          const sFee = Number(res.secureHandlingFee ?? (formData.shipmentProtection ? 39 : 0))
          let disc = 0
          if (formData.couponCode && formData.couponCode.trim().toUpperCase() === 'DELIVEZ10') {
            disc = Math.round((rFee + dFee + sFee) * 0.1 * 100) / 100
          }
          const taxable = Math.max(0, rFee + dFee + sFee - disc)
          const tax = Math.round(taxable * 0.0725 * 100) / 100
          const tot = Math.round((taxable + tax) * 100) / 100

          setQuote({
            currency: res.currency || 'INR',
            retrievalFee: rFee,
            deliveryFee: dFee,
            secureHandlingFee: sFee,
            discountAmount: disc,
            taxAmount: tax,
            totalAmount: tot,
            speedName: res.breakdown?.speedName || (formData.deliverySpeed === 'INSTANT' ? 'Instant Flash (15–30 Mins)' : 'Express Retrieval')
          })
        }
      } catch (e) {
        const rFee = formData.deliverySpeed === 'INSTANT' ? 149 : formData.deliverySpeed === 'EXPRESS' ? 119 : 89
        const dFee = 129
        const sFee = formData.shipmentProtection ? 39 : 0
        const sub = rFee + dFee + sFee
        const disc = formData.couponCode === 'DELIVEZ10' ? Math.round(sub * 0.1) : 0
        const tax = Math.round((sub - disc) * 0.0725 * 100) / 100
        setQuote({
          currency: 'INR',
          retrievalFee: rFee,
          deliveryFee: dFee,
          secureHandlingFee: sFee,
          discountAmount: disc,
          taxAmount: tax,
          totalAmount: sub - disc + tax,
          speedName: formData.deliverySpeed === 'INSTANT' ? 'Instant Flash (15–30 Mins)' : 'Express Retrieval'
        })
      }
    }
    updateQuote()
  }, [formData.deliverySpeed, formData.shipmentProtection, formData.approxValue, formData.couponCode])

  const updateField = (key, val) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const handleNextStep = () => {
    setErrorMsg('')
    if (currentStep === 1) {
      if (!formData.itemCategory) {
        setErrorMsg('Please select an item category.')
        return
      }
      if (!formData.itemName.trim()) {
        setErrorMsg('Please enter the item name.')
        return
      }
    }
    if (currentStep === 3) {
      if (!formData.pickupFlatBuilding || !formData.dropoffAddressLine1) {
        setErrorMsg('Please provide both pickup and delivery addresses.')
        return
      }
    }
    setCurrentStep(prev => Math.min(5, prev + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevStep = () => {
    setErrorMsg('')
    setCurrentStep(prev => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleConfirmBooking = async () => {
    setSubmitting(true)
    setErrorMsg('')

    const token = getUserAccessToken()
    if (!token) {
      setAuthModalOpen(true)
      setSubmitting(false)
      return
    }

    try {
      const idempotencyKey = 'fetch-book-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
      const payload = {
        itemCategory: formData.itemCategory,
        itemName: formData.itemName || 'Forgotten Item',
        itemDescription: formData.description || 'Rapid item retrieval',
        declaredValue: Number(formData.approxValue) || 0,
        itemQuantity: 1,

        locationType: formData.locationType,
        handoverType: formData.handoverType,
        handoverCustomName: formData.contactPersonName || 'Front Desk Staff',
        handoverCustomPhone: formData.contactPersonPhone || '+91 98765 43210',

        pickup: {
          flatBuilding: formData.pickupFlatBuilding,
          street: formData.pickupStreet || 'Main Road',
          area: formData.pickupArea || 'Central',
          city: formData.pickupCity || 'Bengaluru',
          state: formData.pickupState || 'Karnataka',
          postalCode: formData.pickupPostalCode || '560025',
          contactName: formData.pickupContactName || 'Front Desk Reception',
          phoneNumber: formData.pickupPhoneNumber || '+91 98765 43210'
        },

        dropoff: {
          addressType: formData.dropoffAddressType || 'Home',
          addressLine1: formData.dropoffAddressLine1,
          area: formData.dropoffArea || 'Indiranagar',
          city: formData.dropoffCity || 'Bengaluru',
          state: formData.dropoffState || 'Karnataka',
          postalCode: formData.dropoffPostalCode || '560038',
          recipientName: formData.dropoffRecipientName || 'Customer',
          phoneNumber: formData.dropoffPhoneNumber || '+91 63861 89353'
        },

        speed: formData.deliverySpeed,
        scheduledDate: formData.scheduledDate,
        scheduledTimeSlot: formData.scheduledTimeSlot,
        pickupOtpRequired: formData.secureOtpHandover,
        deliveryOtpRequired: true,
        tamperProofPackaging: formData.shipmentProtection,
        paymentMethod: formData.paymentMethod
      }

      const created = await createForgotSomethingBooking(payload, idempotencyKey)
      setConfirmedBooking(created)
      setCurrentStep(6) // Confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Forgot Something booking failed:', err)
      setErrorMsg(err.message || 'Failed to place booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 2000)
  }

  // Pre-fill Sample
  const handleAutoFillSample = () => {
    setFormData(prev => ({
      ...prev,
      itemCategory: 'KEYS',
      itemName: 'Office & Flat Keys with Red Keychain',
      description: 'Bunch of 3 keys attached to red leather keychain with office access card',
      approxValue: '500',
      placeName: 'WeWork Galaxy Residency Road',
      contactPersonName: 'Security Desk Officer',
      contactPersonPhone: '+91 98765 43210',
      roomOrDeskNumber: 'Desk 412 (North Wing)',
      handoverNotes: 'Keys are placed in the reception drawer under "Ravi".',
      deliverySpeed: 'INSTANT'
    }))
  }

  const selectedCategoryMeta = (options?.itemCategories || DEFAULT_FORGOT_SOMETHING_OPTIONS.itemCategories).find(
    c => c.id === formData.itemCategory
  ) || { name: 'Keys', icon: 'Key' }

  // Safe pricing numbers
  const rFee = Number(quote?.retrievalFee ?? 149)
  const dFee = Number(quote?.deliveryFee ?? 129)
  const sFee = Number(quote?.secureHandlingFee ?? 39)
  const discAmt = Number(quote?.discountAmount ?? 0)
  const taxAmt = Number(quote?.taxAmount ?? 23.02)
  const totalAmt = Number(quote?.totalAmount ?? (rFee + dFee + sFee - discAmt + taxAmt))

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.desktopContainer}>
        {/* Top Header */}
        <header className={styles.topNav}>
          <div className={styles.navLeft}>
            <button
              type="button"
              className={styles.backIconBtn}
              onClick={() => currentStep > 1 && currentStep <= 5 ? handlePrevStep() : navigateTo('/user/dashboard')}
            >
              <ArrowLeft size={18} />
            </button>
            <div className={styles.brandGroup}>
              <div className={styles.brandTitleRow}>
                <span className={styles.brandTitle}>DELIVEZ <span className={styles.brandAccent}>FETCH</span></span>
                <span className={styles.brandSub}>RAPID RETRIEVAL</span>
              </div>
              <small className={styles.brandDesc}>
                Retrieve forgotten keys, laptop, chargers, or bags in 15–30 mins flat.
              </small>
            </div>
          </div>

          <div className={styles.navRight}>
            <button type="button" className={styles.sampleAutoFillBtn} onClick={handleAutoFillSample}>
              <Sparkles size={14} />
              <span>Auto-Fill Sample Item</span>
            </button>
            {currentStep <= 5 && (
              <div className={styles.stepIndicatorBadge}>
                Step {currentStep} of 5 • {STEP_TITLES[currentStep - 1]}
              </div>
            )}
          </div>
        </header>

        {/* Desktop Stepper Bar */}
        {currentStep <= 5 && (
          <div className={styles.stepperRail}>
            {STEP_TITLES.map((title, idx) => {
              const stepNum = idx + 1
              const isDone = currentStep > stepNum
              const isActive = currentStep === stepNum
              return (
                <div key={title} className={styles.stepItemWrapper}>
                  <div
                    className={\`\${styles.stepRailItem} \${isActive ? styles.stepRailActive : ''} \${isDone ? styles.stepRailDone : ''}\`}
                    onClick={() => isDone && setCurrentStep(stepNum)}
                  >
                    <div className={styles.stepRailNumber}>
                      {isDone ? <Check size={13} /> : stepNum}
                    </div>
                    <span className={styles.stepRailLabel}>{title}</span>
                  </div>
                  {idx < STEP_TITLES.length - 1 && (
                    <div className={\`\${styles.stepRailDivider} \${isDone ? styles.stepRailDividerActive : ''}\`} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className={styles.errorAlert}>
            <X size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 6: Confirmation View */}
        {currentStep === 6 && confirmedBooking ? (
          <div className={styles.confirmationContainer}>
            <div className={styles.confirmHeader}>
              <div className={styles.confirmBadge}>
                <Check size={36} />
              </div>
              <h1>Retrieval Booking Confirmed!</h1>
              <p>We're dispatching a verified Delivez Fetch partner to collect your item right now.</p>
            </div>

            <div className={styles.confirmInfoGrid}>
              <div className={styles.confirmCard}>
                <small>BOOKING ID</small>
                <strong>{confirmedBooking.bookingNumber || 'DZ-202608-001'}</strong>
                <button type="button" onClick={() => handleCopyId(confirmedBooking.bookingNumber)}>
                  {copiedId ? <Check size={12} /> : <Copy size={12} />}
                </button>
              </div>

              <div className={styles.confirmCard}>
                <small>ESTIMATED ARRIVAL</small>
                <strong style={{ color: '#16a34a' }}>15–25 Mins</strong>
              </div>

              <div className={styles.confirmCard}>
                <small>HANDOVER OTP</small>
                <strong style={{ color: '#dc2626', letterSpacing: '2px' }}>
                  {confirmedBooking.pickupOtp || '4928'}
                </strong>
              </div>

              <div className={styles.confirmCard}>
                <small>TOTAL FARE</small>
                <strong>₹{totalAmt.toFixed(2)}</strong>
              </div>
            </div>

            {/* Tracking Action Buttons */}
            <div className={styles.confirmActionsRow}>
              <button
                type="button"
                className={styles.secondaryHomeBtn}
                onClick={() => navigateTo('/user/dashboard')}
              >
                Go to Dashboard
              </button>
              <button
                type="button"
                className={styles.primaryTrackBtn}
                onClick={() => navigateTo(\`/track/forgot-something/\${confirmedBooking.bookingNumber || confirmedBooking.id}\`)}
              >
                <span>Track Live Retrieval</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Steps 1 to 5: 2-Column Desktop Split Layout */
          <div className={styles.splitLayout}>
            {/* Left Form Panel */}
            <div className={styles.formPanel}>
              {/* STEP 1: Item Details */}
              {currentStep === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.panelHeader}>
                    <h2>What item did you <span className={styles.highlightText}>forget</span>?</h2>
                    <p>Select the category and provide a brief description to help the partner identify it.</p>
                  </div>

                  <div className={styles.categoryGrid}>
                    {(options?.itemCategories || DEFAULT_FORGOT_SOMETHING_OPTIONS.itemCategories).map(cat => {
                      const IconComp = CATEGORY_ICONS[cat.id] || Package
                      const isSelected = formData.itemCategory === cat.id
                      return (
                        <div
                          key={cat.id}
                          className={\`\${styles.categoryCard} \${isSelected ? styles.categorySelected : ''}\`}
                          onClick={() => updateField('itemCategory', cat.id)}
                        >
                          <div className={styles.categoryIconWrap}>
                            <IconComp size={24} />
                          </div>
                          <strong>{cat.name}</strong>
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.formFieldsBlock}>
                    <div className={styles.inputGroup}>
                      <label>Item Name / Tag</label>
                      <input
                        type="text"
                        placeholder="e.g. Set of 3 Office Keys with Red Tag"
                        value={formData.itemName}
                        onChange={(e) => updateField('itemName', e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Item Description & Marks (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Describe color, pouch, brand, or specific identifiers..."
                        value={formData.description}
                        onChange={(e) => updateField('description', e.target.value)}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Approximate Value (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 500"
                        value={formData.approxValue}
                        onChange={(e) => updateField('approxValue', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Location & Handover */}
              {currentStep === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.panelHeader}>
                    <h2>Where is the item <span className={styles.highlightText}>located</span>?</h2>
                    <p>Tell us where you left the item and who the partner should collect it from.</p>
                  </div>

                  <div className={styles.sectionSubTitle}>Location Type</div>
                  <div className={styles.locationGrid}>
                    {(options?.locationTypes || DEFAULT_FORGOT_SOMETHING_OPTIONS.locationTypes).map(loc => {
                      const IconComp = LOCATION_ICONS[loc.id] || Building
                      const isSelected = formData.locationType === loc.id
                      return (
                        <div
                          key={loc.id}
                          className={\`\${styles.locationCard} \${isSelected ? styles.locationSelected : ''}\`}
                          onClick={() => updateField('locationType', loc.id)}
                        >
                          <IconComp size={22} />
                          <strong>{loc.name}</strong>
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.sectionSubTitle} style={{ marginTop: '20px' }}>Who will hand over the item?</div>
                  <div className={styles.handoverGrid}>
                    {(options?.handoverTypes || DEFAULT_FORGOT_SOMETHING_OPTIONS.handoverTypes).map(hnd => {
                      const IconComp = HANDOVER_ICONS[hnd.id] || User
                      const isSelected = formData.handoverType === hnd.id
                      return (
                        <div
                          key={hnd.id}
                          className={\`\${styles.handoverCard} \${isSelected ? styles.handoverSelected : ''}\`}
                          onClick={() => updateField('handoverType', hnd.id)}
                        >
                          <IconComp size={20} />
                          <span>{hnd.name}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.formFieldsBlock} style={{ marginTop: '20px' }}>
                    <div className={styles.formTwoCol}>
                      <div className={styles.inputGroup}>
                        <label>Place / Building Name</label>
                        <input
                          type="text"
                          placeholder="e.g. WeWork Galaxy Residency Road"
                          value={formData.placeName}
                          onChange={(e) => updateField('placeName', e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Room / Desk / Floor</label>
                        <input
                          type="text"
                          placeholder="e.g. Desk 412, 4th Floor"
                          value={formData.roomOrDeskNumber}
                          onChange={(e) => updateField('roomOrDeskNumber', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formTwoCol}>
                      <div className={styles.inputGroup}>
                        <label>Contact Person Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Security Desk / Receptionist"
                          value={formData.contactPersonName}
                          onChange={(e) => updateField('contactPersonName', e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Contact Person Phone</label>
                        <input
                          type="text"
                          placeholder="e.g. +91 98765 43210"
                          value={formData.contactPersonPhone}
                          onChange={(e) => updateField('contactPersonPhone', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Pickup & Delivery Addresses */}
              {currentStep === 3 && (
                <div className={styles.stepContent}>
                  <div className={styles.panelHeader}>
                    <h2>Pickup & <span className={styles.highlightText}>Delivery Route</span></h2>
                    <p>Enter the complete pickup location and your destination address.</p>
                  </div>

                  {/* Pickup Address Box */}
                  <div className={styles.addressFormBlock}>
                    <div className={styles.addressBlockTitle}>
                      <MapPin size={18} color="#dc2626" />
                      <strong>1. Pickup Address (Where item is currently located)</strong>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Building / Flat / Premise</label>
                      <input
                        type="text"
                        placeholder="e.g. WeWork Galaxy, 43 Residency Road"
                        value={formData.pickupFlatBuilding}
                        onChange={(e) => updateField('pickupFlatBuilding', e.target.value)}
                      />
                    </div>
                    <div className={styles.formTwoCol}>
                      <div className={styles.inputGroup}>
                        <label>Street / Area</label>
                        <input
                          type="text"
                          placeholder="e.g. Shanthala Nagar, Ashok Nagar"
                          value={formData.pickupStreet}
                          onChange={(e) => updateField('pickupStreet', e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>City & Pin Code</label>
                        <input
                          type="text"
                          placeholder="e.g. Bengaluru - 560025"
                          value={\`\${formData.pickupCity} - \${formData.pickupPostalCode}\`}
                          onChange={(e) => updateField('pickupCity', e.target.value.split('-')[0].trim())}
                        />
                      </div>
                    </div>
                    <div className={styles.formTwoCol}>
                      <div className={styles.inputGroup}>
                        <label>Contact Person at Pickup</label>
                        <input
                          type="text"
                          value={formData.pickupContactName}
                          onChange={(e) => updateField('pickupContactName', e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <input
                          type="text"
                          value={formData.pickupPhoneNumber}
                          onChange={(e) => updateField('pickupPhoneNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Box */}
                  <div className={styles.addressFormBlock} style={{ marginTop: '20px' }}>
                    <div className={styles.addressBlockTitle}>
                      <MapPinned size={18} color="#16a34a" />
                      <strong>2. Dropoff Address (Deliver to you)</strong>
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Complete Delivery Address Line 1</label>
                      <input
                        type="text"
                        placeholder="House / Flat No, apartment name, street"
                        value={formData.dropoffAddressLine1}
                        onChange={(e) => updateField('dropoffAddressLine1', e.target.value)}
                      />
                    </div>
                    <div className={styles.formTwoCol}>
                      <div className={styles.inputGroup}>
                        <label>Receiver Name</label>
                        <input
                          type="text"
                          value={formData.dropoffRecipientName}
                          onChange={(e) => updateField('dropoffRecipientName', e.target.value)}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Receiver Phone Number</label>
                        <input
                          type="text"
                          value={formData.dropoffPhoneNumber}
                          onChange={(e) => updateField('dropoffPhoneNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Speed & Protection */}
              {currentStep === 4 && (
                <div className={styles.stepContent}>
                  <div className={styles.panelHeader}>
                    <h2>Select <span className={styles.highlightText}>Speed & Security</span></h2>
                    <p>Choose how fast you need your item delivered and customize security protocols.</p>
                  </div>

                  <div className={styles.speedGrid}>
                    {[
                      {
                        id: 'INSTANT',
                        title: '⚡ Instant Flash',
                        time: '15–30 Mins',
                        desc: 'Nearest verified partner dispatched instantly with direct routing.',
                        badge: 'FASTEST'
                      },
                      {
                        id: 'EXPRESS',
                        title: '🚀 Express Retrieval',
                        time: '30–45 Mins',
                        desc: 'Priority retrieval for everyday transit.'
                      },
                      {
                        id: 'SAME_DAY',
                        title: '📅 Scheduled Slot',
                        time: 'Same Day',
                        desc: 'Schedule pickup for later today.'
                      }
                    ].map(sp => {
                      const isSelected = formData.deliverySpeed === sp.id
                      return (
                        <div
                          key={sp.id}
                          className={\`\${styles.speedCard} \${isSelected ? styles.speedSelected : ''}\`}
                          onClick={() => updateField('deliverySpeed', sp.id)}
                        >
                          {sp.badge && <span className={styles.speedBadge}>{sp.badge}</span>}
                          <strong>{sp.title}</strong>
                          <span className={styles.speedTime}>{sp.time}</span>
                          <p>{sp.desc}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Security Toggles */}
                  <div className={styles.securityTogglesBox}>
                    <div className={styles.toggleRow}>
                      <div className={styles.toggleText}>
                        <ShieldCheck size={20} color="#16a34a" />
                        <div>
                          <strong>Secure OTP Handover</strong>
                          <small>Partner can only deliver upon entering 4-digit secret OTP.</small>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.secureOtpHandover}
                        onChange={(e) => updateField('secureOtpHandover', e.target.checked)}
                      />
                    </div>

                    <div className={styles.toggleRow}>
                      <div className={styles.toggleText}>
                        <Shield size={20} color="#0284c7" />
                        <div>
                          <strong>Shipment Protection Cover (+₹39)</strong>
                          <small>100% loss/damage guarantee covered up to ₹10,000.</small>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.shipmentProtection}
                        onChange={(e) => updateField('shipmentProtection', e.target.checked)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Review & Pay */}
              {currentStep === 5 && (
                <div className={styles.stepContent}>
                  <div className={styles.panelHeader}>
                    <h2>Review & <span className={styles.highlightText}>Confirm Retrieval</span></h2>
                    <p>Review your booking details, apply coupons, and choose payment mode.</p>
                  </div>

                  {/* Review Cards */}
                  <div className={styles.reviewCardsGrid}>
                    <div className={styles.reviewCard}>
                      <small>ITEM</small>
                      <strong>{formData.itemName || selectedCategoryMeta.name}</strong>
                      <span>Cat: {selectedCategoryMeta.name}</span>
                    </div>

                    <div className={styles.reviewCard}>
                      <small>SPEED</small>
                      <strong>{formData.deliverySpeed === 'INSTANT' ? 'Instant Flash (15–30 Mins)' : 'Express'}</strong>
                      <span>Direct route dispatch</span>
                    </div>

                    <div className={styles.reviewCard}>
                      <small>SECURITY</small>
                      <strong style={{ color: '#16a34a' }}>OTP Handover Active</strong>
                      <span>Protected ✓</span>
                    </div>
                  </div>

                  {/* Coupon Field */}
                  <div className={styles.couponRow}>
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. DELIVEZ10)"
                      value={formData.couponCode}
                      onChange={(e) => updateField('couponCode', e.target.value.toUpperCase())}
                    />
                    <button type="button" onClick={() => updateField('couponCode', 'DELIVEZ10')}>
                      Apply DELIVEZ10
                    </button>
                  </div>

                  {/* Payment Options */}
                  <div className={styles.paymentMethodsGrid}>
                    {[
                      { id: 'PAY_ON_DELIVERY', label: '💵 Pay on Delivery', sub: 'Cash / UPI at doorstep' },
                      { id: 'UPI', label: '📱 Instant UPI', sub: 'GPay, PhonePe, Paytm' },
                      { id: 'WALLET', label: '💳 Delivez Wallet', sub: 'Instant one-click checkout' },
                      { id: 'CARD', label: '💳 Credit / Debit Card', sub: 'Visa, MasterCard, RuPay' }
                    ].map(pm => {
                      const isSelected = formData.paymentMethod === pm.id
                      return (
                        <div
                          key={pm.id}
                          className={\`\${styles.paymentMethodCard} \${isSelected ? styles.paymentMethodSelected : ''}\`}
                          onClick={() => updateField('paymentMethod', pm.id)}
                        >
                          <strong>{pm.label}</strong>
                          <small>{pm.sub}</small>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Action Navigation */}
              <div className={styles.bottomActions}>
                {currentStep > 1 && (
                  <button type="button" className={styles.prevBtn} onClick={handlePrevStep}>
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                )}

                {currentStep < 5 ? (
                  <button type="button" className={styles.nextBtn} onClick={handleNextStep}>
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.confirmBtn}
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className={styles.spinner} size={16} />
                        <span>Placing Retrieval...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Dispatch Retrieval • ₹{totalAmt.toFixed(2)}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Sticky Live Summary Sidebar */}
            <aside className={styles.summarySidebar}>
              <div className={styles.liveSummaryCard}>
                <div className={styles.summaryTop}>
                  <div className={styles.summaryBadge}>
                    <Zap size={13} /> LIVE QUOTE
                  </div>
                  <strong className={styles.summarySpeedName}>{quote.speedName || 'Instant Flash'}</strong>
                </div>

                {/* Selected Item Preview */}
                <div className={styles.itemPreviewBlock}>
                  <div className={styles.itemIconCircle}>
                    <Package size={20} />
                  </div>
                  <div>
                    <strong>{formData.itemName || selectedCategoryMeta.name}</strong>
                    <small>Category: {selectedCategoryMeta.name}</small>
                  </div>
                </div>

                {/* Route Flow */}
                <div className={styles.routeFlow}>
                  <div className={styles.routeStep}>
                    <div className={styles.routeDotRed} />
                    <div>
                      <small>COLLECT AT</small>
                      <p>{formData.pickupFlatBuilding || 'Workplace / Pickup'}</p>
                    </div>
                  </div>
                  <div className={styles.routeStep}>
                    <div className={styles.routeDotGreen} />
                    <div>
                      <small>DELIVER TO</small>
                      <p>{formData.dropoffAddressLine1 || 'Home / Destination'}</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={styles.fareBreakdownBox}>
                  <div className={styles.fareRow}>
                    <span>Base Retrieval Charge</span>
                    <strong>₹{rFee.toFixed(2)}</strong>
                  </div>
                  <div className={styles.fareRow}>
                    <span>Delivery Base Fee</span>
                    <strong>₹{dFee.toFixed(2)}</strong>
                  </div>
                  {sFee > 0 && (
                    <div className={styles.fareRow}>
                      <span>Secure Handling & Protection</span>
                      <strong>₹{sFee.toFixed(2)}</strong>
                    </div>
                  )}
                  {discAmt > 0 && (
                    <div className={styles.fareRow} style={{ color: '#16a34a' }}>
                      <span>Promo Discount (DELIVEZ10)</span>
                      <strong>-₹{discAmt.toFixed(2)}</strong>
                    </div>
                  )}
                  <div className={styles.fareRow}>
                    <span>GST (~7.25%)</span>
                    <strong>₹{taxAmt.toFixed(2)}</strong>
                  </div>
                  <div className={styles.fareTotalRow}>
                    <span>Total Amount</span>
                    <span>₹{totalAmt.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Footer */}
                <div className={styles.trustFooter}>
                  <ShieldCheck size={16} color="#16a34a" />
                  <span>100% Verified Partners • Contactless Handover</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Seamless Auth Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onAuthenticated={() => {
            setAuthModalOpen(false)
            handleConfirmBooking()
          }}
        />
      </div>
    </div>
  )
}
`;

fs.writeFileSync(path.join(forgotDir, 'ForgotSomethingBookingPage.jsx'), forgotJsx);
console.log('✓ Successfully wrote safe ForgotSomethingBookingPage.jsx');
