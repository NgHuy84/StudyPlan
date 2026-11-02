const WEEKDAYS = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
export const SHORT_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export const pad = (n: number) => String(n).padStart(2, '0');

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "Thứ Hai, 2 tháng 11" */
export function longDate(d = new Date()) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} tháng ${d.getMonth() + 1}`;
}

export function timeOf(iso: string) {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "23:59 · Hôm nay" / "Ngày mai" / "Thứ Tư" / "05/12" */
export function dueLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(d, today)) return timeOf(iso);
  if (isSameDay(d, tomorrow)) return `${timeOf(iso)} · Ngày mai`;
  const diff = (d.getTime() - today.getTime()) / 86400000;
  if (diff > 0 && diff < 7) return WEEKDAYS[d.getDay()];
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** "Còn 13 giờ" */
export function remaining(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return 'Đã quá hạn';
  const h = Math.floor(ms / 3600000);
  if (h < 1) return `Còn ${Math.max(1, Math.round(ms / 60000))} phút`;
  if (h < 48) return `Còn ${h} giờ`;
  return `Còn ${Math.floor(h / 24)} ngày`;
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

/** Thứ Hai đầu tuần chứa ngày d */
export function startOfWeek(d = new Date()) {
  const x = new Date(d);
  const wd = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - wd);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** 0 = Thứ Hai … 6 = Chủ nhật */
export const weekdayIndex = (d = new Date()) => (d.getDay() + 6) % 7;

export const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
