import { Link } from 'react-router-dom';
import { useStore } from '../data/store';
import { greeting, isSameDay, longDate, weekdayIndex } from '../data/date';
import { CATEGORY_COLOR, PRIORITY_ORDER } from '../data/types';
import { TaskCard } from '../components/TaskCard';
import { Progress, StatCard, cssVars } from '../components/ui';
import { Icon } from '../components/Icon';
import { useStats } from './useStats';
import { ThemeToggle } from '../components/ThemeToggle';
import { StreakCard } from '../components/StreakCard';

/* 01 · Hôm nay (mobile)  ·  07 · Tổng quan (website) */
export function TodayPage() {
  const { user, tasks, events, subjects, setSearchOpen, bestStreak, setQuickAddOpen } = useStore();
  const isNew = tasks.length === 0 && subjects.length === 0 && events.length === 0;
  const stats = useStats();
  const today = new Date();
  const first = user?.name.split(' ').pop() ?? 'bạn';

  const todays = tasks.filter((t) => isSameDay(new Date(t.due), today));
  const doneToday = todays.filter((t) => t.done).length;
  const pct = todays.length ? Math.round((doneToday / todays.length) * 100) : 0;

  const pinned = tasks.filter((t) => t.pinned && !t.done).sort((a, b) => a.due.localeCompare(b.due));
  const priorities = tasks
    .filter((t) => !t.done && !t.pinned && new Date(t.due).getTime() - Date.now() < 3 * 86400000)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.due.localeCompare(b.due))
    .slice(0, 5);

  const todayEvents = events.filter((e) => e.day === weekdayIndex(today)).sort((a, b) => a.start.localeCompare(b.start));
  const upcomingSubjects = [...subjects].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned)).slice(0, 3);

  const schedule = (
    <section>
      <div className="section-head">
        <h2 className="t-h2">Lịch hôm nay</h2>
        <Link to="/calendar">Xem lịch</Link>
      </div>
      <div className="stack">
        {todayEvents.length === 0 && (
          <div className="card empty">
            {events.length === 0 ? <>Chưa có lịch học. <Link to="/calendar">Thêm lịch</Link></> : 'Hôm nay không có lịch học 🎉'}
          </div>
        )}
        {todayEvents.map((e) => (
          <div className="sched" key={e.id} style={cssVars({ '--c': CATEGORY_COLOR[e.category].c, '--cbg': CATEGORY_COLOR[e.category].bg })}>
            <div className="time">{e.start}<br />{e.end}</div>
            <div className="block">
              <div className="name">{e.title}</div>
              <div className="t-caption muted">{e.place}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="stack-lg">
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="muted">{longDate(today)}</div>
          <h1 className="t-h1">{greeting(today)}, {first}</h1>
          <p className="muted web-only">Hôm nay bạn có {todays.length} việc và {todayEvents.length} mục trong lịch.</p>
        </div>
        <div className="row mobile-only">
          <button className="icon-btn" aria-label="Tìm kiếm" onClick={() => setSearchOpen(true)}><Icon name="search" /></button>
          <ThemeToggle />
          <Link to="/progress" className="avatar" aria-label="Hồ sơ">{first[0]}</Link>
        </div>
      </div>

      {/* Người dùng mới – chưa có dữ liệu: hướng dẫn 3 bước bắt đầu */}
      {isNew && (
        <section className="card onboard">
          <div>
            <div className="t-h2" style={{ fontWeight: 700 }}>Chào mừng đến với StudyPlan 👋</div>
            <p className="muted" style={{ marginTop: 4 }}>Tài khoản của bạn đang trống. Bắt đầu với 3 bước sau:</p>
          </div>
          <div className="onboard-steps">
            <Link to="/subjects" className="onboard-step">
              <span className="num">1</span>
              <span className="subject-icon" style={{ color: 'var(--cat-study)', background: 'var(--cat-study-bg)' }}><Icon name="book" /></span>
              <b>Thêm môn học</b>
              <span className="t-caption muted">Các môn của học kỳ này</span>
            </Link>
            <Link to="/calendar" className="onboard-step">
              <span className="num">2</span>
              <span className="subject-icon" style={{ color: 'var(--cat-group)', background: 'var(--cat-group-bg)' }}><Icon name="calendar" /></span>
              <b>Thêm lịch học</b>
              <span className="t-caption muted">Lịch học, ca làm hằng tuần</span>
            </Link>
            <button className="onboard-step" onClick={() => setQuickAddOpen(true)}>
              <span className="num">3</span>
              <span className="subject-icon" style={{ color: 'var(--priority-high)', background: 'var(--priority-high-bg)' }}><Icon name="plus" /></span>
              <b>Thêm việc đầu tiên</b>
              <span className="t-caption muted">Bài tập, deadline sắp tới</span>
            </button>
          </div>
        </section>
      )}

      {/* Thẻ tiến độ – mobile */}
      <div className="hero mobile-only">
        <div className="eyebrow">TIẾN ĐỘ HÔM NAY</div>
        <div className="row between" style={{ margin: '6px 0 10px' }}>
          <span className="t-h2" style={{ fontWeight: 700 }}>{doneToday}/{todays.length} việc đã xong</span>
          <span className="t-h2" style={{ fontWeight: 700 }}>{pct}%</span>
        </div>
        <Progress value={pct} />
        <p className="t-caption" style={{ marginTop: 10, opacity: 0.9 }}>
          {todays.length - doneToday > 0
            ? `Còn ${todays.length - doneToday} việc — làm việc gấp nhất trước nhé!`
            : 'Đã xong hết việc hôm nay. Tuyệt vời! 🎉'}
        </p>
      </div>

      {/* 4 thẻ số liệu – website */}
      <div className="grid-4 web-only">
        <StatCard icon="target" tone={{ c: 'var(--primary)', bg: 'var(--indigo-50)' }} label="Việc hôm nay" value={String(todays.length)} sub={`${doneToday} đã hoàn thành`} />
        <StatCard icon="check" tone={{ c: 'var(--priority-low)', bg: 'var(--priority-low-bg)' }} label="Hoàn thành tuần này" value={String(stats.weekDone)} sub={`${stats.onTimePct}% đúng hạn`} />
        <StatCard icon="hourglass" tone={{ c: 'var(--priority-high)', bg: 'var(--priority-high-bg)' }} label="Sắp đến hạn" value={String(stats.dueSoon)} sub="Trong 48 giờ tới" />
        <StreakCard streak={stats.streak} record={bestStreak} />
      </div>

      <div className="web-grid stack-lg">
        <div className="stack-lg">
        {pinned.length > 0 && (
          <section>
            <div className="section-head">
              <h2 className="t-h2 row" style={{ gap: 6 }}><span style={{ color: 'var(--primary)' }}><Icon name="pin" /></span>Đã ghim</h2>
              <span className="muted">{pinned.length} việc</span>
            </div>
            <div className="stack">
              {pinned.map((t) => <TaskCard key={t.id} task={t} />)}
            </div>
          </section>
        )}
        <section>
          <div className="section-head">
            <h2 className="t-h2">Ưu tiên cần làm</h2>
            <span className="muted">{priorities.length} việc</span>
          </div>
          <div className="stack">
            {priorities.length === 0 && (
              <div className="card empty">
                {tasks.length === 0 ? 'Chưa có công việc nào — bấm nút “+” để thêm việc đầu tiên.' : 'Không còn việc gấp. Nghỉ ngơi chút nhé!'}
              </div>
            )}
            {priorities.map((t) => <TaskCard key={t.id} task={t} />)}
            {todays.filter((t) => t.done).map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        </section>
        </div>

        <div className="stack-lg">
          <Link to="/focus" className="card focus-cta">
            <span className="focus-cta-icon"><Icon name="timer" size={22} /></span>
            <div className="grow">
              <div style={{ fontWeight: 700 }}>Bắt đầu phiên tập trung</div>
              <div className="t-caption muted">Pomodoro 25 phút · đã học {stats.studyHours} giờ tuần này</div>
            </div>
            <span className="focus-cta-go"><Icon name="play" size={16} /></span>
          </Link>
          {schedule}
          <section className="web-only" hidden={upcomingSubjects.length === 0}>
            <div className="section-head"><h2 className="t-h2">Môn học sắp đến hạn</h2></div>
            <div className="stack">
              {upcomingSubjects.map((s) => (
                <Link to="/subjects" key={s.id} className="card row" style={{ color: 'inherit', fontWeight: 400 }}>
                  <span className="subject-icon" style={{ color: s.color, background: s.bg }}><Icon name="book" /></span>
                  <div className="grow">
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div className="t-caption muted">{s.teacher}</div>
                  </div>
                  <span className="badge badge-neutral">{s.milestone}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
