const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const pagesDir = path.join(webRoot, 'src/pages/gift-delivery');

// ============================================================================
// 1. Updated GiftDeliveryBookingPage.jsx
// ============================================================================
const bookingJsx = `import React, { useState, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  MapPin,
  Calendar,
  Sparkles,
  PlusSquare,
  CreditCard,
  CheckCircle2,
  Clock,
  Shield,
  ShoppingBag,
  Heart,
  Star,
  Copy,
  Share2,
  Check,
  Loader2,
  User,
  Phone,
  Home,
  Navigation,
  FileEdit,
  EyeOff,
  Camera,
  Video,
  PenTool,
  PartyPopper,
  Flame,
  ChevronRight,
  Info,
  Tag,
  Search,
  MessageCircle,
  X,
  Plus,
  Minus
} from 'lucide-react'
import {
  fetchGiftDeliveryOptions,
  fetchGiftDeliveryQuote,
  createGiftDeliveryBooking,
  DEFAULT_GIFT_DELIVERY_OPTIONS
} from '@/features/gift-delivery/services/giftDeliveryService.js'
import { getUserAccessToken } from '@/features/auth/services/userAuthService.js'
import AuthModal from '@/features/auth/components/AuthModal.jsx'
import styles from './GiftDeliveryBookingPage.module.css'

const STEP_TITLES = [
  'Select Gift',
  'Delivery Details',
  'Date & Time',
  'Premium Setup',
  'Add-ons',
  'Review & Pay'
]

const STEP_ICONS = [
  Gift,
  MapPin,
  Calendar,
  Sparkles,
  PlusSquare,
  CreditCard
]

export default function GiftDeliveryBookingPage() {
  const [step, setStep] = useState(1)
  const [options, setOptions] = useState(DEFAULT_GIFT_DELIVERY_OPTIONS)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [copiedOrderId, setCopiedOrderId] = useState(false)
  const [cardModalOpen, setCardModalOpen] = useState(false)

  // Step 1: Gift Selection State
  const [selectedCategory, setSelectedCategory] = useState('CAKES')
  const [selectedOccasionFilter, setSelectedOccasionFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [favorites, setFavorites] = useState({})

  // Step 2: Delivery Details State
  const [deliverTo, setDeliverTo] = useState('Someone Else') // 'Someone Else' | 'Myself'
  const [recipientName, setRecipientName] = useState('Rahul Sharma')
  const [recipientPhone, setRecipientPhone] = useState('9876543210')
  const [deliveryAddress, setDeliveryAddress] = useState('B-101, Green Park, New Delhi - 110016')
  const [deliveryLandmark, setDeliveryLandmark] = useState('Near Metro Gate No. 2, Main Market')
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('110016')
  const [deliveryCity, setDeliveryCity] = useState('New Delhi')
  const [deliveryState, setDeliveryState] = useState('Delhi')
  const [deliveryInstructions, setDeliveryInstructions] = useState('Ring doorbell twice, please handle with care')
  const [giftMessage, setGiftMessage] = useState('Wishing you the happiest birthday filled with joy and sweetness!')
  const [selectedGreetingCard, setSelectedGreetingCard] = useState({
    id: 'card-bday-1',
    name: 'Happy Birthday Celebration',
    theme: 'Birthday'
  })

  // Step 3: Date & Time State
  const [deliveryType, setDeliveryType] = useState('STANDARD')
  const [scheduledDate, setScheduledDate] = useState('Thu, 09 May 2026')
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('9:00 AM - 12:00 PM (Morning)')
  const [isMidnightDelivery, setIsMidnightDelivery] = useState(false)

  // Step 4 & 5: Premium Setup & Addons State
  const [hasHandwrittenCard, setHasHandwrittenCard] = useState(false)
  const [isAnonymousSender, setIsAnonymousSender] = useState(false)
  const [hasPhotoProof, setHasPhotoProof] = useState(false)
  const [hasPremiumSetup, setHasPremiumSetup] = useState(false)
  const [hasPremiumWrap, setHasPremiumWrap] = useState(false)
  const [hasVideoReaction, setHasVideoReaction] = useState(false)
  const [selectedAddonIds, setSelectedAddonIds] = useState({})

  // Step 6: Review & Payment State
  const [couponCode, setCouponCode] = useState('GIFTLOVE')
  const [appliedCoupon, setAppliedCoupon] = useState('GIFTLOVE')
  const [paymentMethod, setPaymentMethod] = useState('UPI')

  // Quote Result
  const [quote, setQuote] = useState(null)
  const [createdBooking, setCreatedBooking] = useState(null)

  // Initialize options and default product
  useEffect(() => {
    async function loadData() {
      setLoadingOptions(true)
      const data = await fetchGiftDeliveryOptions()
      setOptions(data)
      if (data.products && data.products.length > 0) {
        setSelectedProduct(data.products[0])
      }
      setLoadingOptions(false)
    }
    loadData()
  }, [])

  // Generate 30 future dates for carousel
  const dateOptions = useMemo(() => {
    const dates = []
    const today = new Date()
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(today.getDate() + i)
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : days[d.getDay()]
      const formatted = \`\${days[d.getDay()]}, \${String(d.getDate()).padStart(2, '0')} \${months[d.getMonth()]} \${d.getFullYear()}\`
      dates.push({
        id: formatted,
        dayName,
        dateNum: d.getDate(),
        month: months[d.getMonth()],
        fullString: formatted,
        isToday: i === 0
      })
    }
    return dates
  }, [])

  // Calculate live quote
  useEffect(() => {
    const productToUse = selectedProduct || options.products?.[0]
    if (!productToUse) return

    async function updateQuote() {
      const selectedAddonsList = Object.entries(selectedAddonIds)
        .filter(([, checked]) => checked)
        .map(([id]) => {
          const addon = options.addons?.find(a => a.id === id)
          return { id, price: addon?.price || 0, title: addon?.title }
        })

      const q = await fetchGiftDeliveryQuote({
        productId: productToUse.id,
        productPrice: productToUse.price,
        productQuantity: quantity,
        deliveryType,
        selectedAddons: selectedAddonsList,
        hasHandwrittenCard,
        isAnonymousSender,
        hasPhotoProof,
        hasVideoReaction,
        hasPremiumWrap,
        hasPremiumSetup,
        couponCode: appliedCoupon
      })
      setQuote(q)
    }
    updateQuote()
  }, [
    selectedProduct,
    quantity,
    deliveryType,
    hasHandwrittenCard,
    isAnonymousSender,
    hasPhotoProof,
    hasVideoReaction,
    hasPremiumWrap,
    hasPremiumSetup,
    selectedAddonIds,
    appliedCoupon,
    options.products,
    options.addons
  ])

  // Count active add-ons
  const activeAddonsCount = useMemo(() => {
    let count = 0
    if (hasHandwrittenCard) count++
    if (isAnonymousSender) count++
    if (hasPhotoProof) count++
    if (hasPremiumSetup) count++
    if (hasPremiumWrap) count++
    if (hasVideoReaction) count++
    count += Object.values(selectedAddonIds).filter(Boolean).length
    return count
  }, [hasHandwrittenCard, isAnonymousSender, hasPhotoProof, hasPremiumSetup, hasPremiumWrap, hasVideoReaction, selectedAddonIds])

  // Geolocation auto-fill
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setDeliveryAddress(\`Coordinates: \${pos.coords.latitude.toFixed(4)}, \${pos.coords.longitude.toFixed(4)} (Current GPS)\`)
        setDeliveryCity('Bengaluru')
        setDeliveryPostalCode('560001')
      },
      () => {
        setDeliveryAddress('MG Road, Central Business District, Bengaluru')
        setDeliveryCity('Bengaluru')
        setDeliveryPostalCode('560001')
      }
    )
  }

  // Filter products by category, occasion and search
  const filteredProducts = useMemo(() => {
    if (!options.products) return []
    return options.products.filter(p => {
      const matchCat = p.categoryId === selectedCategory
      const matchOccasion = selectedOccasionFilter === 'All' || p.occasionTag === selectedOccasionFilter || (selectedOccasionFilter === 'All Cakes' && p.categoryId === 'CAKES')
      const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCat && matchOccasion && matchSearch
    })
  }, [options.products, selectedCategory, selectedOccasionFilter, searchQuery])

  // Step Validation & Navigation Helper
  const goToStep = (targetStep) => {
    if (!selectedProduct && options.products?.length > 0) {
      setSelectedProduct(options.products[0])
    }
    if (step === 2 && targetStep > 2) {
      if (!recipientName.trim() || !recipientPhone.trim() || !deliveryAddress.trim()) {
        setErrorMessage('Please fill in recipient name, phone, and delivery address before proceeding.')
        return
      }
    }
    setErrorMessage('')
    setStep(targetStep)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    setErrorMessage('')
    const token = getUserAccessToken()
    if (!token) {
      setAuthModalOpen(true)
      return
    }

    const productToOrder = selectedProduct || options.products?.[0]
    if (!productToOrder) {
      setErrorMessage('Please select a gift product.')
      setStep(1)
      return
    }
    if (!recipientName || !recipientPhone || !deliveryAddress) {
      setErrorMessage('Please complete all recipient and delivery address fields.')
      setStep(2)
      return
    }

    setIsSubmitting(true)
    try {
      const selectedAddonsList = Object.entries(selectedAddonIds)
        .filter(([, checked]) => checked)
        .map(([id]) => {
          const addon = options.addons.find(a => a.id === id)
          return { id, price: addon?.price || 0, title: addon?.title }
        })

      const idempotencyKey = \`gift-order-\${Date.now()}-\${Math.random().toString(36).substring(2, 9)}\`

      const booking = await createGiftDeliveryBooking({
        categoryId: selectedCategory,
        categoryName: options.categories.find(c => c.id === selectedCategory)?.name || 'Cakes',
        productId: productToOrder.id,
        productName: productToOrder.name,
        productDescription: productToOrder.description,
        productImage: productToOrder.image,
        productPrice: productToOrder.price,
        productQuantity: quantity,
        productWeight: productToOrder.weight || '1 kg',
        productServes: productToOrder.serves || '6 - 8 People',
        selectedOccasion: productToOrder.occasionTag || 'Birthday',

        deliverTo,
        recipientName,
        recipientPhone,
        recipientCountryCode: '+91',
        deliveryAddress,
        deliveryLandmark,
        deliveryPostalCode,
        deliveryCity,
        deliveryState,
        deliveryInstructions,

        giftMessage,
        greetingCardId: selectedGreetingCard.id,
        greetingCardName: selectedGreetingCard.name,

        deliveryType,
        scheduledDate,
        scheduledTimeSlot,
        isMidnightDelivery: deliveryType === 'MIDNIGHT',

        selectedAddons: selectedAddonsList,
        hasHandwrittenCard,
        isAnonymousSender,
        hasPhotoProof,
        hasVideoReaction,
        hasPremiumWrap,
        hasPremiumSetup,

        couponCode: appliedCoupon,
        paymentMethod
      }, idempotencyKey)

      setCreatedBooking(booking)
      setStep(7) // Success Screen
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place gift delivery order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Copy Order ID
  const handleCopyOrderId = (id) => {
    navigator.clipboard.writeText(id)
    setCopiedOrderId(true)
    setTimeout(() => setCopiedOrderId(false), 2000)
  }

  // Toggle Favorite
  const toggleFavorite = (productId, e) => {
    e.stopPropagation()
    setFavorites(prev => ({ ...prev, [productId]: !prev[productId] }))
  }

  // Active product reference
  const currentProduct = selectedProduct || options.products?.[0]

  // Render Desktop Sidebar Summary for all steps
  const renderSidebarSummary = () => (
    <aside className={styles.desktopSidebar}>
      <div className={styles.sidebarStickyInner}>
        <h3 className={styles.sidebarHeading}>Order Summary</h3>

        {/* Selected Product Pill */}
        {currentProduct ? (
          <div className={styles.sidebarProductRow}>
            <img src={currentProduct.image} alt={currentProduct.name} className={styles.sidebarProductImg} />
            <div className={styles.sidebarProductDetails}>
              <strong>{currentProduct.name}</strong>
              <span>Qty: {quantity} • ₹{currentProduct.price * quantity}</span>
              <span className={styles.sidebarProductOccasion}>{currentProduct.occasionTag || 'Special Gift'}</span>
            </div>
            {step > 1 && (
              <button type="button" className={styles.sidebarEditBtn} onClick={() => goToStep(1)}>
                Change
              </button>
            )}
          </div>
        ) : (
          <p className={styles.sidebarEmptyNote}>Select a gift to see pricing</p>
        )}

        {/* Recipient & Slot Recap */}
        {recipientName && (
          <div className={styles.sidebarMetaBlock}>
            <div className={styles.sidebarMetaItem}>
              <User size={14} />
              <span>{recipientName} ({recipientPhone})</span>
            </div>
            <div className={styles.sidebarMetaItem}>
              <MapPin size={14} />
              <span className={styles.truncateText}>{deliveryAddress || 'Address'}, {deliveryCity}</span>
            </div>
            {scheduledDate && (
              <div className={styles.sidebarMetaItem}>
                <Clock size={14} />
                <span>{scheduledDate} ({scheduledTimeSlot})</span>
              </div>
            )}
          </div>
        )}

        {/* Selected Add-ons Count */}
        {activeAddonsCount > 0 && (
          <div className={styles.sidebarAddonsPill}>
            <Sparkles size={14} />
            <span>{activeAddonsCount} Experiences & Add-ons (+₹{quote?.addonsTotal || 0})</span>
          </div>
        )}

        {/* Coupon Input */}
        <div className={styles.sidebarCouponRow}>
          <Tag size={16} />
          <input
            type="text"
            placeholder="COUPON"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value.toUpperCase())}
          />
          <button
            type="button"
            className={styles.sidebarCouponBtn}
            onClick={() => {
              setAppliedCoupon(couponCode)
              alert(\`Coupon \${couponCode} applied!\`)
            }}
          >
            Apply
          </button>
        </div>

        {/* Bill Breakdown */}
        <div className={styles.sidebarBillList}>
          <div className={styles.sidebarBillRow}>
            <span>Item Total</span>
            <span>₹{quote?.itemTotal || (currentProduct?.price || 699) * quantity}</span>
          </div>
          <div className={styles.sidebarBillRow}>
            <span>Delivery Charges ({deliveryType})</span>
            <span>₹{quote?.deliveryCharge || 49}</span>
          </div>
          <div className={styles.sidebarBillRow}>
            <span>Packaging & Box</span>
            <span>₹{quote?.packagingCharge || 20}</span>
          </div>
          {quote?.addonsTotal > 0 && (
            <div className={styles.sidebarBillRow}>
              <span>Add-ons & Premium Setup</span>
              <span>₹{quote.addonsTotal}</span>
            </div>
          )}
          {quote?.discountAmount > 0 && (
            <div className={\`\${styles.sidebarBillRow} \${styles.discountText}\`}>
              <span>Discount ({appliedCoupon})</span>
              <span>-₹{quote.discountAmount}</span>
            </div>
          )}
          <div className={styles.sidebarBillRow}>
            <span>Taxes (GST 18%)</span>
            <span>₹{quote?.taxAmount || 38}</span>
          </div>
          <div className={\`\${styles.sidebarBillRow} \${styles.sidebarTotalRow}\`}>
            <strong>Total Payable</strong>
            <strong className={styles.sidebarTotalYellow}>₹{quote?.totalAmount || 806}</strong>
          </div>
        </div>

        {/* 100% Secure Banner */}
        <div className={styles.sidebarSecureBadge}>
          <Shield size={16} />
          <span>100% Safe & Secure Celebration Guarantee</span>
        </div>

        {/* Action Button inside Sidebar for Desktop */}
        <div className={styles.sidebarActionArea}>
          {step === 1 && (
            <button
              type="button"
              className={styles.sidebarPrimaryBtn}
              onClick={() => goToStep(2)}
            >
              Continue to Details <ArrowRight size={16} />
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              className={styles.sidebarPrimaryBtnYellow}
              onClick={() => goToStep(3)}
            >
              Continue to Schedule <ArrowRight size={16} />
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              className={styles.sidebarPrimaryBtn}
              onClick={() => goToStep(4)}
            >
              Continue to Experiences <ArrowRight size={16} />
            </button>
          )}
          {step === 4 && (
            <button
              type="button"
              className={styles.sidebarPrimaryBtn}
              onClick={() => goToStep(5)}
            >
              Continue to Add-ons <ArrowRight size={16} />
            </button>
          )}
          {step === 5 && (
            <button
              type="button"
              className={styles.sidebarPrimaryBtn}
              onClick={() => goToStep(6)}
            >
              Review & Pay <ArrowRight size={16} />
            </button>
          )}
          {step === 6 && (
            <button
              type="button"
              className={styles.sidebarPlaceOrderBtn}
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className={styles.spinner} /> Placing Order...
                </>
              ) : (
                <>
                  Place Order • ₹{quote?.totalAmount || 806} <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  )

  return (
    <div className={styles.pageWrapper}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            {step > 1 && step < 7 && (
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => goToStep(Math.max(1, step - 1))}
                aria-label="Go Back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div
              className={styles.logoText}
              onClick={() => (window.location.href = '/')}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.logoBlack}>DELIVE</span>
              <span className={styles.logoYellow}>Z</span>
            </div>
          </div>

          <div className={styles.serviceBadgeHeader}>
            <Gift size={18} />
            <span>Gift & Surprise Delivery</span>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.cartIconWrapper}>
              <ShoppingBag size={20} className={styles.cartIcon} />
              <span className={styles.cartBadge}>{quantity}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Step Progress Tracker (Steps 1-6) with FULL CLICKABILITY */}
      {step <= 6 && (
        <div className={styles.stepTrackerWrapper}>
          <div className={styles.stepTracker}>
            {STEP_TITLES.map((title, index) => {
              const stepNum = index + 1
              const IconComponent = STEP_ICONS[index]
              const isCompleted = step > stepNum
              const isActive = step === stepNum

              return (
                <React.Fragment key={title}>
                  <div
                    className={\`\${styles.stepItem} \${isActive ? styles.stepActive : ''} \${isCompleted ? styles.stepCompleted : ''}\`}
                    onClick={() => goToStep(stepNum)}
                    role="button"
                    tabIndex={0}
                    title={\`Go to step \${stepNum}: \${title}\`}
                  >
                    <div className={styles.stepIconCircle}>
                      {isCompleted ? <Check size={14} /> : <IconComponent size={14} />}
                    </div>
                    <span className={styles.stepTitle}>
                      {stepNum}. {title}
                    </span>
                  </div>
                  {index < STEP_TITLES.length - 1 && (
                    <div className={\`\${styles.stepLine} \${step > stepNum ? styles.stepLineActive : ''}\`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className={styles.mainContainer}>
        {errorMessage && (
          <div className={styles.errorAlert}>
            <Info size={18} />
            <span>{errorMessage}</span>
            <button type="button" onClick={() => setErrorMessage('')} className={styles.alertClose}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Steps 1 to 6: 2-Column Responsive Layout */}
        {step >= 1 && step <= 6 && (
          <div className={styles.splitLayoutGrid}>
            <div className={styles.leftFormColumn}>
              {/* STEP 1: SELECT GIFT */}
              {step === 1 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeadingGroup}>
                    <h1 className={styles.stepMainHeading}>Choose Your Special Gift</h1>
                    <p className={styles.stepSubHeading}>Handcrafted celebration cakes, luxury bouquets, hampers & treats</p>
                  </div>

                  {/* Categories Grid */}
                  <div className={styles.categoriesGrid}>
                    {options.categories.map(cat => {
                      const isSelected = selectedCategory === cat.id
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          className={\`\${styles.categoryCard} \${isSelected ? styles.categoryCardActive : ''}\`}
                          onClick={() => setSelectedCategory(cat.id)}
                        >
                          <div className={styles.categoryIconCircle}>
                            <Gift size={22} />
                          </div>
                          <span className={styles.categoryName}>{cat.name}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Same Day / Midnight Delivery Banner */}
                  <div className={styles.promoBanner}>
                    <Sparkles size={20} className={styles.promoBannerIcon} />
                    <div className={styles.promoBannerText}>
                      <strong>Midnight & Same Day Delivery Available!</strong>
                      <span>Surprise your loved ones right on time with curated handcrafted arrangements.</span>
                    </div>
                  </div>

                  {/* Filter Chips & Search Bar */}
                  <div className={styles.filtersBar}>
                    <div className={styles.chipRow}>
                      {['All', 'Birthday', 'Anniversary', 'Celebration'].map(occ => (
                        <button
                          key={occ}
                          type="button"
                          className={\`\${styles.filterChip} \${selectedOccasionFilter === occ ? styles.filterChipActive : ''}\`}
                          onClick={() => setSelectedOccasionFilter(occ)}
                        >
                          {occ === 'All' ? \`All \${options.categories.find(c => c.id === selectedCategory)?.name || 'Items'}\` : occ}
                        </button>
                      ))}
                    </div>

                    <div className={styles.searchBox}>
                      <Search size={16} />
                      <input
                        type="text"
                        placeholder="Search cakes, flowers, chocolates..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Products Grid */}
                  <div className={styles.productsGrid}>
                    {filteredProducts.map(product => {
                      const isSelected = (selectedProduct?.id || options.products?.[0]?.id) === product.id
                      const isFav = favorites[product.id]

                      return (
                        <div
                          key={product.id}
                          className={\`\${styles.productCard} \${isSelected ? styles.productCardActive : ''}\`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className={styles.productImageWrapper}>
                            <img src={product.image} alt={product.name} className={styles.productImage} />
                            {product.badge && <span className={styles.productBadge}>{product.badge}</span>}
                            <button
                              type="button"
                              className={\`\${styles.favBtn} \${isFav ? styles.favBtnActive : ''}\`}
                              onClick={(e) => toggleFavorite(product.id, e)}
                              aria-label="Wishlist"
                            >
                              <Heart size={16} fill={isFav ? '#E11D48' : 'none'} />
                            </button>
                          </div>

                          <div className={styles.productInfo}>
                            <div className={styles.productTitleRow}>
                              <h3 className={styles.productName}>{product.name}</h3>
                              <span className={styles.productPrice}>₹{product.price}</span>
                            </div>

                            <p className={styles.productDesc}>{product.description}</p>

                            <div className={styles.productAttributes}>
                              {product.weight && <span>Weight: {product.weight}</span>}
                              {product.serves && <span>Serves: {product.serves}</span>}
                            </div>

                            <div className={styles.productRatingRow}>
                              <div className={styles.starBadge}>
                                <Star size={12} fill="#F59E0B" stroke="#F59E0B" />
                                <span>{product.rating}</span>
                              </div>
                              <span className={styles.reviewsCount}>({product.reviewsCount} reviews)</span>
                            </div>

                            <div className={styles.productActionRow}>
                              {isSelected ? (
                                <div className={styles.qtyCounter} onClick={e => e.stopPropagation()}>
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className={styles.qtyBtn}
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className={styles.qtyValue}>{quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(q => q + 1)}
                                    className={styles.qtyBtn}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.addBtn}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedProduct(product)
                                    setQuantity(1)
                                  }}
                                >
                                  <Plus size={14} /> Add to Gift
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Chat with Expert Prompt */}
                  <div className={styles.expertHelpCard}>
                    <MessageCircle size={24} className={styles.expertIcon} />
                    <div className={styles.expertText}>
                      <strong>Can't find what you're looking for?</strong>
                      <p>Chat with our Gift Concierge for custom hampers and tailored setups.</p>
                    </div>
                    <button
                      type="button"
                      className={styles.expertBtn}
                      onClick={() => alert('Our Gift Concierge is available 24/7 on WhatsApp & Call!')}
                    >
                      Chat with Expert
                    </button>
                  </div>

                  {/* Inline Step 1 Action for quick mobile & desktop reach */}
                  <div className={styles.inlineActionBox}>
                    <button
                      type="button"
                      className={styles.primaryActionBtn}
                      onClick={() => goToStep(2)}
                    >
                      Continue to Delivery Details <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DELIVERY DETAILS */}
              {step === 2 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeadingGroup}>
                    <h1 className={styles.stepMainHeading}>Delivery Details</h1>
                    <p className={styles.stepSubHeading}>Who is this lovely gift for?</p>
                  </div>

                  {/* Deliver To Toggle */}
                  <div className={styles.deliverToToggle}>
                    <span className={styles.fieldLabel}>Deliver to:</span>
                    <div className={styles.togglePills}>
                      <button
                        type="button"
                        className={\`\${styles.togglePill} \${deliverTo === 'Someone Else' ? styles.togglePillActive : ''}\`}
                        onClick={() => setDeliverTo('Someone Else')}
                      >
                        Someone Else
                      </button>
                      <button
                        type="button"
                        className={\`\${styles.togglePill} \${deliverTo === 'Myself' ? styles.togglePillActive : ''}\`}
                        onClick={() => setDeliverTo('Myself')}
                      >
                        Myself
                      </button>
                    </div>
                  </div>

                  {/* Recipient Form */}
                  <div className={styles.formCard}>
                    <div className={styles.formGrid2Col}>
                      <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>Full Name of Recipient</label>
                        <div className={styles.inputWithIcon}>
                          <User size={18} className={styles.inputIcon} />
                          <input
                            type="text"
                            placeholder="Enter recipient's full name"
                            value={recipientName}
                            onChange={e => setRecipientName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>Mobile Number</label>
                        <div className={styles.phoneInputRow}>
                          <div className={styles.countryCodeBadge}>
                            <span>🇮🇳 +91</span>
                          </div>
                          <input
                            type="tel"
                            placeholder="10-digit mobile number"
                            value={recipientPhone}
                            onChange={e => setRecipientPhone(e.target.value.replace(/\\D/g, '').slice(0, 10))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <div className={styles.labelWithAction}>
                        <label className={styles.fieldLabel}>House / Building / Apartment</label>
                        <button
                          type="button"
                          className={styles.useLocationBtn}
                          onClick={handleUseMyLocation}
                        >
                          <Navigation size={14} /> Use My Location
                        </button>
                      </div>
                      <div className={styles.inputWithIcon}>
                        <Home size={18} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="Flat / House No., Floor, Building Name"
                          value={deliveryAddress}
                          onChange={e => setDeliveryAddress(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label className={styles.fieldLabel}>Landmark (Optional)</label>
                      <div className={styles.inputWithIcon}>
                        <MapPin size={18} className={styles.inputIcon} />
                        <input
                          type="text"
                          placeholder="Nearby metro, park, or market"
                          value={deliveryLandmark}
                          onChange={e => setDeliveryLandmark(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={styles.inputRow}>
                      <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>Pincode</label>
                        <input
                          type="text"
                          placeholder="e.g. 110016"
                          value={deliveryPostalCode}
                          onChange={e => setDeliveryPostalCode(e.target.value)}
                        />
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>City</label>
                        <select value={deliveryCity} onChange={e => setDeliveryCity(e.target.value)}>
                          <option value="New Delhi">New Delhi</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="Pune">Pune</option>
                          <option value="Chennai">Chennai</option>
                        </select>
                      </div>

                      <div className={styles.inputGroup}>
                        <label className={styles.fieldLabel}>State</label>
                        <select value={deliveryState} onChange={e => setDeliveryState(e.target.value)}>
                          <option value="Delhi">Delhi</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <div className={styles.labelWithCounter}>
                        <label className={styles.fieldLabel}>Delivery Instructions (Optional)</label>
                        <span className={styles.charCount}>{deliveryInstructions.length}/120</span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={120}
                        placeholder="e.g., Ring doorbell twice, please do not disclose contents"
                        value={deliveryInstructions}
                        onChange={e => setDeliveryInstructions(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Gift Message & Greeting Card */}
                  <div className={styles.formCard}>
                    <div className={styles.labelWithCounter}>
                      <label className={styles.fieldLabel}>Gift Message (Optional)</label>
                      <span className={styles.charCount}>{giftMessage.length}/200</span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={200}
                      placeholder="Write your special heartwarming message for the recipient..."
                      value={giftMessage}
                      onChange={e => setGiftMessage(e.target.value)}
                    />

                    {/* Greeting Card Preview & Selector */}
                    <div className={styles.cardPreviewBox}>
                      <div className={styles.cardPreviewLeft}>
                        <Gift size={20} className={styles.cardPreviewIcon} />
                        <div>
                          <strong>{selectedGreetingCard.name}</strong>
                          <span>Theme: {selectedGreetingCard.theme}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={styles.changeCardBtn}
                        onClick={() => setCardModalOpen(true)}
                      >
                        Change Card
                      </button>
                    </div>
                  </div>

                  {/* Safety Reassurance Banner */}
                  <div className={styles.safetyBanner}>
                    <Shield size={20} className={styles.safetyIcon} />
                    <span>Your gift is safe with us! We ensure temperature-controlled, secure, and celebratory delivery.</span>
                  </div>

                  {/* Desktop Inline Actions */}
                  <div className={styles.desktopInlineActions}>
                    <button
                      type="button"
                      className={styles.secondaryActionBtn}
                      onClick={() => goToStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={styles.primaryActionBtnYellow}
                      onClick={() => goToStep(3)}
                    >
                      Continue to Schedule <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & TIME */}
              {step === 3 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeadingGroup}>
                    <h1 className={styles.stepMainHeading}>Schedule Date & Time</h1>
                    <p className={styles.stepSubHeading}>Choose when your gift should arrive to create the magic moment</p>
                  </div>

                  {/* Delivery Type Options */}
                  <div className={styles.deliveryTypesGridDesktop}>
                    {options.deliveryTypes.map(type => {
                      const isSelected = deliveryType === type.id
                      return (
                        <div
                          key={type.id}
                          className={\`\${styles.deliveryTypeCard} \${isSelected ? styles.deliveryTypeCardActive : ''}\`}
                          onClick={() => setDeliveryType(type.id)}
                        >
                          <div className={styles.deliveryTypeHeader}>
                            <div className={styles.radioCircle}>
                              {isSelected && <div className={styles.radioDot} />}
                            </div>
                            <div className={styles.deliveryTypeTitleGroup}>
                              <strong>{type.name}</strong>
                              {type.badge && <span className={styles.typeBadge}>{type.badge}</span>}
                            </div>
                            <span className={styles.deliveryTypePrice}>₹{type.baseCharge}</span>
                          </div>
                          <p className={styles.deliveryTypeDesc}>{type.description}</p>
                          <span className={styles.deliveryTypeEta}>{type.eta}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.weekBanner}>
                    <Calendar size={18} />
                    <span>We deliver 7 days a week, including weekends and public holidays!</span>
                  </div>

                  {/* Select Delivery Date Carousel */}
                  <div className={styles.dateSection}>
                    <label className={styles.fieldLabel}>Select Delivery Date</label>
                    <span className={styles.dateSubtext}>You can schedule delivery up to 30 days in advance</span>

                    <div className={styles.dateCarousel}>
                      {dateOptions.map(d => {
                        const isSelected = scheduledDate === d.fullString
                        return (
                          <button
                            key={d.id}
                            type="button"
                            className={\`\${styles.datePill} \${isSelected ? styles.datePillActive : ''}\`}
                            onClick={() => setScheduledDate(d.fullString)}
                          >
                            <span className={styles.dateDayName}>{d.dayName}</span>
                            <span className={styles.dateNumber}>{d.dateNum}</span>
                            <span className={styles.dateMonth}>{d.month}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Select Time Slot */}
                  <div className={styles.timeSlotSection}>
                    <label className={styles.fieldLabel}>Select Delivery Time Slot</label>
                    <div className={styles.timeSlotsGrid}>
                      {options.timeSlots.map(slot => {
                        const isSelected = scheduledTimeSlot === slot
                        return (
                          <button
                            key={slot}
                            type="button"
                            className={\`\${styles.timeSlotBtn} \${isSelected ? styles.timeSlotBtnActive : ''}\`}
                            onClick={() => setScheduledTimeSlot(slot)}
                          >
                            <Clock size={16} />
                            <span>{slot}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className={styles.guaranteeNotice}>
                    <Info size={16} />
                    <span>Important: Precise delivery slots are reserved exclusively for your celebration order.</span>
                  </div>

                  <div className={styles.desktopInlineActions}>
                    <button
                      type="button"
                      className={styles.secondaryActionBtn}
                      onClick={() => goToStep(2)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={styles.primaryActionBtn}
                      onClick={() => goToStep(4)}
                    >
                      Continue to Experiences <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PREMIUM SETUP */}
              {step === 4 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeadingGroup}>
                    <h1 className={styles.stepMainHeading}>Premium Experiences</h1>
                    <p className={styles.stepSubHeading}>Make your gift unforgettable with our curated luxury surprises</p>
                  </div>

                  <div className={styles.premiumList}>
                    {/* Handwritten Card */}
                    <div
                      className={\`\${styles.premiumCard} \${hasHandwrittenCard ? styles.premiumCardActive : ''}\`}
                      onClick={() => setHasHandwrittenCard(!hasHandwrittenCard)}
                    >
                      <div className={styles.checkboxCircle}>
                        {hasHandwrittenCard && <Check size={14} color="#FFF" />}
                      </div>
                      <div className={styles.premiumDetails}>
                        <div className={styles.premiumTitleRow}>
                          <strong>Handwritten Message Card</strong>
                          <span className={styles.badgePopular}>Popular</span>
                          <span className={styles.premiumPrice}>₹79</span>
                        </div>
                        <p className={styles.premiumDesc}>We handwrite your special heartfelt message in elegant calligraphy on a luxury card.</p>
                      </div>
                    </div>

                    {/* Anonymous Sender */}
                    <div
                      className={\`\${styles.premiumCard} \${isAnonymousSender ? styles.premiumCardActive : ''}\`}
                      onClick={() => setIsAnonymousSender(!isAnonymousSender)}
                    >
                      <div className={styles.checkboxCircle}>
                        {isAnonymousSender && <Check size={14} color="#FFF" />}
                      </div>
                      <div className={styles.premiumDetails}>
                        <div className={styles.premiumTitleRow}>
                          <strong>Anonymous Sender</strong>
                          <span className={styles.badgeNew}>New</span>
                          <span className={styles.premiumPrice}>₹49</span>
                        </div>
                        <p className={styles.premiumDesc}>Your name will be hidden. Gift will be labeled from "A Secret Admirer" for suspense!</p>
                      </div>
                    </div>

                    {/* Photo Proof */}
                    <div
                      className={\`\${styles.premiumCard} \${hasPhotoProof ? styles.premiumCardActive : ''}\`}
                      onClick={() => setHasPhotoProof(!hasPhotoProof)}
                    >
                      <div className={styles.checkboxCircle}>
                        {hasPhotoProof && <Check size={14} color="#FFF" />}
                      </div>
                      <div className={styles.premiumDetails}>
                        <div className={styles.premiumTitleRow}>
                          <strong>Photo Proof of Delivery</strong>
                          <span className={styles.badgePopular}>Most Popular</span>
                          <span className={styles.premiumPrice}>₹39</span>
                        </div>
                        <p className={styles.premiumDesc}>We'll click & instantly share high-resolution photo proof upon celebratory handover.</p>
                      </div>
                    </div>

                    {/* Premium Luxury Setup */}
                    <div
                      className={\`\${styles.premiumCard} \${styles.luxuryCard} \${hasPremiumSetup ? styles.premiumCardActive : ''}\`}
                      onClick={() => setHasPremiumSetup(!hasPremiumSetup)}
                    >
                      <div className={styles.checkboxCircle}>
                        {hasPremiumSetup && <Check size={14} color="#FFF" />}
                      </div>
                      <div className={styles.premiumDetails}>
                        <div className={styles.premiumTitleRow}>
                          <strong>Premium Setup Experience</strong>
                          <span className={styles.badgeBestValue}>Best Value</span>
                          <span className={styles.premiumPrice}>₹299</span>
                        </div>
                        <p className={styles.premiumDesc}>Luxury celebration setup with balloons, flowers & themed decor at the recipient's doorstep.</p>

                        <div className={styles.inclusionsGrid}>
                          {['Balloons & Décor', 'Premium Table Setup', 'Fresh Flowers', 'Greeting Board', 'LED Fairy Lights', 'Themed Arrangement'].map(inc => (
                            <div key={inc} className={styles.inclusionItem}>
                              <Check size={12} color="#10B981" />
                              <span>{inc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.desktopInlineActions}>
                    <button
                      type="button"
                      className={styles.secondaryActionBtn}
                      onClick={() => goToStep(3)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={styles.primaryActionBtn}
                      onClick={() => goToStep(5)}
                    >
                      Continue to Add-ons <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: ADD-ONS */}
              {step === 5 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeadingGroup}>
                    <h1 className={styles.stepMainHeading}>Add-on Services</h1>
                    <p className={styles.stepSubHeading}>Complete your celebration package with ribbons, wraps, party poppers & candles</p>
                  </div>

                  <div className={styles.addonsGridDesktop}>
                    {options.addons.map(addon => {
                      let isChecked = false
                      if (addon.id === 'PREMIUM_WRAP') isChecked = hasPremiumWrap
                      else if (addon.id === 'VIDEO_REACTION') isChecked = hasVideoReaction
                      else isChecked = Boolean(selectedAddonIds[addon.id])

                      const toggleAddon = () => {
                        if (addon.id === 'PREMIUM_WRAP') setHasPremiumWrap(!hasPremiumWrap)
                        else if (addon.id === 'VIDEO_REACTION') setHasVideoReaction(!hasVideoReaction)
                        else {
                          setSelectedAddonIds(prev => ({
                            ...prev,
                            [addon.id]: !prev[addon.id]
                          }))
                        }
                      }

                      return (
                        <div
                          key={addon.id}
                          className={\`\${styles.addonCard} \${isChecked ? styles.addonCardActive : ''}\`}
                          onClick={toggleAddon}
                        >
                          <div className={styles.addonHeader}>
                            <div className={styles.checkboxCircle}>
                              {isChecked && <Check size={14} color="#FFF" />}
                            </div>
                            <div className={styles.addonTitleBlock}>
                              <strong>{addon.title}</strong>
                              {addon.badge && <span className={styles.badgePopular}>{addon.badge}</span>}
                            </div>
                            <span className={styles.addonPrice}>₹{addon.price}</span>
                          </div>
                          <p className={styles.addonDesc}>{addon.description}</p>
                        </div>
                      )
                    })}
                  </div>

                  <div className={styles.desktopInlineActions}>
                    <button
                      type="button"
                      className={styles.secondaryActionBtn}
                      onClick={() => goToStep(4)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={styles.primaryActionBtn}
                      onClick={() => goToStep(6)}
                    >
                      Review & Pay <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: REVIEW & PAY */}
              {step === 6 && (
                <div className={styles.stepContent}>
                  <div className={styles.sectionHeadingGroup}>
                    <h1 className={styles.stepMainHeading}>Review Your Order</h1>
                    <p className={styles.stepSubHeading}>Please review your order details before placing</p>
                  </div>

                  {/* Product Summary Card */}
                  <div className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                      <div className={styles.productReviewRow}>
                        <img src={currentProduct?.image} alt={currentProduct?.name} className={styles.reviewProductThumb} />
                        <div>
                          <h3 className={styles.reviewProductName}>{currentProduct?.name}</h3>
                          <p className={styles.reviewProductSub}>{currentProduct?.description}</p>
                          <div className={styles.reviewProductMeta}>
                            <span>Weight: {currentProduct?.weight || '1 kg'}</span>
                            <span>• Serves: {currentProduct?.serves || '6 - 8 People'}</span>
                            <span>• Qty: {quantity}</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.reviewCardPriceRow}>
                        <span className={styles.reviewProductPrice}>₹{(currentProduct?.price || 699) * quantity}</span>
                        <button type="button" className={styles.editLinkBtn} onClick={() => goToStep(1)}>Edit</button>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details Card */}
                  <div className={styles.reviewCard}>
                    <div className={styles.cardTitleWithEdit}>
                      <strong>Delivery Details</strong>
                      <button type="button" className={styles.editLinkBtn} onClick={() => goToStep(2)}>Edit</button>
                    </div>

                    <div className={styles.reviewDetailRow}>
                      <User size={16} />
                      <div>
                        <span className={styles.detailLabel}>Deliver to:</span>
                        <strong>{recipientName} ({recipientPhone})</strong>
                      </div>
                    </div>

                    <div className={styles.reviewDetailRow}>
                      <MapPin size={16} />
                      <div>
                        <span className={styles.detailLabel}>Delivery Address:</span>
                        <p>{deliveryAddress}{deliveryLandmark ? \`, Landmark: \${deliveryLandmark}\` : ''}, {deliveryCity} - {deliveryPostalCode}</p>
                      </div>
                    </div>

                    <div className={styles.reviewDetailRow}>
                      <Calendar size={16} />
                      <div>
                        <span className={styles.detailLabel}>Schedule & Speed:</span>
                        <p>{scheduledDate} ({scheduledTimeSlot}) • {deliveryType}</p>
                      </div>
                    </div>

                    {giftMessage && (
                      <div className={styles.reviewDetailRow}>
                        <FileEdit size={16} />
                        <div>
                          <span className={styles.detailLabel}>Gift Message ({selectedGreetingCard.name}):</span>
                          <p className={styles.italicMessage}>"{giftMessage}"</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Select Payment Method */}
                  <div className={styles.paymentMethodsCard}>
                    <h3 className={styles.billHeading}>Select Payment Method</h3>

                    <label className={\`\${styles.paymentOption} \${paymentMethod === 'UPI' ? styles.paymentOptionActive : ''}\`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                      />
                      <div className={styles.paymentInfoBlock}>
                        <strong>UPI</strong>
                        <span>Google Pay, PhonePe, Paytm, BHIM</span>
                      </div>
                    </label>

                    <label className={\`\${styles.paymentOption} \${paymentMethod === 'CARD' ? styles.paymentOptionActive : ''}\`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                      />
                      <div className={styles.paymentInfoBlock}>
                        <strong>Credit / Debit Card</strong>
                        <span>Visa, MasterCard, RuPay</span>
                      </div>
                    </label>

                    <label className={\`\${styles.paymentOption} \${paymentMethod === 'WALLET' ? styles.paymentOptionActive : ''}\`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="WALLET"
                        checked={paymentMethod === 'WALLET'}
                        onChange={() => setPaymentMethod('WALLET')}
                      />
                      <div className={styles.paymentInfoBlock}>
                        <strong>Wallets</strong>
                        <span>Delivez Wallet, Amazon Pay, Paytm</span>
                      </div>
                    </label>

                    <label className={\`\${styles.paymentOption} \${paymentMethod === 'NET_BANKING' ? styles.paymentOptionActive : ''}\`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="NET_BANKING"
                        checked={paymentMethod === 'NET_BANKING'}
                        onChange={() => setPaymentMethod('NET_BANKING')}
                      />
                      <div className={styles.paymentInfoBlock}>
                        <strong>Net Banking</strong>
                        <span>All Major Indian Banks</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sticky Sidebar (Always rendered on desktop for Steps 1-6) */}
            {renderSidebarSummary()}
          </div>
        )}

        {/* STEP 7: ORDER PLACED SUCCESSFULLY */}
        {step === 7 && (
          <section className={styles.successStepContent}>
            {/* Animated Celebration Icon */}
            <div className={styles.celebrationIconWrapper}>
              <div className={styles.celebrationCircle}>
                <Check size={40} className={styles.celebrationCheck} />
              </div>
            </div>

            <h1 className={styles.successHeading}>Order Placed Successfully!</h1>
            <p className={styles.successSubHeading}>Your gift is on its way to make someone smile.</p>

            <div className={styles.successDesktopGrid}>
              {/* Left Column */}
              <div className={styles.successLeftCol}>
                <div className={styles.orderIdCard}>
                  <div className={styles.orderIdLeft}>
                    <span className={styles.orderIdLabel}>Order ID</span>
                    <strong className={styles.orderIdNumber}>{createdBooking?.bookingNumber || 'DLVZ56874291'}</strong>
                  </div>
                  <button
                    type="button"
                    className={styles.copyOrderBtn}
                    onClick={() => handleCopyOrderId(createdBooking?.bookingNumber || 'DLVZ56874291')}
                  >
                    {copiedOrderId ? (
                      <>
                        <Check size={14} /> Copied
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </button>
                </div>

                <div className={styles.estimatedDeliveryCard}>
                  <Calendar size={28} className={styles.estimatedCalendarIcon} />
                  <div className={styles.estimatedDeliveryInfo}>
                    <span className={styles.estLabel}>Estimated Delivery</span>
                    <strong className={styles.estDate}>{scheduledDate}</strong>
                    <span className={styles.estSlot}>{scheduledTimeSlot}</span>
                  </div>
                  <ChevronRight size={20} className={styles.estChevron} />
                </div>

                <div className={styles.whatsNextCard}>
                  <h3 className={styles.whatsNextTitle}>What's Next?</h3>
                  <div className={styles.whatsNextTimeline}>
                    <div className={\`\${styles.timelineNode} \${styles.timelineNodeActive}\`}>
                      <div className={styles.nodeIconCircle}>
                        <CheckCircle2 size={16} />
                      </div>
                      <strong>Order Confirmed</strong>
                      <span>Today</span>
                    </div>

                    <div className={\`\${styles.timelineNode} \${styles.timelineNodeActive}\`}>
                      <div className={styles.nodeIconCircle}>
                        <Gift size={16} />
                      </div>
                      <strong>Preparing Your Gift</strong>
                      <span className={styles.inProgressPill}>In Progress</span>
                    </div>

                    <div className={styles.timelineNode}>
                      <div className={styles.nodeIconCircle}>
                        <ShoppingBag size={16} />
                      </div>
                      <strong>On The Way</strong>
                      <span>Soon</span>
                    </div>

                    <div className={styles.timelineNode}>
                      <div className={styles.nodeIconCircle}>
                        <Sparkles size={16} />
                      </div>
                      <strong>Delivered</strong>
                      <span>Enjoy!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className={styles.successRightCol}>
                <div className={styles.notificationsBanner}>
                  <Shield size={24} />
                  <div>
                    <strong>We've got you covered!</strong>
                    <p>You will receive real-time updates on your order via SMS, Email & Push Notifications.</p>
                  </div>
                </div>

                <div className={styles.referCard}>
                  <Gift size={24} className={styles.referIcon} />
                  <div className={styles.referText}>
                    <strong>Invite Friends & Earn Rewards</strong>
                    <p>Refer your friends and earn exciting Delivez Rewards!</p>
                  </div>
                  <button
                    type="button"
                    className={styles.referBtn}
                    onClick={() => alert('Referral link copied to clipboard!')}
                  >
                    Refer & Earn
                  </button>
                </div>

                <div className={styles.successActionsGrid}>
                  <button
                    type="button"
                    className={styles.needHelpBtn}
                    onClick={() => alert('Delivez Support: Call 1800-123-DELIVEZ or email support@delivez.com')}
                  >
                    Need Help?
                  </button>
                  <button
                    type="button"
                    className={styles.shareOrderBtn}
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'My Delivez Gift Order',
                          text: \`Tracking gift order \${createdBooking?.bookingNumber}\`,
                          url: window.location.origin + \`/gift-delivery/track/\${createdBooking?.bookingNumber || 'DLVZ56874291'}\`
                        })
                      } else {
                        alert('Order tracking link copied!')
                      }
                    }}
                  >
                    <Share2 size={16} /> Share Order
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.trackOrderBtnRed}
                  onClick={() => {
                    window.location.href = \`/gift-delivery/track/\${createdBooking?.bookingNumber || 'DLVZ56874291'}\`
                  }}
                >
                  Track Your Order <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Greeting Card Selector Modal */}
      {cardModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCardModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Select Greeting Card Design</h3>
              <button type="button" onClick={() => setCardModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className={styles.cardDesignsGrid}>
              {options.greetingCards.map(card => (
                <div
                  key={card.id}
                  className={\`\${styles.cardOption} \${selectedGreetingCard.id === card.id ? styles.cardOptionActive : ''}\`}
                  onClick={() => {
                    setSelectedGreetingCard(card)
                    setCardModalOpen(false)
                  }}
                >
                  <img src={card.previewUrl} alt={card.name} className={styles.cardOptionImg} />
                  <strong>{card.name}</strong>
                  <span>Theme: {card.theme}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false)
          handlePlaceOrder()
        }}
      />
    </div>
  )
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryBookingPage.jsx'), bookingJsx, 'utf8');
console.log('Successfully updated GiftDeliveryBookingPage.jsx for unrestricted tab navigation');

// ============================================================================
// 2. Updated GiftDeliveryBookingPage.module.css
// ============================================================================
const bookingCss = `.pageWrapper {
  min-height: 100vh;
  background-color: #F8FAFC;
  color: #0F172A;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding-bottom: 80px;
}

