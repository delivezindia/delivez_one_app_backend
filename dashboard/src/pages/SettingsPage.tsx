import { useState } from 'react';
import { BellRing, Building2, Check, CreditCard, KeyRound, Save, ShieldCheck, UserRound } from 'lucide-react';

import { Button, PageHeader } from '../components/ui';

const settingsNav = [
  { label: 'General', icon: Building2 },
  { label: 'Profile', icon: UserRound },
  { label: 'Notifications', icon: BellRing },
  { label: 'Security', icon: ShieldCheck },
  { label: 'API access', icon: KeyRound },
  { label: 'Billing', icon: CreditCard },
];

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? 'toggle--checked' : ''}`} onClick={onChange}><span /></button>;
}

export default function SettingsPage() {
  const [active, setActive] = useState('General');
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [deliveryAlerts, setDeliveryAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Administration" title="Settings" description="Manage your workspace, preferences, security, and notifications." actions={<Button icon={saved ? Check : Save} onClick={save}>{saved ? 'Saved' : 'Save changes'}</Button>} />

      <section className="settings-layout">
        <nav className="settings-nav" aria-label="Settings sections">
          {settingsNav.map(({ label, icon: Icon }) => <button className={active === label ? 'settings-nav__item settings-nav__item--active' : 'settings-nav__item'} onClick={() => setActive(label)} key={label}><Icon size={18} /><span>{label}</span></button>)}
        </nav>

        <div className="settings-content">
          <article className="card settings-section">
            <div className="settings-section__header"><div><h2>Workspace details</h2><p>Basic information used across your operational dashboard.</p></div><span className="settings-section__tag">{active}</span></div>
            <div className="workspace-logo-row"><div className="workspace-logo">ND</div><div><strong>Workspace logo</strong><span>PNG, JPG, or SVG. Maximum 2 MB.</span><div><Button variant="secondary">Change logo</Button><button className="danger-link">Remove</button></div></div></div>
            <div className="form-grid">
              <label className="field"><span>Workspace name</span><input defaultValue="North District Operations" /></label>
              <label className="field"><span>Business email</span><input type="email" defaultValue="operations@dispatch.in" /></label>
              <label className="field"><span>Primary hub</span><input defaultValue="Bengaluru, Karnataka" /></label>
              <label className="field"><span>Default timezone</span><select defaultValue="Asia/Kolkata"><option value="Asia/Kolkata">India Standard Time (IST)</option><option value="UTC">Coordinated Universal Time</option></select></label>
              <label className="field field--full"><span>Workspace description</span><textarea rows={3} defaultValue="Last-mile delivery operations for Bengaluru North District." /></label>
            </div>
          </article>

          <article className="card settings-section">
            <div className="settings-section__header"><div><h2>Default dispatch preferences</h2><p>Choose how new orders are assigned and prioritized.</p></div></div>
            <div className="choice-grid">
              <label className="choice-card choice-card--selected"><input type="radio" name="dispatch" defaultChecked /><span className="choice-card__radio"><Check size={12} /></span><div><strong>Smart assignment</strong><p>Automatically choose the closest available driver with the best score.</p></div></label>
              <label className="choice-card"><input type="radio" name="dispatch" /><span className="choice-card__radio"><Check size={12} /></span><div><strong>Manual assignment</strong><p>Let dispatch operators select a driver for every new order.</p></div></label>
            </div>
          </article>

          <article className="card settings-section">
            <div className="settings-section__header"><div><h2>Notification preferences</h2><p>Control the operational updates delivered to your team.</p></div></div>
            <div className="preference-list">
              <div><span><strong>Email updates</strong><small>Receive important workspace and account updates.</small></span><Toggle checked={emailUpdates} onChange={() => setEmailUpdates((value) => !value)} label="Email updates" /></div>
              <div><span><strong>Delivery exceptions</strong><small>Alert operators when a route is delayed or unsuccessful.</small></span><Toggle checked={deliveryAlerts} onChange={() => setDeliveryAlerts((value) => !value)} label="Delivery exception alerts" /></div>
              <div><span><strong>Weekly performance report</strong><small>Get a Monday summary of orders, revenue, and driver performance.</small></span><Toggle checked={weeklyReport} onChange={() => setWeeklyReport((value) => !value)} label="Weekly reports" /></div>
            </div>
          </article>

          <article className="danger-zone"><div><strong>Danger zone</strong><p>Deleting a workspace removes all operational data and cannot be undone.</p></div><button>Delete workspace</button></article>
        </div>
      </section>
    </div>
  );
}
