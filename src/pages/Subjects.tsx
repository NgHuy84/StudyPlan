import { useState } from 'react';
import { useStore } from '../data/store';
import { PRIORITY_LABEL, PRIORITY_ORDER, type Priority } from '../data/types';
import { TaskCard } from '../components/TaskCard';
import { Icon } from '../components/Icon';
import { Button, Chips, DeleteButton, PageHead, PinButton, Progress } from '../components/ui';
import { AddSubjectSheet } from './AddSubject';

type Filter = 'all' | 'deadline' | 'pinned';

/* 04 · Không gian môn học  ·  09 · Công việc và môn học (web) */
export function SubjectsPage() {
  const { subjects, tasks, togglePinSubject, deleteSubject, showToast } = useStore();
  const [adding, setAdding] = useState(false);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [prio, setPrio] = useState<'all' | Priority>('all');

  const withStats = subjects.map((s) => {
    const ts = tasks.filter((t) => t.subjectId === s.id);
    const done = ts.filter((t) => t.done).length;
    return { ...s, total: ts.length, open: ts.length - done, pct: ts.length ? Math.round((done / ts.length) * 100) : 0 };
  });

  const list = withStats
    .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()))
    .filter((s) => (filter === 'deadline' ? s.open > 0 : filter === 'pinned' ? s.pinned : true))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));

  const taskList = tasks
    .filter((t) => !t.done)
    .filter((t) => (selected ? t.subjectId === selected : true))
    .filter((t) => (prio === 'all' ? true : t.priority === prio))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || a.due.localeCompare(b.due));

  return (
    <div>
      <PageHead eyebrow="Học kỳ 1 · 2026–2027" title="Môn học" right={<Button icon="plus" small onClick={() => setAdding(true)}>Thêm môn</Button>} />
      <AddSubjectSheet open={adding} onClose={() => setAdding(false)} />
      <div className="web-grid stack-lg">
        <div className="stack">
          <label className="search">
            <Icon name="search" />
            <input placeholder="Tìm môn học, ghi chú, tài liệu…" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <Chips
            options={['all', 'deadline', 'pinned'] as Filter[]}
            value={filter}
            onChange={setFilter}
            render={(f) => ({ all: `Tất cả · ${subjects.length}`, deadline: 'Có deadline', pinned: `Đã ghim · ${subjects.filter((s) => s.pinned).length}` })[f]}
          />
          {list.map((s) => (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              className={`card subject-card ${s.pinned ? 'is-pinned' : ''}`}
              style={{ textAlign: 'left', outline: selected === s.id ? '2px solid var(--primary)' : undefined }}
              onClick={() => setSelected(selected === s.id ? null : s.id)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(selected === s.id ? null : s.id)}
              aria-pressed={selected === s.id}
            >
              <div className="row">
                <span className="subject-icon" style={{ color: s.color, background: s.bg }}><Icon name="book" /></span>
                <div className="grow">
                  <div className="t-h3">{s.name}</div>
                  <div className="t-caption muted">{s.teacher} · {s.schedule}</div>
                </div>
                <DeleteButton
                  small
                  label={s.name}
                  onDelete={() => {
                    deleteSubject(s.id);
                    if (selected === s.id) setSelected(null);
                    showToast(`Đã xoá môn “${s.name}”`);
                  }}
                />
                <PinButton
                  pinned={s.pinned}
                  name={s.name}
                  onToggle={() => {
                    togglePinSubject(s.id);
                    showToast(s.pinned ? `Đã bỏ ghim “${s.name}”` : `Đã ghim “${s.name}” lên đầu 📌`);
                  }}
                />
              </div>
              <div className="row">
                <div className="grow"><Progress value={s.pct} light /></div>
                <span style={{ fontWeight: 600 }}>{s.pct}%</span>
              </div>
              <div className="row wrap">
                {s.open > 0 && <span className="badge badge-neutral"><Icon name="check" size={12} /> {s.open} việc</span>}
                <span className="badge badge-neutral"><Icon name="note" size={12} /> {s.notes} ghi chú</span>
                <span className="badge badge-high">{s.milestone}</span>
              </div>
            </div>
          ))}
          {subjects.length === 0 && (
            <div className="card empty stack" style={{ alignItems: 'center' }}>
              <span className="subject-icon" style={{ color: 'var(--primary)', background: 'var(--indigo-50)' }}><Icon name="book" /></span>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>Chưa có môn học nào</div>
              <div>Thêm các môn của học kỳ này để gom bài tập, deadline và theo dõi tiến độ theo từng môn.</div>
              <Button icon="plus" onClick={() => setAdding(true)}>Thêm môn học đầu tiên</Button>
            </div>
          )}
          {subjects.length > 0 && list.length === 0 && <div className="card empty">Không tìm thấy môn học phù hợp</div>}
        </div>

        <section className="stack">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2 className="t-h2">{selected ? `Việc của môn ${subjects.find((s) => s.id === selected)?.name}` : 'Tất cả công việc'}</h2>
            <span className="muted">{taskList.length} việc</span>
          </div>
          <Chips
            options={['all', 'high', 'medium', 'low'] as ('all' | Priority)[]}
            value={prio}
            onChange={setPrio}
            render={(p) => (p === 'all' ? 'Mọi mức' : PRIORITY_LABEL[p])}
          />
          {taskList.map((t) => <TaskCard key={t.id} task={t} />)}
          {taskList.length === 0 && <div className="card empty">Không có việc nào đang chờ 🎉</div>}
        </section>
      </div>
    </div>
  );
}
