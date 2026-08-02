# AI Scam Inoculation - Phase 8 Presentation

## 1. Pitch

### 1.1. One-Liner

**AI Scam Inoculation** giúp gia đình Việt Nam luyện “miễn dịch lừa đảo” bằng các tình huống chat mô phỏng do Gemini tạo động, để người lớn tuổi nhận ra dấu hiệu Social Engineering trước khi gặp scam thật.

### 1.2. 30-Second Pitch

Lừa đảo trực tuyến không chỉ là vấn đề thiếu thông tin. Nạn nhân thường bị thao túng trong một cuộc trò chuyện có áp lực, có danh nghĩa thẩm quyền, có cảm giác gấp và có yêu cầu chuyển tiền hoặc cung cấp thông tin.

AI Scam Inoculation cho phép người dùng tự luyện tập trong một môi trường mô phỏng có đồng thuận. Gemini đóng vai tình huống lừa đảo mô phỏng, phản hồi tự nhiên theo bất kỳ câu trả lời nào của người dùng. Sau buổi luyện, hệ thống chấm điểm miễn dịch dựa trên dấu hiệu cảnh báo đã nhận diện, gợi ý bài luyện tiếp theo và cho phép chia sẻ tóm tắt cho người thân.

### 1.3. 2-Minute Pitch

Scam hiện đại không giống một bài quiz. Người dùng không chỉ cần biết “đây là lừa đảo”, mà cần luyện phản xạ trong lúc bị gây áp lực: giả ngân hàng, giả người thân cần tiền gấp, giả công an/cơ quan chức năng.

Vấn đề là các cảnh báo hiện nay thường thụ động. Người lớn tuổi đọc xong có thể hiểu, nhưng khi gặp một cuộc trò chuyện thật, họ vẫn dễ bị cuốn vào urgency, authority và emotional pressure.

AI Scam Inoculation dùng nguyên lý inoculation: cho người học tiếp xúc với một “liều yếu” của kỹ thuật thao túng trong môi trường an toàn, có đồng thuận, không có thiệt hại thật. Gemini tạo phản hồi động theo lịch sử hội thoại và trạng thái kịch bản, nên người dùng không thể học thuộc cây quyết định.

Sau buổi luyện, dashboard không chỉ cho một con số. Nó chỉ ra người tham gia đã nhận diện dấu hiệu nào, bỏ lỡ dấu hiệu nào, trích đoạn hội thoại nào cần chú ý và nên luyện tình huống nào tiếp theo.

MVP bám AI Riser Vietnam 2026 và Build with Google AI: Gemini là AI chính, Google AI Studio/Cloud Run là hướng demo, safety guardrails được thiết kế từ đầu.

## 2. Poster

### 2.1. Poster Title

```text
AI Scam Inoculation
Luyện miễn dịch lừa đảo cho gia đình Việt Nam
```

### 2.2. Poster Structure

| Section | Content |
|---|---|
| Problem | Scam không chỉ là thiếu kiến thức; đó là thao túng trong hội thoại có áp lực |
| Target User | Người dùng Việt Nam tự luyện tập; gia đình nhận tóm tắt tự nguyện |
| Solution | Gemini mô phỏng chat lừa đảo có kiểm soát và phản hồi động |
| Learning Loop | Chọn kịch bản -> consent -> chat -> điểm miễn dịch -> luyện tiếp |
| AI-Native | Không decision tree; Gemini phản hồi theo lịch sử hội thoại |
| Safety | Consent, mask dữ liệu nhạy cảm, không link/QR/OTP thật |
| Impact | Người dùng biết mình yếu ở red flag nào và có thể chia sẻ kết quả cho gia đình |

### 2.3. Poster Copy

```text
Scam thật không đi theo kịch bản cố định.
Vì vậy luyện tập cũng không nên là quiz cố định.

AI Scam Inoculation dùng Gemini để tạo các tình huống chat mô phỏng như giả ngân hàng, giả người thân cần tiền gấp, giả cơ quan chức năng. Người tham gia trả lời tự nhiên, hệ thống phân tích dấu hiệu cảnh báo và tạo điểm miễn dịch minh bạch.
```

### 2.4. Visual Suggestions

- Left: phone chat mockup.
- Center: immunity score card.
- Right: red flag highlights.
- Bottom: “Build with Google AI / Gemini”.

## 3. Demo

### 3.1. Demo Setup

Before demo:

- Run local app or Cloud Run URL.
- Configure `GEMINI_API_KEY` through local `.env` or Cloud Run Secret Manager.
- Use `GEMINI_MODEL=gemini-3.6-flash`.
- Run `node tests/run-tests.js`.
- Run `powershell -ExecutionPolicy Bypass -File tests/http-smoke.ps1`.
- Run `powershell -ExecutionPolicy Bypass -File tests/live-gemini-probe.ps1 -DelaySeconds 10`.
- Warm up deployed app with `powershell -ExecutionPolicy Bypass -File tests/warmup.ps1 -BaseUrl "<Cloud Run URL>"`.

