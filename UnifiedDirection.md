# AI Scam Inoculation - Unified Product Direction

## 1. Source of Truth

Tài liệu này là bản source of truth mới cho dự án sau khi hợp nhất các prompt/context trước đó và file `AI-Scam-Inoculation-Huong-Nghien-Cuu-Hop-Nhat.md`.

Tên chương trình: **AI Riser Vietnam 2026**.

Track: **phòng chống lừa đảo / anti-fraud**.

Tinh thần kỹ thuật: **Build with Google AI**, Gemini là AI chính trong sản phẩm cuối.

## 2. Core Product Decision

MVP chuyển sang **Hybrid Model**:

1. Core flow là **tự luyện tập trực tiếp**.
2. Người dùng tự vào app, chọn loại scam/cấp độ, xác nhận đồng thuận, chat với Gemini, xem điểm miễn dịch và lịch sử.
3. Family angle chỉ giữ ở cuối bằng tính năng mỏng: **chia sẻ kết quả cho người thân**.
4. Không dùng mô hình 2 vai trò đầy đủ trong MVP hiện tại.

## 3. Final MVP Flow

```text
Đăng nhập nhẹ / nhập tên
  -> Dashboard cá nhân
  -> Chọn loại scam + cấp độ
  -> Đồng thuận mô phỏng
  -> Chat mô phỏng với Gemini
  -> Kết thúc
  -> Phân tích + Điểm miễn dịch
  -> Dashboard cá nhân + Lịch sử
  -> Chia sẻ kết quả cho người thân
```

## 4. AI-Native Litmus Test

AI là bắt buộc chỉ vì một lý do cốt lõi:

> Gemini phải phản hồi tự nhiên, hợp lý với bất kỳ lựa chọn nào người dùng đưa ra, không đi theo cây quyết định cố định.

MVP demo phải chứng minh điều này bằng dynamic response test:

- Cùng một trạng thái hội thoại.
- Nhập 2-3 câu trả lời khác nhau.
- Gemini phản hồi khác nhau, hợp lý, an toàn và vẫn nằm trong scenario.

## 5. Safety Non-Negotiables

- Có màn hình đồng thuận trước simulation.
- Không nhập/lưu/hiển thị OTP, CCCD, mật khẩu, số thẻ, số tài khoản thật.
- Có nút dừng mô phỏng bất kỳ lúc nào.
- `safetyValidator.js` kiểm tra input và output.
- Prompt đóng khung Gemini là biên kịch mô phỏng giáo dục có kiểm soát, không phải kẻ lừa đảo thật.

## 6. Scoring Non-Negotiables

Scoring phải minh bạch:

```text
Immunity Score = round((recognizedRedFlags / totalRedFlags) * 100)
```

Gemini có thể hỗ trợ xác định tín hiệu red flag, nhưng scoring engine là pure function độc lập và validate theo scenario schema.

## 7. Open Research Questions - Resolved Direction

### 7.1. Không dùng temperature/top_p/top_k thì giữ dynamic bằng cách nào?

Theo Google Gemini docs mới nhất, từ `gemini-3.6-flash` và `gemini-3.5-flash-lite`, `temperature`, `top_p`, `top_k` đã deprecated và bị bỏ qua; future models có thể trả lỗi nếu gửi các tham số này.

Vì vậy dynamic behavior không dựa vào sampling params. Cách kiểm soát mới:

- Prompt yêu cầu phản hồi sát câu gần nhất.
- Luôn gửi conversation history + scenario state.
- Scenario template chỉ định mục tiêu/red flags, không định nghĩa nhánh cố định.
- Dynamic response test là tiêu chuẩn acceptance.

### 7.2. Điểm miễn dịch có căn cứ nào?

MVP score không tuyên bố là thang đo lâm sàng hay chuẩn học thuật tuyệt đối. Nó là learning progress proxy dựa trên inoculation/prebunking: người học được tiếp xúc với kỹ thuật thao túng và được đánh giá theo khả năng nhận diện red flags.

Vì vậy dashboard phải giải thích red flags cụ thể, không chỉ hiển thị điểm.

### 7.3. Chia sẻ kết quả nên mỏng đến đâu?

Trong MVP, chia sẻ chỉ là:

- Tạo bản tóm tắt kết quả.
- Người dùng bấm copy/share text.
- Không có account người thân, không tracking, không consent kép.

Family Shield đầy đủ để future scope.

### 7.4. Nếu Gemini từ chối scenario nhạy cảm?

Giữ system prompt là “educational simulation writer”. Nếu Gemini vẫn từ chối hoặc output không hợp lệ:

- Retry một lần với repair instruction.
- Fallback an toàn.
- Chuyển sang dashboard/feedback.

### 7.5. Consent cho 1 người dùng nên thế nào?

Consent copy phải ngắn:

```text
Tôi hiểu đây là mô phỏng luyện tập, không phải tình huống thật. Tôi sẽ không nhập thông tin riêng tư thật.
```

Không dùng ngôn ngữ “giám sát bí mật/gài bẫy” trong core flow tự luyện tập.

## 8. Implementation Change Required

Current code still contains the older 2-role flow:

```text
scenario picker -> inviter consent -> participant consent -> chat -> dashboard
```

It must be refactored to:

```text
login/name -> personal dashboard -> scenario + level -> single consent -> chat -> result -> share summary
```

## 9. Sources

- Google AI for Developers. “Release notes.” <https://ai.google.dev/gemini-api/docs/changelog>
- Google AI for Developers. “Using the latest Gemini models.” <https://ai.google.dev/gemini-api/docs/latest-model>
- Google AI for Developers. “Gemini 3.6 Flash.” <https://ai.google.dev/gemini-api/docs/models/gemini-3.6-flash>
- Google AI for Developers. “Gemini deprecations.” <https://ai.google.dev/gemini-api/docs/deprecations>
- Google AI for Developers. “Structured outputs.” <https://ai.google.dev/gemini-api/docs/structured-output>
