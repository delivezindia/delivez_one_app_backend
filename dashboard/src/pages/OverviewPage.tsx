import {
  ArrowRight,
  Bike,
  CalendarDays,
  ChevronRight,
  Clock3,
  IndianRupee,
  MapPin,
  PackageCheck,
  Plus,
  ShoppingBag,
  TimerReset,
  UsersRound,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { activity, deliveryMix, orders, weeklyDeliveries } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import { Avatar, Button, CardHeader, MetricCard, PageHeader, StatusBadge } from '../components/ui';

const tooltipStyle = {
  border: '1px solid #ecebf0',
  borderRadius: 12,
  boxShadow: '0 14px 32px rgba(30, 28, 55, 0.12)',
  fontSize: 12,
};

function DeliveryChart() {
  return (
    <div className="chart-area">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={weeklyDeliveries} margin={{ top: 12, right: 6, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="deliveredFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6956e8" stopOpacity={0.22} />
              <stop offset="95%" stopColor="#6956e8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#eeedf2" vertical={false} strokeDasharray="4 5" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a8897', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#aaa8b3', fontSize: 11 }} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#bbb3f7', strokeDasharray: '4 4' }} />
          <Area type="monotone" dataKey="delivered" name="Delivered" stroke="#6956e8" strokeWidth={2.8} fill="url(#deliveredFill)" activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }} isAnimationActive={false} />
          <Area type="monotone" dataKey="pending" name="Pending" stroke="#d6d2ea" strokeWidth={2} fill="transparent" strokeDasharray="5 5" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function DeliverySnapshot() {
  return (
    <article className="card snapshot-card">
      <CardHeader title="Delivery snapshot" subtitle="Today's order distribution" />
      <div className="snapshot-card__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={deliveryMix} dataKey="value" innerRadius={58} outerRadius={76} paddingAngle={4} stroke="none" isAnimationActive={false}>
              {deliveryMix.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="snapshot-card__total"><strong>184</strong><span>total orders</span></div>
      </div>
      <div className="snapshot-legend">
        {deliveryMix.map((item) => (
          <div key={item.name}>
            <span className="legend-dot" style={{ background: item.color }} />
            <span>{item.name}</span>
            <strong>{item.value}%</strong>
          </div>
        ))}
      </div>
      <button className="text-link">View detailed report <ArrowRight size={15} /></button>
    </article>
  );
}

function LiveOperations() {
  return (
    <article className="card live-operations">
      <CardHeader
        title="Live operations"
        subtitle="8 drivers are currently on the road"
        action={<span className="live-pill"><i /> Live</span>}
      />
      <div className="route-map" aria-label="Stylized live delivery map">
        <div className="map-road map-road--one" />
        <div className="map-road map-road--two" />
        <div className="map-road map-road--three" />
        <span className="map-label map-label--one">INDIRANAGAR</span>
        <span className="map-label map-label--two">KORAMANGALA</span>
        <span className="map-label map-label--three">HSR LAYOUT</span>
        <div className="driver-pin driver-pin--one"><Bike size={14} /></div>
        <div className="driver-pin driver-pin--two"><Bike size={14} /></div>
        <div className="driver-pin driver-pin--three"><Bike size={14} /></div>
        <div className="delivery-popover">
          <Avatar initials="RK" size="small" tone="violet" />
          <div><strong>Rahul K.</strong><span>ORD-8452 · 7 min away</span></div>
          <ChevronRight size={16} />
        </div>
      </div>
      <div className="live-operations__footer">
        <div><span className="footer-icon footer-icon--violet"><Bike size={16} /></span><p><strong>8</strong><span>On delivery</span></p></div>
        <div><span className="footer-icon footer-icon--green"><Clock3 size={16} /></span><p><strong>24 min</strong><span>Avg. delivery</span></p></div>
        <Button variant="secondary">Open live map</Button>
      </div>
    </article>
  );
}

function RecentOrders() {
  return (
    <article className="card recent-orders">
      <CardHeader
        title="Recent orders"
        subtitle="Latest orders across all channels"
        action={<button className="text-link">View all <ArrowRight size={15} /></button>}
      />
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Order</th><th>Route</th><th>Placed</th><th>Amount</th><th>Status</th><th aria-label="Actions" /></tr></thead>
          <tbody>
            {orders.slice(0, 5).map((order, index) => (
              <tr key={order.id}>
                <td><div className="customer-cell"><Avatar initials={order.customerInitials} size="small" tone={['violet', 'green', 'orange', 'blue', 'pink'][index]} /><div><strong>{order.id}</strong><span>{order.customer}</span></div></div></td>
                <td><div className="route-cell"><MapPin size={14} /><span>{order.pickup}<small>to {order.destination}</small></span></div></td>
                <td className="muted-cell">{order.placedAt}</td>
                <td><strong>{formatCurrency(order.amount)}</strong></td>
                <td><StatusBadge status={order.status} /></td>
                <td><button className="table-action" aria-label={`View ${order.id}`}><ChevronRight size={17} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export default function OverviewPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Saturday, 22 August"
        title="Good morning, Rax"
        description="Here's what's happening across your delivery network today."
        actions={<><Button variant="secondary" icon={CalendarDays}>This week</Button><Button icon={Plus}>Create order</Button></>}
      />

      <section className="metric-grid">
        <MetricCard label="Total orders" value="1,284" change="12.5%" icon={ShoppingBag} tone="violet" />
        <MetricCard label="Revenue" value="₹3.48L" change="8.2%" icon={IndianRupee} tone="green" />
        <MetricCard label="Active drivers" value="42" change="5.1%" icon={UsersRound} tone="blue" />
        <MetricCard label="Avg. delivery time" value="24 min" change="3.4%" trend="down" icon={TimerReset} tone="orange" footnote="faster than last week" />
      </section>

      <section className="overview-grid">
        <article className="card performance-card">
          <CardHeader
            title="Delivery performance"
            subtitle="Completed and pending deliveries this week"
            action={<select className="compact-select" aria-label="Chart period"><option>Last 7 days</option><option>Last 30 days</option></select>}
          />
          <div className="chart-summary">
            <div><strong>789</strong><span>completed deliveries</span></div>
            <span className="trend trend--up">+14.2%</span>
            <div className="chart-key"><i className="chart-key__solid" /> Delivered <i className="chart-key__dash" /> Pending</div>
          </div>
          <DeliveryChart />
        </article>
        <DeliverySnapshot />
      </section>

      <section className="operations-grid">
        <LiveOperations />
        <article className="card activity-card">
          <CardHeader title="Activity" subtitle="Latest workspace updates" />
          <div className="activity-list">
            {activity.map((item) => (
              <div className="activity-item" key={item.id}>
                <span className={`activity-item__icon activity-item__icon--${item.tone}`}><PackageCheck size={16} /></span>
                <div><strong>{item.title}</strong><span>{item.detail}</span></div>
              </div>
            ))}
          </div>
          <button className="text-link activity-card__link">See all activity <ArrowRight size={15} /></button>
        </article>
      </section>

      <RecentOrders />
    </div>
  );
}
