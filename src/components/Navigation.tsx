import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { Icon, type IconName } from './Icon';
import { ThemeToggle } from './ThemeToggle';

const ITEMS: { to: string; label: string; webLabel: string; icon: IconName }[] = [
  { to: '/', label: 'Hôm nay', webLabel: 'Tổng quan', icon: 'home' },
  { to: '/calendar', label: 'Lịch', webLabel: 'Lịch của tôi', icon: 'calendar' },
  { to: '/subjects', label: 'Môn học', webLabel: 'Công việc & môn học', icon: 'book' },
  { to: '/progress', label: 'Tiến độ', webLabel: 'Tiến độ', icon: 'chart' },
];

/** Tab Bar – mobile: 4 tab + nút "+" ở giữa */
export function TabBar() {
  const { setQuickAddOpen } = useStore();
  const tab = (i: number) => {
    const it = ITEMS[i];
    return (
      <NavLink key={it.to} to={it.to} end className={({ isActive }) => `tab ${isActive ? 'active' : ''}`}>
        <Icon name={it.icon} size={22} />
        {it.label}
      </NavLink>
    );
  };
  return (
    <nav className="tabbar" aria-label="Điều hướng chính">
      {tab(0)}
      {tab(1)}
      <button className="tab-add" aria-label="Thêm việc mới" onClick={() => setQuickAddOpen(true)}>
        <Icon name="plus" size={26} />
      </button>
      {tab(2)}
      {tab(3)}
    </nav>
  );
}

/** Sidebar – website: các Nav Item tương ứng với tab mobile */
export function Sidebar() {
  const { user, logout, setQuickAddOpen, setSearchOpen } = useStore();
  const nav = useNavigate();
  const initial = (user?.name.split(' ').pop() ?? 'S')[0];
  return (
    <aside className="sidebar">
      <Link to="/" className="brand brand-link" aria-label="StudyPlan – về trang chủ" title="Về trang chủ">
        <span className="brand-logo"><Icon name="check" size={20} /></span>
        <div>
          StudyPlan
          <div className="t-caption muted" style={{ fontWeight: 500 }}>Học gọn – sống chủ động</div>
        </div>
      </Link>
      <button className="search-trigger" onClick={() => setSearchOpen(true)}>
        <Icon name="search" size={18} />
        <span className="grow" style={{ textAlign: 'left' }}>Tìm kiếm…</span>
        <kbd>Ctrl K</kbd>
      </button>
      <button className="btn btn-primary btn-block" style={{ marginBottom: 16 }} onClick={() => setQuickAddOpen(true)}>
        <Icon name="plus" size={18} /> Thêm việc mới
      </button>
      {ITEMS.map((it) => (
        <NavLink key={it.to} to={it.to} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Icon name={it.icon} />
          {it.webLabel}
        </NavLink>
      ))}
      <NavLink to="/focus" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Icon name="timer" />
        Tập trung
        <span className="badge badge-group" style={{ marginLeft: 'auto' }}>Mới</span>
      </NavLink>
      <div className="spacer" />
      <ThemeToggle withLabel />
      <div className="user-chip">
        <span className="avatar">{initial}</span>
        <div className="grow">
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div className="t-caption muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>
        <button
          className="icon-btn"
          style={{ width: 36, height: 36 }}
          aria-label="Đăng xuất"
          onClick={() => {
            logout();
            nav('/login');
          }}
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </aside>
  );
}
