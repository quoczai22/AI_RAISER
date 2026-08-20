# LOCAL STATUS - AI Scam Inoculation

Ngày cập nhật: 2026-08-20

## 1. Kết luận

Ứng dụng hiện đủ để demo toàn bộ luồng MVP trong môi trường local.

Unit test, production build và HTTP smoke test đều đã PASS trong lần kiểm tra gần nhất. Các tích hợp cần môi trường công khai hoặc dịch vụ thật vẫn phải được xác minh riêng trước khi tuyên bố sẵn sàng nộp chính thức.

## 2. Đã hoàn thành

### Kiến trúc và công nghệ

- Frontend chính sử dụng React 19 và Vite 5.
- Backend sử dụng Node.js.
- Gemini được gọi phía máy chủ; API key không được đưa xuống trình duyệt.
- Model sản phẩm được khóa ở `gemini-3.6-flash`.
- Không cấu hình `temperature`, `top_p` hoặc `top_k`.
- Sản phẩm vẫn là ứng dụng huấn luyện khả năng chống Social Engineering, không phải công cụ phát hiện lừa đảo.

### Workflow MVP

1. Nhập tên hiển thị.
2. Mở trang chính.
3. Chọn tình huống và mức độ.
4. Xác nhận tham gia mô phỏng một lần.
5. Chat roleplay với tình huống do Gemini tạo.
6. Có thể bấm Dừng bất kỳ lúc nào.
7. Xem phân tích và điểm số.
8. Quay lại dashboard và lịch sử luyện tập.
9. Chia sẻ kết quả nếu người dùng chủ động chọn.
10. Mở danh mục số xác minh và nguồn hỗ trợ khi cần.

### Giao diện và khả năng tiếp cận

- Có giao diện responsive cho máy tính và điện thoại.
- Workflow được khóa theo trạng thái session trên cả desktop và mobile.
- Có chế độ Chữ to và Tương phản cao.
- Nunito được dùng cho tiêu đề, số liệu và nhãn điều hướng.
- Inter được dùng cho nội dung, mô tả và trường nhập liệu.
- Thao tác chính dùng nút bấm rõ ràng, không phụ thuộc cử chỉ phức tạp.
- Voice input đã được loại khỏi MVP vì không đủ ổn định để demo.
- Người dùng đã thử trên điện thoại và báo hoạt động ổn; Codex chưa audit độc lập trên thiết bị vật lý.

### Safety và scoring

- Có validator hai chiều cho dữ liệu người dùng và phản hồi từ Gemini.
- Không yêu cầu hoặc lưu OTP, CCCD, mật khẩu, tài khoản, thẻ hay liên kết thật.
- OTP chỉ bị che khi có ngữ cảnh rõ như `OTP`, `mã xác nhận`, `mã xác minh` hoặc `mã bảo mật`.
- Đã xử lý CCCD/CMND 9 và 12 số, số điện thoại Việt Nam, mật khẩu và tài khoản.
- Taxonomy chỉ gồm: Urgency, Authority, Fear, Social Proof/Reciprocity và Scarcity.
- Scoring là pure function, độc lập với Gemini.
- Công thức điểm: số dấu hiệu nhận diện đúng chia cho tổng dấu hiệu trong tình huống.

### Chia sẻ và nguồn xác minh

- Lưu thẻ kết quả thành ảnh đã hoạt động.
- Facebook share đã được người dùng xác nhận hoạt động.
- Mobile có Web Share và sao chép liên kết fallback.
- Có nhánh Zalo cho public URL và fallback trong môi trường localhost.
- Có danh mục số xác minh, hotline và nguồn hỗ trợ an toàn.
- Nội dung chia sẻ không chứa transcript hoặc dữ liệu nhạy cảm.

### Progressive rendering an toàn

- TASK-026 đã được Codex rework và accept ngày 2026-08-20.
- Gemini output phải hoàn tất parse, retry và validation toàn bộ trước khi được hiển thị.
- Chỉ reply an toàn mới được chia theo từ và render tuần tự qua SSE.
- Không còn đường Gemini live chunk đi trực tiếp tới UI.
- Nút Dừng hủy request phía client; server ngăn dữ liệu đến muộn và giữ session ở trạng thái hoàn thành.
- Đã bổ sung rule chặn OTP có nhãn trong AI output.
- Đây là progressive rendering sau validation, không phải Gemini live streaming.
- Browser automation chưa chạy được do lỗi trusted code path của plugin; UI local vẫn cần một lượt kiểm tra thủ công trước release.