/* Header */
.header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.headerContainer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.headerLeft {
  display: flex;
  align-items: center;
  gap: 14px;
}

.backBtn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border-radius: 8px;
  color: #1E293B;
  transition: background 0.2s;
}

.backBtn:hover {
  background: #F1F5F9;
}

.logoText {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}

.logoBlack {
  color: #0F172A;
}

.logoYellow {
  color: #F59E0B;
}

.serviceBadgeHeader {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFF1F2;
  color: #E11D48;
  border: 1px solid #FECDD3;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
}

@media (max-width: 640px) {
  .serviceBadgeHeader {
    display: none;
  }
}

.headerRight {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cartIconWrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #1E293B;
}

.cartBadge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #F59E0B;
  color: #000000;
  font-size: 11px;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

/* Step Progress Tracker */
.stepTrackerWrapper {
  background: #FFFFFF;
  border-bottom: 1px solid #E2E8F0;
}

.stepTracker {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  overflow-x: auto;
  gap: 8px;
  scrollbar-width: none;
}

.stepTracker::-webkit-scrollbar {
  display: none;
}

.stepItem {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  opacity: 0.65;
  transition: all 0.2s ease;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 8px;
}

.stepItem:hover {
  opacity: 1;
  background: #F8FAFC;
}

.stepItem.stepActive {
  opacity: 1;
}

