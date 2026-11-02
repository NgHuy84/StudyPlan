import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useStore } from '../data/store';
import { CATEGORY_LABEL, PRIORITY_LABEL, type Category, type Priority } from '../data/types';
import { Button, Chips } from '../components/ui';
import { Icon } from '../components/Icon';
import { pad } from '../data/date';

const CATS: Category[] = ['study', 'work', 'personal', 'group'];
const PRIOS: Priority[] = ['high', 'medium', 'low'];
const WHEN = ['today', 'tomorrow', 'pick'] as const;
const REMIND = [15, 60, 120, 1440] as const;
const remindLabel = (m: number) => (m >= 1440 ? 'Trước 1 ngày' : m >= 60 ? `Trước ${m / 60} giờ` : `Trước ${m} phút`);

/* 02 · Thêm việc nhanh – bottom sheet mở từ nút "+" */
export function QuickAddSheet() {
  const { quickAddOpen, setQuickAddOpen, addTask, subjects, showToast } = useStore();
  const [title, setTitle] = useState('');
  const [cat, setCat] = useState<Category>('study');
  const [when, setWhen] = useState<(typeof WHEN)[number]>('tomorrow');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('20:00');
  const [prio, setPrio] = useState<Priority>('high');
  const [subjectId, setSubjectId] = useState('');
  const [remind, setRemind] = useState<number>(60);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (quickAddOpen) {
      setTitle('');
      if (!subjects.some((s) => s.id === subjectId)) setSubjectId(subjects[0]?.id ?? '');
      setErr('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [quickAddOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setQuickAddOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setQuickAddOpen]);

  if (!quickAddOpen) return null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErr('Hãy nhập tên công việc');
      inputRef.current?.focus();
      return;
    }
    const d = new Date();
    if (when === 'tomorrow') d.setDate(d.getDate() + 1);
    if (when === 'pick') {
      const [y, m, dd] = date.split('-').map(Number);
      d.setFullYear(y, m - 1, dd);
    }
    const [h, mi] = time.split(':').map(Number);
    d.setHours(h, mi, 0, 0);
    addTask({
      title: title.trim(),
      category: cat,
      priority: prio,
      subjectId: (cat === 'study' || cat === 'group') && subjectId ? subjectId : undefined,
      due: d.toISOString(),
      remindBefore: remind,
    });
    setQuickAddOpen(false);
    showToast(`Đã thêm “${title.trim()}” · nhắc lúc ${pad(new Date(d.getTime() - remind * 60000).getHours())}:${pad(new Date(d.getTime() - remind * 60000).getMinutes())}`);
  };

  return (
    <div className="overlay" onClick={() => setQuickAddOpen(false)}>
      <form className="sheet stack-lg" onClick={(e) => e.stopPropagation()} onSubmit={submit} role="dialog" aria-modal="true" aria-label="Thêm việc mới" noValidate>
        <div className="grabber" />
        <div className="row between">
          <h2 className="t-h2" style={{ fontWeight: 700 }}>Thêm việc mới</h2>
          <button type="button" className="icon-btn" aria-label="Đóng" onClick={() => setQuickAddOpen(false)}><Icon name="x" /></button>
        </div>

        <div className="field">
          <label htmlFor="qa-title">Tên công việc</label>
          <input id="qa-title" ref={inputRef} className={`input ${err ? 'error' : ''}`} placeholder="VD: Ôn thi giữa kỳ Cấu trúc dữ liệu" value={title} onChange={(e) => { setTitle(e.target.value); setErr(''); }} />
          {err && <span className="field-error">{err}</span>}
        </div>

        <div className="field">
          <label>Loại công việc</label>
          <Chips options={CATS} value={cat} onChange={setCat} render={(c) => CATEGORY_LABEL[c]} />
        </div>

        <div className="field">
          <label>Hạn hoàn thành</label>
          <Chips options={WHEN} value={when} onChange={setWhen} render={(w) => ({ today: 'Hôm nay', tomorrow: 'Ngày mai', pick: 'Chọn ngày' })[w]} />
          <div className="row" style={{ marginTop: 4 }}>
            {when === 'pick' && <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Ngày" />}
            <input type="time" className="input" style={{ maxWidth: 140 }} value={time} onChange={(e) => setTime(e.target.value)} aria-label="Giờ" />
          </div>
        </div>

        <div className="field">
          <label>Mức ưu tiên</label>
          <Chips options={PRIOS} value={prio} onChange={setPrio} render={(p) => (<><span className={`badge-dot badge-${p}`} style={{ background: 'transparent', padding: 0 }} />{PRIORITY_LABEL[p]}</>)} />
        </div>

        {(cat === 'study' || cat === 'group') && (
          <div className="field">
            <label htmlFor="qa-subject">Môn học</label>
            <select id="qa-subject" className="input" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
              <option value="">— Không chọn môn —</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div className="field">
          <label>Nhắc nhở</label>
          <Chips options={REMIND.map(String) as string[]} value={String(remind)} onChange={(v) => setRemind(Number(v))} render={(v) => remindLabel(Number(v))} />
        </div>

        <div className="row">
          <Button type="button" variant="ghost" className="grow" onClick={() => setQuickAddOpen(false)}>Hủy</Button>
          <Button type="submit" className="grow" style={{ flex: 2 }}>Lưu công việc</Button>
        </div>
      </form>
    </div>
  );
}
