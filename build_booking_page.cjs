const fs = require('fs');
const path = require('path');

const webRoot = 'C:\\Users\\Rax\\Desktop\\Delivery_app_web';
const pageDir = path.join(webRoot, 'src', 'pages', 'return-pickup');

if (!fs.existsSync(pageDir)) {
  fs.mkdirSync(pageDir, { recursive: true });
}

const bookingJsx = `import React, { useState, useEffect, useMemo } from 'react'
import {
  Undo2,
  Repeat,
  Wrench,
  ShieldCheck,
  CalendarDays,
  UserCheck,
  MoreHorizontal,
  ShoppingCart,
  Store,
  Tag,
  Building,
  Home,
  User,
  MapPin,
  Search,
  Mic,
  Camera,
  QrCode,
  Upload,
  FileText,
  Package,
  Clock,
  Rocket,
  Truck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Info,
  Shield,
  CreditCard,
  Wallet,
  Sparkles,
  Edit3,
  Copy,
  Share2,
  Check,
  Loader2,
  Trash2,
  ChevronRight,
  Phone,
  Plus
} from 'lucide-react'
import {
  fetchReturnPickupOptions,
  fetchReturnPickupQuote,
  createReturnPickupBooking,
  DEFAULT_RETURN_PICKUP_OPTIONS
} from '@/features/return-pickup/services/returnPickupService.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'
import styles from './ReturnPickupBookingPage.module.css'

const STEP_TITLES = [
  'Return Type',
  'Destination',
  'Addresses',
  'Items & Documents',
  'Schedule & Speed',
  'Review & Pay'
]

const RETURN_ICONS = {
  RETURN_ITEM: Undo2,
  EXCHANGE_ITEM: Repeat,
  REPAIR_SERVICE: Wrench,
  WARRANTY_RETURN: ShieldCheck,
  RENTAL_RETURN: CalendarDays,
  SEND_BACK_TO_PERSON: UserCheck,
  OTHER: MoreHorizontal
}

const DESTINATION_ICONS = {
  ONLINE_STORE: ShoppingCart,
  LOCAL_STORE: Store,
  BRAND_STORE: Tag,
  SERVICE_CENTRE: Building,
  WAREHOUSE: Home,
  ANOTHER_PERSON: User,
  OTHER: MapPin
}

export default function ReturnPickupBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [options, setOptions] = useState(DEFAULT_RETURN_PICKUP_OPTIONS)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedBookingId, setCopiedBookingId] = useState(false)

  // Booking Form State
  const [formData, setFormData] = useState({
    // Step 1: Return Type
    returnType: 'RETURN_ITEM',

    // Step 2: Destination
    destinationType: 'ONLINE_STORE',
    destinationName: 'Amazon India',
    searchStoreQuery: '',
    customStoreName: '',

    // Step 3: Addresses
    pickupStoreName: 'Home',
    pickupAddress: '123, MG Road, Indiranagar',
    pickupCity: 'Bengaluru',
    pickupState: 'Karnataka',
    pickupPostalCode: '560038',
    pickupContactName: 'Ravi Kumar',
    pickupPhoneNumber: '9876543210',
    pickupReferenceNumber: '',
    pickupInstructions: 'Please collect from the main door.',

    returnAddressType: 'Seller / Warehouse',
    returnAddress: 'Warehouse No. 7, KIADB Industrial Area, Hosur Road',
    returnCity: 'Bengaluru',
    returnState: 'Karnataka',
    returnPostalCode: '560100',
    returnContactName: 'Warehouse Returns Desk',
    returnPhoneNumber: '9123456789',
    returnLandmark: 'Opposite Bosch Gate',
    returnInstructions: 'Return is for quality check and refund.',

    // Step 4: Items & Documents
    entryMode: 'MANUAL', // SCAN, UPLOAD, MANUAL, IMPORT
    orderId: 'ORD-928451',
    returnId: 'RET-627189',
    returnBeforeDate: '16 Aug 2026',
    estimatedRefundAmount: 4999,
    itemCategory: 'ELECTRONICS',
    itemDescription: 'Sony Wireless Headphones (Black) - Defective Product',
    itemQuantity: 1,
    declaredValue: 4999,
    approxWeightKg: 0.5,
    lengthCm: 20,
    widthCm: 15,
    heightCm: 8,
    itemCondition: 'NEW_UNUSED',
    specialHandlingTags: ['Fragile', 'Handle with care', 'High Value Item'],
    documents: [
      { id: 'doc-inv', name: 'Invoice.pdf', type: 'INVOICE_ORDER_PROOF', uploadedAt: 'Today' },
      { id: 'doc-rma', name: 'Return Authorization.pdf', type: 'RETURN_AUTHORIZATION', uploadedAt: 'Today' }
    ],

    // Step 5: Schedule & Speed
    scheduledDate: '2026-08-28',
    scheduledTimeSlot: '11:00 AM - 1:00 PM',
    deliveryService: 'STANDARD',
    shipmentProtection: true,

    // Step 6: Payment & Promos
    couponCode: 'DELIVEZ10',
    paymentMethod: 'WALLET'
  })

  // Live Quote State
  const [quote, setQuote] = useState({
    currency: 'INR',
    basePickupCharge: 49,
    distanceCharge: 20,
    handlingCharge: 10,
    deliveryServiceCharge: 89,
    protectionCharge: 19,
    discountAmount: 18.7,
    taxAmount: 30.47,
    totalAmount: 108.00,
    deliveryServiceName: 'Standard Delivery'
  })

  // Confirmation Result
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Fetch Options on mount
  useEffect(() => {
    async function load() {
      try {
        const data = await fetchReturnPickupOptions()
        if (data) setOptions(data)
      } catch (err) {
        console.error('Error loading return options:', err)
      } finally {
        setLoadingOptions(false)
      }
    }
    load()
  }, [])

  // Recalculate Live Quote when inputs change
  useEffect(() => {
    async function updateQuote() {
      try {
        const q = await fetchReturnPickupQuote({
          deliveryService: formData.deliveryService,
          shipmentProtection: formData.shipmentProtection,
          itemQuantity: formData.itemQuantity,
          declaredValue: formData.declaredValue,
          couponCode: formData.couponCode
        })
        if (q) setQuote(q)
      } catch (err) {
        console.warn('Quote update failed:', err)
      }
    }
    updateQuote()
  }, [
    formData.deliveryService,
    formData.shipmentProtection,
    formData.itemQuantity,
    formData.declaredValue,
    formData.couponCode
  ])

  // Field change helper
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Toggle Special Handling Tags
  const toggleHandlingTag = (tag) => {
    setFormData(prev => {
      const exists = prev.specialHandlingTags.includes(tag)
      return {
        ...prev,
        specialHandlingTags: exists
          ? prev.specialHandlingTags.filter(t => t !== tag)
          : [...prev.specialHandlingTags, tag]
      }
    })
  }

  // Quick Store Select
  const handleSelectStore = (store) => {
    setFormData(prev => ({
      ...prev,
      destinationName: store.name,
      returnAddress: store.address.line1,
      returnCity: store.address.city,
      returnState: store.address.state,
      returnPostalCode: store.address.postalCode,
      returnContactName: store.name + ' Returns Team'
    }))
  }

  // Auto-Fill Verified Demo Return (From reference screens)
  const handleAutoFillVerifiedReturn = () => {
    setFormData(prev => ({
      ...prev,
      destinationName: 'ABC Electronics Returns Centre',
      orderId: 'ORD-928451',
      returnId: 'RET-627189',
      returnBeforeDate: '16 Aug 2026',
      estimatedRefundAmount: 4999,
      itemCategory: 'ELECTRONICS',
      itemDescription: 'Sony Wireless Headphones (Defective Unit)',
      declaredValue: 4999,
      approxWeightKg: 0.5,
      itemCondition: 'NEW_UNUSED',
      returnAddress: 'Warehouse No. 7, KIADB Industrial Area, Hosur Road',
      returnCity: 'Bengaluru',
      returnPostalCode: '560100',
      returnContactName: 'ABC Electronics Hub',
      returnInstructions: 'Return is for quality check and refund.'
    }))
  }

  // Add Document
  const handleAddSampleDoc = (title, type) => {
    const newDoc = {
      id: 'doc-' + Date.now(),
      name: title + '.pdf',
      type: type,
      uploadedAt: 'Just now'
    }
    setFormData(prev => ({
      ...prev,
      documents: [...(prev.documents || []), newDoc]
    }))
  }

  // Remove Document
  const handleRemoveDoc = (id) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter(d => d.id !== id)
    }))
  }

  // Step Validation
  const validateStep = (step) => {
    setErrorMessage('')
    if (step === 1) {
      if (!formData.returnType) {
        setErrorMessage('Please select a return type.')
        return false
      }
    } else if (step === 2) {
      if (!formData.destinationType) {
        setErrorMessage('Please select where you are returning the item.')
        return false
      }
    } else if (step === 3) {
      if (!formData.pickupAddress || !formData.pickupContactName || !formData.pickupPhoneNumber) {
        setErrorMessage('Please complete all required pickup details.')
        return false
      }
      if (!formData.returnAddress || !formData.returnContactName) {
        setErrorMessage('Please complete all required return destination details.')
        return false
      }
    } else if (step === 4) {
      if (!formData.itemDescription) {
        setErrorMessage('Please provide item description.')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(6, prev + 1))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    setErrorMessage('')
    setCurrentStep(prev => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final Submit
  const handleConfirmBooking = async () => {
    setSubmitting(true)
    setErrorMessage('')

    const token = getUserAccessToken()
    if (!token) {
      // Direct user to login or request
      window.location.href = '/user/dashboard'
      return
    }

    try {
      const idempotencyKey = 'ret-book-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
      const bookingPayload = {
        returnType: formData.returnType,
        destinationType: formData.destinationType,
        destinationName: formData.destinationName || formData.customStoreName || 'Seller',
        orderId: formData.orderId || null,
        returnId: formData.returnId || null,
        returnBeforeDate: formData.returnBeforeDate || null,
        estimatedRefundAmount: Number(formData.estimatedRefundAmount) || 0,

        pickupStoreName: formData.pickupStoreName || 'Home',
        pickupAddress: formData.pickupAddress,
        pickupCity: formData.pickupCity || 'Bengaluru',
        pickupState: formData.pickupState || 'Karnataka',
        pickupPostalCode: formData.pickupPostalCode || '560038',
        pickupContactName: formData.pickupContactName,
        pickupPhoneNumber: formData.pickupPhoneNumber,
        pickupReferenceNumber: formData.pickupReferenceNumber || null,
        pickupInstructions: formData.pickupInstructions || null,

        returnAddressType: formData.returnAddressType || 'Seller / Warehouse',
        returnAddress: formData.returnAddress,
        returnCity: formData.returnCity || 'Bengaluru',
        returnState: formData.returnState || 'Karnataka',
        returnPostalCode: formData.returnPostalCode || '560100',
        returnContactName: formData.returnContactName,
        returnPhoneNumber: formData.returnPhoneNumber,
        returnLandmark: formData.returnLandmark || null,
        returnInstructions: formData.returnInstructions || null,

        itemCategory: formData.itemCategory,
        itemDescription: formData.itemDescription,
        itemQuantity: Number(formData.itemQuantity) || 1,
        declaredValue: Number(formData.declaredValue) || 0,
        approxWeightKg: Number(formData.approxWeightKg) || 0.5,
        lengthCm: Number(formData.lengthCm) || null,
        widthCm: Number(formData.widthCm) || null,
        heightCm: Number(formData.heightCm) || null,
        itemCondition: formData.itemCondition,
        specialHandlingTags: formData.specialHandlingTags,
        documents: formData.documents,

        scheduledDate: formData.scheduledDate,
        scheduledTimeSlot: formData.scheduledTimeSlot,
        deliveryService: formData.deliveryService,
        shipmentProtection: formData.shipmentProtection,
        couponCode: formData.couponCode,
        paymentMethod: formData.paymentMethod
      }

      const created = await createReturnPickupBooking(bookingPayload, idempotencyKey)
      setConfirmedBooking(created)
      setCurrentStep(7) // Confirmation View
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Booking submission failed:', err)
      setErrorMessage(err.message || 'Failed to confirm return pickup. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Copy Booking ID
  const handleCopyId = (id) => {
    if (!id) return
    navigator.clipboard.writeText(id)
    setCopiedBookingId(true)
    setTimeout(() => setCopiedBookingId(false), 2000)
  }

  // Render Date Pills
  const datePills = useMemo(() => {
    const list = []
    const today = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + i)
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' })
      const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
      const isoStr = d.toISOString().split('T')[0]
      list.push({ dayName, dateStr, isoStr })
    }
    return list
  }, [])

  return (
    <div className={styles.pageWrapper}>
      {/* Top Header Bar */}
      <header className={styles.topHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.brandRow}>
            <div className={styles.brandTitle}>
              <span className={styles.brandLogo}>DELIVEZ</span>
              <span className={styles.brandBadge}>BACK</span>
              <span className={styles.securePill}>
                <ShieldCheck size={14} /> 100% Secure Return
              </span>
            </div>
            <div className={styles.headerMeta}>
              <span className={styles.walletPill}>
                <Wallet size={14} /> Wallet: ₹108.00
              </span>
            </div>
          </div>

          {/* Stepper Navigation */}
          {currentStep <= 6 && (
            <div className={styles.stepperContainer}>
              <div className={styles.stepperRail}>
                {STEP_TITLES.map((title, idx) => {
                  const stepNum = idx + 1
                  const isDone = stepNum < currentStep
                  const isCurrent = stepNum === currentStep
                  return (
                    <div
                      key={title}
                      className={\`\${styles.stepItem} \${isCurrent ? styles.active : ''} \${isDone ? styles.completed : ''}\`}
                      onClick={() => isDone && setCurrentStep(stepNum)}
                    >
                      <div className={styles.stepCircle}>
                        {isDone ? <Check size={14} /> : stepNum}
                      </div>
                      <span className={styles.stepLabel}>{title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainLayout}>
        {/* If Step 7: Confirmation Screen */}
        {currentStep === 7 && confirmedBooking ? (
          <div className={styles.confirmationHero}>
            <div className={styles.confCheckIcon}>
              <CheckCircle2 size={56} color="#16a34a" />
            </div>
            <h1>Your Return is Booked!</h1>
            <p className={styles.confSub}>
              We have assigned our delivery partner. Your return item will be safely picked up and handed over to the destination seller.
            </p>

            <div className={styles.bookingIdCard}>
              <div>
                <small>RETURN BOOKING ID</small>
                <strong>{confirmedBooking.bookingNumber || confirmedBooking.id}</strong>
              </div>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => handleCopyId(confirmedBooking.bookingNumber || confirmedBooking.id)}
              >
                {copiedBookingId ? <Check size={16} /> : <Copy size={16} />}
                <span>{copiedBookingId ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div className={styles.confSummaryGrid}>
              <div className={styles.confSummaryItem}>
                <CalendarDays size={18} color="#d97706" />
                <div>
                  <small>Pickup Date & Time</small>
                  <strong>{confirmedBooking.scheduledDate || 'Today'} • {confirmedBooking.scheduledTimeSlot || '11:00 AM - 1:00 PM'}</strong>
                </div>
              </div>

              <div className={styles.confSummaryItem}>
                <Store size={18} color="#d97706" />
                <div>
                  <small>Return To</small>
                  <strong>{confirmedBooking.destinationName || 'Seller Warehouse'}</strong>
                </div>
              </div>

              <div className={styles.confSummaryItem}>
                <Package size={18} color="#d97706" />
                <div>
                  <small>Item & Speed</small>
                  <strong>{confirmedBooking.itemDescription || 'Electronic Item'} • {confirmedBooking.deliveryService || 'Standard'}</strong>
                </div>
              </div>

              <div className={styles.confSummaryItem}>
                <ShieldCheck size={18} color="#16a34a" />
                <div>
                  <small>Shipment Protection</small>
                  <strong style={{ color: '#16a34a' }}>Covered up to ₹10,000 ✓</strong>
                </div>
              </div>
            </div>

            <div className={styles.confActions}>
              <button
                type="button"
                className={styles.primaryConfBtn}
                onClick={() => window.location.href = \`/track/return-pickup/\${confirmedBooking.bookingNumber || confirmedBooking.id}\`}
              >
                <span>Track Return Live</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className={styles.secondaryConfBtn}
                onClick={() => window.location.href = \`/return-pickup/details/\${confirmedBooking.bookingNumber || confirmedBooking.id}\`}
              >
                View Return Details
              </button>

              <button
                type="button"
                className={styles.outlineConfBtn}
                onClick={() => window.location.href = '/user/dashboard'}
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* 2-Column Split: Form Wizard + Live Sticky Summary */
          <div className={styles.wizardGrid}>
            {/* Left Column: Interactive Form Steps */}
            <div className={styles.formColumn}>
              {errorMessage && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: Select Return Type */}
              {currentStep === 1 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 1</span>
                    <h2>Select Return Type</h2>
                    <p>What would you like to do with your product or package?</p>
                  </div>

                  <div className={styles.typeGrid}>
                    {options.returnTypes.map((type) => {
                      const IconComponent = RETURN_ICONS[type.id] || Undo2
                      const isSelected = formData.returnType === type.id
                      return (
                        <div
                          key={type.id}
                          className={\`\${styles.typeCard} \${isSelected ? styles.selectedType : ''}\`}
                          onClick={() => updateField('returnType', type.id)}
                        >
                          <div className={styles.typeIconWrapper}>
                            <IconComponent size={24} />
                          </div>
                          <div className={styles.typeContent}>
                            <strong>{type.name}</strong>
                            <p>{type.description}</p>
                          </div>
                          <div className={styles.radioDot}>
                            {isSelected && <div className={styles.radioInner} />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* STEP 2: Where is it going? (Destination) */}
              {currentStep === 2 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 2</span>
                    <h2>Where are you returning it?</h2>
                    <p>Select your return destination category or choose a popular store.</p>
                  </div>

                  {/* Destination Categories */}
                  <div className={styles.destinationGrid}>
                    {options.destinationTypes.map((dest) => {
                      const IconComponent = DESTINATION_ICONS[dest.id] || Store
                      const isSelected = formData.destinationType === dest.id
                      return (
                        <div
                          key={dest.id}
                          className={\`\${styles.destCard} \${isSelected ? styles.selectedDest : ''}\`}
                          onClick={() => updateField('destinationType', dest.id)}
                        >
                          <div className={styles.destIcon}>
                            <IconComponent size={22} />
                          </div>
                          <strong>{dest.name}</strong>
                          <small>{dest.description}</small>
                        </div>
                      )
                    })}
                  </div>

                  {/* Search Store Bar */}
                  <div className={styles.storeSearchBox}>
                    <label>Search Store / Brand Name</label>
                    <div className={styles.searchInputWrap}>
                      <Search size={18} color="#94a3b8" />
                      <input
                        type="text"
                        placeholder="Search store, brand or seller (e.g. Amazon, Flipkart, ABC Electronics)..."
                        value={formData.searchStoreQuery}
                        onChange={(e) => updateField('searchStoreQuery', e.target.value)}
                      />
                      <Mic size={18} color="#94a3b8" />
                    </div>
                  </div>

                  {/* Recent / Suggested Stores */}
                  <div className={styles.recentStoresSection}>
                    <div className={styles.subHeading}>
                      <span>Recent / Popular Returns Hubs</span>
                    </div>
                    <div className={styles.recentStoreList}>
                      {options.recentStores.map((store) => {
                        const isSelected = formData.destinationName === store.name
                        return (
                          <div
                            key={store.id}
                            className={\`\${styles.storePillCard} \${isSelected ? styles.selectedStore : ''}\`}
                            onClick={() => handleSelectStore(store)}
                          >
                            <div className={styles.storeMain}>
                              <div className={styles.storeTitle}>
                                <strong>{store.name}</strong>
                                {store.verified && (
                                  <span className={styles.verifiedTag}>
                                    <ShieldCheck size={12} /> Verified
                                  </span>
                                )}
                              </div>
                              <small>{store.address.line1}, {store.address.city}</small>
                            </div>
                            <button type="button" className={styles.selectStoreBtn}>
                              {isSelected ? 'Selected' : 'Select'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 3: Pickup & Delivery Address Details */}
              {currentStep === 3 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 3</span>
                    <h2>Pickup & Return Addresses</h2>
                    <p>Enter where our partner should collect the item and where to deliver it.</p>
                  </div>

                  {/* Pickup Location Card */}
                  <div className={styles.addressFormBlock}>
                    <div className={styles.blockTitle}>
                      <MapPin size={18} color="#d97706" />
                      <span>Pickup Location (Where should we collect?)</span>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Location / Store Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Home, My Office, ABC Shop"
                          value={formData.pickupStoreName}
                          onChange={(e) => updateField('pickupStoreName', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Order / Reference No. (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. ORD-928451"
                          value={formData.pickupReferenceNumber}
                          onChange={(e) => updateField('pickupReferenceNumber', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <div className={styles.labelWithAction}>
                        <label>Pickup Street Address *</label>
                        <button
                          type="button"
                          className={styles.gpsBtn}
                          onClick={() => updateField('pickupAddress', '123, MG Road, Indiranagar, Bengaluru')}
                        >
                          <MapPin size={13} /> Use Current GPS Location
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="House / Flat / Shop no., Building, Street, Area"
                        value={formData.pickupAddress}
                        onChange={(e) => updateField('pickupAddress', e.target.value)}
                      />
                    </div>

                    <div className={styles.formRowThree}>
                      <div className={styles.formGroup}>
                        <label>City *</label>
                        <input
                          type="text"
                          value={formData.pickupCity}
                          onChange={(e) => updateField('pickupCity', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>State</label>
                        <input
                          type="text"
                          value={formData.pickupState}
                          onChange={(e) => updateField('pickupState', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Pincode *</label>
                        <input
                          type="text"
                          value={formData.pickupPostalCode}
                          onChange={(e) => updateField('pickupPostalCode', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Contact Person Name *</label>
                        <input
                          type="text"
                          placeholder="Enter contact name"
                          value={formData.pickupContactName}
                          onChange={(e) => updateField('pickupContactName', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Contact Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="Enter 10-digit mobile"
                          value={formData.pickupPhoneNumber}
                          onChange={(e) => updateField('pickupPhoneNumber', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Pickup Instructions (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Collect from reception, call on arrival"
                        value={formData.pickupInstructions}
                        onChange={(e) => updateField('pickupInstructions', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Return Delivery Address Card */}
                  <div className={styles.addressFormBlock} style={{ marginTop: '24px' }}>
                    <div className={styles.blockTitle}>
                      <Store size={18} color="#d97706" />
                      <span>Return Delivery Address (Where should we deliver?)</span>
                    </div>

                    <div className={styles.addressTypeTabs}>
                      {['My Home', 'Seller / Warehouse', 'Service Centre', 'Custom Address'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={formData.returnAddressType === type ? styles.activeTab : ''}
                          onClick={() => updateField('returnAddressType', type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    <div className={styles.formGroup}>
                      <label>Destination Store / Facility Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Amazon Fulfillment Centre, ABC Electronics"
                        value={formData.destinationName}
                        onChange={(e) => updateField('destinationName', e.target.value)}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Delivery Address *</label>
                      <input
                        type="text"
                        placeholder="Building, Warehouse Gate, Street, Area"
                        value={formData.returnAddress}
                        onChange={(e) => updateField('returnAddress', e.target.value)}
                      />
                    </div>

                    <div className={styles.formRowThree}>
                      <div className={styles.formGroup}>
                        <label>City *</label>
                        <input
                          type="text"
                          value={formData.returnCity}
                          onChange={(e) => updateField('returnCity', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>State</label>
                        <input
                          type="text"
                          value={formData.returnState}
                          onChange={(e) => updateField('returnState', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Pincode *</label>
                        <input
                          type="text"
                          value={formData.returnPostalCode}
                          onChange={(e) => updateField('returnPostalCode', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Recipient Desk / Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Returns Inward Desk"
                          value={formData.returnContactName}
                          onChange={(e) => updateField('returnContactName', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Recipient Phone Number *</label>
                        <input
                          type="tel"
                          placeholder="Enter phone number"
                          value={formData.returnPhoneNumber}
                          onChange={(e) => updateField('returnPhoneNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 4: Item Details & Return Documents */}
              {currentStep === 4 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 4</span>
                    <h2>Item Details & Documents</h2>
                    <p>Add the return item specifications and attach supporting documents.</p>
                  </div>

                  {/* Auto-detected Return Verification Banner */}
                  <div className={styles.autoDetectBanner}>
                    <div className={styles.autoDetectHeader}>
                      <div className={styles.autoDetectTitle}>
                        <Sparkles size={18} color="#d97706" />
                        <strong>Auto-Detect Return Details</strong>
                      </div>
                      <button
                        type="button"
                        className={styles.demoFillBtn}
                        onClick={handleAutoFillVerifiedReturn}
                      >
                        Auto-Fill Sample Return
                      </button>
                    </div>
                    <p>We found verified return details for <b>ABC Electronics</b> (Order #ORD-928451 • Return #RET-627189).</p>
                    <div className={styles.detectPills}>
                      <span>Product: Sony Headphones</span>
                      <span>Return Before: 16 Aug 2026</span>
                      <span>Est. Refund: ₹4,999.00</span>
                    </div>
                  </div>

                  {/* Item Specs Form */}
                  <div className={styles.itemFormSection}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Item Category *</label>
                        <select
                          value={formData.itemCategory}
                          onChange={(e) => updateField('itemCategory', e.target.value)}
                        >
                          {options.itemCategories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Quantity *</label>
                        <div className={styles.quantityPicker}>
                          {[1, 2, 3, 4, 5].map(q => (
                            <button
                              key={q}
                              type="button"
                              className={formData.itemQuantity === q ? styles.activeQty : ''}
                              onClick={() => updateField('itemQuantity', q)}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Item Description / Model Details *</label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Sony Wireless Headphones, Model WH-1000XM4, Black color. Defective power button."
                        value={formData.itemDescription}
                        onChange={(e) => updateField('itemDescription', e.target.value)}
                      />
                      <small className={styles.charCount}>{formData.itemDescription.length}/250 chars</small>
                    </div>

                    <div className={styles.formRowThree}>
                      <div className={styles.formGroup}>
                        <label>Declared Item Value (₹) *</label>
                        <input
                          type="number"
                          placeholder="e.g. 4999"
                          value={formData.declaredValue}
                          onChange={(e) => updateField('declaredValue', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Approx Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 0.5"
                          value={formData.approxWeightKg}
                          onChange={(e) => updateField('approxWeightKg', e.target.value)}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Est. Refund Amount (₹)</label>
                        <input
                          type="number"
                          placeholder="e.g. 4999"
                          value={formData.estimatedRefundAmount}
                          onChange={(e) => updateField('estimatedRefundAmount', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Item Condition */}
                    <div className={styles.conditionSection}>
                      <label>Item Condition *</label>
                      <div className={styles.conditionGrid}>
                        {options.itemConditions.map(cond => (
                          <div
                            key={cond.id}
                            className={\`\${styles.condCard} \${formData.itemCondition === cond.id ? styles.selectedCond : ''}\`}
                            onClick={() => updateField('itemCondition', cond.id)}
                          >
                            <strong>{cond.name}</strong>
                            <small>{cond.description}</small>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Special Handling Tags */}
                    <div className={styles.handlingSection}>
                      <label>Special Handling & Security Tags</label>
                      <div className={styles.tagChips}>
                        {options.specialHandlingOptions.map(tag => {
                          const isSelected = formData.specialHandlingTags.includes(tag.label)
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              className={\`\${styles.tagChip} \${isSelected ? styles.activeTag : ''}\`}
                              onClick={() => toggleHandlingTag(tag.label)}
                            >
                              {isSelected ? <Check size={14} /> : <Plus size={14} />}
                              <span>{tag.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Documents Upload Section */}
                    <div className={styles.documentsSection}>
                      <div className={styles.subHeading}>
                        <span>Upload Return Documents (PDF / JPG / PNG Max 5MB)</span>
                      </div>

                      <div className={styles.docUploadGrid}>
                        {options.documentTypes.map(doc => (
                          <div key={doc.id} className={styles.docCard}>
                            <div className={styles.docInfo}>
                              <div className={styles.docTitleRow}>
                                <strong>{doc.title}</strong>
                                {doc.badge && <span className={styles.docBadge}>{doc.badge}</span>}
                              </div>
                              <small>{doc.description}</small>
                            </div>
                            <button
                              type="button"
                              className={styles.uploadDocBtn}
                              onClick={() => handleAddSampleDoc(doc.title, doc.id)}
                            >
                              <Upload size={14} /> Attach File
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Uploaded Documents List */}
                      {formData.documents && formData.documents.length > 0 && (
                        <div className={styles.uploadedList}>
                          <strong>Attached Documents ({formData.documents.length}):</strong>
                          <div className={styles.docItemsRow}>
                            {formData.documents.map(d => (
                              <div key={d.id} className={styles.uploadedDocItem}>
                                <FileText size={16} color="#d97706" />
                                <span>{d.name}</span>
                                <button type="button" onClick={() => handleRemoveDoc(d.id)}>
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 5: Schedule & Delivery Service Speed */}
              {currentStep === 5 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 5</span>
                    <h2>Schedule & Service Speed</h2>
                    <p>Select your pickup appointment time and choose delivery transit speed.</p>
                  </div>

                  {/* Pickup Date Picker */}
                  <div className={styles.scheduleBlock}>
                    <label>Select Pickup Date</label>
                    <div className={styles.datePillsRow}>
                      {datePills.map(dp => {
                        const isSelected = formData.scheduledDate === dp.isoStr
                        return (
                          <div
                            key={dp.isoStr}
                            className={\`\${styles.datePill} \${isSelected ? styles.selectedDate : ''}\`}
                            onClick={() => updateField('scheduledDate', dp.isoStr)}
                          >
                            <span className={styles.pillDay}>{dp.dayName}</span>
                            <span className={styles.pillDate}>{dp.dateStr}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Pickup Time Slots */}
                  <div className={styles.scheduleBlock} style={{ marginTop: '20px' }}>
                    <div className={styles.labelWithAction}>
                      <label>Select Pickup Time Window</label>
                      <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                        Fastest Partner Arrival Available
                      </span>
                    </div>
                    <div className={styles.timeSlotsGrid}>
                      {options.pickupTimeSlots.map((slot, idx) => {
                        const isSelected = formData.scheduledTimeSlot === slot
                        return (
                          <div
                            key={slot}
                            className={\`\${styles.slotPill} \${isSelected ? styles.selectedSlot : ''}\`}
                            onClick={() => updateField('scheduledTimeSlot', slot)}
                          >
                            <Clock size={14} />
                            <span>{slot}</span>
                            {idx === 0 && <span className={styles.fastestTag}>Fastest</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Delivery Service Speed Options */}
                  <div className={styles.servicesBlock} style={{ marginTop: '28px' }}>
                    <label>Choose Delivery Service Speed</label>
                    <div className={styles.serviceCardsGrid}>
                      {options.deliveryServices.map(srv => {
                        const isSelected = formData.deliveryService === srv.id
                        return (
                          <div
                            key={srv.id}
                            className={\`\${styles.serviceSpeedCard} \${isSelected ? styles.selectedService : ''}\`}
                            onClick={() => updateField('deliveryService', srv.id)}
                          >
                            <div className={styles.srvTopRow}>
                              <div className={styles.srvTitleCol}>
                                <div className={styles.srvNameRow}>
                                  <strong>{srv.name}</strong>
                                  {srv.badge && <span className={styles.srvBadge}>{srv.badge}</span>}
                                </div>
                                <small>{srv.description}</small>
                              </div>
                              <div className={styles.srvPrice}>
                                <strong>₹{srv.baseCharge}.00</strong>
                              </div>
                            </div>
                            <div className={styles.srvBottomRow}>
                              <span className={styles.etaPill}>
                                <Truck size={13} /> {srv.eta}
                              </span>
                              <div className={styles.radioDot}>
                                {isSelected && <div className={styles.radioInner} />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Shipment Protection Toggle */}
                  <div className={styles.protectionCard} style={{ marginTop: '24px' }}>
                    <div className={styles.protLeft}>
                      <ShieldCheck size={28} color="#16a34a" />
                      <div>
                        <strong>Add Shipment Protection (Recommended)</strong>
                        <p>Complete transit cover up to ₹10,000 against package damage, breakage, or loss.</p>
                      </div>
                    </div>
                    <div className={styles.protRight}>
                      <span className={styles.protPrice}>+₹19.00</span>
                      <input
                        type="checkbox"
                        checked={formData.shipmentProtection}
                        onChange={(e) => updateField('shipmentProtection', e.target.checked)}
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 6: Review & Payment */}
              {currentStep === 6 && (
                <section className={styles.stepCard}>
                  <div className={styles.stepHeader}>
                    <span className={styles.stepBadge}>Step 6</span>
                    <h2>Review & Confirm Payment</h2>
                    <p>Review your return details and select a secure payment method.</p>
                  </div>

                  {/* Review Cards */}
                  <div className={styles.reviewBlocks}>
                    {/* Pickup Address */}
                    <div className={styles.reviewItem}>
                      <div className={styles.reviewIcon}><MapPin size={18} /></div>
                      <div className={styles.reviewDetails}>
                        <small>PICKUP FROM</small>
                        <strong>{formData.pickupStoreName} • {formData.pickupContactName} ({formData.pickupPhoneNumber})</strong>
                        <p>{formData.pickupAddress}, {formData.pickupCity} - {formData.pickupPostalCode}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(3)}>
                        <Edit3 size={14} /> Edit
                      </button>
                    </div>

                    {/* Return Destination */}
                    <div className={styles.reviewItem}>
                      <div className={styles.reviewIcon}><Store size={18} /></div>
                      <div className={styles.reviewDetails}>
                        <small>RETURN TO</small>
                        <strong>{formData.destinationName} • {formData.returnContactName}</strong>
                        <p>{formData.returnAddress}, {formData.returnCity} - {formData.returnPostalCode}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(3)}>
                        <Edit3 size={14} /> Edit
                      </button>
                    </div>

                    {/* Item Details */}
                    <div className={styles.reviewItem}>
                      <div className={styles.reviewIcon}><Package size={18} /></div>
                      <div className={styles.reviewDetails}>
                        <small>ITEM DETAILS</small>
                        <strong>{formData.itemDescription}</strong>
                        <p>Qty: {formData.itemQuantity} • Value: ₹{formData.declaredValue} • Condition: {formData.itemCondition}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(4)}>
                        <Edit3 size={14} /> Edit
                      </button>
                    </div>

                    {/* Schedule & Speed */}
                    <div className={styles.reviewItem}>
                      <div className={styles.reviewIcon}><Clock size={18} /></div>
                      <div className={styles.reviewDetails}>
                        <small>SCHEDULE & SPEED</small>
                        <strong>{formData.scheduledDate} ({formData.scheduledTimeSlot})</strong>
                        <p>Service: {formData.deliveryService} • Protection: {formData.shipmentProtection ? 'Covered up to ₹10,000' : 'None'}</p>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(5)}>
                        <Edit3 size={14} /> Edit
                      </button>
                    </div>
                  </div>

                  {/* Promo Coupon Code */}
                  <div className={styles.couponBox}>
                    <Tag size={18} color="#d97706" />
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. DELIVEZ10)"
                      value={formData.couponCode}
                      onChange={(e) => updateField('couponCode', e.target.value)}
                    />
                    <button type="button" className={styles.applyCouponBtn}>
                      Applied
                    </button>
                  </div>

                  {/* Payment Method Selector */}
                  <div className={styles.paymentMethodsSection}>
                    <label>Select Payment Mode</label>
                    <div className={styles.paymentGrid}>
                      {[
                        { id: 'WALLET', name: 'Delivez Money (Wallet)', sub: 'Balance: ₹108.00 (Instant)', icon: Wallet },
                        { id: 'UPI', name: 'UPI / QR', sub: 'Google Pay, PhonePe, Paytm', icon: CreditCard },
                        { id: 'CARD', name: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay', icon: CreditCard },
                        { id: 'NET_BANKING', name: 'Net Banking', sub: 'All Indian banks supported', icon: Building },
                        { id: 'PAY_ON_PICKUP', name: 'Pay on Pickup', sub: 'Pay delivery partner via cash/UPI', icon: UserCheck },
                      ].map(pm => {
                        const isSelected = formData.paymentMethod === pm.id
                        const Icon = pm.icon
                        return (
                          <div
                            key={pm.id}
                            className={\`\${styles.payCard} \${isSelected ? styles.selectedPay : ''}\`}
                            onClick={() => updateField('paymentMethod', pm.id)}
                          >
                            <div className={styles.payIcon}><Icon size={20} /></div>
                            <div className={styles.payInfo}>
                              <strong>{pm.name}</strong>
                              <small>{pm.sub}</small>
                            </div>
                            <div className={styles.radioDot}>
                              {isSelected && <div className={styles.radioInner} />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )}

              {/* Wizard Navigation Footer */}
              <div className={styles.wizardFooter}>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={handleBack}
                    disabled={submitting}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    className={styles.nextBtn}
                    onClick={handleNext}
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.confirmPayBtn}
                    onClick={handleConfirmBooking}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className={styles.spinner} />
                        <span>Confirming Return Pickup...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm & Book Return (₹{quote.totalAmount.toFixed(2)})</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Live Sticky Summary Sidebar */}
            <aside className={styles.summaryColumn}>
              <div className={styles.stickyCard}>
                <div className={styles.sidebarHeader}>
                  <Undo2 size={20} color="#d97706" />
                  <div>
                    <h3>Return Summary</h3>
                    <small>DELIVEZ SECURE RETURN</small>
                  </div>
                </div>

                <div className={styles.sidebarDetails}>
                  <div className={styles.sideItem}>
                    <small>Return Type</small>
                    <strong>{formData.returnType.replace('_', ' ')}</strong>
                  </div>

                  <div className={styles.sideItem}>
                    <small>Destination Hub</small>
                    <strong>{formData.destinationName || 'Seller Hub'}</strong>
                  </div>

                  <div className={styles.sideItem}>
                    <small>Product</small>
                    <span className={styles.productSnippet}>{formData.itemDescription}</span>
                  </div>

                  <div className={styles.sideItem}>
                    <small>Delivery Speed</small>
                    <strong>{quote.deliveryServiceName || 'Standard Delivery'}</strong>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className={styles.priceBreakdown}>
                  <h4>Price Details</h4>
                  <div className={styles.priceRow}>
                    <span>Base Pickup Fee</span>
                    <span>₹{quote.basePickupCharge.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Distance Charge</span>
                    <span>₹{quote.distanceCharge.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Handling & Processing</span>
                    <span>₹{quote.handlingCharge.toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Delivery Service Speed</span>
                    <span>₹{quote.deliveryServiceCharge.toFixed(2)}</span>
                  </div>
                  {quote.protectionCharge > 0 && (
                    <div className={styles.priceRow}>
                      <span>Shipment Protection</span>
                      <span>₹{quote.protectionCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {quote.discountAmount > 0 && (
                    <div className={\`\${styles.priceRow} \${styles.discountRow}\`}>
                      <span>Coupon Discount (DELIVEZ10)</span>
                      <span>-₹{quote.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.priceRow}>
                    <span>Taxes & GST (18%)</span>
                    <span>₹{quote.taxAmount.toFixed(2)}</span>
                  </div>

                  <div className={styles.totalRow}>
                    <div>
                      <strong>Total Amount</strong>
                      <small>Inclusive of all taxes</small>
                    </div>
                    <span className={styles.totalPrice}>₹{quote.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.guaranteeBadge}>
                  <ShieldCheck size={18} color="#16a34a" />
                  <span>100% Damage Protected Return Guarantee</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}
`;

fs.writeFileSync(path.join(pageDir, 'ReturnPickupBookingPage.jsx'), bookingJsx);
console.log('✓ ReturnPickupBookingPage.jsx written');