.stepItem.stepCompleted {
  opacity: 0.9;
}

.stepIconCircle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.2s;
}

.stepActive .stepIconCircle {
  background: #E11D48;
  color: #FFFFFF;
  box-shadow: 0 4px 10px rgba(225, 29, 72, 0.3);
}

.stepCompleted .stepIconCircle {
  background: #10B981;
  color: #FFFFFF;
}

.stepTitle {
  font-size: 13px;
  font-weight: 600;
  color: #64748B;
}

.stepActive .stepTitle {
  color: #E11D48;
  font-weight: 800;
}

.stepLine {
  flex: 1;
  height: 2px;
  background: #E2E8F0;
  margin: 0 10px;
  min-width: 16px;
}

.stepLineActive {
  background: #10B981;
}

@media (max-width: 768px) {
  .stepLine {
    display: none;
  }
  .stepItem {
    flex-direction: column;
    min-width: 55px;
    gap: 4px;
    padding: 2px;
  }
  .stepTitle {
    font-size: 10px;
  }
}

/* Main Container */
.mainContainer {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 20px;
}

.sectionHeadingGroup {
  margin-bottom: 20px;
}

.stepMainHeading {
  font-size: 24px;
  font-weight: 800;
  color: #0F172A;
  margin-bottom: 4px;
}

