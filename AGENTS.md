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
