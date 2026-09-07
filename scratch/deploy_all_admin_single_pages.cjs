const fs = require('fs');
const path = require('path');

const webRoot = 'C:/Users/Rax/Desktop/Delivery_app_web';
const compDir = path.join(webRoot, 'src/pages/dashboard/components');
fs.mkdirSync(compDir, { recursive: true });

// ============================================================================
// 1. Update adminManagementService.js with service endpoints
// ============================================================================
const serviceFile = path.join(webRoot, 'src/features/admin-management/services/adminManagementService.js');
let serviceCode = fs.readFileSync(serviceFile, 'utf8');

const extraMethods = `
export async function fetchAdminCourierBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(\`/admin/courier/bookings?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminCourierStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/courier/bookings/\${id}/status\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminConfidentialBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(\`/admin/confidential/bookings?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminConfidentialStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/confidential/bookings/\${id}/status\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminForgotBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(\`/admin/forgot/bookings?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminForgotStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/forgot/bookings/\${id}/status\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function fetchAdminReturnBookings(params = {}, { signal } = {}) {
  const accessToken = requireAdminToken()
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) query.append(k, v) })
  try {
    const res = await apiRequest(\`/admin/return/bookings?\${query.toString()}\`, {
      headers: { Authorization: \`Bearer \${accessToken}\` },
      signal,
    })
    return res?.data
  } catch (error) {
    handleAuthenticationError(error)
  }
}

export async function updateAdminReturnStatus(id, status) {
  const accessToken = requireAdminToken()
  try {
    const res = await apiRequest(\`/admin/return/bookings/\${id}/status\`, {
      method: 'PATCH',
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    return res?.data?.booking
  } catch (error) {
    handleAuthenticationError(error)
  }
}
`;

if (!serviceCode.includes('fetchAdminCourierBookings')) {
  fs.writeFileSync(serviceFile, serviceCode + extraMethods, 'utf8');
}

