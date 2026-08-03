# Accessibility Compliance Note

## Cơ Sở

Dự án tham chiếu Thông tư 26/2020/TT-BTTTT của Bộ Thông tin và Truyền thông về áp dụng tiêu chuẩn, công nghệ hỗ trợ người khuyết tật tiếp cận, sử dụng sản phẩm, dịch vụ thông tin và truyền thông.

Theo nội dung công bố trên Cổng thông tin điện tử Phổ biến, giáo dục pháp luật quốc gia, Thông tư có hiệu lực từ 01/01/2021 và khuyến khích tổ chức/cá nhân áp dụng tiêu chuẩn, công nghệ hỗ trợ người khuyết tật cho trang thông tin điện tử/cổng thông tin điện tử. Phụ lục Thông tư nêu WCAG 1.0 là bắt buộc với nhóm cơ quan/tổ chức thuộc phạm vi quy định và khuyến nghị WCAG 2.0/2.1.

AI Scam Inoculation không phải cổng dịch vụ công, nhưng MVP áp dụng theo hướng khuyến nghị để tăng khả năng tiếp cận.

## Những Gì Đã Áp Dụng

| Nhóm yêu cầu | Cách app đáp ứng |
|---|---|
| Ngôn ngữ trang | `html lang="vi"` |
| Bỏ qua vùng lặp | Có skip link `Bỏ qua phần đầu trang` |
| Vùng nội dung chính | Dùng `main` và vùng `#app` có thể focus |
| Nhãn input | Input tên, select cấp độ, textarea chat có label/aria-label |
| Trạng thái động | Có `role="status"` / `aria-live="polite"` cho thông báo |
| Chữ lớn | Font mặc định 20px, toggle `Chữ to` 24px |
| Tương phản | Toggle `Tương phản cao`, màu chữ/nút tương phản mạnh |
| Nút dễ bấm | Nút chính tối thiểu 56px chiều cao |
| Icon không thay thế chữ | Icon chỉ trang trí `aria-hidden`, luôn đi kèm chữ |
| Keyboard | Control dùng button/input/select/textarea chuẩn, có `focus-visible` rõ |
| Không dùng gesture phức tạp | Luồng chỉ dùng click/tap và nhập text/voice |
| Giọng nói tiếng Việt | Nút `Nói`, dùng Web Speech API `vi-VN` nếu trình duyệt hỗ trợ |
| Phản hồi thao tác | Button active state + rung nhẹ `navigator.vibrate` nếu thiết bị hỗ trợ |
| Nội dung dễ hiểu | Feedback dashboard viết ngắn, tránh dạy câu trả lời mẫu |

## Giới Hạn Còn Lại

- Chưa có audit WCAG tự động bằng Lighthouse/axe.
- Web Speech API phụ thuộc trình duyệt; nếu không hỗ trợ, app hiển thị thông báo và cho nhập bàn phím.
- Chưa kiểm thử với screen reader thực tế như NVDA/TalkBack/VoiceOver.
- Chưa có phụ đề/audio vì MVP hiện là chat text, không có video/audio nội dung.

## Checklist Trước Demo

```bash
node tests/run-tests.js
```

```powershell
powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1
```

Kiểm tra tay:

1. Bấm `Tab` thấy skip link và focus outline rõ.
2. Bật `Chữ to`.
3. Bật `Tương phản cao`.
4. Vào chat, thử nút `Nói` trên trình duyệt hỗ trợ tiếng Việt.
5. Dùng toàn bộ flow bằng click/tap, không cần gesture phức tạp.
