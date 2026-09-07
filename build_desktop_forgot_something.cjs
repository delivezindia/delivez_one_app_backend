const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const forgotDir = path.join(webRoot, 'src', 'pages', 'forgot-something');
const returnDir = path.join(webRoot, 'src', 'pages', 'return-pickup');

// 1. Update ReturnPickupBookingPage.jsx to add AuthModal
let returnBookingCode = fs.readFileSync(path.join(returnDir, 'ReturnPickupBookingPage.jsx'), 'utf-8');

if (!returnBookingCode.includes('AuthModal')) {
  returnBookingCode = returnBookingCode.replace(
    /import styles from '\.\/ReturnPickupBookingPage\.module\.css'/,
    `import AuthModal from '@/features/auth/components/AuthModal.jsx'\nimport styles from './ReturnPickupBookingPage.module.css'`
  );

  returnBookingCode = returnBookingCode.replace(
    /const \[submitting, setSubmitting\] = useState\(false\)/,
    `const [submitting, setSubmitting] = useState(false)\n  const [authModalOpen, setAuthModalOpen] = useState(false)`
  );

  returnBookingCode = returnBookingCode.replace(
    /const token = getUserAccessToken\(\)\s*if \(!token\) \{\s*\/\/ Direct user to login or request\s*window\.location\.href = '\/user\/dashboard'\s*return\s*\}/,
    `const token = getUserAccessToken()\n    if (!token) {\n      setAuthModalOpen(true)\n      setSubmitting(false)\n      return\n    }`
  );

  // Add AuthModal component before the last closing tag
  returnBookingCode = returnBookingCode.replace(
    /<\/div>\s*\)\s*\}\s*$/,
    `      <AuthModal\n        isOpen={authModalOpen}\n        onClose={() => setAuthModalOpen(false)}\n        onAuthenticated={() => {\n          setAuthModalOpen(false)\n          handleConfirmBooking()\n        }}\n      />\n    </div>\n  )\n}\n`
  );

  fs.writeFileSync(path.join(returnDir, 'ReturnPickupBookingPage.jsx'), returnBookingCode);
  console.log('✓ ReturnPickupBookingPage.jsx updated with seamless AuthModal and DB integration');
}

