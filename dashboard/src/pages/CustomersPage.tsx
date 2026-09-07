import { ChevronLeft, ChevronRight, Download, Mail, MoreHorizontal, Plus, Search, ShoppingBag, UserRoundCheck, UsersRound, WalletCards } from 'lucide-react';

import { customers } from '../data/mockData';
import { formatCurrency } from '../utils/format';
import { Avatar, Button, MetricCard, PageHeader, StatusBadge } from '../components/ui';

export default function CustomersPage() {
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Customer operations"
        title="Customers"
        description="Understand your customers and keep every delivery relationship healthy."
        actions={<><Button variant="secondary" icon={Download}>Export list</Button><Button icon={Plus}>Add customer</Button></>}
      />

      <section className="metric-grid">
        <MetricCard label="Total customers" value="2,486" change="11.2%" icon={UsersRound} tone="violet" />
        <MetricCard label="Active this month" value="1,942" change="8.7%" icon={UserRoundCheck} tone="green" />
        <MetricCard label="Orders per customer" value="6.4" change="3.1%" icon={ShoppingBag} tone="orange" />
        <MetricCard label="Customer value" value="₹8,420" change="6.8%" icon={WalletCards} tone="blue" />
      </section>

      <article className="card customers-panel">
        <div className="panel-toolbar"><div><h2>Customer directory</h2><p>People who ordered from your delivery network</p></div><div><label className="table-search"><Search size={16} /><input placeholder="Search name or email" /></label><select className="compact-select"><option>All customers</option><option>Active</option><option>Inactive</option></select></div></div>
        <div className="table-wrap">
          <table className="data-table customer-table">
            <thead><tr><th>Customer</th><th>Contact</th><th>Total orders</th><th>Total spent</th><th>Joined</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {customers.map((customer, index) => (
                <tr key={customer.id}>
                  <td><div className="customer-cell"><Avatar initials={customer.initials} tone={['violet', 'green', 'orange', 'blue', 'pink', 'cyan'][index]} /><div><strong>{customer.name}</strong><span>{customer.id}</span></div></div></td>
                  <td><div className="contact-cell"><span>{customer.email}</span><small>{customer.phone}</small></div></td>
                  <td><strong>{customer.orders}</strong></td>
                  <td><strong>{formatCurrency(customer.spent)}</strong></td>
                  <td className="muted-cell">{customer.joined}</td>
                  <td><StatusBadge status={customer.status} /></td>
                  <td><div className="row-actions"><button aria-label={`Email ${customer.name}`}><Mail size={16} /></button><button aria-label={`More actions for ${customer.name}`}><MoreHorizontal size={17} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-pagination"><span>Showing <strong>6</strong> of 2,486 customers</span><div><button aria-label="Previous page"><ChevronLeft size={17} /></button><button className="pagination-active">1</button><button>2</button><button>3</button><span>…</span><button>415</button><button aria-label="Next page"><ChevronRight size={17} /></button></div></div>
      </article>
    </div>
  );
}