// ============================================================================
// 2. AdminPersonalCourierView.jsx & .module.css
// ============================================================================
const courierJsx = `import React, { useState, useEffect, useCallback } from 'react'
import { Truck, Search, RefreshCw, Eye, X, CheckCircle2, MapPin, Package, Clock } from 'lucide-react'
import { fetchAdminCourierBookings, updateAdminCourierStatus } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export default function AdminPersonalCourierView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminCourierBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminCourierStatus(id, st)
      setToast(\`Courier status updated to \${st}\`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) { alert(e.message || 'Failed to update') }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}
      <div className={styles.header}>
        <div>
          <h2><Truck size={24} className={styles.iconBlue} /> Personal Courier Management</h2>
          <p>Real-time oversight for point-to-point parcels, express bike priorities & same-day consignments.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input placeholder="Search tracking ID, customer name, mobile..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.select}>
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PICKUP_ASSIGNED">PICKUP ASSIGNED</option>
          <option value="PICKED_UP">PICKED UP</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Customer</th>
              <th>Speed Tier</th>
              <th>Parcel Details</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No courier bookings found.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className={styles.link} onClick={() => setSelected(b)}>{b.bookingNumber}</strong></td>
                  <td><strong>{b.user?.fullName || 'Customer'}</strong><small>{b.user?.mobileNumber}</small></td>
                  <td><span className={styles.badgeBlue}>{b.serviceType}</span></td>
                  <td><span>Size: {b.package?.parcelSize || 'MEDIUM'}</span><small>{b.package?.contentCategory || 'General'}</small></td>
                  <td><strong>₹{b.totalAmount}</strong><small>{b.paymentMethod}</small></td>
                  <td>
                    <select className={styles.statusSelect} value={b.status} onChange={e => handleStatus(b.id, e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PICKUP_ASSIGNED">PICKUP ASSIGNED</option>
                      <option value="PICKED_UP">PICKED UP</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td><button type="button" className={styles.iconBtn} onClick={() => setSelected(b)}><Eye size={15} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Courier #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody}>
              <p><strong>Customer:</strong> {selected.user?.fullName} ({selected.user?.mobileNumber})</p>
              <p><strong>Speed:</strong> {selected.serviceType}</p>
              <p><strong>Total Amount:</strong> ₹{selected.totalAmount} ({selected.paymentStatus})</p>
              <p><strong>Addresses:</strong> {selected.addresses?.length || 2} route points recorded</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

// ============================================================================
// 3. AdminConfidentialCourierView.jsx
// ============================================================================
const confidentialJsx = `import React, { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Search, RefreshCw, Eye, X, CheckCircle2, Lock, FileText } from 'lucide-react'
import { fetchAdminConfidentialBookings, updateAdminConfidentialStatus } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export default function AdminConfidentialCourierView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminConfidentialBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminConfidentialStatus(id, st)
      setToast(\`Confidential status updated to \${st}\`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) { alert(e.message || 'Failed to update') }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}
      <div className={styles.header}>
        <div>
          <h2><ShieldCheck size={24} className={styles.iconGold} /> Confidential & Airport Luggage Control</h2>
          <p>Chain-of-custody tracking for biometric encrypted consignments, legal documents & airport baggage.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input placeholder="Search tracking ID, client name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.select}>
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Client</th>
              <th>Security Level</th>
              <th>Document / Cargo</th>
              <th>Handover</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No confidential deliveries found.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className={styles.link} onClick={() => setSelected(b)}>{b.bookingNumber}</strong></td>
                  <td><strong>{b.user?.fullName || 'Client'}</strong><small>{b.user?.mobileNumber}</small></td>
                  <td><span className={styles.badgeGold}>{b.securityLevel}</span></td>
                  <td><span>{b.documentType} ({b.envelopeSize})</span><small>{b.pageCount} Pages • {b.containsOriginals ? 'Originals' : 'Copies'}</small></td>
                  <td><span>{b.handoverMethod}</span><small>ID Req: {b.recipientIdRequired ? 'Yes' : 'No'}</small></td>
                  <td>
                    <select className={styles.statusSelect} value={b.status} onChange={e => handleStatus(b.id, e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PICKUP_ASSIGNED">ASSIGNED</option>
                      <option value="PICKED_UP">PICKED UP</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td><button type="button" className={styles.iconBtn} onClick={() => setSelected(b)}><Eye size={15} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Security Consignment #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody}>
              <p><strong>Security Tier:</strong> {selected.securityLevel}</p>
              <p><strong>Compliance Accepted:</strong> {new Date(selected.complianceAcceptedAt).toLocaleString()}</p>
              <p><strong>Declared Value:</strong> ₹{selected.declaredValue || 0}</p>
              <p><strong>Total Fare:</strong> ₹{selected.totalAmount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

// ============================================================================
// 4. AdminForgotSomethingView.jsx
// ============================================================================
const forgotJsx = `import React, { useState, useEffect, useCallback } from 'react'
import { ShoppingBag, Search, RefreshCw, Eye, X, CheckCircle2, MapPin, Zap } from 'lucide-react'
import { fetchAdminForgotBookings, updateAdminForgotStatus } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export default function AdminForgotSomethingView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminForgotBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminForgotStatus(id, st)
      setToast(\`Retrieval status updated to \${st}\`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) { alert(e.message || 'Failed to update') }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}
      <div className={styles.header}>
        <div>
          <h2><ShoppingBag size={24} className={styles.iconPurple} /> Forgot Something Retrieval Dispatch</h2>
          <p>Instant item rescue & express courier from homes, offices, hotels, restaurants & venues.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input placeholder="Search item, contact, order ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.select}>
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PICKED_UP">PICKED UP</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Item Category</th>
              <th>Pickup Location</th>
              <th>Dropoff Contact</th>
              <th>Speed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No item retrieval orders found.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className={styles.link} onClick={() => setSelected(b)}>{b.bookingNumber}</strong></td>
                  <td><span className={styles.badgePurple}>{b.itemCategory}</span><small>{b.itemDescription}</small></td>
                  <td><strong>{b.pickupContactName}</strong><small>{b.pickupCity} ({b.locationType})</small></td>
                  <td><strong>{b.dropoffRecipientName}</strong><small>{b.dropoffCity}</small></td>
                  <td><span className={styles.badgeBlue}>{b.speed}</span></td>
                  <td>
                    <select className={styles.statusSelect} value={b.status} onChange={e => handleStatus(b.id, e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PARTNER_ASSIGNED">ASSIGNED</option>
                      <option value="PICKED_UP">PICKED UP</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td><button type="button" className={styles.iconBtn} onClick={() => setSelected(b)}><Eye size={15} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Retrieval #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody}>
              <p><strong>Item:</strong> {selected.itemCategory} - {selected.itemDescription}</p>
              <p><strong>Pickup Address:</strong> {selected.pickupFlatBuilding}, {selected.pickupStreet}, {selected.pickupCity}</p>
              <p><strong>Dropoff Address:</strong> {selected.dropoffAddressLine1}, {selected.dropoffCity}</p>
              <p><strong>Fare:</strong> ₹{selected.totalAmount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

// ============================================================================
// 5. AdminReturnPickupView.jsx
// ============================================================================
const returnJsx = `import React, { useState, useEffect, useCallback } from 'react'
import { RotateCcw, Search, RefreshCw, Eye, X, CheckCircle2, Store, FileCheck } from 'lucide-react'
import { fetchAdminReturnBookings, updateAdminReturnStatus } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminServiceViews.module.css'

export default function AdminReturnPickupView() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminReturnBookings({ search, status: statusFilter })
      setBookings(data?.bookings || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }, [search, statusFilter])

  useEffect(() => { loadData() }, [loadData])

  const handleStatus = async (id, st) => {
    try {
      await updateAdminReturnStatus(id, st)
      setToast(\`Return status updated to \${st}\`)
      setTimeout(() => setToast(''), 3500)
      loadData()
    } catch (e) { alert(e.message || 'Failed to update') }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}
      <div className={styles.header}>
        <div>
          <h2><RotateCcw size={24} className={styles.iconGreen} /> Return & Exchange Pickup Hub</h2>
          <p>Management console for e-commerce returns, warranty pickups & retailer destination drops.</p>
        </div>
        <button type="button" className={styles.refreshBtn} onClick={loadData}>
          <RefreshCw size={14} className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.search}>
          <Search size={15} />
          <input placeholder="Search return ID, vendor, store..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.select}>
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="PICKUP_SCHEDULED">SCHEDULED</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Return ID</th>
              <th>Return Type</th>
              <th>Destination Vendor</th>
              <th>Customer Address</th>
              <th>Item Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className={styles.empty}>No return pickup bookings found.</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id}>
                  <td><strong className={styles.link} onClick={() => setSelected(b)}>{b.bookingNumber}</strong></td>
                  <td><span className={styles.badgeGreen}>{b.returnType}</span></td>
                  <td><strong>{b.destinationName || b.pickupStoreName || 'Retailer Hub'}</strong><small>{b.destinationType}</small></td>
                  <td><strong>{b.pickupContactName}</strong><small>{b.pickupCity}</small></td>
                  <td><span>{b.itemCategory}</span><small>{b.itemCondition}</small></td>
                  <td>
                    <select className={styles.statusSelect} value={b.status} onChange={e => handleStatus(b.id, e.target.value)}>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PICKUP_SCHEDULED">SCHEDULED</option>
                      <option value="PICKED_UP">PICKED UP</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td><button type="button" className={styles.iconBtn} onClick={() => setSelected(b)}><Eye size={15} /></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className={styles.modalOverlay} onClick={() => setSelected(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <h3>Return #{selected.bookingNumber}</h3>
              <button type="button" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className={styles.drawerBody}>
              <p><strong>Vendor Destination:</strong> {selected.destinationName || selected.pickupStoreName}</p>
              <p><strong>Customer Pickup:</strong> {selected.pickupAddress}, {selected.pickupCity}</p>
              <p><strong>Estimated Refund:</strong> ₹{selected.estimatedRefundAmount || 0}</p>
              <p><strong>Fare:</strong> ₹{selected.totalAmount}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

// ============================================================================
// 6. AdminSupportView.jsx
// ============================================================================
const supportJsx = `import React from 'react'
import { Headphones, Phone, Mail, MessageSquare, AlertCircle, Clock, ShieldAlert } from 'lucide-react'
import styles from './AdminServiceViews.module.css'

export default function AdminSupportView() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h2><Headphones size={24} className={styles.iconRed} /> Operations Helpdesk & Escalation Center</h2>
          <p>24/7 priority incident response, rider distress dispatch & VIP customer care desk.</p>
        </div>
      </div>

      <div className={styles.supportGrid}>
        <div className={styles.supportCard}>
          <div className={styles.supportIcon} style={{ background: '#FEE2E2', color: '#DC2626' }}><Phone size={24} /></div>
          <h3>Emergency Rider Helpline</h3>
          <p>Direct line for on-duty delivery partners facing traffic, vehicle breakdown or weather delays.</p>
          <strong>+91 1800-DELIVEZ-SOS</strong>
        </div>

        <div className={styles.supportCard}>
          <div className={styles.supportIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}><MessageSquare size={24} /></div>
          <h3>Live Operations Bridge</h3>
          <p>Internal communication channel with hub dispatch managers across all operating cities.</p>
          <strong>ops-bridge@delivez.internal</strong>
        </div>

        <div className={styles.supportCard}>
          <div className={styles.supportIcon} style={{ background: '#ECFDF5', color: '#059669' }}><ShieldAlert size={24} /></div>
          <h3>Security & Vault Escalation</h3>
          <p>Dedicated security officer desk for armored transit & confidential parcel alarms.</p>
          <strong>security-desk@delivez.com</strong>
        </div>
      </div>
    </div>
  )
}
`;

// ============================================================================
// 7. Shared AdminServiceViews.module.css
// ============================================================================
const sharedCss = `.wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #0F172A;
  color: #FFFFFF;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.header h2 {
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 4px 0;
}

.header p {
  font-size: 13px;
  color: #64748B;
  margin: 0;
}

.iconBlue { color: #2563EB; }
.iconGold { color: #D97706; }
.iconPurple { color: #7C3AED; }
.iconGreen { color: #059669; }
.iconRed { color: #E11D48; }

.refreshBtn {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.filterBar {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 8px 12px;
  flex: 1;
  min-width: 240px;
  color: #64748B;
}

.search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  width: 100%;
}

.select {
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  background: #FFFFFF;
}

.tableCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.table th {
  background: #F8FAFC;
  padding: 12px 14px;
  font-weight: 800;
  color: #475569;
  border-bottom: 1px solid #E2E8F0;
}

.table td {
  padding: 12px 14px;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;
}

.table small {
  display: block;
  font-size: 11px;
  color: #94A3B8;
}

.link {
  color: #0F172A;
  cursor: pointer;
}

.link:hover {
  color: #2563EB;
}

.badgeBlue { background: #EFF6FF; color: #2563EB; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
.badgeGold { background: #FEF3C7; color: #D97706; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
.badgePurple { background: #F5F3FF; color: #7C3AED; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
.badgeGreen { background: #ECFDF5; color: #059669; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; }

.statusSelect {
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid #CBD5E1;
}

.iconBtn {
  background: #F1F5F9;
  border: 1px solid #E2E8F0;
  border-radius: 6px;
  padding: 5px 8px;
  cursor: pointer;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #94A3B8;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 400px;
  background: #FFFFFF;
  padding: 24px;
  box-shadow: -4px 0 24px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawerHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 12px;
}

.drawerHead h3 { margin: 0; font-size: 16px; }
.drawerHead button { background: transparent; border: none; cursor: pointer; }

.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 13px;
}

.supportGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 900px) {
  .supportGrid { grid-template-columns: 1fr; }
}

.supportCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.supportIcon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.supportCard h3 {
  margin: 0;
  font-size: 16px;
}

.supportCard p {
  margin: 0;
  font-size: 12px;
  color: #64748B;
  flex: 1;
}

.supportCard strong {
  font-size: 14px;
  color: #0F172A;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
`;

fs.writeFileSync(path.join(compDir, 'AdminPersonalCourierView.jsx'), courierJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminConfidentialCourierView.jsx'), confidentialJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminForgotSomethingView.jsx'), forgotJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminReturnPickupView.jsx'), returnJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminSupportView.jsx'), supportJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminServiceViews.module.css'), sharedCss, 'utf8');
console.log('Created all individual service views and styles');
