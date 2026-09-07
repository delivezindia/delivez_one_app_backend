const fs = require('fs');
const path = require('path');

const compDir = 'C:/Users/Rax/Desktop/Delivery_app_web/src/pages/dashboard/components';
fs.mkdirSync(compDir, { recursive: true });

// ============================================================================
// 1. AdminUnifiedOrdersView.jsx & .module.css
// ============================================================================
const unifiedOrdersJsx = `import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  X,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
  Gift,
  ShoppingBag,
  Clock,
  Phone,
  User,
  MapPin,
  CheckCircle2
} from 'lucide-react'
import { fetchUnifiedOrders } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminUnifiedOrdersView.module.css'

const SERVICE_CONFIG = {
  'gift-delivery': { label: 'Gift & Surprise', icon: Gift, color: '#E11D48', bg: '#FFF1F2' },
  'personal-courier': { label: 'Personal Courier', icon: Truck, color: '#2563EB', bg: '#EFF6FF' },
  'confidential-courier': { label: 'Confidential / Luggage', icon: ShieldCheck, color: '#D97706', bg: '#FEF3C7' },
  'forgot-something': { label: 'Forgot Something', icon: ShoppingBag, color: '#7C3AED', bg: '#F5F3FF' },
  'return-pickup': { label: 'Return Pickup', icon: RotateCcw, color: '#059669', bg: '#ECFDF5' },
}

export default function AdminUnifiedOrdersView() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 })
  const [filters, setFilters] = useState({
    search: '',
    serviceType: 'ALL',
    status: 'ALL',
  })
  const [selectedOrder, setSelectedOrder] = useState(null)

  const loadOrders = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const data = await fetchUnifiedOrders({ page, limit: pagination.limit, ...filters })
      if (data) {
        setOrders(data.orders || [])
        setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters, pagination.limit])

  useEffect(() => {
    loadOrders(1)
  }, [loadOrders])

  const handleExportCsv = () => {
    window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.heading}>Unified Orders Hub</h2>
          <p className={styles.sub}>
            Live operational pipeline aggregating Personal Courier, Confidential Cargo, Forgot Something, Returns & Gift Deliveries.
          </p>
        </div>
        <div className={styles.btnGroup}>
          <button type="button" className={styles.exportBtn} onClick={handleExportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <button type="button" className={styles.refreshBtn} onClick={() => loadOrders(pagination.page)}>
            <RefreshCw size={15} className={loading ? styles.spin : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterCard}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by order ID, customer name, recipient, destination..."
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>

        <select
          value={filters.serviceType}
          onChange={e => setFilters(prev => ({ ...prev, serviceType: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Service Categories</option>
          <option value="GIFT">Gift & Surprise Delivery</option>
          <option value="COURIER">Personal Courier</option>
          <option value="CONFIDENTIAL">Confidential & Airport Luggage</option>
          <option value="FORGOT">Forgot Something Retrieval</option>
          <option value="RETURN">Return & Exchange Pickup</option>
        </select>

        <select
          value={filters.status}
          onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className={styles.selectFilter}
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">CONFIRMED</option>
          <option value="IN_TRANSIT">IN TRANSIT</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Service</th>
              <th>Customer</th>
              <th>Recipient & Destination</th>
              <th>Item Summary</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Assigned Partner</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  {loading ? 'Loading operational orders...' : 'No orders found matching the filter criteria.'}
                </td>
              </tr>
            ) : (
              orders.map(order => {
                const sConf = SERVICE_CONFIG[order.serviceKey] || { label: order.serviceName, color: '#475569', bg: '#F1F5F9' }
                return (
                  <tr key={order.id || order.bookingNumber}>
                    <td>
                      <strong className={styles.orderLink} onClick={() => setSelectedOrder(order)}>
                        {order.bookingNumber}
                      </strong>
                      <span className={styles.metaSub}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <span className={styles.serviceBadge} style={{ color: sConf.color, background: sConf.bg }}>
                        {sConf.label}
                      </span>
                    </td>
                    <td>
                      <strong>{order.customerName}</strong>
                      <span className={styles.metaSub}>{order.customerPhone}</span>
                    </td>
                    <td>
                      <strong>{order.recipientName}</strong>
                      <span className={styles.metaSub}>{order.destination}</span>
                    </td>
                    <td>
                      <span className={styles.itemText}>{order.itemSummary}</span>
                    </td>
                    <td>
                      <strong>₹{order.amount}</strong>
                      <span className={styles.metaSub}>{order.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={\`\${styles.statusBadge} \${styles['status_' + order.status]}\`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <span className={styles.partnerName}>{order.assignedPartner}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={styles.viewBtn}
                        onClick={() => setSelectedOrder(order)}
                        title="View Full Details"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className={styles.paginationRow}>
            <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)</span>
            <div className={styles.paginationBtns}>
              <button disabled={pagination.page <= 1} onClick={() => loadOrders(pagination.page - 1)}>Prev</button>
              <button disabled={pagination.page >= pagination.totalPages} onClick={() => loadOrders(pagination.page + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Drawer */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <h3>Order #{selectedOrder.bookingNumber}</h3>
                <span className={styles.metaSub}>{selectedOrder.serviceName}</span>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)}><X size={18} /></button>
            </div>

            <div className={styles.drawerBody}>
              <div className={styles.drawerCard}>
                <h4>Customer & Destination</h4>
                <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                <p><strong>Recipient:</strong> {selectedOrder.recipientName}</p>
                <p><strong>Destination:</strong> {selectedOrder.destination}</p>
              </div>

              <div className={styles.drawerCard}>
                <h4>Consignment Overview</h4>
                <p><strong>Item:</strong> {selectedOrder.itemSummary}</p>
                <p><strong>Total Fare:</strong> ₹{selectedOrder.amount} ({selectedOrder.paymentMethod} • {selectedOrder.paymentStatus})</p>
                <p><strong>Current Status:</strong> <span className={\`\${styles.statusBadge} \${styles['status_' + selectedOrder.status]}\`}>{selectedOrder.status}</span></p>
              </div>

              <div className={styles.drawerCard}>
                <h4>Assigned Delivery Partner</h4>
                <p><strong>Partner Name:</strong> {selectedOrder.assignedPartner}</p>
                {selectedOrder.partnerPhone && <p><strong>Contact:</strong> {selectedOrder.partnerPhone}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`;

