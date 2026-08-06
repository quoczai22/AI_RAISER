# Local Status - AI Scam Inoculation

Ngay cap nhat: 2026-08-05

File nay la ghi chu local ngoai luong theo yeu cau cua ban. File da nam trong `.gitignore`, hien khong bi Git track, khong push len GitHub.

## Tom Tat Nhanh

- Repo hien o branch `master`, remote `origin/master`.
- Commit da push moi nhat: `d934eea docs: record mobile browser verification`.
- Worktree hien **chua sach**: co 6 file source/test dang bi sua nhung chua commit, chua push.
- Unit/implementation test moi nhat: **pass**.
- HTTP smoke test moi nhat: **pass**.
- Gemini local da tung xac minh chay that voi `provider=gemini`, model `gemini-3.6-flash`.
- Mobile browser QA co ban da xac minh o viewport `390x844`.

## Da Lam Va Da Push

### Tai lieu va dinh huong

- Hoan thanh cac file phase/docs chinh:
  - `Research.md`
  - `PRD.md`
  - `TechnicalDesign.md`
  - `AIDesign.md`
  - `UI.md`
  - `Testing.md`
  - `Presentation.md`
  - `RiskReport.md`
  - `README.md`
- Giu dung scope: app huan luyen mien dich lua dao, khong phai he thong detection.
- Giu Gemini la AI chinh cua san pham.
- `AGENTS.md` da rut gon thanh ban minimal, lam single source of truth cho reviewer/manager.

### MVP app

- App Node.js + static UI, khong dung framework nang.
- Flow chinh da co:
  - nhap ten
  - dashboard
  - chon scenario + level
  - single consent
  - roleplay chat
  - stop/complete
  - analysis + score
  - dashboard/history
  - share summary nhe
- Voice input Web Speech API da bi go bo khoi MVP vi khong on dinh cho demo.
- UI da co:
  - nut lon
  - chu to
  - tuong phan cao
  - nut Stop luon hien trong chat
  - mobile layout da test co ban bang browser viewport `390x844`

### Gemini / AI

- `src/services/geminiClient.server.js` server-side only.
- Model bi khoa ve `gemini-3.6-flash`.
- Khong gui `temperature`, `top_p`, `top_k`.
- Structured JSON output va safety validation truoc khi hien thi.
- Co fallback an toan khi Gemini loi, timeout hoac quota/rate limit.
- Da xac minh local live mot luot:
  - `geminiConfigured=true`
  - `geminiModel=gemini-3.6-flash`
  - chat response `provider=gemini`
  - `fallbackReason=""`

### Safety / scoring

- Validator 2 chieu:
  - mask input nhay cam
  - chan output co link that, OTP, CCCD, phone, card/account, password, app remote/control, chuyen tien that
- `scoringEngine.js` la pure function.
- Score = red flags nhan ra / tong red flags.
- Feedback taxonomy bi khoa dung 5 nhom:
  - Urgency
  - Authority
  - Fear
  - Social Proof/Reciprocity
  - Scarcity

### Commit/push gan day

- `5469dd5 TASK-006: cập kịch bản tuyển dụng việc nhẹ lương cao và hotline 111` - da commit local.
- `3c9abc1 feat: remove voice input Web Speech API feature` - da push.
- `28e962d docs: record live gemini verification` - da push.
- `d934eea docs: record mobile browser verification` - da push.

## Dang Co Thay Doi (Da Hoan Thanh & Da Test)

Repo hiện đã hoàn thành các tính năng trong Task ngày 2026-08-05 (Accessibility, Firestore Persistence, Kịch bản tuyển dụng giả, Xác nhận API key) và đang lưu trữ cục bộ (chưa commit/push):

