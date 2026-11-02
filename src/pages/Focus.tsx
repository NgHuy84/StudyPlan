import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../data/store';
import { isSameDay, pad, timeOf } from '../data/date';
import { PRIORITY_ORDER } from '../data/types';
import { Button, Chips, PageHead } from '../components/ui';
import { Icon } from '../components/Icon';
import { notify, playChime } from '../hooks/useReminders';

type Mode = 'focus' | 'short' | 'long';
const MODE_LABEL: Record<Mode, string> = { focus: 'Tập trung', short: 'Nghỉ ngắn', long: 'Nghỉ dài' };
const BREAK_MIN: Record<Exclude<Mode, 'focus'>, number> = { short: 5, long: 15 };
const FOCUS_OPTIONS = ['25', '45', '50'] as const;
const TIMER_KEY = 'studyplan.timer';

interface TimerState {
  mode: Mode;
  focusMin: number;
  running: boolean;
  endAt: number | null; // khi đang chạy
  left: number; // giây còn lại khi tạm dừng
  taskId: string;
  round: number; // số phiên tập trung đã xong trong chuỗi hiện tại
}

function loadTimer(taskId?: string): TimerState {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) {
      const t = JSON.parse(raw) as TimerState;
      return taskId && !t.running ? { ...t, taskId } : t;
    }
  } catch {
    /* ignore */
  }
  return { mode: 'focus', focusMin: 25, running: false, endAt: null, left: 25 * 60, taskId: taskId ?? '', round: 0 };
}

const durationOf = (mode: Mode, focusMin: number) => (mode === 'focus' ? focusMin : BREAK_MIN[mode]) * 60;

