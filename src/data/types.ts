export type Priority = 'high' | 'medium' | 'low';
export type Category = 'study' | 'work' | 'personal' | 'group';

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: Category;
  priority: Priority;
  subjectId?: string;
  due: string; // ISO datetime
  remindBefore: number; // phút
  description?: string;
  subtasks: SubTask[];
  done: boolean;
  doneAt?: string;
  pinned?: boolean;
}

/** Một phiên tập trung (Pomodoro) đã hoàn thành */
export interface FocusSession {
  id: string;
  at: string; // ISO – thời điểm kết thúc
  minutes: number;
  taskId?: string;
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  schedule: string;
  color: string;
  bg: string;
  notes: number;
  milestone: string;
  pinned?: boolean;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  place: string;
  category: Category;
  day: number; // 0 = Thứ Hai … 6 = Chủ nhật
  start: string; // "08:00"
  end: string;
}

export interface User {
  name: string;
  email: string;
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Gấp',
  medium: 'Trung bình',
  low: 'Thấp',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  study: 'Học tập',
  work: 'Công việc',
  personal: 'Cá nhân',
  group: 'Nhóm',
};

export const CATEGORY_COLOR: Record<Category, { c: string; bg: string }> = {
  study: { c: 'var(--cat-study)', bg: 'var(--cat-study-bg)' },
  work: { c: 'var(--cat-work)', bg: 'var(--cat-work-bg)' },
  group: { c: 'var(--cat-group)', bg: 'var(--cat-group-bg)' },
  personal: { c: 'var(--cat-personal)', bg: 'var(--cat-personal-bg)' },
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  high: 'var(--priority-high)',
  medium: 'var(--priority-medium)',
  low: 'var(--priority-low)',
};

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
