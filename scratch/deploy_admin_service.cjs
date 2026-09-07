const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const serviceDir = path.join(webRoot, 'src/features/admin-gift-delivery/services');
fs.mkdirSync(serviceDir, { recursive: true });

const serviceCode = `import {
  clearAdminSession,
  getAdminAccessToken,
} from '@/features/admin-auth/services/adminAuthService.js'
import { apiRequest, ApiError } from '@/services/api/apiClient.js'

function requireAdminToken() {
  const accessToken = getAdminAccessToken()
  if (!accessToken) throw new ApiError('Administrator login is required.', 401, null)
  return accessToken
}

function handleAuthenticationError(error) {
  if (error?.status === 401 || error?.status === 403) clearAdminSession()
  throw error
}

// ---------------------------------------------------------------------------
// 1. Dashboard Metrics
// ---------------------------------------------------------------------------
export async function fetchGiftMetrics({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/metrics', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// 2. Orders Management
// ---------------------------------------------------------------------------
export async function fetchAdminGiftOrders(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val)
    }
  })

  try {
    const res = await apiRequest(\`/admin/gift-delivery/orders?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminGiftOrder(orderId, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/orders/\${orderId}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data?.order
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminGiftOrderStatus(orderId, payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/orders/\${orderId}/status\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.order
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function cancelAdminGiftOrder(orderId, reason) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/orders/\${orderId}/cancel\`, {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    })
    return res?.data?.order
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// 3. Products Management
// ---------------------------------------------------------------------------
export async function fetchAdminGiftProducts(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') query.append(key, val)
  })

  try {
    const res = await apiRequest(\`/admin/gift-delivery/products?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data?.products ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminGiftProduct(formData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/products', {
      method: 'POST',
      headers: { Authorization: \`Bearer \${accessToken}\` },
      body: formData,
    })
    return res?.data?.product
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminGiftProduct(productId, formData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/products/\${productId}\`, {
      method: 'PATCH',
      headers: { Authorization: \`Bearer \${accessToken}\` },
      body: formData,
    })
    return res?.data?.product
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminGiftProduct(productId) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/products/\${productId}\`, {
      method: 'DELETE',
      headers: { Authorization: \`Bearer \${accessToken}\` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// 4. Categories Management
// ---------------------------------------------------------------------------
export async function fetchAdminGiftCategories({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/categories', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data?.categories ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminGiftCategory(formData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/categories', {
      method: 'POST',
      headers: { Authorization: \`Bearer \${accessToken}\` },
      body: formData,
    })
    return res?.data?.category
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminGiftCategory(categoryId, formData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/categories/\${categoryId}\`, {
      method: 'PATCH',
      headers: { Authorization: \`Bearer \${accessToken}\` },
      body: formData,
    })
    return res?.data?.category
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminGiftCategory(categoryId) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/categories/\${categoryId}\`, {
      method: 'DELETE',
      headers: { Authorization: \`Bearer \${accessToken}\` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// 5. Gift Cards Management
// ---------------------------------------------------------------------------
export async function fetchAdminGiftCards({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/cards', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data?.cards ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminGiftCard(formData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/cards', {
      method: 'POST',
      headers: { Authorization: \`Bearer \${accessToken}\` },
      body: formData,
    })
    return res?.data?.card
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminGiftCard(cardId, formData) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/cards/\${cardId}\`, {
      method: 'PATCH',
      headers: { Authorization: \`Bearer \${accessToken}\` },
      body: formData,
    })
    return res?.data?.card
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminGiftCard(cardId) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/cards/\${cardId}\`, {
      method: 'DELETE',
      headers: { Authorization: \`Bearer \${accessToken}\` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// 6. Locations Management
// ---------------------------------------------------------------------------
export async function fetchAdminGiftLocations({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/locations', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data?.locations ?? []
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminGiftLocation(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/locations', {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.location
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminGiftLocation(locId, payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/locations/\${locId}\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.location
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminGiftLocation(locId) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/locations/\${locId}\`, {
      method: 'DELETE',
      headers: { Authorization: \`Bearer \${accessToken}\` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}

// ---------------------------------------------------------------------------
// 7. Delivery Configuration & Slots
// ---------------------------------------------------------------------------
export async function fetchAdminGiftConfig({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/config', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminGiftConfig(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/config', {
      method: 'PUT',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.config
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminGiftSlot(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/gift-delivery/slots', {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.slot
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminGiftSlot(slotId, payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/slots/\${slotId}\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.slot
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function deleteAdminGiftSlot(slotId) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/gift-delivery/slots/\${slotId}\`, {
      method: 'DELETE',
      headers: { Authorization: \`Bearer \${accessToken}\` },
    })
    return res
  } catch (error) {
    handleAuthenticationError(error)
  }
}
`;

fs.writeFileSync(path.join(serviceDir, 'adminGiftDeliveryService.js'), serviceCode, 'utf8');
console.log('Created adminGiftDeliveryService.js');