/* Chức năng mới · Chế độ tập trung (Pomodoro) */
export function FocusPage() {
  const { taskId: paramTask } = useParams();
  const { tasks, focus, logFocus, showToast } = useStore();
  const [t, setT] = useState<TimerState>(() => loadTimer(paramTask));
  const [, tick] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify(t));
    } catch {
      /* ignore */
    }
  }, [t]);

  const total = durationOf(t.mode, t.focusMin);
  const left = t.running && t.endAt ? Math.max(0, Math.round((t.endAt - Date.now()) / 1000)) : t.left;
  const pct = 1 - left / total;

  const openTasks = useMemo(
    () => tasks.filter((x) => !x.done).sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]),
    [tasks],
  );
  const task = tasks.find((x) => x.id === t.taskId);

  // giữ trạng thái mới nhất cho các hàm gọi từ setInterval
  const tRef = useRef(t);
  tRef.current = t;

  /** Kết thúc một phiên: ghi nhận và chuyển sang chế độ tiếp theo */
  const finish = useCallback((skipped = false) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const s = tRef.current;
    if (!skipped) playChime();
    if (s.mode === 'focus') {
      const leftNow = s.running && s.endAt ? Math.max(0, (s.endAt - Date.now()) / 1000) : s.left;
      // bỏ qua giữa chừng → chỉ tính số phút đã học thật
      const minutes = skipped ? Math.floor((s.focusMin * 60 - leftNow) / 60) : s.focusMin;
      if (minutes > 0) logFocus(minutes, s.taskId || undefined);
      const round = s.round + 1;
      const next: Mode = round % 4 === 0 ? 'long' : 'short';
      if (!skipped) notify('Hết phiên tập trung 🎉', `Bạn đã tập trung ${s.focusMin} phút. Nghỉ ${BREAK_MIN[next]} phút nhé!`);
      showToast(minutes > 0 ? `Đã ghi nhận ${minutes} phút tập trung! Nghỉ ${BREAK_MIN[next]} phút nhé ☕` : `Chuyển sang nghỉ ${BREAK_MIN[next]} phút`);
      setT({ ...s, mode: next, running: false, endAt: null, left: durationOf(next, s.focusMin), round });
    } else {
      if (!skipped) notify('Hết giờ nghỉ', 'Sẵn sàng cho phiên tập trung tiếp theo?');
      showToast('Hết giờ nghỉ — quay lại tập trung nào! 💪');
      setT({ ...s, mode: 'focus', running: false, endAt: null, left: durationOf('focus', s.focusMin) });
    }
  }, [logFocus, showToast]);

  // quay lại trang sau khi phiên đã hết giờ trong lúc vắng mặt → ghi nhận luôn
  useEffect(() => {
    if (t.running && t.endAt && Date.now() >= t.endAt) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // đồng hồ: cập nhật mỗi 250ms khi đang chạy
  useEffect(() => {
    if (!t.running) return;
    const id = window.setInterval(() => {
      tick((n) => n + 1);
      if (t.endAt && Date.now() >= t.endAt) finish();
    }, 250);
    return () => window.clearInterval(id);
  }, [t.running, t.endAt, finish]);

  // hiển thị thời gian còn lại trên tab trình duyệt
  useEffect(() => {
    const old = document.title;
    if (t.running) document.title = `${pad(Math.floor(left / 60))}:${pad(left % 60)} · ${MODE_LABEL[t.mode]} – StudyPlan`;
    return () => {
      document.title = old;
    };
  });

  // phím tắt: Space = bắt đầu / tạm dừng
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const toggle = () =>
    setT((s) =>
      s.running
        ? { ...s, running: false, endAt: null, left: Math.max(0, Math.round(((s.endAt ?? Date.now()) - Date.now()) / 1000)) }
        : { ...s, running: true, endAt: Date.now() + s.left * 1000 },
    );
  // mỗi lần bắt đầu / đổi chế độ thì cho phép kết thúc phiên mới
  useEffect(() => {
    doneRef.current = false;
  }, [t.mode, t.running]);
  const reset = () => setT((s) => ({ ...s, running: false, endAt: null, left: durationOf(s.mode, s.focusMin) }));
  const setMode = (mode: Mode) => setT((s) => ({ ...s, mode, running: false, endAt: null, left: durationOf(mode, s.focusMin) }));
  const setFocusMin = (m: number) =>
    setT((s) => ({ ...s, focusMin: m, ...(s.mode === 'focus' ? { running: false, endAt: null, left: m * 60 } : {}) }));

  const todaySessions = focus.filter((f) => isSameDay(new Date(f.at), new Date()));
  const todayMin = todaySessions.reduce((a, f) => a + f.minutes, 0);

  // vòng tròn tiến độ
  const R = 120;
  const C = 2 * Math.PI * R;

  return (
    <div className="stack-lg" style={{ maxWidth: 880 }}>
      <PageHead eyebrow="Pomodoro · 25 phút học, 5 phút nghỉ" title="Tập trung" />

      <div className="web-grid stack-lg">
        <section className={`card focus-card mode-${t.mode} ${t.running ? 'running' : ''}`}>
          <div className="segmented" style={{ alignSelf: 'center' }}>
            {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
              <button key={m} className={t.mode === m ? 'active' : ''} onClick={() => setMode(m)}>{MODE_LABEL[m]}</button>
            ))}
          </div>

          <div className="ring">
            <svg viewBox="0 0 280 280" aria-hidden="true">
              <circle cx="140" cy="140" r={R} className="ring-bg" />
              <circle cx="140" cy="140" r={R} className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
            </svg>
            <div className="ring-text">
              <div className="ring-time" aria-live="polite">{pad(Math.floor(left / 60))}:{pad(left % 60)}</div>
              <div className="muted">{t.running ? MODE_LABEL[t.mode] + '…' : 'Đang dừng'}</div>
            </div>
          </div>

          <div className="row" style={{ justifyContent: 'center' }}>
            <button className="icon-btn" aria-label="Đặt lại" onClick={reset}><Icon name="reset" /></button>
            <button className="focus-play" onClick={toggle} aria-label={t.running ? 'Tạm dừng' : 'Bắt đầu'}>
              <Icon name={t.running ? 'pause' : 'play'} size={28} />
            </button>
            <button className="icon-btn" aria-label="Bỏ qua phiên này" onClick={() => finish(true)}><Icon name="chevron" /></button>
          </div>
          <p className="t-caption muted" style={{ textAlign: 'center' }}>Phím tắt: Space để bắt đầu / tạm dừng</p>
        </section>

        <div className="stack">
          <section className="card stack">
            <h2 className="t-h3">Đang làm việc gì?</h2>
            <select className="input" value={t.taskId} onChange={(e) => setT((s) => ({ ...s, taskId: e.target.value }))} aria-label="Chọn công việc">
              <option value="">— Không gắn công việc —</option>
              {openTasks.map((x) => <option key={x.id} value={x.id}>{x.title}</option>)}
            </select>
            {task && (
              <Link to={`/task/${task.id}`} className="t-caption">Hạn {timeOf(task.due)} · xem chi tiết →</Link>
            )}
            <h2 className="t-h3" style={{ marginTop: 8 }}>Thời lượng tập trung</h2>
            <Chips options={FOCUS_OPTIONS} value={String(t.focusMin) as (typeof FOCUS_OPTIONS)[number]} onChange={(v) => setFocusMin(Number(v))} render={(v) => `${v} phút`} />
          </section>

          <section className="card stack">
            <div className="row between">
              <h2 className="t-h3">Hôm nay</h2>
              <span className="badge badge-study">{Math.floor(todayMin / 60)} giờ {todayMin % 60} phút</span>
            </div>
            <div className="row wrap" style={{ gap: 6 }} aria-label={`Đã xong ${t.round % 4} trên 4 phiên`}>
              {[0, 1, 2, 3].map((i) => <span key={i} className={`tomato ${i < t.round % 4 ? 'on' : ''}`} />)}
              <span className="t-caption muted" style={{ marginLeft: 4 }}>Sau 4 phiên được nghỉ dài 15 phút</span>
            </div>
            {todaySessions.length === 0 && <p className="muted t-caption">Chưa có phiên nào hôm nay. Bắt đầu thôi!</p>}
            {[...todaySessions].reverse().slice(0, 5).map((f) => (
              <div key={f.id} className="row between t-caption">
                <span className="row"><Icon name="check" size={14} /> {f.minutes} phút{f.taskId ? ` · ${tasks.find((x) => x.id === f.taskId)?.title ?? ''}` : ''}</span>
                <span className="muted">{timeOf(f.at)}</span>
              </div>
            ))}
          </section>

          <Button variant="ghost" icon="bell" onClick={async () => {
            if (!('Notification' in window)) return showToast('Trình duyệt không hỗ trợ thông báo');
            const p = await Notification.requestPermission();
            showToast(p === 'granted' ? 'Đã bật thông báo trên máy 🔔' : 'Bạn chưa cho phép thông báo');
          }}>
            Bật thông báo khi hết giờ
          </Button>
        </div>
      </div>
    </div>
  );
}
