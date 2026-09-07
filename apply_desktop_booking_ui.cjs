const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';

function writeFile(relPath, content) {
  const fullPath = path.join(webRoot, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
  console.log('Wrote:', fullPath);
}

// 1. CSS
const desktopCss = fs.readFileSync('c:/Users/Rax/Desktop/Delivery_app_site_backend/build_desktop_forgot_something.cjs', 'utf8');
writeFile('src/pages/forgot-something/ForgotSomethingBookingPage.module.css', desktopCss);
writeFile('src/pages/forgot-something/ForgotSomethingTrackingPage.module.css', desktopCss);

// 2. Booking Page JSX
const bookingJsx = `import { useEffect, useMemo, useState } from 'react'
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
  CreditCard,
  Crosshair,
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
} from 'lucide-react'
import { navigateTo } from '@/app/router/navigation.js'
import { getStoredUser } from '@/features/auth/services/userAuthService.js'
import {
  createForgotSomethingBooking,
  fetchForgotSomethingOptions,
  fetchForgotSomethingQuote,
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

const STEPS = [
  { id: 1, name: 'Item' },
  { id: 2, name: 'Location' },
  { id: 3, name: 'Handover' },
  { id: 4, name: 'Pickup' },
  { id: 5, name: 'Deliver To' },
  { id: 6, name: 'Details' },
  { id: 7, name: 'Speed' },
  { id: 8, name: 'Security' },
  { id: 9, name: 'Review & Pay' },
]

export default function ForgotSomethingBookingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [options, setOptions] = useState(null)
  const [savedAddresses, setSavedAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  const [formData, setFormData] = useState({
    itemCategory: 'BAG',
    itemName: 'Black Laptop Bag',
    itemDescription: 'Left behind in cab on the way',
    itemBrandColor: 'Safari / Black',
    itemQuantity: 1,
    declaredValue: 2500,
    itemTags: ['Fragile', 'High Value', 'Urgent'],
    itemPhotoUrl: '',
    itemPhotoData: '',
    photoPreview: '',

    locationType: 'HOTEL',
    handoverType: 'RECEPTION',
    handoverCustomName: '',
    handoverCustomPhone: '',

    pickup: {
      flatBuilding: 'Flat 402, Lotus Towers',
      street: 'Outer Ring Road',
      area: 'Bellandur',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560103',
      contactName: 'Front Desk Reception',
      phoneNumber: '9876543210',
      landmark: 'Near EcoSpace',
    },

    dropoff: {
      addressType: 'Home',
      addressLine1: '123, MG Road, Bengaluru',
      addressLine2: '',
      area: 'MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560001',
      recipientName: 'Rahul Sharma',
      phoneNumber: '9876548421',
      landmark: 'Opposite Trinity Metro',
    },

    speed: 'INSTANT',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeSlot: 'ASAP',

    pickupOtpRequired: true,
    deliveryOtpRequired: true,
    photoAtPickup: false,
    photoAtDelivery: true,
    tamperProofPackaging: true,
    receiverSignature: false,
    callBeforeArrival: false,

    paymentMethod: 'WALLET',
    termsAccepted: true,
  })

  const [quote, setQuote] = useState({
    retrievalFee: 149,
    deliveryFee: 129,
    secureHandlingFee: 39,
    taxAmount: 23.02,
    totalAmount: 340.02,
  })

  useEffect(() => {
    let active = true
    Promise.all([fetchForgotSomethingOptions(), fetchSavedAddresses().catch(() => [])])
      .then(([optData, addresses]) => {
        if (!active) return
        setOptions(optData)
        setSavedAddresses(addresses || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load initial data:', err)
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    fetchForgotSomethingQuote({
      speed: formData.speed,
      tamperProofPackaging: formData.tamperProofPackaging,
      itemQuantity: formData.itemQuantity,
      declaredValue: formData.declaredValue,
    })
      .then((q) => setQuote(q))
      .catch(() => {})
  }, [formData.speed, formData.tamperProofPackaging, formData.itemQuantity, formData.declaredValue])

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setFormData((prev) => ({
            ...prev,
            pickup: {
              ...prev.pickup,
              city: 'Bengaluru',
              area: 'Indiranagar',
              street: '100 Feet Road',
              postalCode: '560038',
              landmark: 'GPS Auto-Detected Location',
            },
          }))
        },
        () => {
          setFormData((prev) => ({
            ...prev,
            pickup: {
              ...prev.pickup,
              flatBuilding: 'Sector 42, DLF Phase 5',
              street: 'Golf Course Road',
              area: 'Sector 42',
              city: 'Gurugram',
              state: 'Haryana',
              postalCode: '122002',
              landmark: 'Near Rapid Metro',
            },
          }))
        }
      )
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be smaller than 5MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      setFormData((prev) => ({
        ...prev,
        photoPreview: dataUrl,
        itemPhotoData: dataUrl,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleToggleTag = (tag) => {
    setFormData((prev) => {
      const exists = prev.itemTags.includes(tag)
      return {
        ...prev,
        itemTags: exists ? prev.itemTags.filter((t) => t !== tag) : [...prev.itemTags, tag],
      }
    })
  }

  const handleSelectSavedAddress = (addr) => {
    setFormData((prev) => ({
      ...prev,
      dropoff: {
        ...prev.dropoff,
        addressType: addr.label || 'Home',
        addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2 || '',
        area: addr.area || '',
        city: addr.city || 'Bengaluru',
        state: addr.state || 'Karnataka',
        postalCode: addr.postalCode || '560001',
        recipientName: addr.contactName || prev.dropoff.recipientName,
        phoneNumber: addr.phoneNumber || prev.dropoff.phoneNumber,
        landmark: addr.landmark || '',
      },
    }))
  }

  const handleNextStep = () => {
    setErrorMsg('')
    if (currentStep === 1 && !formData.itemCategory) {
      setErrorMsg('Please select what item you forgot.')
      return
    }
    if (currentStep === 2 && !formData.locationType) {
      setErrorMsg('Please select where your item is located.')
      return
    }
    if (currentStep === 3 && !formData.handoverType) {
      setErrorMsg('Please select who will hand over the item.')
      return
    }
    if (currentStep === 4) {
      if (!formData.pickup.flatBuilding || !formData.pickup.street || !formData.pickup.city) {
        setErrorMsg('Please fill in required pickup address details.')
        return
      }
      if (!formData.pickup.contactName || !formData.pickup.phoneNumber) {
        setErrorMsg('Please provide pickup contact name and phone number.')
        return
      }
    }
    if (currentStep === 5) {
      if (!formData.dropoff.addressLine1 || !formData.dropoff.city) {
        setErrorMsg('Please fill in delivery address details.')
        return
      }
      if (!formData.dropoff.recipientName || !formData.dropoff.phoneNumber) {
        setErrorMsg('Please provide recipient name and phone number.')
        return
      }
    }
    if (currentStep === 6) {
      if (!formData.itemName.trim()) {
        setErrorMsg('Please specify the item name.')
        return
      }
    }
    setCurrentStep((prev) => prev + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevStep = () => {
    setErrorMsg('')
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigateTo('/user/dashboard')
    }
  }

  const handleConfirmAndBook = async () => {
    setErrorMsg('')
    const user = getStoredUser()
    if (!user) {
      setAuthModalOpen(true)
      return
    }

    if (!formData.termsAccepted) {
      setErrorMsg('Please accept the Terms & Conditions and Privacy Policy to proceed.')
      return
    }

    setSubmitting(true)
    try {
      const idempotencyKey = 'fs-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9)
      const booking = await createForgotSomethingBooking(
        {
          itemCategory: formData.itemCategory,
          itemName: formData.itemName,
          itemDescription: formData.itemDescription,
          itemBrandColor: formData.itemBrandColor,
          itemQuantity: formData.itemQuantity,
          declaredValue: formData.declaredValue,
          itemTags: formData.itemTags,
          itemPhotoData: formData.itemPhotoData || null,
          locationType: formData.locationType,
          handoverType: formData.handoverType,
          handoverCustomName: formData.handoverCustomName || null,
          handoverCustomPhone: formData.handoverCustomPhone || null,
          pickup: formData.pickup,
          dropoff: formData.dropoff,
          speed: formData.speed,
          scheduledDate: formData.scheduledDate,
          scheduledTimeSlot: formData.scheduledTimeSlot,
          pickupOtpRequired: formData.pickupOtpRequired,
          deliveryOtpRequired: formData.deliveryOtpRequired,
          photoAtPickup: formData.photoAtPickup,
          photoAtDelivery: formData.photoAtDelivery,
          tamperProofPackaging: formData.tamperProofPackaging,
          receiverSignature: formData.receiverSignature,
          callBeforeArrival: formData.callBeforeArrival,
          paymentMethod: formData.paymentMethod,
        },
        idempotencyKey
      )

      setConfirmedBooking(booking)
      setCurrentStep(10)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error('Booking failed:', err)
      setErrorMsg(err?.message || 'Unable to place retrieval request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const SelectedCategoryIcon = CATEGORY_ICONS[formData.itemCategory] || Package

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.desktopContainer}>
        {/* Top Navbar */}
        <header className={styles.topNav}>
          <div className={styles.navLeft}>
            <button className={styles.backIconBtn} onClick={handlePrevStep} aria-label="Go Back">
              <ArrowLeft size={20} />
            </button>
            <div className={styles.brandGroup} onClick={() => navigateTo('/')} style={{ cursor: 'pointer' }}>
              <div className={styles.brandTitle}>
                DELIVE<span className={styles.brandAccent}>Z</span>
              </div>
              <div className={styles.brandSub}>FETCH • RAPID RETRIEVAL</div>
            </div>
          </div>

          <div className={styles.navRight}>
            {currentStep <= 9 && (
              <div className={styles.stepIndicatorBadge}>
                Step {currentStep} of 9 • {STEPS[currentStep - 1]?.name}
              </div>
            )}
            <button
              className={styles.supportBtn}
              onClick={() => alert('24/7 Delivez Fetch retrieval desk: Call 1800-DELIVEZ (toll-free).')}
            >
              <HelpCircle size={16} color="#d32f2f" />
              <span>Help Desk</span>
            </button>
          </div>
        </header>

        {/* Stepper Rail (Desktop Horizontal Bar for Steps 1 to 9) */}
        {currentStep <= 9 && (
          <div className={styles.stepperRail}>
            {STEPS.map((step, idx) => {
              const isDone = currentStep > step.id
              const isActive = currentStep === step.id
              return (
                <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 'none' }}>
                  <div
                    className={\`\${styles.stepRailItem} \${isActive ? styles.stepRailActive : ''} \${
                      isDone ? styles.stepRailDone : ''
                    }\`}
                    onClick={() => {
                      if (isDone) setCurrentStep(step.id)
                    }}
                  >
                    <div className={styles.stepRailNumber}>{isDone ? <Check size={14} /> : step.id}</div>
                    <span className={styles.stepRailLabel}>{step.name}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={\`\${styles.stepRailDivider} \${isDone ? styles.stepRailDividerActive : ''}\`} />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Dynamic Step Panels */}
        {currentStep === 10 && confirmedBooking ? (
          /* Step 10: Confirmation View */
          <div className={styles.confirmationContainer}>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.confirmBadge}>
                <Check size={36} />
              </div>
              <h1 className={styles.panelTitle} style={{ fontSize: '2rem' }}>
                Booking Confirmed!
              </h1>
              <p className={styles.panelSubtitle} style={{ fontSize: '1.1rem', color: '#15803d', fontWeight: 700 }}>
                We're dispatching a verified partner to retrieve your item now.
              </p>
            </div>

            <div className={styles.confirmInfoGrid}>
              <div className={styles.confirmInfoCard}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>BOOKING ID</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                  {confirmedBooking.bookingNumber}
                </span>
              </div>
              <div className={styles.confirmInfoCard}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>ESTIMATED PICKUP</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#d97706' }}>15–20 Mins</span>
              </div>
              <div className={styles.confirmInfoCard}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>SERVICE SPEED</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                  {confirmedBooking.speed || 'Instant'}
                </span>
              </div>
              <div className={styles.confirmInfoCard}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>PROTECTION</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#10b981' }}>Secure Handled</span>
              </div>
            </div>

            {/* Retrieval Progress Tracker */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem', color: '#0f172a' }}>
                Live Retrieval Milestone Track
              </div>
              <div className={styles.milestoneTrack}>
                <div className={styles.milestoneLine} />
                <div className={\`\${styles.milestoneNode} \${styles.milestoneNodeDone}\`}>
                  <Check size={16} color="#fff" />
                </div>
                <div className={\`\${styles.milestoneNode} \${styles.milestoneNodeDone}\`}>
                  <Check size={16} color="#fff" />
                </div>
                <div className={styles.milestoneNode} />
                <div className={styles.milestoneNode} />
                <div className={styles.milestoneNode} />
              </div>

              <div className={styles.milestoneLabels}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Order Confirmed</div>
                  <small style={{ color: '#64748b' }}>Just now</small>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Partner Assigned</div>
                  <small style={{ color: '#15803d' }}>Active</small>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8' }}>Pickup in Progress</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8' }}>On the Way</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#94a3b8' }}>Delivered</div>
                </div>
              </div>
            </div>

            <div className={styles.otpDisplayBox}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#0f172a' }}>Pickup Verification OTP</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Share this 4-digit code with the retrieval partner upon item pickup.
                </div>
              </div>
              <div className={styles.otpCodeBadge}>{confirmedBooking.pickupOtp || '4821'}</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                className={styles.continueYellowBtn}
                style={{ flex: 1, padding: '1rem' }}
                onClick={() => navigateTo(\`/track/forgot-something/\${confirmedBooking.bookingNumber}\`)}
              >
                <MapPin size={18} /> Track Live Retrieval Telemetry &gt;
              </button>
              <button
                className={styles.backBtn}
                style={{ flex: 1, padding: '1rem', justifyContent: 'center' }}
                onClick={() => navigateTo('/user/dashboard')}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* Steps 1 to 9: Split-Pane Desktop Layout */
          <div className={styles.splitLayout}>
            {/* Left Form Panel */}
            <div className={styles.formPanel}>
              {/* STEP 1: What did you forget? */}
              {currentStep === 1 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>What did you forget?</h1>
                    <p className={styles.panelSubtitle}>Select the category of the item you want us to fetch.</p>
                  </div>

                  <div className={styles.categoryGrid}>
                    {(options?.itemCategories || []).map((cat) => {
                      const IconComp = CATEGORY_ICONS[cat.id] || Package
                      const isSelected = formData.itemCategory === cat.id
                      return (
                        <div
                          key={cat.id}
                          className={\`\${styles.categoryCard} \${isSelected ? styles.categoryCardSelected : ''}\`}
                          onClick={() => setFormData((p) => ({ ...p, itemCategory: cat.id, itemName: p.itemName || cat.name }))}
                        >
                          <div className={styles.categoryIconCircle}>
                            <IconComp size={28} />
                          </div>
                          <span className={styles.categoryLabel}>{cat.name}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.trustBanner}>
                    <ShieldCheck size={32} color="#d97706" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '2px' }}>
                        We've got you covered!
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                        Our background-verified partners securely retrieve forgotten items from residences, hotels, offices, vehicles, or restaurants with tamper-evident packaging.
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2: Where is your item? */}
              {currentStep === 2 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>Where is your item?</h1>
                    <p className={styles.panelSubtitle}>Let us know the type of place where we should pick up your item.</p>
                  </div>

                  <div className={styles.placeGrid}>
                    {(options?.locationTypes || []).map((loc) => {
                      const IconComp = LOCATION_ICONS[loc.id] || MapPin
                      const isSelected = formData.locationType === loc.id
                      return (
                        <div
                          key={loc.id}
                          className={\`\${styles.placeCard} \${isSelected ? styles.placeCardSelected : ''}\`}
                          onClick={() => setFormData((p) => ({ ...p, locationType: loc.id }))}
                        >
                          {isSelected && (
                            <div className={styles.placeCardBadge}>
                              <Check size={14} />
                            </div>
                          )}
                          <div className={styles.placeIconBox}>
                            <IconComp size={24} />
                          </div>
                          <div className={styles.placeTitle}>{loc.name}</div>
                          <div className={styles.placeDesc}>{loc.description}</div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* STEP 3: Who can hand it over? */}
              {currentStep === 3 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>Who can hand it over?</h1>
                    <p className={styles.panelSubtitle}>
                      Our delivery partner will coordinate with this point of contact at the pickup location.
                    </p>
                  </div>

                  <div className={styles.handoverGrid}>
                    {(options?.handoverOptions || []).map((h) => {
                      const IconComp = HANDOVER_ICONS[h.id] || User
                      const isSelected = formData.handoverType === h.id
                      return (
                        <div
                          key={h.id}
                          className={\`\${styles.handoverCard} \${isSelected ? styles.handoverCardSelected : ''}\`}
                          onClick={() => setFormData((p) => ({ ...p, handoverType: h.id }))}
                        >
                          <div className={styles.placeIconBox} style={{ width: '44px', height: '44px' }}>
                            <IconComp size={20} />
                          </div>
                          <div className={styles.handoverInfo}>
                            <div className={styles.handoverTitle}>{h.name}</div>
                            <div className={styles.handoverDesc}>{h.description}</div>
                          </div>
                          <div className={styles.handoverRadio}>
                            {isSelected && <div className={styles.handoverRadioInner} />}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {formData.handoverType === 'CUSTOM_CONTACT' && (
                    <div className={styles.formGrid2} style={{ marginTop: '0.5rem' }}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Contact Person Full Name</label>
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="e.g., Ramesh Verma"
                          value={formData.handoverCustomName}
                          onChange={(e) => setFormData((p) => ({ ...p, handoverCustomName: e.target.value }))}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>10-Digit Phone Number</label>
                        <input
                          type="tel"
                          className={styles.inputField}
                          placeholder="e.g., 9876543210"
                          value={formData.handoverCustomPhone}
                          onChange={(e) => setFormData((p) => ({ ...p, handoverCustomPhone: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className={styles.trustBanner}>
                    <ShieldCheck size={28} color="#d97706" />
                    <div>
                      <strong>Verified Pickup Protocol:</strong> Photo evidence and handover OTP authentication are captured automatically.
                    </div>
                  </div>
                </>
              )}

              {/* STEP 4: Pickup Location */}
              {currentStep === 4 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>
                      Pickup <span className={styles.panelTitleHighlight}>Location</span>
                    </h1>
                    <p className={styles.panelSubtitle}>Tell us the exact address where the forgotten item is located.</p>
                  </div>

                  <div className={styles.locationDetectBox} onClick={handleUseCurrentLocation}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#d32f2f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Crosshair size={22} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Use Current GPS Location</div>
                        <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Autofill address and coordinates automatically</div>
                      </div>
                    </div>
                    <ChevronRight size={22} color="#94a3b8" />
                  </div>

                  <div className={styles.formGrid2}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Flat / Building / House No. *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Flat 402, Lotus Towers"
                        value={formData.pickup.flatBuilding}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, flatBuilding: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Street / Road *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Outer Ring Road"
                        value={formData.pickup.street}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, street: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Area / Locality *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Bellandur"
                        value={formData.pickup.area}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, area: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>City *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Bengaluru"
                        value={formData.pickup.city}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, city: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Pincode *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. 560103"
                        value={formData.pickup.postalCode}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, postalCode: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Landmark (Optional)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Near EcoSpace Tech Park"
                        value={formData.pickup.landmark || ''}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, landmark: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Contact Person at Pickup *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Front Desk Reception"
                        value={formData.pickup.contactName}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, contactName: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Contact Phone Number *</label>
                      <input
                        type="tel"
                        className={styles.inputField}
                        placeholder="e.g. 9876543210"
                        value={formData.pickup.phoneNumber}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, pickup: { ...p.pickup, phoneNumber: e.target.value } }))
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.alertRedBanner}>
                    <Bell size={24} style={{ flexShrink: 0 }} />
                    <div>Please ensure someone is reachable at the pickup location for a prompt handover.</div>
                  </div>
                </>
              )}

              {/* STEP 5: Deliver To */}
              {currentStep === 5 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>
                      Deliver <span className={styles.panelTitleHighlight}>To</span>
                    </h1>
                    <p className={styles.panelSubtitle}>Where should we bring your retrieved item?</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                    {['Home', 'Office', 'Friend / Family', 'Custom'].map((tab) => (
                      <div
                        key={tab}
                        onClick={() => setFormData((p) => ({ ...p, dropoff: { ...p.dropoff, addressType: tab } }))}
                        style={{
                          border: formData.dropoff.addressType === tab ? '2px solid #d32f2f' : '1.5px solid #e2e8f0',
                          background: formData.dropoff.addressType === tab ? '#fff5f5' : '#ffffff',
                          color: formData.dropoff.addressType === tab ? '#d32f2f' : '#475569',
                          borderRadius: '14px',
                          padding: '0.85rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                        }}
                      >
                        {tab === 'Home' && <Home size={20} />}
                        {tab === 'Office' && <Building2 size={20} />}
                        {tab === 'Friend / Family' && <Users size={20} />}
                        {tab === 'Custom' && <MapPin size={20} />}
                        <span>{tab}</span>
                      </div>
                    ))}
                  </div>

                  {savedAddresses.length > 0 && (
                    <div>
                      <label className={styles.inputLabel}>Saved Addresses</label>
                      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '4px' }}>
                        {savedAddresses.map((addr) => (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectSavedAddress(addr)}
                            style={{
                              minWidth: '180px',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '14px',
                              padding: '0.85rem',
                              cursor: 'pointer',
                              background: '#ffffff',
                            }}
                          >
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{addr.label}</div>
                            <div style={{ color: '#64748b', fontSize: '0.78rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {addr.addressLine1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={styles.formGrid2}>
                    <div className={styles.formGridFull + ' ' + styles.inputGroup}>
                      <label className={styles.inputLabel}>Delivery Address Line 1 *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. 123, MG Road, Bengaluru"
                        value={formData.dropoff.addressLine1}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, dropoff: { ...p.dropoff, addressLine1: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Recipient Full Name *</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Rahul Sharma"
                        value={formData.dropoff.recipientName}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, dropoff: { ...p.dropoff, recipientName: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Recipient Phone Number *</label>
                      <input
                        type="tel"
                        className={styles.inputField}
                        placeholder="e.g. 9876548421"
                        value={formData.dropoff.phoneNumber}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, dropoff: { ...p.dropoff, phoneNumber: e.target.value } }))
                        }
                      />
                    </div>
                    <div className={styles.formGridFull + ' ' + styles.inputGroup}>
                      <label className={styles.inputLabel}>Landmark (Optional)</label>
                      <input
                        type="text"
                        className={styles.inputField}
                        placeholder="e.g. Opposite Trinity Metro Station"
                        value={formData.dropoff.landmark || ''}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, dropoff: { ...p.dropoff, landmark: e.target.value } }))
                        }
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 6: Item Details */}
              {currentStep === 6 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>Item Details</h1>
                    <p className={styles.panelSubtitle}>Provide descriptive details to help our partner identify your item.</p>
                  </div>

                  <div className={styles.itemDetailsSplit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Item Name *</label>
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="e.g., Black Laptop Bag"
                          value={formData.itemName}
                          onChange={(e) => setFormData((p) => ({ ...p, itemName: e.target.value }))}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Short Description</label>
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="e.g., Left behind in conference room on 3rd floor"
                          value={formData.itemDescription}
                          onChange={(e) => setFormData((p) => ({ ...p, itemDescription: e.target.value }))}
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label className={styles.inputLabel}>Brand / Color (Optional)</label>
                        <input
                          type="text"
                          className={styles.inputField}
                          placeholder="e.g., Safari / Black"
                          value={formData.itemBrandColor}
                          onChange={(e) => setFormData((p) => ({ ...p, itemBrandColor: e.target.value }))}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.75rem' }}>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Quantity</label>
                          <select
                            className={styles.selectField}
                            value={formData.itemQuantity}
                            onChange={(e) => setFormData((p) => ({ ...p, itemQuantity: Number(e.target.value) }))}
                          >
                            {[1, 2, 3, 4, 5].map((q) => (
                              <option key={q} value={q}>
                                {q}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.inputGroup}>
                          <label className={styles.inputLabel}>Approx. Value (₹)</label>
                          <input
                            type="number"
                            className={styles.inputField}
                            placeholder="e.g., 2500"
                            value={formData.declaredValue || ''}
                            onChange={(e) => setFormData((p) => ({ ...p, declaredValue: Number(e.target.value) }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <label className={styles.photoUploadBox}>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                        {formData.photoPreview ? (
                          <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
                            <img src={formData.photoPreview} alt="Item upload preview" className={styles.photoPreviewThumb} />
                            <span style={{ fontSize: '0.8rem', color: '#d32f2f', fontWeight: 800, marginTop: '8px', display: 'block' }}>
                              Click to change item photo
                            </span>
                          </div>
                        ) : (
                          <>
                            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fff5f5', color: '#d32f2f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <UploadCloud size={28} />
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>Upload Item Photo</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                              Supports JPG, PNG up to 5MB. Helps partner confirm exact item.
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Item Tags</label>
                    <div className={styles.tagPills} style={{ marginTop: '4px' }}>
                      {['Fragile', 'High Value', 'Urgent', 'Small Item'].map((tag) => {
                        const isSelected = formData.itemTags.includes(tag)
                        return (
                          <div
                            key={tag}
                            className={\`\${styles.tagPill} \${isSelected ? styles.tagPillActive : ''}\`}
                            onClick={() => handleToggleTag(tag)}
                          >
                            {tag === 'Fragile' && <Sparkles size={15} />}
                            {tag === 'High Value' && <Shield size={15} />}
                            {tag === 'Urgent' && <Clock size={15} />}
                            {tag === 'Small Item' && <Package size={15} />}
                            <span>{tag}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 7: Schedule & Service */}
              {currentStep === 7 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>Schedule & Service Speed</h1>
                    <p className={styles.panelSubtitle}>Choose how quickly you need your item retrieved and delivered.</p>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Choose Pickup Speed</label>
                    <div className={styles.speedGrid} style={{ marginTop: '6px' }}>
                      {(options?.speedOptions || []).map((spd) => {
                        const isSelected = formData.speed === spd.id
                        return (
                          <div
                            key={spd.id}
                            className={\`\${styles.speedCard} \${isSelected ? styles.speedCardActive : ''}\`}
                            onClick={() => setFormData((p) => ({ ...p, speed: spd.id }))}
                          >
                            <div className={styles.placeIconBox} style={{ width: '48px', height: '48px' }}>
                              {spd.id === 'INSTANT' && <Bike size={24} color="#d32f2f" />}
                              {spd.id === 'EXPRESS' && <Rocket size={24} color="#d32f2f" />}
                              {spd.id === 'SAME_DAY' && <Truck size={24} color="#d32f2f" />}
                              {spd.id === 'PRECISE_TIME' && <Clock size={24} color="#d32f2f" />}
                            </div>
                            <div className={styles.speedTitle}>{spd.name}</div>
                            <div className={styles.speedEta}>{spd.eta}</div>
                            <div className={styles.speedPrice}>From ₹{spd.baseFee}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Select Pickup Date</label>
                    <div className={styles.datePillList} style={{ marginTop: '6px' }}>
                      {[0, 1, 2, 3, 4].map((offset) => {
                        const d = new Date()
                        d.setDate(d.getDate() + offset)
                        const dayName = offset === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })
                        const dateNum = d.getDate()
                        const dateStr = d.toISOString().split('T')[0]
                        const isSelected = formData.scheduledDate === dateStr
                        return (
                          <div
                            key={dateStr}
                            className={\`\${styles.datePill} \${isSelected ? styles.datePillActive : ''}\`}
                            onClick={() => setFormData((p) => ({ ...p, scheduledDate: dateStr }))}
                          >
                            <span className={styles.datePillLabel}>{dayName}</span>
                            <span className={styles.datePillNumber}>{dateNum}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Select Pickup Time Slot</label>
                    <div className={styles.timePillList} style={{ marginTop: '6px' }}>
                      {(options?.timeSlots || ['ASAP', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM']).map((slot) => {
                        const isSelected = formData.scheduledTimeSlot === slot
                        return (
                          <div
                            key={slot}
                            className={\`\${styles.timePill} \${isSelected ? styles.timePillActive : ''}\`}
                            onClick={() => setFormData((p) => ({ ...p, scheduledTimeSlot: slot }))}
                          >
                            {slot}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* STEP 8: Secure Handling & Verification */}
              {currentStep === 8 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>Secure Handling & Safety Options</h1>
                    <p className={styles.panelSubtitle}>Configure safety protocols from pickup to handoff.</p>
                  </div>

                  <div className={styles.alertRedBanner}>
                    <Lock size={22} style={{ flexShrink: 0 }} />
                    <div>All items are protected under Delivez Secure Chain of Custody warranty.</div>
                  </div>

                  <div className={styles.securityGrid}>
                    {(options?.securityToggles || []).map((tog) => {
                      const checked = !!formData[tog.id]
                      return (
                        <div key={tog.id} className={styles.toggleCard}>
                          <div className={styles.toggleInfo}>
                            <div className={styles.toggleTitle}>{tog.name}</div>
                            <div className={styles.toggleDesc}>{tog.description}</div>
                          </div>
                          <label className={styles.switch}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => setFormData((p) => ({ ...p, [tog.id]: e.target.checked }))}
                            />
                            <span className={styles.slider} />
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {/* STEP 9: Review & Pay */}
              {currentStep === 9 && (
                <>
                  <div className={styles.panelHeader}>
                    <h1 className={styles.panelTitle}>Review & Confirm Retrieval</h1>
                    <p className={styles.panelSubtitle}>Verify order details and select your preferred payment mode.</p>
                  </div>

                  <div>
                    <label className={styles.inputLabel}>Choose Payment Method</label>
                    <div className={styles.paymentGrid} style={{ marginTop: '6px' }}>
                      {[
                        { id: 'WALLET', label: 'Delivez Wallet', sub: 'Balance: ₹512', icon: Wallet },
                        { id: 'UPI', label: 'UPI / QR', sub: 'Instant', icon: QrCode },
                        { id: 'CARD', label: 'Debit / Credit', sub: 'Visa/Mastercard', icon: CreditCard },
                        { id: 'PAY_ON_DELIVERY', label: 'Pay on Delivery', sub: 'Cash / Card', icon: CreditCard },
                      ].map((pm) => {
                        const IconComp = pm.icon || CreditCard
                        const isSelected = formData.paymentMethod === pm.id
                        return (
                          <div
                            key={pm.id}
                            className={\`\${styles.paymentCard} \${isSelected ? styles.paymentCardSelected : ''}\`}
                            onClick={() => setFormData((p) => ({ ...p, paymentMethod: pm.id }))}
                          >
                            <IconComp size={22} />
                            <div>{pm.label}</div>
                            <span style={{ fontSize: '0.72rem', color: pm.id === 'WALLET' ? '#15803d' : '#64748b' }}>
                              {pm.sub}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData((p) => ({ ...p, termsAccepted: e.target.checked }))}
                    />
                    <span>
                      I agree to the <strong>Delivez Terms & Conditions</strong> and <strong>Retrieval Policy</strong>.
                    </span>
                  </label>
                </>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1.5px solid #fecaca',
                    borderRadius: '12px',
                    padding: '0.85rem 1.25rem',
                    color: '#b91c1c',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className={styles.bottomActions}>
                <button className={styles.backBtn} onClick={handlePrevStep}>
                  <ArrowLeft size={18} /> {currentStep === 1 ? 'Cancel' : 'Back'}
                </button>

                {currentStep === 9 ? (
                  <button
                    className={\`\${styles.continueRedBtn} \${submitting ? styles.disabledBtn : ''}\`}
                    onClick={handleConfirmAndBook}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Confirm & Place Retrieval >'}
                  </button>
                ) : (
                  <button className={styles.continueRedBtn} onClick={handleNextStep}>
                    <span>Continue</span>
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Right Sticky Live Summary Sidebar (Desktop) */}
            <aside className={styles.summarySidebar}>
              <div className={styles.liveSummaryCard}>
                <div className={styles.summaryHeader}>
                  <span className={styles.summaryTitle}>Retrieval Summary</span>
                  <span className={styles.summaryLivePill}>LIVE QUOTE</span>
                </div>

                {/* Item Details Block */}
                <div className={styles.summaryItemRow}>
                  <div className={styles.summaryIconWrap}>
                    <SelectedCategoryIcon size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      {formData.itemName || 'Selected Item'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {formData.itemQuantity} Qty • {formData.itemCategory}
                    </div>
                  </div>
                </div>

                {/* Visual Route */}
                <div className={styles.routeBlock}>
                  <div className={styles.routeLine} />
                  <div className={styles.routePoint}>
                    <div className={styles.routeDot} />
                    <div className={styles.routePointContent}>
                      <div className={styles.routeLabel}>PICKUP FROM ({formData.locationType})</div>
                      <div className={styles.routeAddress}>
                        {formData.pickup.flatBuilding}, {formData.pickup.city}
                      </div>
                    </div>
                  </div>

                  <div className={styles.routePoint}>
                    <div className={\`\${styles.routeDot} \${styles.routeDotGreen}\`} />
                    <div className={styles.routePointContent}>
                      <div className={styles.routeLabel}>DELIVER TO ({formData.dropoff.addressType})</div>
                      <div className={styles.routeAddress}>
                        {formData.dropoff.addressLine1}, {formData.dropoff.city}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selected Speed */}
                <div style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Selected Speed</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d32f2f' }}>
                    {formData.speed === 'INSTANT' ? '⚡ Instant (15–30m)' : formData.speed}
                  </span>
                </div>

                {/* Dynamic Price Breakdown */}
                <div className={styles.priceBox}>
                  <div className={styles.priceRow}>
                    <span>Base Retrieval Fee</span>
                    <span>₹ {Number(quote.retrievalFee).toFixed(2)}</span>
                  </div>
                  <div className={styles.priceRow}>
                    <span>Delivery Transit</span>
                    <span>₹ {Number(quote.deliveryFee).toFixed(2)}</span>
                  </div>
                  {quote.secureHandlingFee > 0 && (
                    <div className={styles.priceRow}>
                      <span>Secure Packaging Fee</span>
                      <span>₹ {Number(quote.secureHandlingFee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className={styles.priceRow}>
                    <span>Taxes & GST (7.25%)</span>
                    <span>₹ {Number(quote.taxAmount).toFixed(2)}</span>
                  </div>
                  <div className={styles.priceTotalRow}>
                    <span>Total Amount</span>
                    <span style={{ color: '#d32f2f' }}>₹ {Number(quote.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Guarantee Box */}
              <div className={styles.guaranteeBox}>
                <ShieldCheck size={32} color="#10b981" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.35 }}>
                  <strong>Delivez Guarantee:</strong> Dedicated delivery partner with GPS live telemetry and encrypted OTP handover.
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  )
}
`;

writeFile('src/pages/forgot-something/ForgotSomethingBookingPage.jsx', bookingJsx);

// 3. Tracking Page JSX (Desktop friendly 2-column layout)
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

writeFile('src/pages/forgot-something/ForgotSomethingTrackingPage.jsx', trackingJsx);
console.log('All desktop components written successfully!');
`;

writeFile('apply_desktop_booking_ui.cjs', '');
fs.writeFileSync('c:/Users/Rax/Desktop/Delivery_app_site_backend/apply_desktop_booking_ui.cjs', desktopJs);
