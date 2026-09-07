import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from 'lucide-react';

import type { OrderStatus } from '../types';

export function Button({
  children,
  variant = 'primary',
  icon: Icon,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: LucideIcon;
}) {
  return (
    <button className={`button button--${variant} ${className}`} {...props}>
      {Icon && <Icon size={17} strokeWidth={2.2} />}
      <span>{children}</span>
    </button>
  );
}

export function Avatar({
  initials,
  size = 'medium',
  tone = 'violet',
}: {
  initials: string;
  size?: 'small' | 'medium' | 'large';
  tone?: string;
}) {
  return <span className={`avatar avatar--${size} avatar--${tone}`}>{initials}</span>;
}

export function StatusBadge({ status }: { status: OrderStatus | string }) {
  const statusClass = status.toLowerCase().replaceAll(' ', '-');
  return (
    <span className={`status-badge status-badge--${statusClass}`}>
      <span className="status-badge__dot" />
      {status}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="page-header__eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  tone,
  footnote = 'vs. previous period',
}: {
  label: string;
  value: string;
  change: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  tone: string;
  footnote?: string;
}) {
  const TrendIcon = trend === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <article className="metric-card">
      <div className={`metric-card__icon metric-card__icon--${tone}`}>
        <Icon size={20} />
      </div>
      <div className="metric-card__label">{label}</div>
      <strong>{value}</strong>
      <div className="metric-card__change-row">
        <span className={`trend trend--${trend}`}>
          <TrendIcon size={14} /> {change}
        </span>
        <span>{footnote}</span>
      </div>
    </article>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action ?? (
        <button className="icon-button icon-button--subtle" aria-label={`More options for ${title}`}>
          <MoreHorizontal size={19} />
        </button>
      )}
    </div>
  );
}

export function ProgressBar({ value, tone = 'violet' }: { value: number; tone?: string }) {
  return (
    <div className="progress-track" aria-label={`${value}%`}>
      <span className={`progress-value progress-value--${tone}`} style={{ width: `${value}%` }} />
    </div>
  );
}
