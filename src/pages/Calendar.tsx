import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { SHORT_DAYS, isSameDay, pad, startOfWeek, timeOf, toMinutes, weekdayIndex } from '../data/date';
import { CATEGORY_COLOR, CATEGORY_LABEL, PRIORITY_COLOR, type Category, type Task } from '../data/types';
import { Button, DeleteButton, PageHead, cssVars } from '../components/ui';
import { AddEventSheet } from './AddEvent';
import { Icon } from '../components/Icon';

const START = 7; // 07:00
const END = 22; // 22:00
const HOUR_PX = 56;
const FULL_DAYS = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ nhật'];

type View = 'day' | 'week' | 'month' | 'year';
const VIEW_LABEL: Record<View, string> = { day: 'Ngày', week: 'Tuần', month: 'Tháng', year: 'Năm' };

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Các ô của lưới tháng: bắt đầu từ Thứ Hai, đủ 6 tuần */
function monthGrid(year: number, month: number) {
  const first = startOfWeek(new Date(year, month, 1));
  return Array.from({ length: 42 }, (_, i) => addDays(first, i));
}

/* 03 · Lịch học và công việc  ·  08 · Lịch của tôi (web) */
export function CalendarPage() {
  const { events, tasks } = useStore();
  const nav = useNavigate();
  const today = new Date();
  const [anchor, setAnchor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [view, setView] = useState<View>(() => (window.innerWidth >= 960 ? 'week' : 'day'));
  const [now, setNow] = useState(new Date());
  const [dir, setDir] = useState<'next' | 'prev' | 'none'>('none');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const monday = startOfWeek(anchor);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const tasksOn = (d: Date) => tasks.filter((t) => isSameDay(new Date(t.due), d));

  /* ---------- Điều hướng trước / sau ---------- */
  const move = (step: 1 | -1) => {
    setDir(step > 0 ? 'next' : 'prev');
    const d = new Date(anchor);
    if (view === 'day') d.setDate(d.getDate() + step);
    if (view === 'week') d.setDate(d.getDate() + 7 * step);
    if (view === 'month') d.setMonth(d.getMonth() + step, 1);
    if (view === 'year') d.setFullYear(d.getFullYear() + step, d.getMonth(), 1);
    setAnchor(d);
  };
  const goToday = () => {
    setDir('none');
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setAnchor(d);
  };
  const openDay = (d: Date) => {
    setDir('none');
    setAnchor(d);
    setView('day');
  };
  const openMonth = (m: number) => {
    setDir('none');
    setAnchor(new Date(anchor.getFullYear(), m, 1));
    setView('month');
  };

  const title =
    view === 'day'
      ? `${FULL_DAYS[weekdayIndex(anchor)]}, ${pad(anchor.getDate())}/${pad(anchor.getMonth() + 1)}/${anchor.getFullYear()}`
      : view === 'week'
        ? `${pad(weekDays[0].getDate())}/${pad(weekDays[0].getMonth() + 1)} – ${pad(weekDays[6].getDate())}/${pad(weekDays[6].getMonth() + 1)}/${weekDays[6].getFullYear()}`
        : view === 'month'
          ? `Tháng ${anchor.getMonth() + 1}, ${anchor.getFullYear()}`
          : `Năm ${anchor.getFullYear()}`;

  const years = Array.from({ length: 11 }, (_, i) => today.getFullYear() - 5 + i);

  return (
    <div>
      <PageHead
        eyebrow={`Tháng ${anchor.getMonth() + 1}, ${anchor.getFullYear()}`}
        title="Lịch của tôi"
        right={
          <div className="segmented cal-views" role="tablist" aria-label="Chế độ xem">
            {(Object.keys(VIEW_LABEL) as View[]).map((v) => (
              <button key={v} role="tab" aria-selected={view === v} className={view === v ? 'active' : ''} onClick={() => { setDir('none'); setView(v); }}>
                {VIEW_LABEL[v]}
              </button>
            ))}
          </div>
        }
      />

      {/* ---------- Thanh điều hướng thời gian ---------- */}
      <div className="cal-toolbar">
        <div className="row">
          <button className="icon-btn" aria-label="Trước" onClick={() => move(-1)}><Icon name="back" /></button>
          <button className="icon-btn" aria-label="Sau" onClick={() => move(1)}><Icon name="chevron" /></button>
          <button className="btn btn-secondary btn-sm" onClick={goToday}>Hôm nay</button>
          <Button small icon="plus" onClick={() => setAdding(true)}>Thêm lịch</Button>
        </div>
        <h2 className="t-h3 cal-title">{title}</h2>
        <div className="row">
          <select className="input cal-select" aria-label="Chọn tháng" value={anchor.getMonth()}
            onChange={(e) => { setDir('none'); setAnchor(new Date(anchor.getFullYear(), Number(e.target.value), 1)); if (view === 'year') setView('month'); }}>
            {Array.from({ length: 12 }, (_, m) => <option key={m} value={m}>Tháng {m + 1}</option>)}
          </select>
          <select className="input cal-select" aria-label="Chọn năm" value={anchor.getFullYear()}
            onChange={(e) => { setDir('none'); setAnchor(new Date(Number(e.target.value), anchor.getMonth(), 1)); }}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <AddEventSheet key={String(adding)} open={adding} onClose={() => setAdding(false)} defaultDay={weekdayIndex(anchor)} />

      {events.length === 0 && (
        <div className="card row" style={{ marginBottom: 16, background: 'var(--indigo-50)', borderColor: 'var(--indigo-100)' }}>
          <span className="focus-cta-icon"><Icon name="calendar" size={22} /></span>
          <div className="grow">
            <div style={{ fontWeight: 700 }}>Lịch của bạn đang trống</div>
            <div className="t-caption muted">Thêm lịch học, ca làm thêm… một lần, app tự lặp lại mỗi tuần.</div>
          </div>
          <Button small icon="plus" onClick={() => setAdding(true)}>Thêm lịch</Button>
        </div>
      )}

      {(view === 'day' || view === 'week') && (
        <div className="card" style={{ padding: 8, marginBottom: 16 }}>
          <div className="week-strip">
            {weekDays.map((d, i) => (
              <button
                key={i}
                className={`day-pill ${view === 'day' && isSameDay(d, anchor) ? 'active' : ''} ${isSameDay(d, today) ? 'is-today' : ''}`}
                onClick={() => openDay(d)}
              >
                {SHORT_DAYS[i]}
                <b>{d.getDate()}</b>
                <i className="dots">{tasksOn(d).slice(0, 3).map((t) => <span key={t.id} style={{ background: PRIORITY_COLOR[t.priority] }} />)}</i>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="row wrap" style={{ marginBottom: 16 }}>
        {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
          <span key={c} className={`badge badge-${c} badge-dot`}>{CATEGORY_LABEL[c]}</span>
        ))}
        <span className="badge badge-neutral"><Icon name="clock" size={12} /> Hạn công việc</span>
      </div>

      {/* key đổi theo mốc thời gian để chạy hiệu ứng trượt khi bấm trước / sau */}
      <div key={`${view}-${anchor.toDateString()}`} className={`cal-body cal-${dir}`}>
        {(view === 'day' || view === 'week') && (
          <TimeGrid
            days={view === 'day' ? [anchor] : weekDays}
            showHead={view === 'week'}
            today={today}
            now={now}
            tasksOn={tasksOn}
            onTask={(id) => nav(`/task/${id}`)}
            onDay={openDay}
          />
        )}

        {view === 'month' && (
          <div className="card month">
            <div className="month-head">{SHORT_DAYS.map((d) => <span key={d}>{d}</span>)}</div>
            <div className="month-grid">
              {monthGrid(anchor.getFullYear(), anchor.getMonth()).map((d) => {
                const ts = tasksOn(d);
                const evs = events.filter((e) => e.day === weekdayIndex(d));
                const out = d.getMonth() !== anchor.getMonth();
                return (
                  <button key={d.toISOString()} className={`month-cell ${out ? 'out' : ''} ${isSameDay(d, today) ? 'today' : ''}`} onClick={() => openDay(d)}>
                    <span className="num">{d.getDate()}</span>
                    {!out && evs.length > 0 && <span className="t-caption muted cell-ev">{evs.length} mục lịch</span>}
                    {ts.slice(0, 2).map((t) => (
                      <span key={t.id} className={`cell-task ${t.done ? 'done' : ''}`} style={cssVars({ '--c': PRIORITY_COLOR[t.priority] })}>{t.title}</span>
                    ))}
                    {ts.length > 2 && <span className="t-caption muted cell-more">+{ts.length - 2} việc</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === 'year' && (
          <div className="year-grid">
            {Array.from({ length: 12 }, (_, m) => (
              <button key={m} className={`card mini-month ${m === today.getMonth() && anchor.getFullYear() === today.getFullYear() ? 'current' : ''}`} onClick={() => openMonth(m)}>
                <div className="t-h3" style={{ marginBottom: 8 }}>Tháng {m + 1}</div>
                <div className="mini-grid">
                  {SHORT_DAYS.map((d) => <span key={d} className="mini-head">{d.replace('T', '')}</span>)}
                  {monthGrid(anchor.getFullYear(), m).map((d) => {
                    const out = d.getMonth() !== m;
                    const has = !out && tasksOn(d).length > 0;
                    return (
                      <span key={d.toISOString()} className={`mini-day ${out ? 'out' : ''} ${isSameDay(d, today) ? 'today' : ''} ${has ? 'has' : ''}`}>
                        {d.getDate()}
                      </span>
                    );
                  })}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Lưới giờ cho chế độ Ngày / Tuần ---------- */
function TimeGrid({
  days,
  showHead,
  today,
  now,
  tasksOn,
  onTask,
  onDay,
}: {
  days: Date[];
  showHead: boolean;
  today: Date;
  now: Date;
  tasksOn: (d: Date) => Task[];
  onTask: (id: string) => void;
  onDay: (d: Date) => void;
}) {
  const { events, deleteEvent, showToast } = useStore();
  const nowTop = ((now.getHours() * 60 + now.getMinutes() - START * 60) / 60) * HOUR_PX;
  const cols = `48px repeat(${days.length}, minmax(110px, 1fr))`;

  return (
    <div className="card" style={{ padding: 16, overflowX: 'auto' }}>
      {showHead && (
        <div style={{ display: 'grid', gridTemplateColumns: cols, marginBottom: 8 }}>
          <span />
          {days.map((d, i) => (
            <button key={i} className={`week-head ${isSameDay(d, today) ? 'today' : ''}`} onClick={() => onDay(d)}>
              <span className="wd">{FULL_DAYS[weekdayIndex(d)]}</span>
              <span className="dt">{pad(d.getDate())}/{pad(d.getMonth() + 1)}</span>
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: cols }}>
        <div>
          {Array.from({ length: END - START }, (_, i) => (
            <div key={i} className="t-caption" style={{ height: HOUR_PX, color: 'var(--neutral-400)', transform: 'translateY(-8px)' }}>
              {pad(START + i)}:00
            </div>
          ))}
        </div>
        {days.map((d) => {
          const di = weekdayIndex(d);
          const dueTasks = tasksOn(d);
          return (
            <div key={d.toISOString()} className="timeline" style={{ display: 'block' }}>
              <div className="lane" style={{ height: (END - START) * HOUR_PX }}>
                {Array.from({ length: END - START }, (_, i) => (
                  <div key={i} className="line" style={{ top: i * HOUR_PX }} />
                ))}
                {events.filter((e) => e.day === di).map((e) => {
                  const top = ((toMinutes(e.start) - START * 60) / 60) * HOUR_PX;
                  const h = ((toMinutes(e.end) - toMinutes(e.start)) / 60) * HOUR_PX;
                  const col = CATEGORY_COLOR[e.category];
                  return (
                    <div key={e.id} className="event" style={{ top, height: h - 4, right: 4, ...cssVars({ '--c': col.c, '--cbg': col.bg }) }}>
                      <span className="event-del">
                        <DeleteButton small label={e.title} onDelete={() => { deleteEvent(e.id); showToast(`Đã xoá “${e.title}” khỏi lịch`); }} />
                      </span>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{e.title}</div>
                      {h > 50 && <div className="t-caption muted">{e.start} – {e.end} · {e.place}</div>}
                    </div>
                  );
                })}
                {dueTasks.map((t) => {
                  const m = toMinutes(timeOf(t.due));
                  const top = Math.min(Math.max(((m - START * 60) / 60) * HOUR_PX, 0), (END - START) * HOUR_PX - 26);
                  return (
                    <button key={t.id} className={`due-chip ${t.done ? 'done' : ''}`} style={{ top, ...cssVars({ '--c': PRIORITY_COLOR[t.priority] }) }} onClick={() => onTask(t.id)} title={t.title}>
                      <Icon name="clock" size={12} /> {timeOf(t.due)} · {t.title}
                    </button>
                  );
                })}
                {isSameDay(d, today) && nowTop > 0 && nowTop < (END - START) * HOUR_PX && (
                  <div className="now" style={{ top: nowTop }} title={`Bây giờ ${pad(now.getHours())}:${pad(now.getMinutes())}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
