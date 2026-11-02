import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../data/store';
import { dueLabel, isSameDay, pad, remaining, timeOf } from '../data/date';
import { Button, CategoryBadge, Checkbox, PinButton, PriorityBadge, Progress } from '../components/ui';
import { Icon, type IconName } from '../components/Icon';

/* 05 · Chi tiết công việc */
export function TaskDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { tasks, subjects, toggleTask, toggleSubtask, updateTask, deleteTask, togglePinTask, showToast } = useStore();
  const task = tasks.find((t) => t.id === id);
  const [newSub, setNewSub] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) {
    return (
      <div className="card empty">
        Không tìm thấy công việc. <a href="#" onClick={(e) => { e.preventDefault(); nav('/'); }}>Về Hôm nay</a>
      </div>
    );
  }

  const subject = subjects.find((s) => s.id === task.subjectId);
  const due = new Date(task.due);
  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const remindAt = new Date(due.getTime() - task.remindBefore * 60000);
  const dayText = isSameDay(due, new Date()) ? `Hôm nay, ${pad(due.getDate())}/${pad(due.getMonth() + 1)}` : dueLabel(task.due);

  const info: { icon: IconName; label: string; value: string; extra?: string }[] = [
    { icon: 'clock', label: 'Hạn nộp', value: `${timeOf(task.due)} · ${dayText}`, extra: task.done ? undefined : remaining(task.due) },
    ...(subject ? [{ icon: 'book' as IconName, label: 'Môn học', value: subject.name }] : []),
    { icon: 'bell', label: 'Nhắc nhở', value: `Trước ${task.remindBefore >= 60 ? `${task.remindBefore / 60} giờ` : `${task.remindBefore} phút`} (${timeOf(remindAt.toISOString())})` },
  ];

  return (
    <div className="stack-lg" style={{ maxWidth: 720 }}>
      <div className="row between">
        <button className="icon-btn" aria-label="Quay lại" onClick={() => nav(-1)}><Icon name="back" /></button>
        <span className="t-h3">Chi tiết công việc</span>
        <div className="row">
        <PinButton
          pinned={task.pinned}
          name={task.title}
          onToggle={() => {
            togglePinTask(task.id);
            showToast(task.pinned ? 'Đã bỏ ghim công việc' : 'Đã ghim công việc lên đầu 📌');
          }}
        />
        {/* xoá 2 bước: bấm lần 1 để hỏi lại, bấm lần 2 trong 3 giây để xoá (không dùng confirm() của trình duyệt) */}
        <button
          className={`icon-btn ${confirmDelete ? 'danger-armed' : ''}`}
          aria-label={confirmDelete ? 'Bấm lần nữa để xoá' : 'Xoá công việc'}
          title={confirmDelete ? 'Bấm lần nữa để xoá' : 'Xoá công việc'}
          onClick={() => {
            if (confirmDelete) {
              deleteTask(task.id);
              showToast('Đã xoá công việc');
              nav('/');
            } else {
              setConfirmDelete(true);
              showToast('Bấm biểu tượng thùng rác lần nữa để xoá');
              window.setTimeout(() => setConfirmDelete(false), 3000);
            }
          }}
        >
          <Icon name="trash" />
        </button>
        </div>
      </div>

      <div className="stack">
        <div className="row">
          <PriorityBadge priority={task.priority} />
          <CategoryBadge category={task.category} />
          {task.done && <span className="badge badge-low">Đã hoàn thành</span>}
          {task.pinned && <span className="badge badge-neutral"><Icon name="pin" size={12} /> Đã ghim</span>}
        </div>
        {editing ? (
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) updateTask(task.id, { title: draft.trim() });
              setEditing(false);
            }}
          >
            <input className="input t-h3" autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} aria-label="Tên công việc"
              onKeyDown={(e) => e.key === 'Escape' && setEditing(false)} />
            <Button type="submit" small>Lưu</Button>
            <Button type="button" variant="ghost" small onClick={() => setEditing(false)}>Huỷ</Button>
          </form>
        ) : (
          <h1 className="t-h1" style={{ textDecoration: task.done ? 'line-through' : undefined }} onDoubleClick={() => { setDraft(task.title); setEditing(true); }}>{task.title}</h1>
        )}
      </div>

      <div className="card stack" style={{ gap: 0, padding: 0 }}>
        {info.map((it, i) => (
          <div key={it.label} className="row" style={{ padding: '14px 16px', borderTop: i ? '1px solid var(--border)' : 0 }}>
            <span className="subject-icon" style={{ width: 36, height: 36, background: 'var(--indigo-50)', color: 'var(--primary)' }}><Icon name={it.icon} size={18} /></span>
            <div className="grow">
              <div className="t-caption muted">{it.label}</div>
              <div style={{ fontWeight: 600 }}>{it.value}</div>
            </div>
            {it.extra && <span className="badge badge-high">{it.extra}</span>}
          </div>
        ))}
      </div>

      <section className="stack">
        <h2 className="t-h3">Mô tả</h2>
        <textarea
          className="input"
          style={{ minHeight: 96, padding: 12, resize: 'vertical' }}
          placeholder="Thêm ghi chú cho công việc…"
          value={task.description ?? ''}
          onChange={(e) => updateTask(task.id, { description: e.target.value })}
        />
      </section>

      <section className="stack">
        <div className="row between">
          <h2 className="t-h3">Việc con</h2>
          <span className="muted">{doneSubs}/{task.subtasks.length}</span>
        </div>
        {task.subtasks.length > 0 && <Progress value={(doneSubs / task.subtasks.length) * 100} light />}
        {task.subtasks.map((s) => (
          <div key={s.id} className="row" style={{ minHeight: 44 }}>
            <Checkbox checked={s.done} label={s.title} onChange={() => toggleSubtask(task.id, s.id)} />
            <span style={{ textDecoration: s.done ? 'line-through' : undefined, color: s.done ? 'var(--text-secondary)' : undefined }}>{s.title}</span>
          </div>
        ))}
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newSub.trim()) return;
            updateTask(task.id, { subtasks: [...task.subtasks, { id: String(Date.now()), title: newSub.trim(), done: false }] });
            setNewSub('');
          }}
        >
          <input className="input" placeholder="+ Thêm việc con" value={newSub} onChange={(e) => setNewSub(e.target.value)} />
        </form>
      </section>

      {!task.done && (
        <Button variant="secondary" icon="timer" block onClick={() => nav(`/focus/${task.id}`)}>
          Tập trung làm việc này (Pomodoro)
        </Button>
      )}

      <div className="row">
        <Button variant="ghost" icon="edit" className="grow" onClick={() => { setDraft(task.title); setEditing(true); }}>Sửa tên</Button>
        <Button
          icon="check"
          className="grow"
          style={{ flex: 2 }}
          variant={task.done ? 'secondary' : 'primary'}
          onClick={() => {
            toggleTask(task.id);
            showToast(task.done ? 'Đã mở lại công việc' : 'Tuyệt! Đã hoàn thành 1 việc 🎉');
          }}
        >
          {task.done ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu hoàn thành'}
        </Button>
      </div>
    </div>
  );
}
