import { Bike, CheckCircle2, Download, MapPin, MoreHorizontal, Plus, Search, Star, TimerReset, UserCheck } from 'lucide-react';

import { drivers } from '../data/mockData';
import { Avatar, Button, MetricCard, PageHeader, ProgressBar, StatusBadge } from '../components/ui';

export default function DriversPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Fleet management"
        title="Driver network"
        description="Manage driver availability, performance, and delivery assignments."
        actions={<><Button variant="secondary" icon={Download}>Export</Button><Button icon={Plus}>Add driver</Button></>}
      />

      <section className="metric-grid">
        <MetricCard label="Total drivers" value="54" change="7.8%" icon={Bike} tone="violet" />
        <MetricCard label="Currently active" value="42" change="4.2%" icon={UserCheck} tone="green" />
        <MetricCard label="Avg. rating" value="4.8" change="0.3%" icon={Star} tone="orange" />
        <MetricCard label="Acceptance rate" value="96.4%" change="1.9%" icon={CheckCircle2} tone="blue" />
      </section>

      <article className="card drivers-panel">
        <div className="panel-toolbar"><div><h2>All drivers</h2><p>54 drivers across your delivery zones</p></div><div><label className="table-search table-search--compact"><Search size={16} /><input placeholder="Search drivers" /></label><select className="compact-select"><option>All statuses</option><option>Active</option><option>On delivery</option><option>Offline</option></select></div></div>
        <div className="driver-grid">
          {drivers.map((driver) => (
            <article className="driver-card" key={driver.id}>
              <div className="driver-card__top"><Avatar initials={driver.initials} size="large" tone={driver.accent} /><div><strong>{driver.name}</strong><span>{driver.id} · {driver.vehicle}</span></div><button className="table-action" aria-label={`Actions for ${driver.name}`}><MoreHorizontal size={18} /></button></div>
              <div className="driver-card__status"><StatusBadge status={driver.status} /><span><Star size={15} fill="currentColor" /> {driver.rating}</span></div>
              <div className="driver-card__area"><MapPin size={15} /><span>{driver.area}</span></div>
              <div className="driver-card__stats"><div><strong>{driver.deliveries}</strong><span>Deliveries</span></div><div><strong>{driver.successRate}%</strong><span>Success rate</span></div></div>
              <div className="driver-card__progress"><span><span>Weekly capacity</span><strong>{Math.min(95, Math.round(driver.deliveries / 5))}%</strong></span><ProgressBar value={Math.min(95, Math.round(driver.deliveries / 5))} tone={driver.accent} /></div>
              <div className="driver-card__footer"><button>View profile</button><button aria-label={`Message ${driver.name}`}><TimerReset size={16} /> Assign</button></div>
            </article>
          ))}
        </div>
      </article>
    </div>
  );
}
