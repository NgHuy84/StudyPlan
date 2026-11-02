import { useState, type FormEvent } from 'react';
import { useStore } from '../data/store';
import { Button, Field, Sheet } from '../components/ui';

/** Bảng màu cho môn học – lấy từ style guide */
const COLORS = [
  { c: 'var(--cat-study)', bg: 'var(--cat-study-bg)', name: 'Xanh dương' },
  { c: 'var(--cat-group)', bg: 'var(--cat-group-bg)', name: 'Tím' },
  { c: 'var(--priority-medium)', bg: 'var(--priority-medium-bg)', name: 'Cam' },
  { c: 'var(--cat-personal)', bg: 'var(--cat-personal-bg)', name: 'Xanh lá' },
  { c: 'var(--priority-high)', bg: 'var(--priority-high-bg)', name: 'Đỏ' },
  { c: 'var(--indigo-500)', bg: 'var(--indigo-50)', name: 'Chàm' },
];

/* Chức năng mới · Thêm môn học */
export function AddSubjectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addSubject, showToast } = useStore();
  const [name, setName] = useState('');
  const [teacher, setTeacher] = useState('');
  const [schedule, setSchedule] = useState('');
  const [milestone, setMilestone] = useState('');
  const [color, setColor] = useState(0);
  const [err, setErr] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr('Hãy nhập tên môn học');
    addSubject({
      name: name.trim(),
      teacher: teacher.trim() || 'Chưa có giảng viên',
      schedule: schedule.trim() || 'Chưa có lịch',
      milestone: milestone.trim() || 'Chưa có mốc',
      color: COLORS[color].c,
      bg: COLORS[color].bg,
    });
    showToast(`Đã thêm môn “${name.trim()}”`);
    setName(''); setTeacher(''); setSchedule(''); setMilestone(''); setErr('');
    onClose();
  };

  return (
    <Sheet open={open} title="Thêm môn học" onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="sj-name" label="Tên môn học" placeholder="VD: Cơ sở dữ liệu" value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} error={err} autoFocus />
        <Field id="sj-teacher" label="Giảng viên" placeholder="VD: GV. Trần Minh" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
        <Field id="sj-schedule" label="Lịch học & phòng" placeholder="VD: T2, T4 · A2.04" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
        <Field id="sj-mile" label="Mốc quan trọng" placeholder="VD: Thi 18/11" value={milestone} onChange={(e) => setMilestone(e.target.value)} />
        <div className="field">
          <label>Màu môn học</label>
          <div className="row wrap" role="radiogroup">
            {COLORS.map((c, i) => (
              <button key={i} type="button" role="radio" aria-checked={color === i} aria-label={c.name}
                className={`swatch ${color === i ? 'active' : ''}`} style={{ background: c.c }} onClick={() => setColor(i)} />
            ))}
          </div>
        </div>
        <div className="row" style={{ marginTop: 8 }}>
          <Button type="button" variant="ghost" className="grow" onClick={onClose}>Hủy</Button>
          <Button type="submit" className="grow" style={{ flex: 2 }}>Lưu môn học</Button>
        </div>
      </form>
    </Sheet>
  );
}
