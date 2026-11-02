import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DEMO_EMAIL, useStore } from '../data/store';
import { Icon } from '../components/Icon';
import { Button, Field } from '../components/ui';

const REMEMBER_KEY = 'studyplan.rememberEmail';
const ACCOUNTS_KEY = 'studyplan.accounts';

function readRemembered(): string {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Lưu tên của tài khoản vừa đăng ký để lần sau đăng nhập hiện đúng tên */
function saveAccount(email: string, name: string) {
  try {
    const all = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '{}') as Record<string, string>;
    all[email.toLowerCase()] = name;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

/** Tên hiển thị: lấy từ tài khoản đã đăng ký, nếu không có thì suy ra từ email (vd: an.tran@… → "Tran An") */
function nameFor(email: string): string {
  try {
    const all = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '{}') as Record<string, string>;
    if (all[email.toLowerCase()]) return all[email.toLowerCase()];
  } catch {
    /* ignore */
  }
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim();
  // email thường dạng ten.ho → đảo lại thành "Ho Ten" để lời chào gọi đúng tên
  return local ? local.split(' ').reverse().map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Sinh viên';
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <div className="auth-aside">
        <div className="brand" style={{ color: '#fff', padding: 0 }}>
          <span className="brand-logo" style={{ background: 'rgba(255,255,255,.2)' }}><Icon name="check" size={20} /></span>
          StudyPlan
        </div>
        <h2 style={{ fontSize: 40, lineHeight: '50px', fontWeight: 700 }}>
          Quản lý thời gian
          <br />
          Học hiệu quả hơn
        </h2>
        <p style={{ opacity: 0.85, maxWidth: 420, fontSize: 16, lineHeight: '26px' }}>
          Lịch học, ca làm và deadline ở cùng một nơi. Biết ngay việc nào cần làm trước, nhận nhắc nhở đúng lúc
          và giữ chuỗi ngày học tập của bạn.
        </p>
        <div className="row" style={{ gap: 24 }}>
          {[['12', 'việc mỗi tuần'], ['92%', 'đúng hạn'], ['4 ngày', 'chuỗi liên tiếp']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{v}</div>
              <div style={{ opacity: 0.8, fontSize: 13 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="auth-form">
        <div className="brand mobile-only" style={{ padding: 0 }}>
          <span className="brand-logo"><Icon name="check" size={20} /></span>
          StudyPlan
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- 00 · Đăng nhập ---------- */
export function LoginPage() {
  const { login } = useStore();
  const nav = useNavigate();
  // không điền sẵn email; chỉ nhớ email khi người dùng đã tick "Ghi nhớ đăng nhập"
  const [email, setEmail] = useState(() => readRemembered());
  const [pw, setPw] = useState('');
  const [remember, setRemember] = useState(() => !!readRemembered());
  const [err, setErr] = useState<{ email?: string; pw?: string }>({});
  const [info, setInfo] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof err = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Email chưa đúng định dạng';
    if (pw.length < 1) next.pw = 'Vui lòng nhập mật khẩu';
    setErr(next);
    if (Object.keys(next).length) return;
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* ignore */
    }
    login({ name: nameFor(email.trim()), email: email.trim() });
    nav('/');
  };

  return (
    <AuthLayout>
      <div>
        <h1 className="t-h1">Chào mừng trở lại!</h1>
        <p className="muted" style={{ marginTop: 6 }}>Đăng nhập để xem lịch học, ca làm và deadline của bạn hôm nay.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="email" label="Email" type="email" placeholder="ten.sinhvien@iuh.edu.vn" value={email} onChange={(e) => setEmail(e.target.value)} error={err.email} autoComplete="email" />
        <Field id="pw" label="Mật khẩu" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} error={err.pw} autoComplete="current-password" />
        <div className="row between">
          <label className="row" style={{ cursor: 'pointer', minHeight: 44 }}>
            <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} />
            Ghi nhớ đăng nhập
          </label>
          <a href="#" onClick={(e) => e.preventDefault()}>Quên mật khẩu?</a>
        </div>
        <Button type="submit" block>Đăng nhập</Button>
        <div className="divider">hoặc</div>
        {info && <p className="field-hint" role="status" style={{ textAlign: 'center' }}>{info}</p>}
        <Button type="button" variant="ghost" block icon="qr" onClick={() => setInfo('Tính năng quét mã QR thẻ sinh viên đang được phát triển.')}>
          Đăng nhập bằng mã QR thẻ sinh viên
        </Button>
      </form>
      <p className="muted" style={{ textAlign: 'center' }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
      <div className="demo-hint">
        <Icon name="sparkle" size={18} />
        <span className="grow t-caption">
          Muốn xem thử với dữ liệu mẫu? Dùng tài khoản demo <b>{DEMO_EMAIL}</b> (mật khẩu bất kỳ).
        </span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEmail(DEMO_EMAIL); setPw('demo'); setErr({}); }}>
          Dùng demo
        </button>
      </div>
    </AuthLayout>
  );
}

/* ---------- 00B · Đăng ký tài khoản ---------- */
export function RegisterPage() {
  const { login } = useStore();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [agree, setAgree] = useState(false);
  const [tried, setTried] = useState(false);

  const rules = [
    { ok: pw.length >= 8, text: 'Ít nhất 8 ký tự' },
    { ok: /\d/.test(pw), text: 'Có ít nhất 1 chữ số' },
    { ok: /[A-ZÀ-Ỹ]/.test(pw), text: 'Có ít nhất 1 chữ in hoa' },
  ];
  const errors = {
    name: !name.trim() ? 'Vui lòng nhập họ và tên' : undefined,
    email: !/^\S+@\S+\.\S+$/.test(email) ? 'Email chưa đúng định dạng' : undefined,
  };
  const valid = !errors.name && !errors.email && rules.every((r) => r.ok) && agree;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!valid) return;
    saveAccount(email.trim(), name.trim());
    login({ name: name.trim(), email: email.trim() });
    nav('/');
  };

  return (
    <AuthLayout>
      <div>
        <span className="badge badge-neutral">Bước 1/2</span>
        <h1 className="t-h1" style={{ marginTop: 10 }}>Tạo tài khoản</h1>
        <p className="muted" style={{ marginTop: 6 }}>Chỉ mất 1 phút để bắt đầu sắp xếp việc học và việc làm.</p>
      </div>
      <form className="stack" onSubmit={submit} noValidate>
        <Field id="name" label="Họ và tên" placeholder="Nguyễn Văn A" value={name} onChange={(e) => setName(e.target.value)} error={tried ? errors.name : undefined} />
        <Field id="remail" label="Email trường" placeholder="ten@iuh.edu.vn" value={email} onChange={(e) => setEmail(e.target.value)}
          hint="Dùng email trường để tự đồng bộ thời khoá biểu" error={tried ? errors.email : undefined} />
        <Field id="rpw" label="Mật khẩu" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <ul className="stack" style={{ gap: 4, padding: 0, margin: 0, listStyle: 'none' }}>
          {rules.map((r) => (
            <li key={r.text} className={`row t-caption ${r.ok ? 'rule-ok' : 'muted'}`}>
              <Icon name={r.ok ? 'check' : 'x'} size={14} /> {r.text}
            </li>
          ))}
        </ul>
        <label className="row" style={{ alignItems: 'flex-start', cursor: 'pointer' }}>
          <input type="checkbox" checked={agree} onChange={() => setAgree(!agree)} style={{ width: 18, height: 18, marginTop: 2, accentColor: 'var(--primary)' }} />
          <span className="t-caption" style={{ fontSize: 13 }}>
            Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a> của StudyPlan.
          </span>
        </label>
        {tried && !agree && <span className="field-error">Bạn cần đồng ý với điều khoản để tiếp tục</span>}
        <Button type="submit" block>Tiếp tục</Button>
      </form>
      <p className="muted" style={{ textAlign: 'center' }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </AuthLayout>
  );
}
