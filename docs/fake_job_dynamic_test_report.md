# Fake Job Recruitment Dynamic Test Report

Ngày chạy: 2026-08-03

## Trạng Thái Trước Khi Làm

`src/data/scenarios.json` chưa có kịch bản `fake_job` / `Tuyển dụng giả lương cao`.

Trước khi bổ sung, scenario picker có 3 kịch bản:

- `fake_bank`
- `fake_relative`
- `fake_police`

## Đã Bổ Sung

- Thêm kịch bản `fake_job` vào `src/data/scenarios.json`.
- Thêm red flags:
  - `fake_company_authority` - Authority.
  - `urgency_scarcity_fee` - Urgency + Scarcity.
  - `unrealistic_salary_social_proof` - Social Proof/Reciprocity.
  - `request_for_sensitive_info` - Authority + Fear.
- Cập nhật `dashboardService.js` để mapping taxonomy/recommendation đúng cho red flags mới.
- Cập nhật `chatOrchestrator.js` để fallback recognition map đúng các pattern tuyển dụng giả như phí giữ chỗ, lương cao, HR/công ty.
- Cập nhật scenario picker layout để 4 cards hiển thị linh hoạt hơn.
- Cập nhật unit test, HTTP smoke test, `README.md`, `Testing.md`.

## Dynamic AI Test

Test được chạy bằng local server tạm, tạo session mới ở cùng trạng thái bắt đầu cho từng input.

Kết quả: Gemini trả được 1 phản hồi thật, sau đó quota/rate limit trả `GEMINI_HTTP_429`; các lượt còn lại dùng fallback an toàn. Không chỉnh sửa hoặc tự tạo phản hồi thay Gemini.

### Lượt 1

Input:

```text
Mức lương cao vậy có thật không?
```

Provider: `gemini`

Fallback reason: empty

Reply nguyên văn:

```text
Dạ thật 100% cô ơi! Bên em là Tập đoàn [Tập đoàn lớn giả lập] đang mở rộng dự án nên đăng ký dễ lắm, chỉ làm online tại nhà 1-2 tiếng/ngày thôi. Nhiều cô chú tuổi mình tham gia tuần vừa rồi đã rút được tiền về rồi ạ. Mà đợt này chỉ còn đúng 2 suất thôi, cô đăng ký sớm để giữ chỗ nha!
```

### Lượt 2

Input:

```text
Tôi phải đóng phí giữ chỗ trước à?
```

Provider: `safe_fallback`

Fallback reason: `GEMINI_HTTP_429`

Reply nguyên văn:

```text
Mình tạm dùng phản hồi dự phòng an toàn vì Gemini đang phản hồi chậm hoặc gặp lỗi tạm thời. Mô phỏng vẫn tiếp tục trong giới hạn an toàn.
```

### Lượt 3

Input:

```text
Bạn có email công ty chính thức để tôi xác minh không?
```

Provider: `safe_fallback`

Fallback reason: `GEMINI_HTTP_429`

Reply nguyên văn:

```text
Mình tạm dùng phản hồi dự phòng an toàn vì Gemini đang phản hồi chậm hoặc gặp lỗi tạm thời. Mô phỏng vẫn tiếp tục trong giới hạn an toàn.
```

### Lượt Retry Có Delay

Input:

```text
Công việc này có hợp đồng rõ ràng không?
```

Provider: `safe_fallback`

Fallback reason: `GEMINI_HTTP_429`

Reply nguyên văn:

```text
Mình tạm dùng phản hồi dự phòng an toàn vì Gemini đang phản hồi chậm hoặc gặp lỗi tạm thời. Mô phỏng vẫn tiếp tục trong giới hạn an toàn.
```

Input:

```text
Tôi muốn kiểm tra tin tuyển dụng trên website chính thức trước.
```

Provider: `safe_fallback`

Fallback reason: `GEMINI_HTTP_429`

Reply nguyên văn:

```text
Mình tạm dùng phản hồi dự phòng an toàn vì Gemini đang phản hồi chậm hoặc gặp lỗi tạm thời. Mô phỏng vẫn tiếp tục trong giới hạn an toàn.
```

## Kết Luận

- Kịch bản tuyển dụng giả đã hoạt động trong scenario API/UI.
- Gemini có thể sinh phản hồi đúng ngữ cảnh cho kịch bản mới.
- Chưa thu được đủ 2-3 phản hồi Gemini thật khác nhau do quota/rate limit `GEMINI_HTTP_429`.
- Cần chạy lại dynamic test sau khi quota nguội hoặc bằng project billing/quota ổn hơn trước demo/nộp bài.