### 1. Accessibility (Hỗ trợ tiếp cận)
- **Toggle "Chữ to / Tương phản cao"**: Hiển thị rõ trên trang chủ (`renderEntryDashboard`) và cả trang kết quả dashboard (`renderDashboardView`). Khi toggle, thay đổi trạng thái và áp dụng trực tiếp lên class của `body` (CSS variables tương ứng).
- **Độ tương phản màu (WCAG AA)**: Cải tiến màu của các biến trong `src/public/app.css` (`--color-muted`, `--color-primary`, `--color-success`, `--color-primary-soft`) để đảm bảo độ tương phản đạt chuẩn WCAG AA trở lên.
- **Kích thước nút bấm**: Toàn bộ nút bấm quan trọng (nút Dừng và xem điểm, Bắt đầu tập luyện, v.v.) được đảm bảo có chiều cao tối thiểu từ `56px` đến `64px` (đáp ứng tiêu chuẩn tối thiểu `~44px`).
- **Ngôn ngữ đơn giản**: Đơn giản hóa toàn bộ text UI trong `src/public/app.js` thành các câu ngắn gọn, trực diện, dễ hiểu cho người cao tuổi.

### 2. Firestore Persistence (Lưu trữ Firestore & Fallback)
- **Firestore Database**: Tích hợp lưu trữ session vào Firestore trong `src/services/store.js`. Nếu có cấu hình `FIRESTORE_PROJECT_ID` / `GOOGLE_CLOUD_PROJECT`, dữ liệu được đồng bộ trực tiếp lên đám mây.
- **Fallback Local File Store**: Nếu không có cấu hình Firestore, hệ thống tự động fallback lưu session xuống tệp tin cục bộ `sessions_local.db` thay vì chỉ in-memory, giúp giữ lại dữ liệu khi restart server.
- **Strict Firestore Mode**: Bật chế độ ném lỗi nghiêm ngặt khi các thao tác ghi/xóa trên Firestore thực tế thất bại.
- **Giữ nguyên Interface**: Giữ nguyên toàn bộ cấu trúc API và phương thức gọi của `dashboardService.js`, chỉ thay đổi lớp lưu trữ phía dưới.

### 3. Kịch bản "Tuyển dụng việc nhẹ lương cao"
- **Xác nhận cấu trúc**: Kịch bản tuyển dụng giả (`fake_job`) đã có đầy đủ trong `src/data/scenarios.json` với 5 nhóm red flags tương ứng với 5 taxonomy khóa:
  - `job_vague_description` (mô tả mập mờ - Authority)
  - `unofficial_recruitment_channel` (tuyển qua mạng xã hội cá nhân - Social Proof/Reciprocity)
  - `urgent_departure_pressure` (áp lực đi gấp - Urgency)
  - `no_clear_contract` (không có hợp đồng hoặc giục cọc phí - Scarcity)
  - `illegal_border_crossing_offer` (dụ dỗ đi đường lậu - Fear)
- **Căn chỉnh Nhận diện Dấu hiệu (Mới bổ sung)**: Sửa đổi `preferredKeys` trong `src/services/chatOrchestrator.js` để ánh xạ chính xác các từ khóa liên quan đến kịch bản tuyển dụng với 5 khóa red flag thực tế của `fake_job` (thay vì các khóa legacy không khớp). Điều này đảm bảo khi người dùng nhận diện bẫy tuyển dụng (ở chế độ fallback hoặc live), kết quả sẽ được tính điểm chính xác.
- **Bổ sung Ca kiểm thử (Mới bổ sung)**: Thêm ca kiểm thử tự động trong `tests/run-tests.js` giả lập việc người dùng phát hiện hành vi tuyển dụng mập mờ, không hợp đồng lao động rõ ràng để xác nhận việc nhận diện đúng khóa `no_clear_contract` và kết xuất điểm số chính xác.

### 4. Bảo mật API Key
- **Xác nhận**: Không tồn tại bất kỳ ô nhập API key hay cấu hình key nào từ UI. API key chỉ được cấu hình duy nhất ở phía máy chủ qua biến môi trường để đảm bảo an toàn.

---

