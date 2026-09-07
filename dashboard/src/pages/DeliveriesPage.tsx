import { Bike, Clock3, ExternalLink, LocateFixed, MapPin, Navigation, Phone, Plus, Route, Signal } from 'lucide-react';

import { orders } from '../data/mockData';
import { Avatar, Button, PageHeader, ProgressBar, StatusBadge } from '../components/ui';

const activeDeliveries = orders.filter((order) => ['Confirmed', 'Picked up', 'In transit'].includes(order.status));

export default function DeliveriesPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Real-time operations"
        title="Live deliveries"
        description="Monitor active routes, driver progress, and delivery exceptions in real time."
        actions={<><Button variant="secondary" icon={LocateFixed}>Recenter map</Button><Button icon={Plus}>Assign delivery</Button></>}
      />

      <section className="delivery-kpis">
        <div><span className="kpi-icon kpi-icon--violet"><Bike size={19} /></span><p><span>Active deliveries</span><strong>8</strong></p><small>Across 5 zones</small></div>
        <div><span className="kpi-icon kpi-icon--green"><Clock3 size={19} /></span><p><span>On-time rate</span><strong>94.8%</strong></p><small>+2.4% today</small></div>
        <div><span className="kpi-icon kpi-icon--orange"><Navigation size={19} /></span><p><span>Distance today</span><strong>386 km</strong></p><small>42.8 km remaining</small></div>
        <div><span className="kpi-icon kpi-icon--blue"><Signal size={19} /></span><p><span>Driver coverage</span><strong>87%</strong></p><small>3 drivers available</small></div>
      </section>

      <section className="deliveries-layout">
        <article className="card delivery-list-card">
          <div className="delivery-list-card__header"><div><h2>Active routes</h2><p>Updated a few seconds ago</p></div><span className="live-pill"><i /> Live</span></div>
          <div className="delivery-list">
            {activeDeliveries.map((order, index) => (
              <button className={`delivery-row ${index === 0 ? 'delivery-row--active' : ''}`} key={order.id}>
                <div className="delivery-row__top"><div><Avatar initials={order.driver?.split(' ').map((part) => part[0]).join('') ?? 'NA'} size="small" tone={['violet', 'green', 'orange'][index]} /><span><strong>{order.driver}</strong><small>{order.id}</small></span></div><StatusBadge status={order.status} /></div>
                <div className="delivery-row__route"><span className="route-point route-point--start" /><p>{order.pickup}<small>Pickup</small></p><span className="route-line" /><span className="route-point route-point--end" /><p>{order.destination}<small>Drop-off</small></p></div>
                <div className="delivery-row__progress"><ProgressBar value={[72, 48, 34][index] ?? 50} tone={index === 1 ? 'green' : 'violet'} /><span>{[7, 14, 19][index]} min away</span></div>
              </button>
            ))}
          </div>
        </article>

        <article className="delivery-map-card">
          <div className="delivery-map__controls"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button></div>
          <span className="map-area-label map-area-label--one">Indiranagar</span><span className="map-area-label map-area-label--two">Koramangala</span><span className="map-area-label map-area-label--three">Domlur</span><span className="map-area-label map-area-label--four">HSR Layout</span>
          <div className="map-route map-route--primary" /><div className="map-route map-route--secondary" /><div className="map-route map-route--third" />
          <div className="map-driver map-driver--one"><Bike size={16} /></div><div className="map-driver map-driver--two"><Bike size={16} /></div><div className="map-driver map-driver--three"><Bike size={16} /></div>
          <div className="map-destination map-destination--one"><MapPin size={17} /></div><div className="map-destination map-destination--two"><MapPin size={17} /></div>
          <div className="map-selected-driver">
            <div className="map-selected-driver__head"><Avatar initials="RK" tone="violet" /><div><strong>Rahul Kumar</strong><span><i /> In transit</span></div><button aria-label="Open delivery"><ExternalLink size={17} /></button></div>
            <div className="map-selected-driver__route"><Route size={16} /><span>Indiranagar → Koramangala</span><strong>2.8 km</strong></div>
            <div className="map-selected-driver__meta"><span><Clock3 size={15} /> ETA 11:18 AM</span><button><Phone size={15} /> Call</button></div>
          </div>
          <div className="map-attribution">Live fleet view · updated 8s ago</div>
        </article>
      </section>
    </div>
  );
}
