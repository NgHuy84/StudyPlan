import { useId, type CSSProperties } from 'react';
import { Icon } from './Icon';

/** Ngọn lửa SVG – dùng trong thanh streak */
function Flame({ className, style }: { className?: string; style?: CSSProperties }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 32" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-o`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#e5484d" />
          <stop offset=".55" stopColor="#f5a524" />
          <stop offset="1" stopColor="#ffd166" />
        </linearGradient>
        <linearGradient id={`${id}-i`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffd166" />
          <stop offset="1" stopColor="#fff6d6" />
        </linearGradient>
      </defs>
      <path d="M12 1c1.5 5 7 8.5 7 16a7 7 0 0 1-14 0c0-3.5 1.8-5.6 3.3-7 .3 2.2 1.2 3.6 2.6 4.3C10.6 10 11 5.5 12 1Z" fill={`url(#${id}-o)`} />
      <path d="M12 14c.8 2.6 3.5 4.2 3.5 7.6a3.5 3.5 0 0 1-7 0c0-2 1-3.1 1.8-3.8.2 1 .6 1.7 1.2 2 .1-2.3.2-4 .5-5.8Z" fill={`url(#${id}-i)`} />
    </svg>
  );
}

/**
 * Thẻ "Chuỗi ngày" có thanh tiến độ tới kỷ lục.
 * Rê chuột (hoặc chạm trên điện thoại) → lửa bùng lên trong thanh để tăng quyết tâm.
 */
export function StreakCard({ streak, record = 9 }: { streak: number; record?: number }) {
  const best = Math.max(record, streak);
  const pct = best ? Math.min(100, (streak / best) * 100) : 0;
  const left = best - streak;
  const message =
    streak === 0
      ? 'Hoàn thành 1 việc hôm nay để nhóm lửa! 🔥'
      : left > 0
        ? `Còn ${left} ngày nữa là phá kỷ lục! 🔥`
        : 'Bạn đang lập kỷ lục mới! Giữ lửa nhé 🔥';

  return (
    <div className="card stat streak-card" tabIndex={0} aria-label={`Chuỗi ${streak} ngày. ${message}`}>
      <span className="icon streak-icon" style={{ color: 'var(--priority-medium)', background: 'var(--priority-medium-bg)' }}>
        <Icon name="flame" size={20} />
      </span>
      <span className="muted t-caption">Chuỗi ngày</span>
      <span className="value">{streak} ngày</span>

      <div className="streak-bar" role="progressbar" aria-valuenow={streak} aria-valuemin={0} aria-valuemax={best}>
        <div className="streak-fill" style={{ width: `${Math.max(pct, 8)}%` }}>
          {/* các ngọn lửa nhỏ chạy dọc thanh – chỉ hiện khi hover */}
          {Array.from({ length: 7 }, (_, i) => (
            <Flame key={i} className="streak-flame" style={{ left: `${6 + i * 13}%`, animationDelay: `${(i % 4) * 0.13}s` }} />
          ))}
          <span className="streak-ember" />
        </div>
        {/* ngọn lửa lớn ở đầu thanh */}
        <Flame className="streak-tip" style={{ left: `calc(${Math.max(pct, 8)}% - 11px)` }} />
      </div>

      <span className="t-caption muted streak-sub">
        <span className="streak-default">Kỷ lục: {best} ngày</span>
        <span className="streak-hover">{message}</span>
      </span>
    </div>
  );
}
