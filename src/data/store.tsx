import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { seedEvents, seedFocus, seedSubjects, seedTasks } from './seed';
import type { FocusSession, ScheduleEvent, Subject, Task, User } from './types';

const KEY = 'studyplan.v1';
const THEME_KEY = 'studyplan.theme';

export type Theme = 'light' | 'dark';

function initialTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark') return t;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface State {
  user: User | null;
  tasks: Task[];
  subjects: Subject[];
  events: ScheduleEvent[];
  focus: FocusSession[];
  /** id các công việc đã được nhắc, để không nhắc lại */
  notified: string[];
}

const DEFAULTS: State = {
  user: null,
  tasks: seedTasks,
  subjects: seedSubjects,
  events: seedEvents,
  focus: seedFocus,
  notified: [],
};

interface Store extends State {
  login: (user: User) => void;
  logout: () => void;
  addTask: (t: Omit<Task, 'id' | 'done' | 'subtasks'> & { subtasks?: Task['subtasks'] }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subId: string) => void;
  deleteTask: (id: string) => void;
  togglePinTask: (id: string) => void;
  togglePinSubject: (id: string) => void;
  logFocus: (minutes: number, taskId?: string) => void;
  markNotified: (id: string) => void;
  resetDemo: () => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (v: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Ctx = createContext<Store | null>(null);

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    // gộp với giá trị mặc định để dữ liệu cũ (thiếu trường mới) vẫn dùng được
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<State>) };
  } catch {
    /* bỏ qua dữ liệu hỏng */
  }
  return DEFAULTS;
}

const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#12151D' : '#4F5BD5');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* trình duyệt chặn lưu trữ */
    }
  }, [state]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  }, []);

  const value = useMemo<Store>(() => ({
    ...state,
    quickAddOpen,
    setQuickAddOpen,
    searchOpen,
    setSearchOpen,
    toast,
    showToast,
    theme,
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    login: (user) => setState((s) => ({ ...s, user })),
    logout: () => setState((s) => ({ ...s, user: null })),
    addTask: (t) =>
      setState((s) => ({ ...s, tasks: [{ ...t, id: uid(), done: false, subtasks: t.subtasks ?? [] }, ...s.tasks] })),
    updateTask: (id, patch) =>
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        // đổi hạn hoặc thời điểm nhắc → cho phép nhắc lại
        notified: 'due' in patch || 'remindBefore' in patch ? s.notified.filter((n) => n !== id) : s.notified,
      })),
    toggleTask: (id) =>
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : undefined } : t,
        ),
      })),
    toggleSubtask: (taskId, subId) =>
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === taskId
            ? { ...t, subtasks: t.subtasks.map((st) => (st.id === subId ? { ...st, done: !st.done } : st)) }
            : t,
        ),
      })),
    deleteTask: (id) => setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) })),
    togglePinTask: (id) =>
      setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)) })),
    togglePinSubject: (id) =>
      setState((s) => ({ ...s, subjects: s.subjects.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)) })),
    logFocus: (minutes, taskId) =>
      setState((s) => ({ ...s, focus: [...s.focus, { id: uid(), at: new Date().toISOString(), minutes, taskId }] })),
    markNotified: (id) => setState((s) => (s.notified.includes(id) ? s : { ...s, notified: [...s.notified, id] })),
    resetDemo: () => setState((s) => ({ ...DEFAULTS, user: s.user })),
  }), [state, quickAddOpen, searchOpen, toast, showToast, theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore phải nằm trong StoreProvider');
  return s;
}
