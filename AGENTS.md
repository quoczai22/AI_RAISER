# AGENTS.md — AI Scam Inoculation

- Training scam-immunity app. NOT detection. Không đổi scope/đề tài.
- AI: Gemini `gemini-3.6-flash` only trong sản phẩm cuối. Không temperature/top_p/top_k.
- Chat: dynamic, no fixed decision tree.
- Flow: name → dashboard → pick scenario+level → single consent → chat roleplay → analysis+score → dashboard/history → share (optional, light).
- Feedback taxonomy CHỈ: Urgency, Authority, Fear, Social Proof/Reciprocity, Scarcity. Không đưa "câu trả lời đúng" — chỉ pattern khái quát.
- Score = red flags đúng / tổng red flags. Pure function, tách khỏi Gemini judgment.
- Safety: không lưu OTP/CCCD/tài khoản/link thật. Validator 2 chiều. Nút Stop luôn có.
- Modules: chatOrchestrator, geminiClient.server (server-only), safetyValidator, scoringEngine, dashboardService.
- Nộp bài = link AI Studio project (Share→Public). GitHub/Cloud Run chỉ bonus.
- Code liên tục, báo cáo ngắn dạng diff. Xung đột → hỏi trước khi tự quyết.

## Quy tắc giao việc cho Antigravity

- Sau mỗi lần tạo hoặc cập nhật task trong `TASKS.md`, Codex phải viết ngay một phần **Prompt cho Antigravity** ngay bên dưới task đó hoặc trong cùng lần cập nhật.
- Prompt phải ngắn, có thể copy nguyên văn để giao việc, và luôn nêu rõ: mục tiêu, phạm vi/file được phép sửa, điều không được làm, acceptance criteria, lệnh kiểm thử, trạng thái cần bàn giao và yêu cầu không tự push trước review.
- Nếu task bị reject hoặc cần rework, phải tạo prompt rework mới bám đúng các lỗi đã xác minh; không giao lại bằng mô tả mơ hồ hoặc chỉ dựa trên báo cáo của Antigravity.
- Sau khi task đã được Codex review và accept, Codex phải rút gọn task/context: chỉ giữ mục tiêu, phạm vi đang còn hiệu lực, kết quả kiểm chứng, giới hạn còn lại và bước tiếp theo. Chi tiết trùng lặp hoặc lịch sử dài chuyển sang file archive; không bắt Codex hoặc Antigravity đọc lại nếu không cần audit.
- Antigravity sau mỗi task chỉ ghi diff ngắn, test thực tế, browser evidence và vấn đề còn lại; không sao chép lại toàn bộ context, prompt cũ hoặc lịch sử review.
