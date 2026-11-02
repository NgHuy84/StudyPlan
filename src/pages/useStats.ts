import { useEffect, useMemo } from 'react';
import { useStore } from '../data/store';
import { isSameDay, startOfWeek } from '../data/date';

/** Số liệu tiến độ dùng chung cho màn Hôm nay (web) và Tiến độ. */
export function useStats() {
  const { tasks, focus } = useStore();
  return useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekTasks = tasks.filter((t) => new Date(t.due) >= weekStart || (t.doneAt && new Date(t.doneAt) >= weekStart));
    const last7 = new Date(now);
    last7.setDate(now.getDate() - 6);
    last7.setHours(0, 0, 0, 0);

    const doneRecent = tasks.filter((t) => t.done && t.doneAt && new Date(t.doneAt) >= last7);
    const relevant = tasks.filter((t) => new Date(t.due) >= last7 && new Date(t.due).getTime() <= now.getTime() + 86400000 * 1);
    const onTime = doneRecent.filter((t) => t.doneAt! <= t.due).length;

    // biểu đồ 7 ngày gần nhất
    const perDay = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(last7);
      d.setDate(last7.getDate() + i);
      return { date: d, count: doneRecent.filter((t) => isSameDay(new Date(t.doneAt!), d)).length };
    });

    // chuỗi ngày: số ngày liên tiếp (tính lùi từ hôm nay/hôm qua) có ít nhất 1 việc xong
    let streak = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const has = tasks.some((t) => t.done && t.doneAt && isSameDay(new Date(t.doneAt), d));
      if (has) streak++;
      else if (i > 0) break;
    }

    const dueSoon = tasks.filter((t) => !t.done && new Date(t.due).getTime() - now.getTime() < 48 * 3600000 && new Date(t.due) > now).length;

    return {
      weekDone: weekTasks.filter((t) => t.done).length,
      weekTotal: weekTasks.length,
      recentDone: doneRecent.length,
      recentTotal: Math.max(relevant.length, doneRecent.length),
      onTimePct: doneRecent.length ? Math.round((onTime / doneRecent.length) * 100) : 100,
      onTime,
      perDay,
      streak,
      dueSoon,
      // giờ học = tổng thời gian các phiên tập trung trong 7 ngày qua
      studyHours: Math.round(focus.filter((f) => new Date(f.at) >= last7).reduce((a, f) => a + f.minutes, 0) / 60),
    };
  }, [tasks, focus]);
}

/** Ghi nhận kỷ lục chuỗi ngày khi chuỗi hiện tại vượt kỷ lục cũ */
export function useStreakRecord() {
  const { streak } = useStats();
  const { bestStreak, setBestStreak, user } = useStore();
  useEffect(() => {
    if (user && streak > bestStreak) setBestStreak(streak);
  }, [user, streak, bestStreak, setBestStreak]);
}
