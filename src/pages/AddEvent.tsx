import { useState, type FormEvent } from 'react';
import { useStore } from '../data/store';
import { CATEGORY_LABEL, type Category } from '../data/types';
import { toMinutes } from '../data/date';
import { Button, Chips, Field, Sheet } from '../components/ui';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const CATS: Category[] = ['study', 'work', 'personal', 'group'];

/* Chức năng mới · Thêm lịch học / ca làm (lặp lại hằng tuần) */
export function AddEventSheet({ open, onClose, defaultDay = 0 }: { open: boolean; onClose: () => void; defaultDay?: number }) {
  const { addEvent, showToast } = useStore();
  const [title, setTitle] = useState('');
  const [place, setPlace] = useState('');
  const [cat, setCat] = useState<Category>('study');
  const [days, setDays] = useState<number[]>([defaultDay]);
  const [start, setStart] = useState('07:00');
  const [end, setEnd] = useState('09:30');
  const [err, setErr] = useState<{ title?: string; time?: string; days?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!title.trim()) next.title = 'Hãy nhập tên lịch';
    if (toMinutes(end) <= toMinutes(start)) next.time = 'Giờ kết thúc phải sau giờ bắt đầu';
    if (days.length === 0) next.days = 'Chọn ít nhất 1 ngày trong tuần';
    setErr(next);
    if (Object.keys(next).length) return;
    days.forEach((day) => addEvent({ title: title.trim(), place: place.trim() || '—', category: cat, day, start, end }));
    showToast(`Đã thêm “${title.trim()}” vào lịch (${days.map((d) => DAYS[d]).join(', ')})`);
    setTitle(''); setPlace('');
    onClose();
  };

  return (
    <Sheet open={open} title="Thêm lịch học / ca làm" onClose={onClose}>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="ev-title" label="Tên" placeholder="VD: Lập trình Java" value={title} onChange={(e) => setTitle(e.target.value)} error={err.title} autoFocus />
        <Field id="ev-place" label="Địa điểm" placeholder="VD: Phòng A2.04" value={place} onChange={(e) => setPlace(e.target.value)} />
        <div className="field">
          <label>Loại</label>
          <Chips options={CATS} value={cat} onChange={setCat} render={(c) => CATEGORY_LABEL[c]} />
        </div>
        <div className="field">
          <label>Lặp lại vào</label>
          <div className="chips">
            {DAYS.map((d, i) => (
              <button key={d} type="button" aria-pressed={days.includes(i)} className={`chip ${days.includes(i) ? 'active' : ''}`}
                onClick={() => setDays((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i].sort()))}>{d}</button>
            ))}
          </div>
          {err.days && <span className="field-error">{err.days}</span>}
        </div>
        <div className="row">
          <div className="field grow">
            <label htmlFor="ev-start">Bắt đầu</label>
            <input id="ev-start" type="time" className="input" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="field grow">
            <label htmlFor="ev-end">Kết thúc</label>
            <input id="ev-end" type="time" className={`input ${err.time ? 'error' : ''}`} value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        {err.time && <span className="field-error">{err.time}</span>}
        <div className="row" style={{ marginTop: 8 }}>
          <Button type="button" variant="ghost" className="grow" onClick={onClose}>Hủy</Button>
          <Button type="submit" className="grow" style={{ flex: 2 }}>Lưu vào lịch</Button>
        </div>
      </form>
    </Sheet>
  );
}
