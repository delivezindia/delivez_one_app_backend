const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';

// 1. Create directory for admin management service
const serviceDir = path.join(webRoot, 'src/features/admin-management/services');
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

export async function fetchUnifiedStats({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/stats', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchUnifiedOrders(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.append(k, v)
  })

  try {
    const res = await apiRequest(\`/admin/orders/unified?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function universalTrack(trackingId, { signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/track/\${encodeURIComponent(trackingId)}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminPartners(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  if (params.search) query.append('search', params.search)

  try {
    const res = await apiRequest(\`/admin/partners?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function createAdminPartner(payload) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/partners', {
      method: 'POST',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res?.data?.partner
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminFinanceSummary({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/finance', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function triggerAdminSettlement() {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/finance/settlement', {
      method: 'POST',
      headers: { Authorization: \`Bearer \${accessToken}\` },
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminAnalytics({ signal } = {}) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest('/admin/analytics', {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}
`;

fs.writeFileSync(path.join(serviceDir, 'adminManagementService.js'), serviceCode, 'utf8');
console.log('Created adminManagementService.js');
