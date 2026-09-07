import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Filter, MapPin, MoreHorizontal, Plus, Search } from 'lucide-react';

import { orders } from '../data/mockData';
import type { OrderStatus } from '../types';
import { formatCurrency } from '../utils/format';
import { Avatar, Button, PageHeader, StatusBadge } from '../components/ui';

const filters: Array<'All orders' | OrderStatus> = ['All orders', 'Pending', 'Confirmed', 'Picked up', 'In transit', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All orders');

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = filter === 'All orders' || order.status === filter;
      const matchesQuery = !normalizedQuery || [order.id, order.customer, order.pickup, order.destination].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesStatus && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        description="Create, track, and manage every customer order from one place."
        actions={<><Button variant="secondary" icon={Download}>Export</Button><Button icon={Plus}>New order</Button></>}
      />

      <section className="order-summary-strip">
        <div><span className="summary-dot summary-dot--violet" /><p><strong>184</strong><span>Total today</span></p></div>
        <div><span className="summary-dot summary-dot--orange" /><p><strong>12</strong><span>Awaiting dispatch</span></p></div>
        <div><span className="summary-dot summary-dot--green" /><p><strong>156</strong><span>Completed</span></p></div>
        <div><span className="summary-dot summary-dot--red" /><p><strong>3</strong><span>Exceptions</span></p></div>
      </section>

      <article className="card orders-panel">
        <div className="orders-toolbar">
          <label className="table-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order or customer" /></label>
          <div className="orders-toolbar__right">
            <button className="button button--secondary"><Filter size={16} /><span>More filters</span><i className="filter-count">2</i></button>
            <select className="compact-select" aria-label="Order date"><option>Today</option><option>This week</option><option>This month</option></select>
          </div>
        </div>

        <div className="filter-tabs" role="tablist" aria-label="Order status filters">
          {filters.map((status) => (
            <button key={status} role="tab" aria-selected={filter === status} className={filter === status ? 'filter-tab filter-tab--active' : 'filter-tab'} onClick={() => setFilter(status)}>
              {status}<span>{status === 'All orders' ? orders.length : orders.filter((order) => order.status === status).length}</span>
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="data-table data-table--orders">
            <thead><tr><th><input type="checkbox" aria-label="Select all orders" /></th><th>Order & customer</th><th>Route</th><th>Priority</th><th>Amount</th><th>Driver</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.id}>
                  <td><input type="checkbox" aria-label={`Select ${order.id}`} /></td>
                  <td><div className="customer-cell"><Avatar initials={order.customerInitials} size="small" tone={['violet', 'green', 'orange', 'blue', 'pink', 'cyan'][index % 6]} /><div><strong>{order.id}</strong><span>{order.customer} · {order.placedAt}</span></div></div></td>
                  <td><div className="route-cell"><MapPin size={14} /><span>{order.pickup}<small>{order.destination}</small></span></div></td>
                  <td><span className={`priority priority--${order.priority.toLowerCase().replace(' ', '-')}`}>{order.priority}</span></td>
                  <td><strong>{formatCurrency(order.amount)}</strong></td>
                  <td>{order.driver ? <span className="driver-name"><span>{order.driver.split(' ').map((part) => part[0]).join('')}</span>{order.driver}</span> : <span className="unassigned">Unassigned</span>}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td><button className="table-action" aria-label={`Actions for ${order.id}`}><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredOrders.length === 0 && <div className="empty-state"><Search size={24} /><strong>No orders found</strong><span>Try a different search or status filter.</span></div>}
        </div>

        <div className="table-pagination"><span>Showing <strong>{filteredOrders.length}</strong> of 184 orders</span><div><button aria-label="Previous page"><ChevronLeft size={17} /></button><button className="pagination-active">1</button><button>2</button><button>3</button><span>…</span><button>24</button><button aria-label="Next page"><ChevronRight size={17} /></button></div></div>
      </article>
    </div>
  );
}
