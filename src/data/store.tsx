import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { seedEvents, seedFocus, seedSubjects, seedTasks } from './seed';
import type { FocusSession, ScheduleEvent, Subject, Task, User } from './types';

const KEY = 'studyplan.v2';
const THEME_KEY = 'studyplan.theme';

/** Tài khoản demo – chỉ tài khoản này có sẵn dữ liệu mẫu */
export const DEMO_EMAIL = 'huy.nguyen@iuh.edu.vn';
export const isDemoEmail = (email?: string) => (email ?? '').trim().toLowerCase() === DEMO_EMAIL;

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

/** Dữ liệu riêng của từng tài khoản */
interface UserData {
  tasks: Task[];
  subjects: Subject[];
  events: ScheduleEvent[];
  focus: FocusSession[];
  /** id các công việc đã được nhắc, để không nhắc lại */
  notified: string[];
  bestStreak: number;
}

const demoData = (): UserData => ({
  tasks: seedTasks,
  subjects: seedSubjects,
  events: seedEvents,
  focus: seedFocus,
  notified: [],
  bestStreak: 9,
});

const emptyData = (): UserData => ({ tasks: [], subjects: [], events: [], focus: [], notified: [], bestStreak: 0 });

const dataFor = (email: string): UserData => (isDemoEmail(email) ? demoData() : emptyData());

interface State {
  user: User | null;
  /** email (chữ thường) → dữ liệu */
  data: Record<string, UserData>;
}

type NewSubject = Omit<Subject, 'id' | 'notes' | 'pinned'> & { notes?: number };

interface Store extends UserData {
  user: User | null;
  isDemo: boolean;
  login: (user: User) => void;
  logout: () => void;
  addTask: (t: Omit<Task, 'id' | 'done' | 'subtasks'> & { subtasks?: Task['subtasks'] }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subId: string) => void;
  deleteTask: (id: string) => void;
  togglePinTask: (id: string) => void;
  togglePinSubject: (id: string) => void;
  addSubject: (s: NewSubject) => void;
  deleteSubject: (id: string) => void;
  addEvent: (e: Omit<ScheduleEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  logFocus: (minutes: number, taskId?: string) => void;
  markNotified: (id: string) => void;
  setBestStreak: (n: number) => void;
  /** tài khoản demo: khôi phục dữ liệu mẫu · tài khoản khác: xoá sạch dữ liệu */
  resetData: () => void;
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
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s && typeof s === 'object' && s.data) return s;
    }
    localStorage.removeItem('studyplan.v1'); // dữ liệu phiên bản cũ (dùng chung cho mọi người)
  } catch {
    /* bỏ qua dữ liệu hỏng */
  }
  return { user: null, data: {} };
}

const uid = () => crypto.randomUUID?.() ?? String(Date.now() + Math.random());
const keyOf = (u: User | null) => (u?.email ?? '').trim().toLowerCase();

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

  const value = useMemo<Store>(() => {
    const k = keyOf(state.user);
    const mine: UserData = { ...emptyData(), ...(state.data[k] ?? (k ? dataFor(k) : emptyData())) };

    /** cập nhật dữ liệu của tài khoản đang đăng nhập */
    const patch = (fn: (d: UserData) => Partial<UserData>) =>
      setState((s) => {
        const key = keyOf(s.user);
        if (!key) return s;
        const cur: UserData = { ...emptyData(), ...(s.data[key] ?? dataFor(key)) };
        return { ...s, data: { ...s.data, [key]: { ...cur, ...fn(cur) } } };
      });

    return {
      ...mine,
      user: state.user,
      isDemo: isDemoEmail(state.user?.email),
      quickAddOpen,
      setQuickAddOpen,
      searchOpen,
      setSearchOpen,
      toast,
      showToast,
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      login: (user) =>
        setState((s) => {
          const key = keyOf(user);
          // lần đầu đăng nhập: tài khoản demo nhận dữ liệu mẫu, tài khoản khác bắt đầu trống
          return { user, data: s.data[key] ? s.data : { ...s.data, [key]: dataFor(key) } };
        }),
      logout: () => setState((s) => ({ ...s, user: null })),
      addTask: (t) => patch((d) => ({ tasks: [{ ...t, id: uid(), done: false, subtasks: t.subtasks ?? [] }, ...d.tasks] })),
      updateTask: (id, p) =>
        patch((d) => ({
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...p } : t)),
          // đổi hạn hoặc thời điểm nhắc → cho phép nhắc lại
          notified: 'due' in p || 'remindBefore' in p ? d.notified.filter((n) => n !== id) : d.notified,
        })),
      toggleTask: (id) =>
        patch((d) => ({
          tasks: d.tasks.map((t) =>
            t.id === id ? { ...t, done: !t.done, doneAt: !t.done ? new Date().toISOString() : undefined } : t,
          ),
        })),
      toggleSubtask: (taskId, subId) =>
        patch((d) => ({
          tasks: d.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: t.subtasks.map((st) => (st.id === subId ? { ...st, done: !st.done } : st)) } : t,
          ),
        })),
      deleteTask: (id) => patch((d) => ({ tasks: d.tasks.filter((t) => t.id !== id) })),
      togglePinTask: (id) => patch((d) => ({ tasks: d.tasks.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)) })),
      togglePinSubject: (id) => patch((d) => ({ subjects: d.subjects.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)) })),
      addSubject: (sub) => patch((d) => ({ subjects: [...d.subjects, { notes: 0, ...sub, id: uid() }] })),
      deleteSubject: (id) =>
        patch((d) => ({
          subjects: d.subjects.filter((x) => x.id !== id),
          tasks: d.tasks.map((t) => (t.subjectId === id ? { ...t, subjectId: undefined } : t)),
        })),
      addEvent: (e) => patch((d) => ({ events: [...d.events, { ...e, id: uid() }] })),
      deleteEvent: (id) => patch((d) => ({ events: d.events.filter((x) => x.id !== id) })),
      logFocus: (minutes, taskId) => patch((d) => ({ focus: [...d.focus, { id: uid(), at: new Date().toISOString(), minutes, taskId }] })),
      markNotified: (id) => patch((d) => (d.notified.includes(id) ? {} : { notified: [...d.notified, id] })),
      setBestStreak: (n) => patch((d) => (n > d.bestStreak ? { bestStreak: n } : {})),
      resetData: () => patch(() => dataFor(keyOf(state.user))),
    };
  }, [state, quickAddOpen, searchOpen, toast, showToast, theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore phải nằm trong StoreProvider');
  return s;
}
