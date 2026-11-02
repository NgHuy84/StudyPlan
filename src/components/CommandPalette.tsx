import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { dueLabel } from '../data/date';
import { Icon, type IconName } from './Icon';

interface Item {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: IconName;
  run: () => void;
}

/** Bỏ dấu tiếng Việt để tìm "on tap" vẫn ra "Ôn tập" */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();

/* Chức năng mới · Tìm kiếm nhanh (Ctrl + K) */
export function CommandPalette() {
  const { searchOpen, setSearchOpen, tasks, subjects, setQuickAddOpen, toggleTheme, theme } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Ctrl+K / Cmd+K / phím "/" để mở
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      } else if (e.key === '/' && !typing && !searchOpen) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => {
    if (searchOpen) {
      setQ('');
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [searchOpen]);

  const close = () => setSearchOpen(false);
  const go = (path: string) => () => {
    close();
    nav(path);
  };

  const items = useMemo<Item[]>(() => {
    const actions: Item[] = [
      { id: 'a-add', group: 'Thao tác', label: 'Thêm việc mới', icon: 'plus', run: () => { close(); setQuickAddOpen(true); } },
      { id: 'a-focus', group: 'Thao tác', label: 'Bắt đầu phiên tập trung', icon: 'timer', run: go('/focus') },
      { id: 'a-theme', group: 'Thao tác', label: theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối', icon: theme === 'dark' ? 'sun' : 'moon', run: () => { toggleTheme(); close(); } },
      { id: 'p-home', group: 'Trang', label: 'Hôm nay / Tổng quan', icon: 'home', run: go('/') },
      { id: 'p-cal', group: 'Trang', label: 'Lịch của tôi', icon: 'calendar', run: go('/calendar') },
      { id: 'p-sub', group: 'Trang', label: 'Môn học', icon: 'book', run: go('/subjects') },
      { id: 'p-prog', group: 'Trang', label: 'Tiến độ', icon: 'chart', run: go('/progress') },
    ];
    const taskItems: Item[] = tasks.map((t) => ({
      id: t.id,
      group: 'Công việc',
      label: t.title,
      hint: t.done ? 'Đã xong' : dueLabel(t.due),
      icon: t.done ? 'check' : t.pinned ? 'pin' : 'clock',
      run: go(`/task/${t.id}`),
    }));
    const subjectItems: Item[] = subjects.map((s) => ({
      id: s.id, group: 'Môn học', label: s.name, hint: s.teacher, icon: 'book', run: go('/subjects'),
    }));
    const all = [...actions, ...taskItems, ...subjectItems];
    if (!q.trim()) return [...actions, ...taskItems.filter((_, i) => !tasks[i].done).slice(0, 5)];
    const nq = norm(q.trim());
    return all.filter((it) => norm(`${it.label} ${it.hint ?? ''}`).includes(nq)).slice(0, 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, tasks, subjects, theme]);

  useEffect(() => {
    listRef.current?.querySelector('.cmd-item.active')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!searchOpen) return null;

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(items.length - 1, a + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    if (e.key === 'Enter') items[active]?.run();
    if (e.key === 'Escape') close();
  };

  let lastGroup = '';
  return (
    <div className="overlay cmd-overlay" onClick={close}>
      <div className="cmd" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Tìm kiếm nhanh">
        <label className="cmd-input">
          <Icon name="search" />
          <input
            ref={inputRef}
            placeholder="Tìm công việc, môn học hoặc thao tác…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            aria-label="Từ khoá"
          />
          <kbd>Esc</kbd>
        </label>
        <div className="cmd-list" ref={listRef}>
          {items.length === 0 && <div className="empty">Không tìm thấy “{q}”</div>}
          {items.map((it, i) => {
            const head = it.group !== lastGroup ? (lastGroup = it.group) : null;
            return (
              <div key={it.id}>
                {head && <div className="cmd-group">{head}</div>}
                <button className={`cmd-item ${i === active ? 'active' : ''}`} onMouseEnter={() => setActive(i)} onClick={it.run}>
                  <Icon name={it.icon} size={18} />
                  <span className="grow">{it.label}</span>
                  {it.hint && <span className="t-caption muted">{it.hint}</span>}
                </button>
              </div>
            );
          })}
        </div>
        <div className="cmd-foot t-caption muted">
          <span><kbd>↑</kbd><kbd>↓</kbd> chọn</span><span><kbd>Enter</kbd> mở</span><span><kbd>Ctrl</kbd>+<kbd>K</kbd> mở / đóng</span>
        </div>
      </div>
    </div>
  );
}
