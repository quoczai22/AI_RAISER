# AGENTS.md — AI Scam Inoculation (AI Riser Vietnam 2026)

> File này là nguồn sự thật DUY NHẤT cho mọi phiên làm việc của Codex trong repo này. Codex tự động đọc file này trước khi bắt đầu task — không cần dán lại context thủ công. Nếu bất kỳ chỉ dẫn nào trong task prompt của tôi mâu thuẫn với file này, ưu tiên file này trừ khi tôi nói rõ đang cố ý thay đổi.

## 1. Dự án là gì

- Tên: **AI Scam Inoculation**. Dự án thi AI Riser Vietnam 2026.
- **Không liên quan** tới bất kỳ repo/project nào khác của tôi (kể cả CloudCVHub — một project AWS hỗ trợ tạo CV bằng AI, hoàn toàn tách biệt). Không mang giả định, code, hay ngữ cảnh từ project khác vào đây.
- Đề tài đã chốt, **không đổi, không brainstorm thêm, không mở rộng ngoài MVP** mô tả ở mục 4.

## 2. Bản chất sản phẩm — Training, không phải Detection

Sản phẩm **không phát hiện lừa đảo**. Đây là nền tảng **huấn luyện khả năng nhận biết lừa đảo** dựa trên Inoculation Theory / prebunking / simulation-based learning.

Người dùng được đặt vào tình huống lừa đảo mô phỏng (giả ngân hàng, giả công an, giả người thân mượn tiền, tuyển dụng giả, deepfake...). Gemini đóng vai kẻ lừa đảo, hội thoại diễn ra động, không theo kịch bản cố định. Sau khi kết thúc, hệ thống phân tích, chỉ ra dấu hiệu đáng nghi đã bỏ lỡ, và cập nhật "Scam Immunity Score".

## 3. AI — Gemini là lõi, không thương lượng

- **Gemini (`gemini-3.6-flash`) là AI DUY NHẤT trong luồng sản phẩm cuối.** Mọi AI khác (Claude, GPT, Codex...) chỉ hỗ trợ quá trình phát triển (viết code, review), không bao giờ xuất hiện trong API call của tính năng sản phẩm.
- **⚠️ Ràng buộc kỹ thuật đã xác nhận:** từ Gemini 3.6 Flash, các tham số `temperature`, `top_p`, `top_k` đã bị loại bỏ khỏi API — không dùng các tham số này. Kiểm soát độ đa dạng/không đoán trước được của hội thoại qua system prompt + context + scenario state, không qua sampling params.

### Vì sao AI bắt buộc phải có — lý do DUY NHẤT, không phải các lý do khác
Đã kiểm chứng qua Litmus Test: nếu cấm AI, vấn đề (con người thiếu miễn dịch tâm lý trước thao túng) vẫn đáng giải quyết — ngành phishing-simulation rule-based (KnowBe4, Proofpoint) đã tồn tại độc lập với AI. Vậy lý do AI bắt buộc **không phải** "tạo nội dung hay" hay "cá nhân hoá" — mà là:

> **Hội thoại phải phản hồi tự nhiên, hợp lý với BẤT KỲ input nào của người dùng, không đi theo cây quyết định cố định — vì đây là cơ chế DUY NHẤT chống học vẹt.**

Nếu kịch bản cố định, người dùng luyện vài lần sẽ học thuộc "câu trả lời đúng" thay vì học nhận diện thật — vô dụng khi gặp lừa đảo thật. AI động khiến nội dung mỗi lần luôn khác nhau, buộc người dùng học nhận diện **pattern kỹ thuật thao túng**, không phải học thuộc câu trả lời.

## 4. MVP đã chốt (mô hình Hybrid)

```
Đăng nhập/nhập tên → Dashboard cá nhân → Chọn loại scam + cấp độ →
Consent đơn (1 người dùng, không phải 2 vai trò) →
Chat mô phỏng với Gemini (dynamic, không đoán trước được) →
Kết thúc → Phân tích + Điểm miễn dịch (công thức minh bạch) →
Dashboard kết quả + Lịch sử →
[Tính năng mỏng] Copy/share tóm tắt kết quả cho người thân (tuỳ chọn, KHÔNG bắt buộc, KHÔNG cần consent kép)
```

**Không** làm: mô hình 2 vai trò đầy đủ (inviter/participant consent kép), pipeline học tin tức lừa đảo real-time, voice AI, cá nhân hoá sâu bằng dữ liệu thật.

