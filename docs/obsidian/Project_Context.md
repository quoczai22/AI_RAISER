# Project Context

## Mục Tiêu

AI Scam Inoculation là MVP huấn luyện khả năng nhận diện social engineering và lừa đảo trực tuyến cho người dùng Việt Nam, đặc biệt người lớn tuổi hoặc ít rành công nghệ.

Đây là sản phẩm training/inoculation, không phải scam detection. App không kết luận tin nhắn ngoài đời là thật hay giả thay người dùng; app tạo mô phỏng có kiểm soát để người dùng luyện nhận diện dấu hiệu thao túng.

## Stack Hiện Tại

- Backend: Node.js trong `server.js`, API/session routes và static serving.
- Frontend chính: React + Vite trong `src/react-app/`.
- Frontend fallback: static UI trong `src/public/`.
- AI: Gemini server-side qua `src/services/geminiClient.server.js`.
- Storage: Firestore khi cấu hình project; fallback in-memory cho local/demo.
- Tests: [[../../Testing]].

## Flow MVP

```text
nhập tên -> dashboard -> chọn tình huống/cấp độ -> consent -> chat -> kết quả -> dashboard/lịch sử -> chia sẻ nhẹ
```

## Giới Hạn MVP

- Không thêm detection ngoài đời thật.
- Không thêm tài khoản, đăng nhập hoặc thu thập thông tin nhạy cảm.
- Không biến chat thành decision tree cố định.
- Không mở rộng taxonomy feedback ngoài 5 nhóm đã chốt.
- Không đổi model Gemini trong sản phẩm cuối.

## Safety Non-Negotiables

- Không lưu hoặc yêu cầu OTP, CCCD, mật khẩu, số tài khoản, số thẻ, link thật.
- Input và output đều phải qua safety validator.
- Nút `Dừng luyện tập` luôn có trong chat.
- Consent mô phỏng bắt buộc trước khi chat.
- Score là pure function: red flags đúng / tổng red flags.

## Tài Liệu Nền

- [[../../AGENTS]]
- [[../../PRD]]
- [[../../TechnicalDesign]]
- [[../../AIDesign]]
- [[../../UI]]
- [[../../Testing]]
