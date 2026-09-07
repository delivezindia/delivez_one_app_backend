import { ArrowUpRight, CalendarDays, Download, IndianRupee, PackageCheck, RotateCw, Timer, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { deliveryMix, drivers, monthlyRevenue } from '../data/mockData';
import { formatCompactNumber, formatCurrency } from '../utils/format';
import { Button, CardHeader, MetricCard, PageHeader, ProgressBar } from '../components/ui';

const tooltipStyle = { border: '1px solid #ecebf0', borderRadius: 12, boxShadow: '0 14px 32px rgba(30, 28, 55, 0.12)', fontSize: 12 };

export default function AnalyticsPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Business intelligence"
        title="Analytics"
        description="Turn delivery performance into clear, actionable business decisions."
        actions={<><Button variant="secondary" icon={CalendarDays}>Jan 1 – Jul 31</Button><Button icon={Download}>Download report</Button></>}
      />

      <section className="metric-grid">
        <MetricCard label="Gross revenue" value="₹34.8L" change="18.6%" icon={IndianRupee} tone="violet" />
        <MetricCard label="Completed orders" value="8,429" change="14.2%" icon={PackageCheck} tone="green" />
        <MetricCard label="Repeat customers" value="68.4%" change="5.9%" icon={RotateCw} tone="blue" />
        <MetricCard label="Avg. fulfillment" value="24m 12s" change="4.8%" trend="down" icon={Timer} tone="orange" footnote="faster this period" />
      </section>

      <section className="analytics-top-grid">
        <article className="card revenue-card">
          <CardHeader title="Revenue growth" subtitle="Monthly revenue against operating target" action={<select className="compact-select"><option>Last 7 months</option><option>This year</option></select>} />
          <div className="revenue-summary"><div><span>Total revenue</span><strong>{formatCurrency(168320)}</strong></div><span className="trend trend--up"><ArrowUpRight size={15} /> 16.8%</span><div className="chart-key"><i className="chart-key__bar" /> Revenue <i className="chart-key__target" /> Target</div></div>
          <div className="analytics-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue} margin={{ top: 12, right: 8, left: -14, bottom: 0 }} barGap={3}>
                <CartesianGrid stroke="#eeedf2" vertical={false} strokeDasharray="4 5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a8897', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#aaa8b3', fontSize: 11 }} tickFormatter={formatCompactNumber} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#f5f3ff' }} formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" name="Revenue" fill="#6956e8" radius={[6, 6, 2, 2]} maxBarSize={28} isAnimationActive={false} />
                <Bar dataKey="target" name="Target" fill="#e8e5f8" radius={[6, 6, 2, 2]} maxBarSize={28} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="card fulfillment-card">
          <CardHeader title="Order fulfillment" subtitle="Distribution by delivery state" />
          <div className="fulfillment-chart">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={deliveryMix} dataKey="value" innerRadius={66} outerRadius={88} paddingAngle={4} startAngle={90} endAngle={-270} stroke="none" isAnimationActive={false}>{deliveryMix.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer>
            <div><strong>96%</strong><span>fulfilled</span></div>
          </div>
          <div className="fulfillment-list">{deliveryMix.map((item) => <div key={item.name}><span><i style={{ background: item.color }} />{item.name}</span><strong>{item.value}%</strong></div>)}</div>
        </article>
      </section>

      <section className="analytics-bottom-grid">
        <article className="card driver-performance-card">
          <CardHeader title="Top driver performance" subtitle="Based on completed deliveries and ratings" action={<button className="text-link">View all drivers</button>} />
          <div className="performance-list">
            {drivers.slice(0, 5).map((driver, index) => (
              <div key={driver.id}><span className={`rank rank--${index + 1}`}>{index + 1}</span><div className={`mini-avatar mini-avatar--${driver.accent}`}>{driver.initials}</div><p><strong>{driver.name}</strong><span>{driver.deliveries} deliveries · ★ {driver.rating}</span></p><div className="performance-score"><span>{driver.successRate}%</span><ProgressBar value={driver.successRate} tone={driver.accent} /></div></div>
            ))}
          </div>
        </article>

        <article className="card insight-card">
          <div className="insight-card__icon"><TrendingUp size={22} /></div><span className="insight-label">Smart insight</span><h2>Friday is your highest demand day</h2><p>Order volume is 24% higher between 5–8 PM. Schedule 6 more drivers to keep fulfillment under 25 minutes.</p><div className="insight-stat"><span>Potential time saved</span><strong>38 hrs <small>/ month</small></strong></div><Button>Review recommendation</Button>
        </article>
      </section>
    </div>
  );
}