## 5. Yêu cầu bắt buộc cho system prompt / feedback (quan trọng nhất, hay bị làm sai)

1. **System prompt đóng vai kẻ lừa đảo** phải đóng khung rõ: đây là biên kịch tình huống giáo dục có kiểm soát, không phải yêu cầu AI lừa đảo thật. Có bước đồng thuận trước khi vào simulation. Không lưu/hiển thị OTP, CCCD, số tài khoản, link thật.

2. **Feedback sau simulation BẮT BUỘC dạy pattern kỹ thuật thao túng, KHÔNG dạy kịch bản câu trả lời cụ thể.** Mỗi red flag phải gắn tên kỹ thuật khái quát: **urgency (tạo áp lực khẩn cấp), authority (giả danh quyền lực), fear (đe doạ hậu quả), social proof/reciprocity (lợi dụng lòng tin), scarcity (khan hiếm giả tạo)**.
   - ❌ Sai: "Bạn nên trả lời: 'Tôi sẽ gọi hotline chính thức để kiểm tra'" (dạy học thuộc câu).
   - ✅ Đúng: "Kẻ lừa đảo vừa kết hợp urgency + authority — dấu hiệu chung: bất kỳ ai giục hành động ngay lập tức đều đáng ngờ, bất kể tự xưng là ai."
   - Dùng taxonomy trên nhất quán cho MỌI kịch bản, không tự đặt tên kỹ thuật khác nhau mỗi lần.

3. **Chấm điểm phải minh bạch, tách khỏi việc Gemini "tự đánh giá cảm tính".** `scoringEngine.js` giữ là pure function độc lập. Công thức: số dấu hiệu nhận diện đúng / tổng số dấu hiệu cài trong kịch bản. Gemini chỉ xác định đúng/sai từng dấu hiệu, không tự cho điểm mơ hồ.

## 6. Kiến trúc — giữ nguyên ranh giới module

`chatOrchestrator.js` (điều phối hội thoại) · `geminiClient.server.js` (gọi Gemini, chỉ server-side, KHÔNG BAO GIỜ lộ key ra client) · `safetyValidator.js` (validator 2 chiều — trước và sau khi gọi Gemini, chặn URL/số điện thoại/yêu cầu OTP thật) · `scoringEngine.js` (pure scoring) · `dashboardService.js` (tổng hợp dashboard).

## 7. Deploy & Security

- Gemini API key qua **Secret Manager** khi deploy Cloud Run (không phải plain `--set-env-vars`).
- Warm-up request trước demo 5-10 phút (tránh cold-start làm mất session in-memory).
- Có đường porting sang Google AI Studio Build Mode — giữ 4 module boundaries tương đương khi port.

## 8. Cách làm việc — nhẹ, không cứng nhắc

- **Không cần dừng lại từng phase để chờ duyệt.** Cứ code liên tục theo task được giao.
- Sau mỗi cụm việc hoàn thành, **báo cáo ngắn gọn kiểu diff** (đã sửa gì, ở file nào, vì sao) — không cần viết lại toàn bộ tài liệu markdown mới.
- Ưu tiên hành động thực tế (code chạy được, test qua) hơn là tài liệu hoá dài dòng.
- Nếu phát hiện rủi ro/xung đột với mục 1-7 ở trên, dừng lại và hỏi trước khi tự ý quyết định.

## 9. Checklist tự kiểm tra trước khi báo "xong" (map theo tiêu chí chấm AI Riser)

| Tiêu chí | Tự hỏi |
|---|---|
| Feasibility | Chạy ổn định trong demo 3 phút không? Phụ thuộc rủi ro gì (network, rate limit)? |
| AI Necessity | Bỏ AI ra, phần này còn hoạt động đúng thiết kế không? Nếu có → cảnh báo, đang code "AI cho có" |
| Demo Quality | Test tay 2-3 câu trả lời khác nhau tại cùng 1 điểm hội thoại — Gemini có phản hồi khác nhau, hợp lý không? |
| Anti-memorization | Feedback có gắn tên kỹ thuật thao túng khái quát, không phải câu trả lời mẫu cụ thể không? |
| Innovation | Dashboard có hơn "% đúng/sai" đơn thuần không? |
| Impact | Người dùng có biết chính xác mình yếu ở kỹ thuật thao túng nào không? |
| Safety | Không lưu/hiển thị OTP/CCCD/số tài khoản/link thật ở bất kỳ đâu? |

Nếu bất kỳ mục nào không đạt, dừng lại, nêu vấn đề, đề xuất cách sửa trước khi báo hoàn thành.
