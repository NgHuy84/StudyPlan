import type { ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { CATEGORY_LABEL, PRIORITY_LABEL, type Category, type Priority } from '../data/types';

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
export function Button({
  variant = 'primary',
  block,
  small,
  icon,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; block?: boolean; small?: boolean; icon?: IconName }) {
  return (
    <button
      className={`btn btn-${variant} ${block ? 'btn-block' : ''} ${small ? 'btn-sm' : ''} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={small ? 16 : 18} />}
      {children}
    </button>
  );
}

/* ---------------- Badge ---------------- */
export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`badge badge-dot badge-${priority}`}>{PRIORITY_LABEL[priority]}</span>;
}
export function CategoryBadge({ category }: { category: Category }) {
  return <span className={`badge badge-${category}`}>{CATEGORY_LABEL[category]}</span>;
}
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: string }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

/* ---------------- Checkbox ---------------- */
export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`checkbox ${checked ? 'checked' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
    >
      {checked && <Icon name="check" size={16} />}
    </button>
  );
}

/* ---------------- Input ---------------- */
export function Field({
  label,
  hint,
  error,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string; id: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className={`input ${error ? 'error' : ''}`} aria-invalid={!!error} {...rest} />
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  );
}

/* ---------------- Chips ---------------- */
export function Chips<T extends string>({
  options,
  value,
  onChange,
  render,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  render?: (v: T) => ReactNode;
}) {
  return (
    <div className="chips" role="radiogroup">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          className={`chip ${value === o ? 'active' : ''}`}
          onClick={() => onChange(o)}
        >
          {render ? render(o) : o}
        </button>
      ))}
    </div>
  );
}

/* ---------------- Stat card ---------------- */
export function StatCard({
  icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: IconName;
  tone: { c: string; bg: string };
  label: string;
  value: string;
  sub?: ReactNode;
}) {
  return (
    <div className="card stat">
      <span className="icon" style={{ color: tone.c, background: tone.bg }}>
        <Icon name={icon} size={20} />
      </span>
      <span className="muted t-caption">{label}</span>
      <span className="value">{value}</span>
      {sub && <span className="t-caption muted">{sub}</span>}
    </div>
  );
}

/* ---------------- Progress ---------------- */
export function Progress({ value, light }: { value: number; light?: boolean }) {
  return (
    <div className={`progress ${light ? 'light' : ''}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ---------------- Page header ---------------- */
export function PageHead({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: ReactNode }) {
  return (
    <div className="page-head">
      <div>
        {eyebrow && <div className="muted">{eyebrow}</div>}
        <h1 className="t-h1">{title}</h1>
      </div>
      {right}
    </div>
  );
}

/** Gán biến CSS (vd: --accent) vào style một cách an toàn kiểu dữ liệu */
export function cssVars(vars: Record<string, string>): CSSProperties {
  return vars as CSSProperties;
}

/* ---------------- Pin (ghim / bỏ ghim) ---------------- */
export function PinButton({ pinned, onToggle, name, small }: { pinned?: boolean; onToggle: () => void; name: string; small?: boolean }) {
  const label = pinned ? `Bỏ ghim ${name}` : `Ghim ${name}`;
  return (
    <button
      type="button"
      className={`pin-btn ${pinned ? 'on' : ''} ${small ? 'small' : ''}`}
      aria-pressed={!!pinned}
      aria-label={label}
      title={pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <Icon name="pin" size={small ? 16 : 18} />
    </button>
  );
}