.stepSubHeading {
  font-size: 14px;
  color: #64748B;
}

/* Error Alert */
.errorAlert {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FEE2E2;
  color: #991B1B;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}

.alertClose {
  margin-left: auto;
  background: transparent;
  border: none;
  color: #991B1B;
  cursor: pointer;
}

/* Categories Grid */
.categoriesGrid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

@media (max-width: 1024px) {
  .categoriesGrid {
    grid-template-columns: repeat(5, 1fr);
  }
}

@media (max-width: 640px) {
  .categoriesGrid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.categoryCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.categoryCard:hover {
  border-color: #CBD5E1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.categoryCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.15);
}

.categoryIconCircle {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #F8FAFC;
  color: #E11D48;
  display: flex;
  align-items: center;
  justify-content: center;
}

.categoryCardActive .categoryIconCircle {
  background: #FFE4E6;
}

.categoryName {
  font-size: 12px;
  font-weight: 700;
  color: #1E293B;
  text-align: center;
}

/* Promo Banner */
.promoBanner {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 1px solid #FCD34D;
  border-radius: 14px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.promoBannerIcon {
  color: #D97706;
  flex-shrink: 0;
}

.promoBannerText {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.promoBannerText strong {
  font-size: 14px;
  color: #92400E;
}

.promoBannerText span {
  font-size: 12px;
  color: #B45309;
}

/* Filters & Search */
.filtersBar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

@media (max-width: 768px) {
  .filtersBar {
    flex-direction: column;
    align-items: stretch;
  }
}

.searchBox {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 10px 14px;
  color: #64748B;
  min-width: 260px;
}

.searchBox input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #0F172A;
}

.chipRow {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.filterChip {
  padding: 8px 16px;
  border-radius: 20px;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.filterChipActive {
  background: #0F172A;
  color: #FFFFFF;
  border-color: #0F172A;
}

/* Products Grid */
.productsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

@media (max-width: 1100px) {
  .productsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .productsGrid {
    grid-template-columns: 1fr;
  }
}

.productCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.25s ease;
}

.productCard:hover {
  border-color: #CBD5E1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-3px);
}

.productCardActive {
  border-color: #E11D48;
  box-shadow: 0 8px 24px rgba(225, 29, 72, 0.18);
}

.productImageWrapper {
  position: relative;
  width: 100%;
  height: 170px;
  background: #F1F5F9;
}

.productImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.productBadge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #E11D48;
  color: #FFFFFF;
  font-size: 10px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.favBtn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.favBtnActive {
  color: #E11D48;
}

.productInfo {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.productTitleRow {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.productName {
  font-size: 15px;
  font-weight: 700;
  color: #0F172A;
  line-height: 1.3;
}

.productPrice {
  font-size: 16px;
  font-weight: 800;
  color: #E11D48;
  white-space: nowrap;
}

.productDesc {
  font-size: 12px;
  color: #64748B;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.productAttributes {
  display: flex;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  background: #F8FAFC;
  padding: 5px 8px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.productRatingRow {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
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

.reviewsCount {
  font-size: 11px;
  color: #94A3B8;
}

.productActionRow {
  margin-top: auto;
}

.addBtn {
  width: 100%;
  padding: 10px;
  border-radius: 10px;
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  color: #0F172A;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.addBtn:hover {
  background: #E2E8F0;
}

.qtyCounter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  border-radius: 10px;
  padding: 6px 12px;
}

.qtyBtn {
  background: #FFFFFF;
  border: 1px solid #FECDD3;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #E11D48;
  cursor: pointer;
}

.qtyValue {
  font-size: 14px;
  font-weight: 800;
  color: #E11D48;
}

/* Expert Help Card */
.expertHelpCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.expertIcon {
  color: #0284C7;
  flex-shrink: 0;
}

.expertText {
  flex: 1;
}

.expertText strong {
  font-size: 14px;
  color: #0F172A;
  display: block;
}

.expertText p {
  font-size: 12px;
  color: #64748B;
  margin: 2px 0 0 0;
}

.expertBtn {
  padding: 8px 16px;
  background: #E0F2FE;
  color: #0369A1;
  border: 1px solid #BAE6FD;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.inlineActionBox {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 2-COLUMN SPLIT LAYOUT (DESKTOP) */
.splitLayoutGrid {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

.leftFormColumn {
  flex: 1;
  min-width: 0;
}

.desktopSidebar {
  width: 380px;
  flex-shrink: 0;
}

@media (max-width: 960px) {
  .splitLayoutGrid {
    flex-direction: column;
  }
  .desktopSidebar {
    width: 100%;
  }
}

.sidebarStickyInner {
  position: sticky;
  top: 90px;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.sidebarHeading {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 16px 0;
}

.sidebarProductRow {
  display: flex;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #E2E8F0;
  margin-bottom: 14px;
}

.sidebarProductImg {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
}

.sidebarProductDetails {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sidebarProductDetails strong {
  font-size: 14px;
  color: #0F172A;
}

.sidebarProductDetails span {
  font-size: 12px;
  color: #64748B;
}

.sidebarProductOccasion {
  font-size: 11px;
  color: #E11D48;
  font-weight: 700;
}

.sidebarEditBtn {
  background: transparent;
  border: none;
  color: #E11D48;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  align-self: flex-start;
}

.sidebarMetaBlock {
  background: #F8FAFC;
  padding: 10px 12px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.sidebarMetaItem {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}

.truncateText {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.sidebarAddonsPill {
  background: #FFF1F2;
  color: #BE185D;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.sidebarCouponRow {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px dashed #CBD5E1;
  border-radius: 10px;
  padding: 6px 10px;
  margin-bottom: 16px;
  color: #E11D48;
}

.sidebarCouponRow input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  font-weight: 700;
  color: #0F172A;
  text-transform: uppercase;
}

.sidebarCouponBtn {
  background: #0F172A;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.sidebarBillList {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px dashed #E2E8F0;
  margin-bottom: 14px;
}

.sidebarBillRow {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #475569;
}

.discountText {
  color: #10B981;
  font-weight: 700;
}

.sidebarTotalRow {
  font-size: 16px;
  color: #0F172A;
  padding-top: 4px;
}

.sidebarTotalYellow {
  color: #F59E0B;
  font-size: 18px;
}

.sidebarSecureBadge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #059669;
  background: #ECFDF5;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.sidebarActionArea {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebarPrimaryBtn {
  width: 100%;
  background: #0F172A;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebarPrimaryBtnYellow {
  width: 100%;
  background: #F59E0B;
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
}

.sidebarPlaceOrderBtn {
  width: 100%;
  background: #DC2626;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 15px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
}

.desktopInlineActions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

/* Step 2: Form */
.formGrid2Col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

@media (max-width: 600px) {
  .formGrid2Col {
    grid-template-columns: 1fr;
  }
}

.deliverToToggle {
  margin-bottom: 18px;
}

.fieldLabel {
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 6px;
  display: block;
}

.togglePills {
  display: flex;
  background: #E2E8F0;
  padding: 4px;
  border-radius: 12px;
  gap: 4px;
  max-width: 320px;
}

.togglePill {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #64748B;
  cursor: pointer;
  transition: all 0.2s;
}

.togglePillActive {
  background: #FFFFFF;
  color: #0F172A;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.formCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 22px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inputGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inputWithIcon {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 14px;
  background: #FFFFFF;
}

.inputWithIcon input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #0F172A;
}

.inputIcon {
  color: #94A3B8;
}

.phoneInputRow {
  display: flex;
  gap: 10px;
}

.countryCodeBadge {
  background: #F1F5F9;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
}

.phoneInputRow input {
  flex: 1;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
  color: #0F172A;
  outline: none;
}

.labelWithAction {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.useLocationBtn {
  background: transparent;
  border: none;
  color: #E11D48;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.inputRow {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

@media (max-width: 540px) {
  .inputRow {
    grid-template-columns: 1fr;
  }
}

.inputRow input,
.inputRow select {
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #0F172A;
  outline: none;
  background: #FFFFFF;
}

.labelWithCounter {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.charCount {
  font-size: 11px;
  color: #94A3B8;
}

textarea {
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 14px;
  color: #0F172A;
  outline: none;
  font-family: inherit;
  resize: vertical;
}

.cardPreviewBox {
  background: #F8FAFC;
  border: 1px dashed #CBD5E1;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cardPreviewLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cardPreviewIcon {
  color: #E11D48;
}

.cardPreviewLeft strong {
  font-size: 14px;
  color: #0F172A;
  display: block;
}

.cardPreviewLeft span {
  font-size: 12px;
  color: #64748B;
}

.changeCardBtn {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
  cursor: pointer;
}

.safetyBanner {
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #065F46;
  font-size: 13px;
  margin-bottom: 20px;
}

.safetyIcon {
  color: #10B981;
  flex-shrink: 0;
}

/* Step 3: Date & Time */
.deliveryTypesGridDesktop {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 18px;
}

@media (max-width: 600px) {
  .deliveryTypesGridDesktop {
    grid-template-columns: 1fr;
  }
}

.deliveryTypeCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.deliveryTypeCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.deliveryTypeHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.radioCircle {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.deliveryTypeCardActive .radioCircle {
  border-color: #E11D48;
}

.radioDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #E11D48;
}

.deliveryTypeTitleGroup {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.deliveryTypeTitleGroup strong {
  font-size: 14px;
  color: #0F172A;
}

.typeBadge {
  background: #FEF3C7;
  color: #B45309;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.deliveryTypePrice {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.deliveryTypeDesc {
  font-size: 12px;
  color: #64748B;
  margin: 4px 0 2px 28px;
}

.deliveryTypeEta {
  font-size: 11px;
  font-weight: 700;
  color: #10B981;
  margin-left: 28px;
  display: block;
}

.weekBanner {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #475569;
  margin-bottom: 20px;
}

.dateSection {
  margin-bottom: 24px;
}

.dateSubtext {
  font-size: 12px;
  color: #94A3B8;
  margin-bottom: 12px;
  display: block;
}

.dateCarousel {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: none;
}

.datePill {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 72px;
  cursor: pointer;
  transition: all 0.2s;
}

.datePillActive {
  background: #0F172A;
  border-color: #0F172A;
  color: #FFFFFF;
}

.dateDayName {
  font-size: 11px;
  font-weight: 600;
  color: #64748B;
}

.datePillActive .dateDayName {
  color: #CBD5E1;
}

.dateNumber {
  font-size: 17px;
  font-weight: 800;
}

.dateMonth {
  font-size: 11px;
  font-weight: 600;
  color: #94A3B8;
}

.datePillActive .dateMonth {
  color: #94A3B8;
}

.timeSlotSection {
  margin-bottom: 24px;
}

.timeSlotsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

@media (max-width: 540px) {
  .timeSlotsGrid {
    grid-template-columns: 1fr;
  }
}

.timeSlotBtn {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.timeSlotBtnActive {
  border-color: #E11D48;
  background: #FFF1F2;
  color: #E11D48;
}

.guaranteeNotice {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #64748B;
  margin-bottom: 20px;
}

/* Step 4: Premium Setup */
.premiumList {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.premiumCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.premiumCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.checkboxCircle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #CBD5E1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.premiumCardActive .checkboxCircle {
  background: #E11D48;
  border-color: #E11D48;
}

.addonCardActive .checkboxCircle {
  background: #E11D48;
  border-color: #E11D48;
}

.premiumDetails {
  flex: 1;
}

.premiumTitleRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.premiumTitleRow strong {
  font-size: 15px;
  color: #0F172A;
  flex: 1;
}

.badgePopular {
  background: #FEF3C7;
  color: #B45309;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.badgeNew {
  background: #E0F2FE;
  color: #0369A1;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.badgeBestValue {
  background: #DCFCE7;
  color: #15803D;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
}

.premiumPrice {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
}

.premiumDesc {
  font-size: 13px;
  color: #64748B;
  line-height: 1.4;
  margin: 0;
}

.inclusionsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
  background: #FFFFFF;
  padding: 12px;
  border-radius: 10px;
}

@media (max-width: 600px) {
  .inclusionsGrid {
    grid-template-columns: 1fr 1fr;
  }
}

.inclusionItem {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

/* Step 5: Add-ons (Desktop 2-Col) */
.addonsGridDesktop {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .addonsGridDesktop {
    grid-template-columns: 1fr;
  }
}

.addonCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.addonCardActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.addonHeader {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.addonTitleBlock {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.addonTitleBlock strong {
  font-size: 14px;
  color: #0F172A;
}

.addonPrice {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
}

.addonDesc {
  font-size: 12px;
  color: #64748B;
  margin: 0 0 0 34px;
}

/* Step 6: Review & Pay */
.reviewCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
}

.reviewCardHeader {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.productReviewRow {
  display: flex;
  gap: 14px;
}

.reviewProductThumb {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  object-fit: cover;
}

.reviewProductName {
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 2px 0;
}

.reviewProductSub {
  font-size: 13px;
  color: #64748B;
  margin: 0 0 4px 0;
}

.reviewProductMeta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.reviewCardPriceRow {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.reviewProductPrice {
  font-size: 17px;
  font-weight: 800;
  color: #0F172A;
}

.editLinkBtn {
  background: transparent;
  border: none;
  color: #E11D48;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.cardTitleWithEdit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.cardTitleWithEdit strong {
  font-size: 15px;
  color: #0F172A;
}

.reviewDetailRow {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  color: #475569;
  margin-bottom: 10px;
}

.detailLabel {
  font-size: 11px;
  color: #94A3B8;
  display: block;
}

.italicMessage {
  font-style: italic;
  color: #BE185D;
  margin: 2px 0 0 0;
}

.billHeading {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 14px 0;
}

/* Payment Methods */
.paymentMethodsCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.paymentOption {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.paymentOptionActive {
  border-color: #F59E0B;
  background: #FFFBEB;
}

.paymentInfoBlock {
  display: flex;
  flex-direction: column;
}

.paymentInfoBlock strong {
  font-size: 14px;
  color: #0F172A;
}

.paymentInfoBlock span {
  font-size: 12px;
  color: #64748B;
}

.primaryActionBtn {
  background: #0F172A;
  color: #FFFFFF;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.primaryActionBtn:hover {
  background: #1E293B;
}

.primaryActionBtnYellow {
  background: #F59E0B;
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.secondaryActionBtn {
  background: transparent;
  border: 1.5px solid #CBD5E1;
  color: #334155;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

/* Step 7: Success Screen (Desktop 2-Col) */
.successStepContent {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-top: 10px;
}

.celebrationIconWrapper {
  margin-bottom: 16px;
}

.celebrationCircle {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #FEF3C7;
  border: 4px solid #FDE68A;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #D97706;
}

.successHeading {
  font-size: 26px;
  font-weight: 900;
  color: #0F172A;
  margin: 0 0 6px 0;
}

.successSubHeading {
  font-size: 15px;
  color: #64748B;
  margin: 0 0 24px 0;
}

.successDesktopGrid {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  text-align: left;
}

@media (max-width: 768px) {
  .successDesktopGrid {
    grid-template-columns: 1fr;
  }
}

.successLeftCol, .successRightCol {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.orderIdCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.orderIdLeft {
  display: flex;
  flex-direction: column;
}

.orderIdLabel {
  font-size: 11px;
  color: #94A3B8;
}

.orderIdNumber {
  font-size: 18px;
  font-weight: 900;
  color: #0F172A;
  letter-spacing: 0.5px;
}

.copyOrderBtn {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.estimatedDeliveryCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.estimatedCalendarIcon {
  color: #10B981;
}

.estimatedDeliveryInfo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.estLabel {
  font-size: 11px;
  color: #94A3B8;
}

.estDate {
  font-size: 16px;
  font-weight: 800;
  color: #10B981;
}

.estSlot {
  font-size: 13px;
  color: #64748B;
}

.estChevron {
  color: #CBD5E1;
}

.whatsNextCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
}

.whatsNextTitle {
  font-size: 15px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 16px 0;
}

.whatsNextTimeline {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.timelineNode {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
  opacity: 0.5;
}

.timelineNodeActive {
  opacity: 1;
}

.nodeIconCircle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #F1F5F9;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.timelineNodeActive .nodeIconCircle {
  background: #FEF3C7;
  color: #D97706;
}

.timelineNode strong {
  font-size: 12px;
  color: #0F172A;
  line-height: 1.2;
}

.timelineNode span {
  font-size: 11px;
  color: #94A3B8;
}

.inProgressPill {
  background: #E0F2FE;
  color: #0369A1 !important;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.notificationsBanner {
  background: #DC2626;
  color: #FFFFFF;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.notificationsBanner strong {
  font-size: 15px;
  display: block;
}

.notificationsBanner p {
  font-size: 13px;
  color: #FEE2E2;
  margin: 2px 0 0 0;
}

.referCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.referIcon {
  color: #F59E0B;
}

.referText {
  flex: 1;
}

.referText strong {
  font-size: 15px;
  color: #0F172A;
  display: block;
}

.referText p {
  font-size: 13px;
  color: #64748B;
  margin: 2px 0 0 0;
}

.referBtn {
  background: #FFFBEB;
  border: 1px solid #FCD34D;
  color: #D97706;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.successActionsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.needHelpBtn {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
}

.shareOrderBtn {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.trackOrderBtnRed {
  background: #DC2626;
  color: #FFFFFF;
  border: none;
  border-radius: 14px;
  padding: 16px;
  font-size: 16px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
}

/* Modal */
.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 20px;
}

.modalContent {
  background: #FFFFFF;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 24px;
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.modalHeader h3 {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
}

.modalHeader button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748B;
}

.cardDesignsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.cardOption {
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cardOptionActive {
  border-color: #E11D48;
  background: #FFF1F2;
}

.cardOptionImg {
  width: 100%;
  height: 120px;
  border-radius: 10px;
  object-fit: cover;
}

.cardOption strong {
  font-size: 14px;
  color: #0F172A;
}

.cardOption span {
  font-size: 12px;
  color: #64748B;
}
`;

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryBookingPage.module.css'), bookingCss, 'utf8');
console.log('Successfully updated GiftDeliveryBookingPage.module.css');