## Ket Qua Test Moi Nhat

Đã chạy ngày 2026-08-05:

- **Unit Tests (`node tests/run-tests.js`)**: **PASS** (Chạy thành công 100% các ca kiểm thử, bao gồm test ghi đè tệp tin database cục bộ, lưu trữ sessions, Strict Firestore error-throwing, và nhận diện red flags cho kịch bản tuyển dụng giả).
- **HTTP Smoke Test (`tests/http-smoke.ps1`)**: **PASS** (Server khởi động bình thường, các API endpoints hoạt động ổn định và kiểm thử HTTP thành công với mã 200/201).

---

## Chua Xac Minh Duoc & Can Nguoi Dung Quyet Dinh

- **Chưa xác minh trên thiết bị thật**: Mới chỉ QA mobile viewport bằng headless emulator `390x844`.
- **Cấu hình Firestore dự án thực tế**: Cần người dùng cấu hình `FIRESTORE_PROJECT_ID` hoặc Google Application Credentials khi triển khai lên Cloud.
- **Commit và Push**: Các file hiện đang được lưu cục bộ và sẵn sàng commit/push khi có lệnh của người dùng.

---

## Viec Nen Lam Tiep

1. Người dùng review và phê duyệt các thay đổi này.
2. Thực hiện commit và push các thay đổi lên Git.

---

## Cach Chay Nhanh

```bash
node server.js
```

Mở:

```text
http://localhost:3000
```

Chạy test:

```bash
node tests/run-tests.js
```

```powershell
powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```

---

## Phiên Chạy Không Giám Sát (Unattended Session - 2026-08-06)

### Branch: `wip/unattended-session`

#### Mục 1: Kiểm Tra Trạng Thái Kịch Bản Thực Tế (scenarios.json)
- **Tổng số kịch bản hiện có**: 4 kịch bản trong `src/data/scenarios.json`
- **Chi tiết đối chiếu**:
  - `fake_bank` (Giả ngân hàng xác minh tài khoản): **ĐÃ CÓ**
  - `fake_police` (Giả công an/cơ quan chức năng): **ĐÃ CÓ**
  - `fake_relative` (Giả người thân mượn tiền): **ĐÃ CÓ**
  - `fake_job` (Tuyển dụng việc nhẹ lương cao): **ĐÃ CÓ**
  - `deepfake` (Deepfake giọng nói/hình ảnh): **CHƯA CÓ**
  - `travel_sales` (Bẫy du lịch giá rẻ): **CHƯA CÓ**
  - `gym_sales` (Bẫy gói tập gym / tín dụng ngầm): **CHƯA CÓ**
  - `ecommerce_refund` (Sàn TMĐT Shopee/Lazada hoàn tiền): **CHƯA CÓ**
  - `vneid` (VNeID / Dịch vụ công giả mạo): **CHƯA CÓ**

#### Mục 2: Hoàn Thiện Tồn Đọng Kịch Bản Scope Gốc (deepfake)
- **Kịch bản `deepfake`**: Bổ sung kịch bản `deepfake` vào `src/data/scenarios.json` theo đúng 5 nhóm taxonomy đã khóa (`deepfake_video_glitch`, `urgency_threat`, `request_to_transfer_money`).
- **Cập nhật Unit / Smoke test**: Cập nhật số lượng kịch bản mong đợi từ 4 lên 5 trong `tests/run-tests.js` và `tests/http-smoke.ps1`.
- **Dynamic Test 1 lượt**: Đã chạy test 1 lượt cho kịch bản `deepfake` với input `"Sao video bi giat lag va tat mat vay?"`. Kết quả: `deepfake_video_glitch` được trigger chuẩn xác (`provider=safe_fallback`, reason=`GEMINI_HTTP_429`).
- **Kết quả Test Suite**: `npm run frontend:build` (PASS), `node tests/run-tests.js` (PASS), `http-smoke.ps1` (PASS).



