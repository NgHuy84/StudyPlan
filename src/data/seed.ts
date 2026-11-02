import type { FocusSession, ScheduleEvent, Subject, Task } from './types';

/** Tạo thời điểm tương đối so với hôm nay để dữ liệu mẫu luôn "mới". */
function at(dayOffset: number, time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

export const seedSubjects: Subject[] = [
  { id: 'csdl', name: 'Cơ sở dữ liệu', teacher: 'GV. Trần Minh', schedule: 'T2, T4 · A2.04', color: 'var(--cat-study)', bg: 'var(--cat-study-bg)', notes: 5, milestone: 'Thi 18/11', pinned: true },
  { id: 'ux', name: 'Thiết kế UX', teacher: 'GV. Lê Hà', schedule: 'T3 · B1.02', color: 'var(--cat-group)', bg: 'var(--cat-group-bg)', notes: 8, milestone: 'Đồ án 30/11', pinned: true },
  { id: 'java', name: 'Lập trình Java', teacher: 'GV. Phạm Long', schedule: 'T2, T5 · Lab 3', color: 'var(--priority-medium)', bg: 'var(--priority-medium-bg)', notes: 4, milestone: 'Thi 22/12' },
  { id: 'eng', name: 'Tiếng Anh 3', teacher: 'Cô Ngọc', schedule: 'T6 · C3.01', color: 'var(--cat-personal)', bg: 'var(--cat-personal-bg)', notes: 2, milestone: 'Nói 05/12' },
  { id: 'ctdl', name: 'Cấu trúc dữ liệu & giải thuật', teacher: 'GV. Võ Nam', schedule: 'T4 · A1.07', color: 'var(--indigo-500)', bg: 'var(--indigo-50)', notes: 3, milestone: 'Giữa kỳ 12/11' },
];

export const seedTasks: Task[] = [
  {
    id: 't1', pinned: true, title: 'Nộp bài tập lớn UX: Wireframe ứng dụng', category: 'study', priority: 'high', subjectId: 'ux',
    due: at(0, '23:59'), remindBefore: 120,
    description: 'Hoàn thiện wireframe 12 màn hình, xuất PDF và nộp trên LMS. Nhớ đính kèm link Figma trong phần ghi chú.',
    subtasks: [
      { id: 's1', title: 'Vẽ luồng người dùng', done: true },
      { id: 's2', title: 'Wireframe 8 màn mobile', done: true },
      { id: 's3', title: 'Wireframe 6 màn website', done: false },
      { id: 's4', title: 'Xuất PDF & nộp LMS', done: false },
    ],
    done: false,
  },
  { id: 't2', title: 'Ôn tập CSDL chương 5', category: 'study', priority: 'medium', subjectId: 'csdl', due: at(0, '20:00'), remindBefore: 60, subtasks: [], done: false },
  { id: 't3', title: 'Đọc tài liệu tiếng Anh', category: 'study', priority: 'low', subjectId: 'eng', due: at(2, '21:00'), remindBefore: 60, subtasks: [], done: false },
  { id: 't4', title: 'Gửi lịch họp nhóm đồ án', category: 'group', priority: 'medium', subjectId: 'ux', due: at(0, '09:00'), remindBefore: 30, subtasks: [], done: true, doneAt: at(0, '08:40') },
  { id: 't5', title: 'Ôn thi giữa kỳ Cấu trúc dữ liệu', category: 'study', priority: 'high', subjectId: 'ctdl', due: at(1, '20:00'), remindBefore: 60, subtasks: [], done: false },
  { id: 't6', title: 'Bài tập Lab 4 Java', category: 'study', priority: 'medium', subjectId: 'java', due: at(3, '23:00'), remindBefore: 120, subtasks: [], done: false },
  { id: 't7', title: 'Đổi ca làm thêm thứ Bảy', category: 'work', priority: 'low', due: at(4, '18:00'), remindBefore: 60, subtasks: [], done: false },
  // việc đã xong trong tuần (cho màn Tiến độ)
  { id: 'd1', title: 'Quiz CSDL chương 4', category: 'study', priority: 'medium', subjectId: 'csdl', due: at(-1, '22:00'), remindBefore: 60, subtasks: [], done: true, doneAt: at(-1, '21:00') },
  { id: 'd2', title: 'Nộp báo cáo Java tuần 7', category: 'study', priority: 'high', subjectId: 'java', due: at(-2, '23:59'), remindBefore: 60, subtasks: [], done: true, doneAt: at(-2, '22:10') },
  { id: 'd3', title: 'Chuẩn bị slide nhóm', category: 'group', priority: 'medium', subjectId: 'ux', due: at(-2, '20:00'), remindBefore: 60, subtasks: [], done: true, doneAt: at(-2, '19:30') },
  { id: 'd4', title: 'Luyện nói tiếng Anh 15 phút', category: 'personal', priority: 'low', subjectId: 'eng', due: at(-4, '21:00'), remindBefore: 30, subtasks: [], done: true, doneAt: at(-4, '20:30') },
  { id: 'd5', title: 'Đọc chương 3 CTDL', category: 'study', priority: 'low', subjectId: 'ctdl', due: at(-5, '21:00'), remindBefore: 30, subtasks: [], done: true, doneAt: at(-5, '20:00') },
  { id: 'd6', title: 'Đăng ký ca làm tuần sau', category: 'work', priority: 'medium', due: at(-6, '18:00'), remindBefore: 30, subtasks: [], done: true, doneAt: at(-6, '17:00') },
];

export const seedEvents: ScheduleEvent[] = [
  { id: 'e1', title: 'Lập trình Java', place: 'Phòng A2.04 · Lý thuyết', category: 'study', day: 0, start: '08:00', end: '09:30' },
  { id: 'e2', title: 'Tập gym', place: 'Nhà thi đấu', category: 'personal', day: 0, start: '11:00', end: '12:00' },
  { id: 'e3', title: 'Họp nhóm đồ án UX', place: 'Thư viện tầng 3', category: 'group', day: 0, start: '13:00', end: '14:30' },
  { id: 'e4', title: 'Ca làm thêm', place: 'Quán cà phê · Q. Gò Vấp', category: 'work', day: 0, start: '15:00', end: '19:00' },
  { id: 'e5', title: 'Thiết kế UX', place: 'B1.02', category: 'study', day: 1, start: '07:00', end: '09:30' },
  { id: 'e6', title: 'Cơ sở dữ liệu', place: 'A2.04', category: 'study', day: 2, start: '09:30', end: '11:30' },
  { id: 'e7', title: 'Cấu trúc dữ liệu', place: 'A1.07', category: 'study', day: 2, start: '13:00', end: '15:00' },
  { id: 'e8', title: 'Lập trình Java (Lab)', place: 'Lab 3', category: 'study', day: 3, start: '13:00', end: '16:00' },
  { id: 'e9', title: 'Ca làm thêm', place: 'Quán cà phê', category: 'work', day: 3, start: '17:00', end: '21:00' },
  { id: 'e10', title: 'Tiếng Anh 3', place: 'C3.01', category: 'study', day: 4, start: '07:00', end: '09:30' },
  { id: 'e11', title: 'Ca làm thêm', place: 'Quán cà phê', category: 'work', day: 5, start: '08:00', end: '14:00' },
  { id: 'e12', title: 'Đá bóng', place: 'Sân trường', category: 'personal', day: 6, start: '16:00', end: '17:30' },
];

/** Lịch sử tập trung 7 ngày qua (~14 giờ) để màn Tiến độ có số liệu */
export const seedFocus: FocusSession[] = [
  [-6, 150], [-5, 120], [-4, 100], [-3, 125], [-2, 150], [-1, 125], [0, 50],
].map(([d, m], i) => ({ id: `f${i}`, at: at(d, '21:00'), minutes: m }));
