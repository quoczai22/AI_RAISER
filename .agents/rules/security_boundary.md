---
trigger: always_on
description: Security boundary rule forbidding actions outside workspace and destructive delete commands.
---

# Security Boundary Rule

## 1. Phạm Vi Thao Tác Trực Tiếp (Workspace Boundary)
- AI Agent CHỈ ĐƯỢC PHÉP đọc, chỉnh sửa, tạo mới hoặc xóa tệp tin bên trong phạm vi thư mục dự án hiện tại (`c:\Users\kienq\OneDrive - University Of Industry and Trade\Tài liệu\Ai Raiser`).
- Tuyệt đối KHÔNG ĐƯỢC PHÉP đọc, sửa, hoặc xóa mã nguồn hay tệp tin ở các ổ đĩa khác (C:\, D:\, E:\...) hoặc các thư mục nằm bên ngoài project hiện tại.

## 2. Cấm Lệnh Xóa Nguy Hiểm (Destructive Command Restrictions)
- NGHIÊM CẤM thực thi các lệnh xóa nguy hiểm mang tính phá hủy hệ thống hoặc xóa diện rộng như:
  - `rm -rf` / `rm -r`
  - `del /f /s /q`
  - `rmdir /s /q`
  - `Remove-Item -Recurse -Force` trên thư mục gốc hoặc đường dẫn tuyệt đối ngoài workspace.
- Mọi thao tác dọn dẹp tệp tin tạm chỉ được thực hiện có giới hạn bên trong dự án và phải xác minh đường dẫn an toàn trước khi thực hiện.
# Always Process Operations & Security Monitor

## 1. Cảnh báo lỗi hệ thống (System Error Alert)
- **Continuous Heartbeat:** Antigravity phải duy trì một tiến trình kiểm tra trạng thái (heartbeat) định kỳ.
- **Interruption Recovery:** Nếu chế độ Always Process bị gián đoạn, treo tiến trình (hang), hoặc bị mất quyền truy cập tài nguyên (Permission Denied), hệ thống phải lập tức dừng tác vụ đang lỗi và phát cảnh báo âm thanh/pop-up thông báo cho người dùng.
- **State Logging:** Ghi nhận lại mã lỗi và vị trí file gây ra lỗi vào tệp `.agent/logs/error.log` trước khi dừng hẳn.

## 2. Cập nhật cơ chế nhận diện (Rule & Patch Update)
- **Strict Rule Locking:** Khóa cứng quyền thay đổi đối với thư mục `.agent/rules/`. Mọi hành vi tự ý sửa đổi file quy tắc từ các tiến trình bên ngoài phải được thông báo ngay lập tức.
- **Patch Verification:** Khi Antigravity cập nhật phiên bản mới hoặc có bản vá liên quan đến cơ chế nhận diện quy tắc, AI phải tự động quét lại toàn bộ file `.agent/rules/security_boundary.md` để đảm bảo các điều khoản bảo mật không bị ghi đè hoặc vô hiệu hóa.

## 3. Báo cáo tối ưu tài nguyên (Resource Optimization)
- **Threshold Limit:** Giới hạn tài nguyên phần cứng cho tiến trình chạy ngầm: Tối đa 15% CPU và 1GB RAM (hoặc tùy chỉnh theo cấu hình máy).
- **Overhead Warning:** Nếu tiến trình Always Process vượt quá ngưỡng này trong hơn 30 giây liên tiếp, AI phải tự động hạ thấp độ ưu tiên (throttling), dọn dẹp bộ nhớ đệm (cache), và gửi thông báo cảnh báo tiêu thụ tài nguyên quá mức lên màn hình IDE.
