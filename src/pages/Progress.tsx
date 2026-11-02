import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { SHORT_DAYS, isSameDay, pad, weekdayIndex } from '../data/date';
import { CATEGORY_COLOR, CATEGORY_LABEL, type Category } from '../data/types';
import { Button, PageHead, Progress, StatCard } from '../components/ui';
import { useStats } from './useStats';
import { ThemeToggle } from '../components/ThemeToggle';
import { StreakCard } from '../components/StreakCard';

/* 06 · Tiến độ  ·  10 · Tiến độ (web) */
export function ProgressPage() {
  const s = useStats();
  const { tasks, logout, resetData, showToast, isDemo, bestStreak } = useStore();
  const [armed, setArmed] = useState(false);
  const nav = useNavigate();
  const first = s.perDay[0].date;
  const last = s.perDay[6].date;
  const max = Math.max(1, ...s.perDay.map((d) => d.count));

  const byCat = (Object.keys(CATEGORY_LABEL) as Category[]).map((c) => {
    const ts = tasks.filter((t) => t.category === c);
    return { c, total: ts.length, done: ts.filter((t) => t.done).length };
  });

  return (
    <div className="stack-lg">
      <PageHead eyebrow={`${pad(first.getDate())}/${pad(first.getMonth() + 1)} – ${pad(last.getDate())}/${pad(last.getMonth() + 1)}`} title="Tiến độ" right={<span className="mobile-only"><ThemeToggle /></span>} />

      <div className="hero">
        <div className="eyebrow">7 NGÀY QUA BẠN ĐÃ HOÀN THÀNH</div>
        <div className="t-display" style={{ margin: '6px 0 10px' }}>{s.recentDone}/{s.recentTotal} việc</div>
        <Progress value={(s.recentDone / Math.max(1, s.recentTotal)) * 100} />
        <p className="t-caption" style={{ marginTop: 10, opacity: 0.9 }}>Giữ nhịp này nhé — mỗi ngày một chút là đủ!</p>
      </div>

      <div className="grid-4">
        <StatCard icon="target" tone={{ c: 'var(--priority-low)', bg: 'var(--priority-low-bg)' }} label="Đúng hạn" value={`${s.onTimePct}%`} sub={`${s.onTime}/${s.recentDone} việc`} />
        <StatCard icon="clock" tone={{ c: 'var(--primary)', bg: 'var(--indigo-50)' }} label="Giờ học" value={`${s.studyHours} giờ`} sub="Mục tiêu 15 giờ" />
        <StatCard icon="hourglass" tone={{ c: 'var(--priority-high)', bg: 'var(--priority-high-bg)' }} label="Sắp đến hạn" value={String(s.dueSoon)} sub="Trong 48 giờ tới" />
        <StreakCard streak={s.streak} record={bestStreak} />
      </div>

      <div className="web-grid stack-lg">
        <section className="card">
          <div className="section-head">
            <h2 className="t-h3">Việc hoàn thành mỗi ngày</h2>
            <span className="muted">Tổng {s.recentDone}</span>
          </div>
          <div className="bars">
            {s.perDay.map((d, i) => (
              <div key={i} className={`bar ${isSameDay(d.date, new Date()) ? 'today' : ''}`}>
                <b style={{ color: 'var(--text)' }}>{d.count}</b>
                <span style={{ height: `${(d.count / max) * 100}%` }} />
                {SHORT_DAYS[weekdayIndex(d.date)]}
              </div>
            ))}
          </div>
        </section>

        <section className="card stack">
          <h2 className="t-h3">Theo loại công việc</h2>
          {byCat.map(({ c, total, done }) => (
            <div key={c} className="stack" style={{ gap: 6 }}>
              <div className="row between">
                <span className="row"><span style={{ width: 10, height: 10, borderRadius: 3, background: CATEGORY_COLOR[c].c }} />{CATEGORY_LABEL[c]}</span>
                <span className="muted">{done}/{total}</span>
              </div>
              <div className="progress light"><span style={{ width: `${total ? (done / total) * 100 : 0}%`, background: CATEGORY_COLOR[c].c }} /></div>
            </div>
          ))}
        </section>
      </div>

      <div className="row mobile-only">
        <Button
          variant={armed ? 'danger' : 'ghost'}
          className="grow"
          onClick={() => {
            if (!armed) {
              setArmed(true);
              window.setTimeout(() => setArmed(false), 3000);
              return;
            }
            resetData();
            setArmed(false);
            showToast(isDemo ? 'Đã khôi phục dữ liệu mẫu' : 'Đã xoá toàn bộ dữ liệu của bạn');
          }}
        >
          {armed ? 'Bấm lần nữa để xác nhận' : isDemo ? 'Khôi phục dữ liệu mẫu' : 'Xoá dữ liệu'}
        </Button>
        <Button variant="danger" className="grow" icon="logout" onClick={() => { logout(); nav('/login'); }}>Đăng xuất</Button>
      </div>
    </div>
  );
}