### Tài liệu

- Đã tạo `AI-Scam-Inoculation-Gioi-Thieu-Demo.docx`.
- Tài liệu gồm vấn đề, đối tượng hướng tới, giải pháp, cách sử dụng demo, kiến trúc, công nghệ và trạng thái xác minh.
- File đã được render thành 4 trang và kiểm tra không bị tràn hoặc cắt nội dung.

## 3. Bằng chứng kiểm thử mới nhất

- `npm.cmd test`: PASS.
- `npm.cmd run frontend:build`: PASS.
- `powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1`: PASS.
- `git diff --check`: PASS; chỉ có cảnh báo chuyển line ending từ LF sang CRLF trên Windows.
- `master` so với `origin/master`: `0 ahead / 0 behind` tại lần kiểm tra local gần nhất.

Build ban đầu từng bị sandbox chặn quyền đọc thư mục cha của OneDrive. Khi chạy ngoài sandbox, Vite build thành công với 46 module; đây không phải lỗi code.

## 4. Chưa xác minh được

1. Gemini live chạy liên tục 2-3 lượt mà không chuyển sang safe fallback do quota/rate limit.
2. Google AI Studio public link/import hoạt động từ tài khoản hoặc thiết bị của người chấm.
3. Zalo share hoạt động đầy đủ trên URL HTTPS công khai.
4. Firestore thật hoạt động với credential hợp lệ và giữ dữ liệu sau khi restart.
5. Codex chưa audit độc lập toàn bộ workflow trên điện thoại vật lý.

Không được báo PASS cho các mục trên nếu chưa có URL, credential hoặc bằng chứng chạy thật.

## 5. Trạng thái Git

- Branch hiện tại: `master`.
- Commit gần nhất: `cf771f7 feat: implement base UI styles, hotline component, and cybersecurity propaganda source data`.
- Có 15 file tracked đã thay đổi nhưng chưa commit/push.
- Thống kê diff có thể tiếp tục thay đổi cho đến khi tạo release-candidate commit.

Các file tracked đang thay đổi:

- `LOCAL_STATUS.md`
- `TASKS.md`
- `TASKS_ARCHIVE.md`
- `server.js`
- `src/public/app.js`
- `src/react-app/App.jsx`
- `src/react-app/app.css`
- `src/react-app/components/AppShell.jsx`
- `src/react-app/components/ChatShell.jsx`
- `src/react-app/components/ResultScorecard.jsx`
- `src/react-app/components/ShareCard.jsx`
- `src/react-app/components/SimulationConsent.jsx`
- `src/services/chatOrchestrator.js`
- `src/services/safetyValidator.js`
- `tests/run-tests.js`

Các mục chưa được Git theo dõi:

- `.docx_qa/`: thư mục render kiểm tra tài liệu, không nên push.
- `AI-Scam-Inoculation-Gioi-Thieu-Demo.docx`: tài liệu Word mới; chỉ push nếu muốn lưu cùng repo.
- `~$-Scam-Inoculation-Gioi-Thieu-Demo.docx`: file khóa tạm do Microsoft Word tạo, tuyệt đối không push.

## 6. Việc cần làm tiếp theo

1. Đóng Microsoft Word để file khóa `~$...docx` được giải phóng.
2. Thêm `.docx_qa/` và file khóa Word vào `.gitignore` nếu chưa có.
3. Quyết định có đưa tài liệu Word chính thức vào repo hay chỉ giữ local.
4. Review diff lần cuối rồi tạo release-candidate snapshot commit cho source, test và tài liệu cần giữ.
5. Push snapshot lên GitHub sau khi commit được kiểm tra.
6. Khi quota Gemini hồi, chạy 2-3 phiên Gemini live và ghi lại `provider` cùng lý do fallback nếu có.
7. Kiểm tra Google AI Studio public link và Zalo share trên HTTPS công khai.
8. Chỉ bật Firestore production sau khi có project và credential thật để kiểm thử persistence.

## 7. Cách chạy local

```powershell
npm.cmd install
npm.cmd run frontend:build
node server.js
```

Mở trình duyệt tại:

```text
http://localhost:3000
```

Chạy kiểm thử:

```powershell
npm.cmd test
powershell.exe -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```

Nếu giao diện hiển thị safe fallback, luồng demo vẫn an toàn nhưng không được dùng trạng thái đó làm bằng chứng Gemini live đang hoạt động.
