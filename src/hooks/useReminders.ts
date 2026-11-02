import { useEffect } from 'react';
import { useStore } from '../data/store';
import { timeOf } from '../data/date';

/** Hiện thông báo của hệ điều hành (nếu người dùng đã cho phép) */
export function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body, icon: './favicon.svg', tag: title });
    }
  } catch {
    /* một số trình duyệt chặn Notification ngoài service worker */
  }
}

/** Tiếng "ting" ngắn bằng Web Audio – không cần file âm thanh */
export function playChime() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1320].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const t0 = ctx.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
      o.connect(g).connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + 0.65);
    });
    window.setTimeout(() => ctx.close(), 1200);
  } catch {
    /* không hỗ trợ âm thanh */
  }
}

/**
 * Chức năng mới · Nhắc nhở thông minh:
 * cứ 30 giây kiểm tra một lần, công việc nào đã tới giờ nhắc (hạn − thời gian nhắc)
 * mà chưa xong và chưa nhắc thì hiện thông báo trong app + thông báo hệ thống.
 */
export function useReminders() {
  const { tasks, notified, markNotified, showToast, user } = useStore();

  useEffect(() => {
    if (!user) return;
    const check = () => {
      const now = Date.now();
      for (const t of tasks) {
        if (t.done || notified.includes(t.id)) continue;
        const due = new Date(t.due).getTime();
        const remindAt = due - t.remindBefore * 60000;
        if (now >= remindAt && now < due) {
          markNotified(t.id);
          const msg = `⏰ “${t.title}” đến hạn lúc ${timeOf(t.due)}`;
          showToast(msg);
          notify('Sắp đến hạn công việc', msg);
          playChime();
          break; // mỗi lần chỉ nhắc 1 việc để không dồn dập
        }
      }
    };
    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, [tasks, notified, markNotified, showToast, user]);
}
