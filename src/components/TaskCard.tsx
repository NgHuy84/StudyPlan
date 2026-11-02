import { useNavigate } from 'react-router-dom';
import { useStore } from '../data/store';
import { dueLabel } from '../data/date';
import { PRIORITY_COLOR, type Task } from '../data/types';
import { Icon } from './Icon';
import { Checkbox, PinButton, PriorityBadge, cssVars } from './ui';

export function TaskCard({ task }: { task: Task }) {
  const { subjects, toggleTask, togglePinTask, showToast } = useStore();
  const nav = useNavigate();
  const subject = subjects.find((s) => s.id === task.subjectId);

  return (
    <div
      className={`task-card ${task.done ? 'done' : ''}`}
      style={cssVars({ '--accent': task.done ? 'var(--neutral-100)' : PRIORITY_COLOR[task.priority] })}
      onClick={() => nav(`/task/${task.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && nav(`/task/${task.id}`)}
    >
      <Checkbox
        checked={task.done}
        label={`Đánh dấu hoàn thành: ${task.title}`}
        onChange={() => {
          toggleTask(task.id);
          if (!task.done) showToast('Tuyệt! Đã hoàn thành 1 việc 🎉');
        }}
      />
      <div className="grow">
        <div className="title">{task.title}</div>
        <div className="meta">
          <Icon name="clock" size={13} />
          {dueLabel(task.due)}
          {subject && <> · {subject.name}</>}
        </div>
      </div>
      {task.done ? <span className="badge badge-low">Đã xong</span> : <PriorityBadge priority={task.priority} />}
      <PinButton
        small
        pinned={task.pinned}
        name={task.title}
        onToggle={() => {
          togglePinTask(task.id);
          showToast(task.pinned ? 'Đã bỏ ghim công việc' : 'Đã ghim công việc lên đầu 📌');
        }}
      />
    </div>
  );
}