const unifiedOrdersCss = `.wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.headerRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.heading {
  font-size: 20px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 4px 0;
}

.sub {
  font-size: 13px;
  color: #64748B;
  margin: 0;
}

.btnGroup {
  display: flex;
  gap: 10px;
}

.exportBtn, .refreshBtn {
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
  transition: all 0.2s;
}

.exportBtn:hover, .refreshBtn:hover {
  background: #F8FAFC;
  border-color: #CBD5E1;
}

.filterCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.searchWrap {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #F8FAFC;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 8px 12px;
  flex: 1;
  min-width: 260px;
  color: #64748B;
}

.searchWrap input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #0F172A;
  width: 100%;
}

.selectFilter {
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  background: #FFFFFF;
  outline: none;
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
  white-space: nowrap;
}

.table td {
  padding: 12px 14px;
  border-bottom: 1px solid #F1F5F9;
  vertical-align: middle;
}

.orderLink {
  color: #E11D48;
  cursor: pointer;
}

.metaSub {
  font-size: 11px;
  color: #94A3B8;
  display: block;
}

.serviceBadge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.itemText {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 160px;
}

.statusBadge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
}

.status_CONFIRMED { background: #EFF6FF; color: #2563EB; }
.status_IN_TRANSIT, .status_ON_THE_WAY { background: #FFFBEB; color: #D97706; }
.status_DELIVERED { background: #ECFDF5; color: #059669; }
.status_CANCELLED { background: #FEF2F2; color: #DC2626; }

.partnerName {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.viewBtn {
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

.paginationRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F8FAFC;
  font-size: 12px;
  color: #64748B;
}

.paginationBtns {
  display: flex;
  gap: 8px;
}

.paginationBtns button {
  background: #FFFFFF;
  border: 1px solid #CBD5E1;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
}

.paginationBtns button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}

.drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 420px;
  background: #FFFFFF;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

.drawerHead {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #E2E8F0;
  padding-bottom: 12px;
}

.drawerHead h3 {
  margin: 0;
  font-size: 17px;
}

.drawerHead button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #64748B;
}

.drawerBody {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.drawerCard {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 14px;
}

.drawerCard h4 {
  font-size: 13px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 8px 0;
}

.drawerCard p {
  font-size: 12px;
  color: #475569;
  margin: 4px 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`;

