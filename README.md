# StudyPlan

Ứng dụng quản lý thời gian và công việc cho sinh viên, viết bằng **React + Vite + TypeScript**. Giao diện bám theo thiết kế Figma *"Wireframe – Quản lý thời gian sinh viên"*, trang **🎨 UI Design – StudyPlan** (nhóm 11).

## Chạy dự án

Yêu cầu: **Node.js 18 trở lên** (kiểm tra bằng lệnh `node -v`).

```bash
npm install     # cài thư viện, chỉ cần chạy lần đầu
npm run dev     # chạy ở http://localhost:5173
```

Trong VS Code, mở thư mục `StudyPlan` bằng **File → Open Folder**, mở Terminal bằng `` Ctrl+` `` rồi gõ hai lệnh trên.

- Tài khoản demo: ô email đã điền sẵn, mật khẩu nhập bất kỳ rồi bấm **Đăng nhập**.
- Xem giao diện mobile: thu hẹp cửa sổ trình duyệt xuống dưới 960px, hoặc nhấn F12 rồi bật chế độ thiết bị (Ctrl+Shift+M).
- Xem giao diện website: mở cửa sổ rộng từ 960px trở lên. App sẽ chuyển sang sidebar và bố cục Tổng quan.

Dữ liệu được lưu trong `localStorage` của trình duyệt. Muốn khôi phục dữ liệu mẫu, vào **Tiến độ → Dữ liệu mẫu** trên giao diện mobile, hoặc xoá localStorage.

## Màn hình và đường dẫn

| Figma | Mobile | Website | Đường dẫn |
|---|---|---|---|
| 00 / 11 | Đăng nhập | Đăng nhập (2 cột) | `/login` |
| 00B / 12 | Đăng ký tài khoản | Tạo tài khoản | `/register` |
| 01 / 07 | Hôm nay | Tổng quan | `/` |
| 02 | Thêm việc nhanh (bottom sheet) | Hộp thoại | nút **+** |
| 03 / 08 | Lịch học và công việc | Lịch của tôi (tuần) | `/calendar` |
| 04 / 09 | Không gian môn học | Công việc và môn học | `/subjects` |
| 05 | Chi tiết công việc | ← | `/task/:id` |
| 06 / 10 | Tiến độ | Tiến độ | `/progress` |

## Cấu trúc thư mục

```
src/
├── styles/
│   ├── tokens.css      # Design tokens theo Style Guide: màu, font, bo góc, khoảng cách
│   └── global.css      # Style cho các component và bố cục responsive
├── components/
│   ├── Icon.tsx        # Bộ icon nét đều
│   ├── ui.tsx          # Button, Badge, Checkbox, Input (Field), Chips, StatCard, Progress
│   ├── TaskCard.tsx    # Task Card
│   └── Navigation.tsx  # Tab Bar (mobile) + Sidebar / Nav Item (website)
├── data/
│   ├── types.ts        # Kiểu dữ liệu, nhãn ưu tiên và loại công việc
│   ├── seed.ts         # Dữ liệu mẫu
│   ├── store.tsx       # State toàn cục (React Context + localStorage)
│   └── date.ts         # Hàm xử lý ngày giờ tiếng Việt
└── pages/              # Các màn hình
```

## Style Guide được áp dụng

- **Màu chính:** Indigo `#4F5BD5`.
- **Mức ưu tiên:** Gấp `#E5484D`, Trung bình `#F5A524`, Thấp `#2FB36B`.
- **Loại công việc:** Học tập `#2E90FA`, Công việc `#F5A524`, Nhóm `#8B5CF6`, Cá nhân `#2FB36B`.
- **Font:** Be Vietnam Pro (400/500/600/700), thang chữ 32/26/20/17/16/14/12.
- **Bo góc:** 8 (checkbox) · 12 (nút) · 16 (thẻ) · 24 (sheet) · 999 (badge).
- **Khoảng cách:** lưới 4px; vùng chạm tối thiểu 44px.