// 2. Write Desktop-First ForgotSomethingBookingPage.jsx
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
    itemName: '',
    description: '',
    approxValue: '',
    itemPhotos: [],

    locationType: 'OFFICE',
    placeName: '',
    handoverType: 'RECEPTION',
    contactPersonName: '',
    contactPersonPhone: '',
    roomOrDeskNumber: '',
    handoverNotes: '',

    pickupStoreName: 'Workplace',
    pickupAddress: 'WeWork Galaxy, 43 Residency Road, Shanthala Nagar, Ashok Nagar, Bengaluru, Karnataka 560025',
    pickupCity: 'Bengaluru',
    pickupState: 'Karnataka',
    pickupPostalCode: '560025',
    pickupContactName: 'Office Reception Desk',
    pickupPhoneNumber: '+91 98765 43210',
    pickupInstructions: 'Item is kept with front desk security. Please mention Delivez Fetch pickup.',

    dropoffStoreName: 'Home',
    dropoffAddress: '123, 4th Cross, Indiranagar 1st Stage, Bengaluru, Karnataka 560038',
    dropoffCity: 'Bengaluru',
    dropoffState: 'Karnataka',
    dropoffPostalCode: '560038',
    dropoffContactName: 'Ravi Kishan',
    dropoffPhoneNumber: '+91 63861 89353',
    dropoffInstructions: 'Please deliver to the main door.',

    deliverySpeed: 'INSTANT_FLASH',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeSlot: '15-30 Mins (Fastest)',
    secureOtpHandover: true,
    shipmentProtection: true,
    photoProofRequired: true,
    couponCode: '',
    paymentMethod: 'PAY_ON_DELIVERY'
  })

  // Live Pricing Quote State
  const [quote, setQuote] = useState({
    currency: 'INR',
    baseCharge: 49,
    distanceCharge: 30,
    speedSurcharge: 40,
    protectionCharge: 19,
    discountAmount: 0,
    taxAmount: 24.84,
    totalAmount: 162.84,
    speedName: 'Instant Flash'
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
          deliverySpeed: formData.deliverySpeed,
          shipmentProtection: formData.shipmentProtection,
          approxValue: Number(formData.approxValue) || 0,
          couponCode: formData.couponCode
        })
        if (res) setQuote(res)
      } catch (e) {
        // Fallback local calc
        const speedRate = formData.deliverySpeed === 'INSTANT_FLASH' ? 40 : formData.deliverySpeed === 'EXPRESS_45' ? 25 : 0
        const protRate = formData.shipmentProtection ? 19 : 0
        const sub = 49 + 30 + speedRate + protRate
        const disc = formData.couponCode === 'DELIVEZ10' ? Math.round(sub * 0.1) : 0
        const tax = Math.round((sub - disc) * 0.18)
        setQuote({
          currency: 'INR',
          baseCharge: 49,
          distanceCharge: 30,
          speedSurcharge: speedRate,
          protectionCharge: protRate,
          discountAmount: disc,
          taxAmount: tax,
          totalAmount: sub - disc + tax,
          speedName: formData.deliverySpeed === 'INSTANT_FLASH' ? 'Instant Flash' : 'Express Retrieval'
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
    }
    if (currentStep === 3) {
      if (!formData.pickupAddress || !formData.dropoffAddress) {
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
        itemName: formData.itemName || formData.itemCategory,
        description: formData.description || 'Forgot item retrieval',
        approxValue: Number(formData.approxValue) || 0,
        itemPhotos: formData.itemPhotos,

        locationType: formData.locationType,
        placeName: formData.placeName || 'Workplace / Location',
        handoverType: formData.handoverType,
        contactPersonName: formData.contactPersonName || 'Reception Staff',
        contactPersonPhone: formData.contactPersonPhone || '+91 98765 43210',
        roomOrDeskNumber: formData.roomOrDeskNumber || '',
        handoverNotes: formData.handoverNotes || '',

        pickup: {
          storeName: formData.pickupStoreName || 'Workplace',
          address: formData.pickupAddress,
          city: formData.pickupCity || 'Bengaluru',
          state: formData.pickupState || 'Karnataka',
          postalCode: formData.pickupPostalCode || '560025',
          contactName: formData.pickupContactName || 'Front Desk',
          phoneNumber: formData.pickupPhoneNumber || '+91 98765 43210',
          instructions: formData.pickupInstructions || ''
        },

        dropoff: {
          addressType: formData.dropoffStoreName || 'Home',
          address: formData.dropoffAddress,
          city: formData.dropoffCity || 'Bengaluru',
          state: formData.dropoffState || 'Karnataka',
          postalCode: formData.dropoffPostalCode || '560038',
          contactName: formData.dropoffContactName || 'Customer',
          phoneNumber: formData.dropoffPhoneNumber || '+91 63861 89353',
          instructions: formData.dropoffInstructions || ''
        },

        deliverySpeed: formData.deliverySpeed,
        scheduledDate: formData.scheduledDate,
        scheduledTimeSlot: formData.scheduledTimeSlot,
        secureOtpHandover: formData.secureOtpHandover,
        shipmentProtection: formData.shipmentProtection,
        photoProofRequired: formData.photoProofRequired,
        couponCode: formData.couponCode,
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
      itemName: 'Office & Flat Keys with Red Tag',
      description: 'Bunch of 3 keys attached to a red leather keychain with office access card',
      approxValue: 500,
      placeName: 'WeWork Office 4th Floor',
      contactPersonName: 'Security Desk Officer',
      contactPersonPhone: '+91 98765 43210',
      roomOrDeskNumber: 'Desk 412 (North Wing)',
      handoverNotes: 'Keys are placed in the reception drawer under "Ravi".',
      deliverySpeed: 'INSTANT_FLASH'
    }))
  }

  const selectedCategoryMeta = (options?.itemCategories || DEFAULT_FORGOT_SOMETHING_OPTIONS.itemCategories).find(
    c => c.id === formData.itemCategory
  ) || { name: 'Item', icon: 'Package' }

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
                <strong>₹{(Number(confirmedBooking.totalAmount) || quote.totalAmount).toFixed(2)}</strong>
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
                        placeholder="e.g. Set of 3 Office Keys with Blue Ring"
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
                      <label>Complete Pickup Address</label>
                      <textarea
                        rows={2}
                        placeholder="Street, building name, landmark, area, city & pin code"
                        value={formData.pickupAddress}
                        onChange={(e) => updateField('pickupAddress', e.target.value)}
                      />
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
                      <label>Complete Delivery Address</label>
                      <textarea
                        rows={2}
                        placeholder="House / Flat No, apartment name, street, city & pin code"
                        value={formData.dropoffAddress}
                        onChange={(e) => updateField('dropoffAddress', e.target.value)}
                      />
                    </div>
                    <div className={styles.formTwoCol}>
                      <div className={styles.inputGroup}>
                        <label>Receiver Name</label>
                        <input
                          type="text"
                          value={formData.dropoffContactName}
                          onChange={(e) => updateField('dropoffContactName', e.target.value)}
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
                        id: 'INSTANT_FLASH',
                        title: '⚡ Instant Flash',
                        time: '15–30 Mins',
                        desc: 'Nearest verified partner dispatched instantly with direct routing.',
                        badge: 'FASTEST'
                      },
                      {
                        id: 'EXPRESS_45',
                        title: '🚀 Express Retrieval',
                        time: '30–45 Mins',
                        desc: 'Priority retrieval for everyday transit.'
                      },
                      {
                        id: 'SCHEDULED',
                        title: '📅 Scheduled Slot',
                        time: 'Choose Time',
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
                          <strong>Shipment Protection Cover (+₹19)</strong>
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
                      <strong>{formData.deliverySpeed === 'INSTANT_FLASH' ? 'Instant Flash (15-30 Mins)' : 'Express'}</strong>
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
                        <span>Confirm & Dispatch Retrieval • ₹{quote.totalAmount.toFixed(2)}</span>
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
                      <p>{formData.pickupStoreName || 'Workplace / Pickup'}</p>
                    </div>
                  </div>
                  <div className={styles.routeStep}>
                    <div className={styles.routeDotGreen} />
                    <div>
                      <small>DELIVER TO</small>
                      <p>{formData.dropoffStoreName || 'Home / Destination'}</p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={styles.fareBreakdownBox}>
                  <div className={styles.fareRow}>
                    <span>Base Retrieval Charge</span>
                    <strong>₹{quote.baseCharge.toFixed(2)}</strong>
                  </div>
                  <div className={styles.fareRow}>
                    <span>Distance Fare (~4.2 km)</span>
                    <strong>₹{quote.distanceCharge.toFixed(2)}</strong>
                  </div>
                  <div className={styles.fareRow}>
                    <span>Speed Priority Surcharge</span>
                    <strong>₹{quote.speedSurcharge.toFixed(2)}</strong>
                  </div>
                  {quote.protectionCharge > 0 && (
                    <div className={styles.fareRow}>
                      <span>Shipment Protection Cover</span>
                      <strong>₹{quote.protectionCharge.toFixed(2)}</strong>
                    </div>
                  )}
                  {quote.discountAmount > 0 && (
                    <div className={styles.fareRow} style={{ color: '#16a34a' }}>
                      <span>Promo Discount</span>
                      <strong>-₹{quote.discountAmount.toFixed(2)}</strong>
                    </div>
                  )}
                  <div className={styles.fareRow}>
                    <span>GST (18%)</span>
                    <strong>₹{quote.taxAmount.toFixed(2)}</strong>
                  </div>
                  <div className={styles.fareTotalRow}>
                    <span>Total Amount</span>
                    <span>₹{quote.totalAmount.toFixed(2)}</span>
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

// 3. Write Desktop-First ForgotSomethingBookingPage.module.css
const forgotCss = `/* ForgotSomethingBookingPage.module.css */
.pageWrapper {
  min-height: 100vh;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
  padding: 24px 20px 80px;
  box-sizing: border-box;
}

.desktopContainer {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Top Nav Header */
.topNav {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.navLeft {
  display: flex;
  align-items: center;
  gap: 16px;
}

.backIconBtn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  cursor: pointer;
}

.brandGroup {
  display: flex;
  flex-direction: column;
}

.brandTitleRow {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.brandTitle {
  font-size: 1.35rem;
  font-weight: 900;
  color: #0f172a;
}

.brandAccent {
  color: #d97706;
}

.brandSub {
  font-size: 0.65rem;
  font-weight: 800;
  background: #fef3c7;
  color: #b45309;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.brandDesc {
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 2px;
}

.navRight {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sampleAutoFillBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
}

.stepIndicatorBadge {
  background: #f1f5f9;
  color: #334155;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 14px;
  border-radius: 8px;
}

/* Stepper Rail */
.stepperRail {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.stepItemWrapper {
  display: flex;
  align-items: center;
  flex: 1;
}

.stepItemWrapper:last-child {
  flex: none;
}

.stepRailItem {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.stepRailNumber {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f1f5f9;
  border: 2px solid #cbd5e1;
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepRailActive .stepRailNumber {
  background: #d97706;
  border-color: #d97706;
  color: #ffffff;
}

.stepRailDone .stepRailNumber {
  background: #16a34a;
  border-color: #16a34a;
  color: #ffffff;
}

.stepRailLabel {
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

.stepRailActive .stepRailLabel {
  color: #0f172a;
}

.stepRailDivider {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  margin: 0 12px;
  min-width: 16px;
}

.stepRailDividerActive {
  background: #16a34a;
}

/* 2-Column Split Layout */
.splitLayout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;
}

.formPanel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.panelHeader {
  margin-bottom: 24px;
}

.panelHeader h2 {
  font-size: 1.4rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 6px;
}

.highlightText {
  color: #d97706;
}

.panelHeader p {
  font-size: 0.88rem;
  color: #64748b;
  margin: 0;
}

/* Category Grid */
.categoryGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.categoryCard {
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  background: #ffffff;
  transition: all 0.15s ease;
}

.categoryCard:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.categorySelected {
  border-color: #d97706;
  background: #fffbeb;
  box-shadow: 0 0 0 1px #d97706;
}

.categoryIconWrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
}

.categorySelected .categoryIconWrap {
  background: #fef3c7;
  color: #b45309;
}

.categoryCard strong {
  font-size: 0.8rem;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
}

/* Form Fields */
.formFieldsBlock {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inputGroup label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #334155;
}

.inputGroup input,
.inputGroup textarea {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-family: inherit;
  outline: none;
  background: #ffffff;
}

.inputGroup input:focus,
.inputGroup textarea:focus {
  border-color: #d97706;
  box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.15);
}

.formTwoCol {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* Location & Handover Grids */
.sectionSubTitle {
  font-size: 0.88rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
}

.locationGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.locationCard {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  background: #ffffff;
}

.locationSelected {
  border-color: #d97706;
  background: #fffbeb;
  color: #b45309;
}

.handoverGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.handoverCard {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.82rem;
  font-weight: 700;
}

.handoverSelected {
  border-color: #d97706;
  background: #fffbeb;
  color: #b45309;
}

/* Address Block */
.addressFormBlock {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.addressBlockTitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: #0f172a;
}

/* Speed Grid */
.speedGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.speedCard {
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  background: #ffffff;
  position: relative;
}

.speedSelected {
  border-color: #d97706;
  background: #fffbeb;
  box-shadow: 0 0 0 1px #d97706;
}

.speedBadge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.65rem;
  font-weight: 800;
  background: #fef3c7;
  color: #b45309;
  padding: 2px 6px;
  border-radius: 4px;
}

.speedTime {
  font-size: 1.15rem;
  font-weight: 900;
  color: #d97706;
}

.speedCard p {
  font-size: 0.78rem;
  color: #64748b;
  margin: 0;
  line-height: 1.35;
}

/* Security Toggles */
.securityTogglesBox {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.toggleRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggleText {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggleText strong {
  display: block;
  font-size: 0.9rem;
  color: #0f172a;
}

.toggleText small {
  font-size: 0.78rem;
  color: #64748b;
}

/* Review Cards */
.reviewCardsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.reviewCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reviewCard small {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.reviewCard strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.reviewCard span {
  font-size: 0.78rem;
  color: #64748b;
}

/* Coupon Row */
.couponRow {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.couponRow input {
  flex: 1;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.88rem;
}

.couponRow button {
  background: #fef3c7;
  color: #b45309;
  border: 1px solid #fde68a;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

/* Payment Methods */
.paymentMethodsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.paymentMethodCard {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  cursor: pointer;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.paymentMethodSelected {
  border-color: #d97706;
  background: #fffbeb;
}

.paymentMethodCard strong {
  font-size: 0.88rem;
  color: #0f172a;
}

.paymentMethodCard small {
  font-size: 0.75rem;
  color: #64748b;
}

/* Bottom Actions */
.bottomActions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
  margin-top: 24px;
  gap: 12px;
}

.prevBtn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.nextBtn,
.confirmBtn {
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* Right Sticky Sidebar */
.summarySidebar {
  position: sticky;
  top: 24px;
}

.liveSummaryCard {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summaryTop {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.summaryBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #dcfce7;
  color: #166534;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
}

.summarySpeedName {
  font-size: 0.85rem;
  color: #0f172a;
}

.itemPreviewBlock {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
}

.itemIconCircle {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #fef3c7;
  color: #b45309;
  display: flex;
  align-items: center;
  justify-content: center;
}

.itemPreviewBlock strong {
  display: block;
  font-size: 0.88rem;
  color: #0f172a;
}

.itemPreviewBlock small {
  font-size: 0.75rem;
  color: #64748b;
}

.routeFlow {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
  padding: 14px;
  border-radius: 12px;
}

.routeStep {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.routeDotRed {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dc2626;
  margin-top: 4px;
}

.routeDotGreen {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #16a34a;
  margin-top: 4px;
}

.routeStep small {
  display: block;
  font-size: 0.68rem;
  font-weight: 700;
  color: #64748b;
}

.routeStep p {
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f172a;
  margin: 1px 0 0;
}

.fareBreakdownBox {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
  padding-top: 14px;
}

.fareRow {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #475569;
}

.fareTotalRow {
  display: flex;
  justify-content: space-between;
  font-size: 1.15rem;
  font-weight: 900;
  color: #0f172a;
  border-top: 1px dashed #cbd5e1;
  padding-top: 8px;
  margin-top: 4px;
}

.trustFooter {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  color: #166534;
  font-weight: 600;
  justify-content: center;
}

/* Confirmation Container */
.confirmationContainer {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.confirmBadge {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #16a34a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.confirmHeader h1 {
  font-size: 1.6rem;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 6px;
}

.confirmHeader p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0 0 24px;
}

.confirmInfoGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.confirmCard {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.confirmCard small {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
}

.confirmCard strong {
  font-size: 1.05rem;
  color: #0f172a;
}

.confirmCard button {
  background: none;
  border: none;
  color: #d97706;
  cursor: pointer;
  display: flex;
}

.confirmActionsRow {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.secondaryHomeBtn {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.primaryTrackBtn {
  background: #d97706;
  color: #ffffff;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 0.92rem;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.errorAlert {
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 1024px) {
  .splitLayout {
    grid-template-columns: 1fr;
  }
  .summarySidebar {
    position: static;
  }
  .categoryGrid {
    grid-template-columns: repeat(3, 1fr);
  }
  .confirmInfoGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .topNav,
  .formTwoCol,
  .locationGrid,
  .handoverGrid,
  .speedGrid,
  .reviewCardsGrid,
  .paymentMethodsGrid {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: stretch;
  }
  .categoryGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}
`;

fs.writeFileSync(path.join(forgotDir, 'ForgotSomethingBookingPage.jsx'), forgotJsx);
fs.writeFileSync(path.join(forgotDir, 'ForgotSomethingBookingPage.module.css'), forgotCss);
console.log('✓ ForgotSomethingBookingPage.jsx and CSS updated to desktop version');
