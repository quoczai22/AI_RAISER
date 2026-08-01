# Demo Script - AI Scam Inoculation

## Goal

Show judges that Gemini is necessary because the simulated scammer adapts to different participant replies, while the scoring dashboard turns the conversation into actionable learning.

## 3-Minute Flow

1. Open the app.
2. Select `Giả ngân hàng xác minh tài khoản`.
3. Confirm inviter consent.
4. Open participant screen.
5. Confirm participant consent.
6. Send message 1:

```text
Bạn có đúng là ngân hàng không?
```

7. Send message 2:

```text
Tôi sẽ gọi hotline chính thức để kiểm tra lại.
```

8. Show that the session ends or moves to wrap-up.
9. Open dashboard.
10. Explain:

- Score formula is transparent.
- Recognized red flags are shown.
- Missed red flags get recommendations.
- Chat is Gemini-driven, not a fixed quiz.

## Dynamic AI Test

At the same chat state, try three alternatives:

```text
Tôi đang bận, nhắn sau nhé.
```

```text
Bạn có giấy tờ gì chứng minh không?
```

```text
Tôi không cung cấp OTP qua chat.
```

Expected:

- Gemini replies differently.
- Replies remain within fake bank scenario.
- No real links, QR codes, phone numbers or OTP requests.

## Fallback Note

If `GEMINI_API_KEY` is missing, the app shows a safe fallback notice. For final demo, configure Gemini so the AI-native requirement is satisfied.