fs.writeFileSync(path.join(compDir, 'AdminUnifiedOrdersView.jsx'), unifiedOrdersJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminUnifiedOrdersView.module.css'), unifiedOrdersCss, 'utf8');
console.log('Created AdminUnifiedOrdersView');

// ============================================================================
// 2. AdminPartnersView.jsx & .module.css
// ============================================================================
const partnersJsx = `import React, { useState, useEffect, useCallback } from 'react'
import {
  UserCog,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Bike,
  Star,
  CheckCircle2,
  X,
  RefreshCw
} from 'lucide-react'
import { fetchAdminPartners, createAdminPartner } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminPartnersView.module.css'

export default function AdminPartnersView() {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, online: 0, busy: 0, offline: 0 })
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ fullName: '', mobileNumber: '', email: '', zone: 'South Delhi', vehicle: 'Electric Scooter (EV-01)' })

  const loadPartners = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAdminPartners({ search })
      if (data) {
        setPartners(data.partners || [])
        setStats({
          total: data.total || 0,
          online: data.onlineCount || 0,
          busy: data.busyCount || 0,
          offline: data.offlineCount || 0,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadPartners()
  }, [loadPartners])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await createAdminPartner(form)
      setModalOpen(false)
      setForm({ fullName: '', mobileNumber: '', email: '', zone: 'South Delhi', vehicle: 'Electric Scooter (EV-01)' })
      loadPartners()
    } catch (err) {
      alert(err.message || 'Failed to onboard partner.')
    }
  }

  return (
    <div className={styles.wrapper}>
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#EFF6FF', color: '#2563EB' }}><UserCog size={22} /></div>
          <div><small>Total Fleet</small><strong>{stats.total} Riders</strong></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#ECFDF5', color: '#059669' }}><CheckCircle2 size={22} /></div>
          <div><small>Online & Available</small><strong>{stats.online} Active</strong></div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ background: '#FFFBEB', color: '#D97706' }}><Bike size={22} /></div>
          <div><small>On Live Trips</small><strong>{stats.busy} Dispatched</strong></div>
        </div>
      </div>

      {/* Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="Search riders by name, vehicle, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="button" className={styles.primaryBtn} onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Onboard New Rider
        </button>
      </div>

      {/* Partners Grid */}
      <div className={styles.grid}>
        {partners.map(p => (
          <div key={p.id} className={styles.partnerCard}>
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>
                {p.name.slice(0, 1).toUpperCase()}
              </div>
              <div className={styles.nameZone}>
                <strong>{p.name}</strong>
                <span><MapPin size={12} /> {p.zone}</span>
              </div>
              <span className={\`\${styles.statusBadge} \${styles['status_' + p.status]}\`}>
                {p.status}
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.infoRow}><Phone size={13} /> {p.phone}</div>
              <div className={styles.infoRow}><Bike size={13} /> {p.vehicle}</div>
              <div className={styles.statsRow}>
                <span><Star size={13} fill="#F59E0B" color="#F59E0B" /> <strong>{p.rating}</strong></span>
                <span><strong>{p.completedDeliveries}</strong> deliveries</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Onboard Modal */}
      {modalOpen && (
        <div className={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h3>Onboard Delivery Rider</h3>
              <button type="button" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Full Name *</label>
                <input required value={form.fullName} onChange={e => setForm(prev => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Mobile Number (10 digits) *</label>
                <input required value={form.mobileNumber} onChange={e => setForm(prev => ({ ...prev, mobileNumber: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Assigned Zone Hub</label>
                <input value={form.zone} onChange={e => setForm(prev => ({ ...prev, zone: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Vehicle Model & Number</label>
                <input value={form.vehicle} onChange={e => setForm(prev => ({ ...prev, vehicle: e.target.value }))} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.primaryBtn}>Register Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
`;

const partnersCss = `.wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.kpiCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.kpiIcon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpiCard small {
  font-size: 11px;
  color: #64748B;
  display: block;
}

.kpiCard strong {
  font-size: 18px;
  color: #0F172A;
}

.headerBar {
  display: flex;
  gap: 12px;
  align-items: center;
}

.searchBox {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 10px;
  padding: 9px 14px;
  flex: 1;
  color: #64748B;
}

.searchBox input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  width: 100%;
}

.primaryBtn {
  background: #0F172A;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 960px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

.partnerCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cardHeader {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #0F172A;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

.nameZone {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nameZone strong {
  font-size: 14px;
  color: #0F172A;
}

.nameZone span {
  font-size: 11px;
  color: #64748B;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.statusBadge {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 10px;
}

.status_ONLINE { background: #DCFCE7; color: #15803D; }
.status_BUSY { background: #FEF3C7; color: #B45309; }
.status_OFFLINE { background: #F1F5F9; color: #64748B; }

.cardBody {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #475569;
  border-top: 1px solid #F1F5F9;
  padding-top: 10px;
}

.infoRow {
  display: flex;
  align-items: center;
  gap: 6px;
}

.statsRow {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  background: #F8FAFC;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 11px;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
}

.modalHead {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modalHead h3 {
  margin: 0;
  font-size: 17px;
}

.modalHead button {
  background: transparent;
  border: none;
  cursor: pointer;
}

.modalForm {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.formGroup {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.formGroup label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.formGroup input {
  border: 1.5px solid #E2E8F0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
}

.modalActions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.secondaryBtn {
  background: #F1F5F9;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
`;

fs.writeFileSync(path.join(compDir, 'AdminPartnersView.jsx'), partnersJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminPartnersView.module.css'), partnersCss, 'utf8');
console.log('Created AdminPartnersView');

// ============================================================================
// 3. AdminFinanceView.jsx & .module.css
// ============================================================================
const financeJsx = `import React, { useState, useEffect } from 'react'
import {
  WalletCards,
  ReceiptIndianRupee,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Send
} from 'lucide-react'
import { fetchAdminFinanceSummary, triggerAdminSettlement } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminFinanceView.module.css'

export default function AdminFinanceView() {
  const [finance, setFinance] = useState(null)
  const [settling, setSettling] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchAdminFinanceSummary().then(setFinance).catch(console.error)
  }, [])

  const handleRunSettlement = async () => {
    setSettling(true)
    try {
      const res = await triggerAdminSettlement()
      setToast(res?.message || 'Settlement completed!')
      setTimeout(() => setToast(''), 4000)
    } catch (e) {
      alert(e.message || 'Settlement failed.')
    } finally {
      setSettling(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      {toast && <div className={styles.toast}><CheckCircle2 size={16} color="#10B981" /> {toast}</div>}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <small>Gross Platform GMV</small>
          <strong>₹{finance?.grossMerchandiseValue?.toLocaleString('en-IN') || '1,77,370'}</strong>
          <span>Total customer collections</span>
        </div>
        <div className={styles.kpiCard}>
          <small>Net Platform Revenue</small>
          <strong style={{ color: '#059669' }}>₹{finance?.netPlatformRevenue?.toLocaleString('en-IN') || '78,450'}</strong>
          <span>Platform commissions & margins</span>
        </div>
        <div className={styles.kpiCard}>
          <small>Rider Payouts Payable</small>
          <strong style={{ color: '#E11D48' }}>₹{finance?.partnerPayoutsPayable?.toLocaleString('en-IN') || '74,495'}</strong>
          <span>Disbursed via automated batching</span>
        </div>
        <div className={styles.kpiCard}>
          <small>GST & Taxes Collected</small>
          <strong>₹{finance?.taxesCollected?.toLocaleString('en-IN') || '24,425'}</strong>
          <span>18% statutory tax compliance</span>
        </div>
      </div>

      {/* Settlement Action Banner */}
      <div className={styles.settleBanner}>
        <div>
          <h3>Weekly Partner Automatic Settlement Batch</h3>
          <p>Scheduled auto-disbursement to 48 verified rider bank accounts via IMPS/NEFT rails.</p>
        </div>
        <button type="button" className={styles.settleBtn} disabled={settling} onClick={handleRunSettlement}>
          <Send size={15} /> {settling ? 'Processing Batch...' : 'Trigger Settlement Run'}
        </button>
      </div>

      {/* Settlement History Table */}
      <div className={styles.card}>
        <h3 className={styles.cardHeading}>Disbursement Batches History</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Batch ID</th>
              <th>Period</th>
              <th>Riders</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Settled At</th>
            </tr>
          </thead>
          <tbody>
            {(finance?.settlementBatches || []).map(b => (
              <tr key={b.id}>
                <td><strong>{b.id}</strong></td>
                <td>{b.period}</td>
                <td>{b.totalRiders} Partners</td>
                <td><strong>₹{b.payoutAmount.toLocaleString('en-IN')}</strong></td>
                <td><span className={styles.settledBadge}>{b.status}</span></td>
                <td>{b.settledAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
`;

const financeCss = `.wrapper {
  display: flex;
  flex-direction: column;
  gap: 18px;
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

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

@media (max-width: 1024px) {
  .kpiGrid { grid-template-columns: repeat(2, 1fr); }
}

.kpiCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpiCard small {
  font-size: 11px;
  font-weight: 700;
  color: #64748B;
}

.kpiCard strong {
  font-size: 22px;
  font-weight: 900;
  color: #0F172A;
}

.kpiCard span {
  font-size: 11px;
  color: #94A3B8;
}

.settleBanner {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  color: #FFFFFF;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.settleBanner h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.settleBanner p {
  margin: 0;
  font-size: 12px;
  color: #94A3B8;
}

.settleBtn {
  background: #10B981;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.settleBtn:hover {
  background: #059669;
}

.card {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 18px;
}

.cardHeading {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 14px 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 13px;
}

.table th {
  background: #F8FAFC;
  padding: 10px 14px;
  font-weight: 800;
  color: #475569;
  border-bottom: 1px solid #E2E8F0;
}

.table td {
  padding: 12px 14px;
  border-bottom: 1px solid #F1F5F9;
}

.settledBadge {
  background: #ECFDF5;
  color: #059669;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 6px;
}
`;

fs.writeFileSync(path.join(compDir, 'AdminFinanceView.jsx'), financeJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminFinanceView.module.css'), financeCss, 'utf8');
console.log('Created AdminFinanceView');

// ============================================================================
// 4. AdminAnalyticsView.jsx & .module.css
// ============================================================================
const analyticsJsx = `import React, { useState, useEffect } from 'react'
import {
  ChartNoAxesCombined,
  TrendingUp,
  Percent,
  Clock,
  ThumbsUp,
  Download
} from 'lucide-react'
import { fetchAdminAnalytics } from '@/features/admin-management/services/adminManagementService.js'
import styles from './AdminAnalyticsView.module.css'

export default function AdminAnalyticsView() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchAdminAnalytics().then(setData).catch(console.error)
  }, [])

  return (
    <div className={styles.wrapper}>
      {/* Top Insights */}
      <div className={styles.insightsGrid}>
        <div className={styles.insightCard}>
          <div className={styles.iconCircle} style={{ background: '#ECFDF5', color: '#059669' }}><TrendingUp size={20} /></div>
          <div><small>Delivery Completion Rate</small><strong>{data?.deliverySuccessRate || 98.4}%</strong></div>
        </div>
        <div className={styles.insightCard}>
          <div className={styles.iconCircle} style={{ background: '#EFF6FF', color: '#2563EB' }}><Clock size={20} /></div>
          <div><small>Avg Delivery Duration</small><strong>{data?.avgDeliveryTimeMins || 42} mins</strong></div>
        </div>
        <div className={styles.insightCard}>
          <div className={styles.iconCircle} style={{ background: '#FFF1F2', color: '#E11D48' }}><ThumbsUp size={20} /></div>
          <div><small>Customer Satisfaction (CSAT)</small><strong>{data?.customerSatisfactionScore || 4.88} / 5.0</strong></div>
        </div>
      </div>

      {/* 7-Day Trend Chart */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h3>Daily Orders & Revenue Trend (Past 7 Days)</h3>
          <button type="button" className={styles.exportBtn} onClick={() => window.open('http://localhost:4000/api/v1/admin/export/orders', '_blank')}>
            <Download size={14} /> Export Dataset
          </button>
        </div>
        <div className={styles.chartBars}>
          {(data?.dailyOrdersTrend || []).map((t, idx) => (
            <div key={t.day} className={styles.chartCol}>
              <div className={styles.barWrap}>
                <div className={styles.bar} style={{ height: \`\${Math.min(100, Math.max(20, t.orders * 2))}%\` }}>
                  <span className={styles.barTooltip}>₹{t.revenue}</span>
                </div>
              </div>
              <span className={styles.barLabel}>{t.day}</span>
              <small className={styles.barCount}>{t.orders} ord</small>
            </div>
          ))}
        </div>
      </div>

      {/* Service Distribution Bars */}
      <div className={styles.card}>
        <h3>Service Demand Distribution</h3>
        <div className={styles.distGrid}>
          {(data?.serviceDistribution || []).map(s => (
            <div key={s.name} className={styles.distItem}>
              <div className={styles.distHeader}>
                <strong>{s.name}</strong>
                <span>{s.percentage}% ({s.count} orders)</span>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: \`\${s.percentage}%\`, background: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
`;

const analyticsCss = `.wrapper {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
}

.insightsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.insightCard {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.iconCircle {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.insightCard small {
  font-size: 11px;
  color: #64748B;
  display: block;
}

.insightCard strong {
  font-size: 20px;
  color: #0F172A;
}

.card {
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 16px;
  padding: 20px;
}

.cardHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cardHead h3 {
  margin: 0;
  font-size: 15px;
}

.exportBtn {
  background: #F8FAFC;
  border: 1px solid #CBD5E1;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.chartBars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 180px;
  padding: 10px 20px 0 20px;
  border-bottom: 1.5px solid #E2E8F0;
}

.chartCol {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.barWrap {
  height: 140px;
  width: 32px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  background: #0F172A;
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: height 0.4s ease;
}

.barTooltip {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 800;
  color: #64748B;
  white-space: nowrap;
}

.barLabel {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.barCount {
  font-size: 10px;
  color: #94A3B8;
}

.distGrid {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 14px;
}

.distItem {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.distHeader {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.progressTrack {
  height: 8px;
  background: #F1F5F9;
  border-radius: 10px;
  overflow: hidden;
}

.progressBar {
  height: 100%;
  border-radius: 10px;
}
`;

fs.writeFileSync(path.join(compDir, 'AdminAnalyticsView.jsx'), analyticsJsx, 'utf8');
fs.writeFileSync(path.join(compDir, 'AdminAnalyticsView.module.css'), analyticsCss, 'utf8');
console.log('Created AdminAnalyticsView');
