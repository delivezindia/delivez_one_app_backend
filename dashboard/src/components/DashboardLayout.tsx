import { useEffect, useState } from 'react';
import {
  BarChart3,
  Bell,
  Bike,
  Boxes,
  ChevronDown,
  CircleHelp,
  Command,
  LayoutDashboard,
  Menu,
  PackageCheck,
  Search,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { Avatar, Button } from './ui';

const navigation = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Orders', path: '/orders', icon: Boxes, count: 12 },
  { label: 'Live deliveries', path: '/deliveries', icon: PackageCheck, count: 8 },
  { label: 'Drivers', path: '/drivers', icon: Bike },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

const titles: Record<string, string> = {
  '/': 'Overview',
  '/orders': 'Order management',
  '/deliveries': 'Live deliveries',
  '/drivers': 'Driver network',
  '/customers': 'Customers',
  '/analytics': 'Analytics',
  '/settings': 'Workspace settings',
};

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <div className="brand-mark"><Command size={22} strokeWidth={2.5} /></div>
          <div>
            <span>Dispatch</span>
            <small>Operations</small>
          </div>
          <button className="sidebar__close" onClick={onClose} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="workspace-switcher__mark">ND</div>
          <div>
            <strong>North District</strong>
            <span>Bengaluru hub</span>
          </div>
          <ChevronDown size={16} />
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          <span className="sidebar__label">Workspace</span>
          {navigation.map(({ label, path, icon: Icon, count }) => (
            <NavLink
              to={path}
              end={path === '/'}
              key={path}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
              {count && <small>{count}</small>}
            </NavLink>
          ))}

          <span className="sidebar__label sidebar__label--second">Manage</span>
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          >
            <Settings size={19} strokeWidth={1.9} />
            <span>Settings</span>
          </NavLink>
          <a href="mailto:support@dispatch.local" className="nav-link">
            <CircleHelp size={19} strokeWidth={1.9} />
            <span>Help center</span>
          </a>
        </nav>

        <div className="sidebar__upgrade">
          <div className="sidebar__upgrade-icon"><Sparkles size={17} /></div>
          <strong>Unlock smart dispatch</strong>
          <p>Automate driver allocation and route planning.</p>
          <Button variant="secondary">Explore Pro</Button>
        </div>

        <div className="sidebar__profile">
          <Avatar initials="RA" size="medium" tone="orange" />
          <div>
            <strong>Rax Admin</strong>
            <span>Administrator</span>
          </div>
          <ChevronDown size={16} />
        </div>
      </aside>
      {open && <button className="sidebar-overlay" onClick={onClose} aria-label="Close navigation" />}
    </>
  );
}

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="app-main">
        <header className="topbar">
          <div className="topbar__left">
            <button
              className="icon-button topbar__menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="topbar__title">
              <span>Dispatch /</span>
              <strong>{titles[location.pathname] ?? 'Dashboard'}</strong>
            </div>
          </div>

          <div className="topbar__actions">
            <label className="global-search">
              <Search size={17} />
              <input aria-label="Search dashboard" placeholder="Search orders, drivers..." />
              <kbd>⌘ K</kbd>
            </label>
            <button className="icon-button notification-button" aria-label="Notifications">
              <Bell size={19} />
              <span />
            </button>
            <div className="topbar__avatar"><Avatar initials="RA" size="small" tone="orange" /></div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
