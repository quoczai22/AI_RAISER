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
