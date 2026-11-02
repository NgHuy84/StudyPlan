import { useStore } from '../data/store';
import { Icon } from './Icon';

/** Nút chuyển giao diện sáng / tối */
export function ThemeToggle({ withLabel }: { withLabel?: boolean }) {
  const { theme, toggleTheme } = useStore();
  const dark = theme === 'dark';
  const label = dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
  if (withLabel) {
    return (
      <button className="nav-item theme-switch" onClick={toggleTheme} aria-label={label} aria-pressed={dark}>
        <Icon name={dark ? 'sun' : 'moon'} />
        <span className="grow" style={{ textAlign: 'left' }}>{dark ? 'Giao diện tối' : 'Giao diện sáng'}</span>
        <span className={`switch ${dark ? 'on' : ''}`} aria-hidden="true"><span /></span>
      </button>
    );
  }
  return (
    <button className="icon-btn theme-btn" onClick={toggleTheme} aria-label={label} title={label}>
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  );
}
