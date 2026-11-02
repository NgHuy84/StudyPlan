import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useMemo, useRef } from 'react';
import { useStore } from './data/store';
import { Sidebar, TabBar } from './components/Navigation';
import { LoginPage, RegisterPage } from './pages/Auth';
import { TodayPage } from './pages/Today';
import { CalendarPage } from './pages/Calendar';
import { SubjectsPage } from './pages/Subjects';
import { TaskDetailPage } from './pages/TaskDetail';
import { ProgressPage } from './pages/Progress';
import { QuickAddSheet } from './pages/QuickAdd';
import { FocusPage } from './pages/Focus';
import { CommandPalette } from './components/CommandPalette';
import { useReminders } from './hooks/useReminders';
import { useStreakRecord } from './pages/useStats';

/** Thứ tự các tab – dùng để xác định hướng trượt khi chuyển trang */
const ORDER = ['/', '/calendar', '/subjects', '/progress', '/focus'];

/** Chọn hiệu ứng: tab bên phải → trượt sang trái, tab bên trái → trượt sang phải, trang chi tiết → nổi lên */
function useTransitionName(pathname: string) {
  const prev = useRef(pathname);
  const name = useMemo(() => {
    const from = ORDER.indexOf(prev.current);
    const to = ORDER.indexOf(pathname);
    if (pathname.startsWith('/task/')) return 'page-push';
    if (prev.current.startsWith('/task/')) return 'page-pop';
    if (from === -1 || to === -1 || from === to) return 'page-fade';
    return to > from ? 'page-next' : 'page-prev';
  }, [pathname]);
  useEffect(() => {
    prev.current = pathname;
  }, [pathname]);
  return name;
}

/** Khung ứng dụng: sidebar (website) + nội dung + tab bar (mobile) */
function Shell() {
  const { user, toast } = useStore();
  const { pathname } = useLocation();
  const transition = useTransitionName(pathname);
  useReminders();
  useStreakRecord();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        {/* key theo đường dẫn để mỗi lần chuyển trang, nội dung được dựng lại và chạy hiệu ứng */}
        <div key={pathname} className={`page ${transition}`}>
          <Outlet />
        </div>
      </main>
      <TabBar />
      <QuickAddSheet />
      <CommandPalette />
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const { user } = useStore();
  return user ? <Navigate to="/" replace /> : <div className="page page-fade">{children}</div>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route element={<Shell />}>
        <Route index element={<TodayPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="subjects" element={<SubjectsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="task/:id" element={<TaskDetailPage />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="focus/:taskId" element={<FocusPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
