const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const pagesDir = path.join(webRoot, 'src/pages/gift-delivery');
fs.mkdirSync(pagesDir, { recursive: true });

// -------------------------------------------------------------
// 1. GiftDeliveryBookingPage.jsx
// -------------------------------------------------------------
const bookingPageJsx = `import React, { useState, useEffect, useMemo } from 'react'
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
  const [priceDetailsOpen, setPriceDetailsOpen] = useState(false)

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
    if (!selectedProduct) return
    async function updateQuote() {
      const selectedAddonsList = Object.entries(selectedAddonIds)
        .filter(([, checked]) => checked)
        .map(([id]) => {
          const addon = options.addons.find(a => a.id === id)
          return { id, price: addon?.price || 0, title: addon?.title }
        })

      const q = await fetchGiftDeliveryQuote({
        productId: selectedProduct.id,
        productPrice: selectedProduct.price,
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

  // Handle Order Placement
  const handlePlaceOrder = async () => {
    setErrorMessage('')
    const token = getUserAccessToken()
    if (!token) {
      setAuthModalOpen(true)
      return
    }

    if (!selectedProduct) {
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
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        productDescription: selectedProduct.description,
        productImage: selectedProduct.image,
        productPrice: selectedProduct.price,
        productQuantity: quantity,
        productWeight: selectedProduct.weight || '1 kg',
        productServes: selectedProduct.serves || '6 - 8 People',
        selectedOccasion: selectedProduct.occasionTag || 'Birthday',

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

  return (
    <div className={styles.pageWrapper}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {step > 1 && step < 7 && (
            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep(s => Math.max(1, s - 1))}
              aria-label="Go Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className={styles.logoText}>
            <span className={styles.logoBlack}>DELIVE</span>
            <span className={styles.logoYellow}>Z</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.cartIconWrapper}>
            <ShoppingBag size={22} className={styles.cartIcon} />
            <span className={styles.cartBadge}>{quantity}</span>
          </div>
        </div>
      </header>

      {/* Step Progress Tracker (Steps 1-6) */}
      {step <= 6 && (
        <div className={styles.stepTracker}>
          {STEP_TITLES.map((title, index) => {
            const stepNum = index + 1
            const IconComponent = STEP_ICONS[index]
            const isCompleted = step > stepNum
            const isActive = step === stepNum

            return (
              <div
                key={title}
                className={\`\${styles.stepItem} \${isActive ? styles.stepActive : ''} \${isCompleted ? styles.stepCompleted : ''}\`}
                onClick={() => {
                  if (stepNum < step) setStep(stepNum)
                }}
              >
                <div className={styles.stepIconCircle}>
                  {isCompleted ? <Check size={14} /> : <IconComponent size={14} />}
                </div>
                <span className={styles.stepTitle}>
                  {stepNum}. {title}
                </span>
              </div>
            )
          })}
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

        {/* STEP 1: SELECT GIFT */}
        {step === 1 && (
          <section className={styles.stepContent}>
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
                <span>Surprise your loved ones right on time at 12:00 AM.</span>
              </div>
            </div>

            {/* Filter Chips & Search */}
            <div className={styles.filtersBar}>
              <div className={styles.searchBox}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search cakes, flowers, chocolates..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

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
            </div>

            {/* Products Grid */}
            <div className={styles.productsGrid}>
              {filteredProducts.map(product => {
                const isSelected = selectedProduct?.id === product.id
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
                            <Plus size={14} /> Add
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

            {/* Sticky Bottom Bar */}
            <div className={styles.bottomActionBar}>
              <div className={styles.bottomPriceSummary}>
                <span className={styles.bottomPriceLabel}>Selected: {selectedProduct?.name || 'No gift selected'}</span>
                <span className={styles.bottomPriceValue}>₹{quote?.totalAmount || selectedProduct?.price || 699}</span>
              </div>
              <button
                type="button"
                className={styles.primaryActionBtn}
                disabled={!selectedProduct}
                onClick={() => setStep(2)}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 2: DELIVERY DETAILS */}
        {step === 2 && (
          <section className={styles.stepContent}>
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

            {/* Sticky Bottom Actions */}
            <div className={styles.bottomActionBar}>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryActionBtnYellow}
                onClick={() => {
                  if (!recipientName.trim() || !recipientPhone.trim() || !deliveryAddress.trim()) {
                    setErrorMessage('Please fill in recipient name, phone, and delivery address.')
                    return
                  }
                  setErrorMessage('')
                  setStep(3)
                }}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 3: DATE & TIME */}
        {step === 3 && (
          <section className={styles.stepContent}>
            <div className={styles.sectionHeadingGroup}>
              <h1 className={styles.stepMainHeading}>Schedule Date & Time</h1>
              <p className={styles.stepSubHeading}>Choose when your gift should arrive to create the magic moment</p>
            </div>

            {/* Delivery Type Options */}
            <div className={styles.deliveryTypesGrid}>
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

            {/* 7 Days a week banner */}
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

            {/* Notice */}
            <div className={styles.guaranteeNotice}>
              <Info size={16} />
              <span>Important: Precise delivery slots are reserved exclusively for your celebration order.</span>
            </div>

            {/* Sticky Bottom Actions */}
            <div className={styles.bottomActionBar}>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => setStep(4)}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 4: PREMIUM SETUP */}
        {step === 4 && (
          <section className={styles.stepContent}>
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

            {/* Summary Bar */}
            {activeAddonsCount > 0 && (
              <div className={styles.addonCounterBar}>
                <Sparkles size={16} />
                <span>{activeAddonsCount} experiences selected (+₹{quote?.addonsTotal || 0})</span>
              </div>
            )}

            {/* Sticky Bottom Actions */}
            <div className={styles.bottomActionBar}>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => setStep(3)}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => setStep(5)}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 5: ADD-ONS */}
        {step === 5 && (
          <section className={styles.stepContent}>
            <div className={styles.sectionHeadingGroup}>
              <h1 className={styles.stepMainHeading}>Add-on Services</h1>
              <p className={styles.stepSubHeading}>Complete your celebration package with ribbons, wraps, party poppers & candles</p>
            </div>

            <div className={styles.addonsGrid}>
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

            {/* Sticky Bottom Actions */}
            <div className={styles.bottomActionBar}>
              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => setStep(4)}
              >
                Back
              </button>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => setStep(6)}
              >
                Review & Pay <ArrowRight size={18} />
              </button>
            </div>
          </section>
        )}

        {/* STEP 6: REVIEW & PAY */}
        {step === 6 && (
          <section className={styles.stepContent}>
            <div className={styles.sectionHeadingGroup}>
              <h1 className={styles.stepMainHeading}>Review Your Order</h1>
              <p className={styles.stepSubHeading}>Please review your order details before placing</p>
            </div>

            {/* Product Summary Card */}
            <div className={styles.reviewCard}>
              <div className={styles.reviewCardHeader}>
                <div className={styles.productReviewRow}>
                  <img src={selectedProduct?.image} alt={selectedProduct?.name} className={styles.reviewProductThumb} />
                  <div>
                    <h3 className={styles.reviewProductName}>{selectedProduct?.name}</h3>
                    <p className={styles.reviewProductSub}>{selectedProduct?.description}</p>
                    <div className={styles.reviewProductMeta}>
                      <span>Weight: {selectedProduct?.weight || '1 kg'}</span>
                      <span>• Serves: {selectedProduct?.serves || '6 - 8 People'}</span>
                      <span>• Qty: {quantity}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.reviewCardPriceRow}>
                  <span className={styles.reviewProductPrice}>₹{selectedProduct?.price * quantity}</span>
                  <button type="button" className={styles.editLinkBtn} onClick={() => setStep(1)}>Edit</button>
                </div>
              </div>
            </div>

            {/* Delivery Details Card */}
            <div className={styles.reviewCard}>
              <div className={styles.cardTitleWithEdit}>
                <strong>Delivery Details</strong>
                <button type="button" className={styles.editLinkBtn} onClick={() => setStep(2)}>Edit</button>
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

            {/* Coupon Application */}
            <div className={styles.couponCard}>
              <Tag size={18} className={styles.couponIcon} />
              <input
                type="text"
                placeholder="Enter Coupon (e.g. GIFTLOVE)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
              />
              <button
                type="button"
                className={styles.applyCouponBtn}
                onClick={() => {
                  setAppliedCoupon(couponCode)
                  alert(\`Coupon \${couponCode} applied successfully!\`)
                }}
              >
                Apply
              </button>
            </div>

            {/* Bill Summary */}
            <div className={styles.billCard}>
              <h3 className={styles.billHeading}>Bill Summary</h3>
              <div className={styles.billRow}>
                <span>Item Total</span>
                <span>₹{quote?.itemTotal || selectedProduct?.price * quantity}</span>
              </div>
              <div className={styles.billRow}>
                <span>Delivery Charges</span>
                <span>₹{quote?.deliveryCharge || 49}</span>
              </div>
              <div className={styles.billRow}>
                <span>Packaging Charges</span>
                <span>₹{quote?.packagingCharge || 20}</span>
              </div>
              {quote?.addonsTotal > 0 && (
                <div className={styles.billRow}>
                  <span>Add-ons & Premium Setup</span>
                  <span>₹{quote.addonsTotal}</span>
                </div>
              )}
              {quote?.discountAmount > 0 && (
                <div className={\`\${styles.billRow} \${styles.discountRow}\`}>
                  <span>Coupon Discount ({appliedCoupon})</span>
                  <span>-₹{quote.discountAmount}</span>
                </div>
              )}
              <div className={styles.billRow}>
                <span>Taxes (GST)</span>
                <span>₹{quote?.taxAmount || 38}</span>
              </div>
              <div className={\`\${styles.billRow} \${styles.totalPayableRow}\`}>
                <strong>Total Payable</strong>
                <strong className={styles.totalYellow}>₹{quote?.totalAmount || 806}</strong>
              </div>
            </div>

            {/* 100% Secure Payment Banner */}
            <div className={styles.securePaymentBanner}>
              <Shield size={22} className={styles.secureShieldIcon} />
              <div>
                <strong>100% Secure Payment</strong>
                <p>Your payment details are safe with end-to-end encryption.</p>
              </div>
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

            {/* Sticky Bottom Actions */}
            <div className={styles.bottomActionBar}>
              <div className={styles.bottomPriceSummary}>
                <span className={styles.bottomPriceValue}>₹{quote?.totalAmount || 806}</span>
                <span
                  className={styles.viewPriceDetailsLink}
                  onClick={() => setPriceDetailsOpen(!priceDetailsOpen)}
                >
                  View Price Details
                </span>
              </div>
              <button
                type="button"
                className={styles.placeOrderBtnRed}
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className={styles.spinner} /> Placing Order...
                  </>
                ) : (
                  <>
                    Place Order <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
            <p className={styles.termsNote}>By placing this order, you agree to our Terms & Conditions</p>
          </section>
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

            {/* Order ID Card */}
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

            {/* Estimated Delivery Card */}
            <div className={styles.estimatedDeliveryCard}>
              <Calendar size={28} className={styles.estimatedCalendarIcon} />
              <div className={styles.estimatedDeliveryInfo}>
                <span className={styles.estLabel}>Estimated Delivery</span>
                <strong className={styles.estDate}>{scheduledDate}</strong>
                <span className={styles.estSlot}>{scheduledTimeSlot}</span>
              </div>
              <ChevronRight size={20} className={styles.estChevron} />
            </div>

            {/* What's Next Progress Card */}
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

            {/* Real-time updates notice */}
            <div className={styles.notificationsBanner}>
              <Shield size={24} />
              <div>
                <strong>We've got you covered!</strong>
                <p>You will receive real-time updates on your order via SMS, Email & Push Notifications.</p>
              </div>
            </div>

            {/* Refer & Earn card */}
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

            {/* Action Buttons */}
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

fs.writeFileSync(path.join(pagesDir, 'GiftDeliveryBookingPage.jsx'), bookingPageJsx, 'utf8');
console.log('Created GiftDeliveryBookingPage.jsx');