### 3.2. Demo Script

1. Open app.
2. Enter a display name.
3. Select `Giả ngân hàng xác minh tài khoản`.
4. Pick difficulty.
5. Show simulation consent and safety warning.
6. Say: “Consent là bắt buộc, vì đây là môi trường luyện tập mô phỏng.”
7. Start chat.
8. Type:

```text
Bạn có đúng là ngân hàng không?
```

9. Show Gemini reply.
10. Type:

```text
Tôi không cung cấp OTP qua chat. Tôi sẽ tự gọi hotline chính thức.
```

11. End session.
12. Show dashboard:

- Immunity score.
- Recognized red flags.
- Missed red flags.
- Highlighted conversation.
- Next scenario recommendation.
- Share summary for family.

### 3.3. Demo Talk Track

```text
Điểm quan trọng là AI không chỉ đọc một script. Nếu tôi trả lời khác, Gemini sẽ phản hồi khác nhưng vẫn nằm trong guardrails của scenario. Đây là lý do sản phẩm cần AI: scam thật là hội thoại động, nên luyện tập cũng phải động.
```

### 3.4. Backup Demo

If Gemini API is slow or unavailable:

- Use safe fallback flow.
- Explain fallback is safety continuity.
- If fallback reason is `GEMINI_HTTP_429`, explain this is quota/rate limit, not missing AI implementation.
- Show code/docs proving Gemini path exists server-side.
- Re-run with Gemini key if network recovers.

## 4. Judge Questions

### Q1. Why is AI necessary? Why not a quiz?

Because real social engineering is interactive. A quiz can test memory, but it cannot simulate unpredictable conversational pressure. Gemini lets the scammer persona adapt to arbitrary participant replies while staying within safety boundaries.

### Q2. How do you prevent the AI from teaching people how to scam?

The system uses multiple layers:

- Consent-based educational system prompt.
- Scenario allowed tactics.
- No real links, QR codes, OTP, bank details or app install steps.
- Structured JSON output.
- App-side safety validator.
- Retry/fallback if output is unsafe.

### Q3. How is the score calculated?

The MVP score is transparent:

```text
Immunity Score = recognized red flags / total red flags * 100
```

Gemini may suggest red flag signals, but the scoring engine validates them against the scenario schema. The dashboard explains recognized and missed red flags.

### Q4. Why focus on families?

Family is a realistic prevention channel in Vietnam. Con/cháu often worry about parents/grandparents being scammed, but need a respectful way to practice without shaming them.

### Q5. What makes this different from security awareness training?

Many platforms focus on enterprise phishing emails. This MVP focuses on Vietnamese family scam contexts: fake bank, fake relative, fake authority, chat-first behavior and non-judgmental family coaching.

### Q6. What if users enter real personal data?

The UI warns before chat, and the app masks OTP-like, CCCD-like, phone/card-like and password-like input. The model sees masked content, and the dashboard does not display raw sensitive data.

### Q7. How do you prove it is not a decision tree?

Test the same scenario state with 3 different participant messages. Gemini should produce different, context-aware responses. Scenario templates define goals and red flags, not fixed branches.

### Q8. What is the future scope?

- More Vietnam-specific scenarios.
- Progress over multiple sessions.
- Firestore persistence.
- Difficulty levels.
- Google AI Studio/Cloud Run production hardening.

## 5. FAQ

### Is this product trying to detect real scams?

No. MVP is a training simulator, not a real-time fraud detector or reporting system.

### Does the participant know it is simulated?

Yes. Consent is required before chat starts.

### Does the app store real personal information?

No. The app warns users not to enter real sensitive data and masks likely sensitive values.

### Can the AI generate dangerous content?

The design assumes this risk and mitigates it with prompt boundaries, structured output, safety settings, output validator, retry and fallback.

### Why Gemini?

AI Riser Vietnam 2026 is aligned with Build with Google AI. Gemini provides dynamic Vietnamese conversation and structured output needed for simulation and scoring.

### What should be shown in the final demo?

Show the complete learning loop:

```text
Scenario -> Consent -> Gemini Chat -> Score -> Red Flag Dashboard -> Next Practice
```

## 6. Phase 8 Deliverables

- Pitch: completed.
- Poster: completed.
- Demo: completed.
- Judge Questions: completed.
- FAQ: completed.

## 7. Phase 8 Review Gate

Roadmap phases 1-8 are now covered.

Remaining practical work:

- Configure Gemini secret in the deployed environment.
- Avoid or resolve `GEMINI_HTTP_429` quota/rate-limit before judging.
- Test in Google AI Studio or deploy to Cloud Run.
- Rehearse dynamic response demo.
- Improve UI polish if time remains.

**Status:** Phase 8 ready for review.
