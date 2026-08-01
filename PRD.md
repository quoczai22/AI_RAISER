# AI Scam Inoculation - Phase 2 Product Requirement Document

## 1. Executive Summary

**AI Scam Inoculation** là sản phẩm luyện tập “miễn dịch lừa đảo” cho gia đình Việt Nam. Người mời, thường là con/cháu 28-45 tuổi, tạo một buổi luyện tập và mời cha mẹ/ông bà 55+ tham gia qua giao diện chat quen thuộc. Trong buổi luyện tập, **Gemini/Google AI** đóng vai biên kịch tình huống lừa đảo có kiểm soát, phản hồi động theo câu trả lời của người tham gia, sau đó hệ thống chấm “điểm miễn dịch” dựa trên số dấu hiệu cảnh báo người dùng nhận diện đúng.

Ngữ cảnh chương trình là **AI Riser Vietnam 2026**, không phải AI Raiser. Sản phẩm thuộc track **phòng chống lừa đảo / anti-fraud** và cần bám tinh thần **#BuildwithGoogleAI**. Do đó PRD ưu tiên demo/build trong hệ sinh thái Google AI, đặc biệt **Google AI Studio**, **Gemini API** và triển khai lên **Google Cloud Run** nếu cần public demo.

MVP tập trung vào một vòng học tập nhỏ nhưng thuyết phục:

1. Người mời chọn kịch bản.
2. Hai bên xác nhận đồng thuận.
3. Người tham gia trò chuyện với AI trong tình huống mô phỏng.
4. Hệ thống chấm điểm theo red flags đã định nghĩa trước.
5. Người mời xem dashboard đơn giản: điểm, điểm mạnh/yếu, đoạn hội thoại được highlight, gợi ý luyện tiếp.

Giá trị AI cốt lõi là **hội thoại mô phỏng không đoán trước được**. Sản phẩm không được vận hành như decision tree cố định. Nếu bỏ Gemini ra khỏi luồng hội thoại chính, MVP không còn đạt mục tiêu AI-native.

## 2. Problem

### 2.1. Problem Statement

Người lớn tuổi tại Việt Nam thường gặp khó khăn khi phải đánh giá tin nhắn hoặc cuộc trò chuyện có yếu tố giả danh, khẩn cấp, đe dọa, hoặc yêu cầu chuyển tiền/cung cấp thông tin. Các cảnh báo lừa đảo hiện nay thường là nội dung đọc thụ động, trong khi tình huống thật xảy ra dưới áp lực cảm xúc và diễn biến hội thoại khó đoán.

Gia đình muốn giúp cha mẹ/ông bà phòng tránh lừa đảo, nhưng thiếu một cách luyện tập an toàn, không phán xét, dễ tiếp cận và có thể cho thấy cụ thể người thân đang yếu ở dấu hiệu nào.

### 2.2. User Pain Points

| User | Pain Point | Product Response |
|---|---|---|
| Người tham gia 55+ | Khó phân biệt tin nhắn thật/giả khi đối phương nói tự nhiên, dồn dập hoặc dùng danh nghĩa có thẩm quyền | Mô phỏng chat theo tình huống đời sống, feedback rõ red flags |
| Người mời 28-45 | Lo cha mẹ/ông bà bị lừa nhưng không biết luyện thế nào mà không gây căng thẳng | Tạo buổi luyện tập có consent, kết quả dễ hiểu |
| Team demo/hackathon | Cần chứng minh AI là bắt buộc, không phải gắn AI cho có | Gemini phản hồi động với bất kỳ câu trả lời nào |
| Giám khảo | Cần thấy impact, feasibility, ethics và AI-native trong 3 phút demo | MVP có flow ngắn, rõ, chạy được, có điểm và dashboard |
| AI Riser organizer/context | Cần sản phẩm thể hiện Build with Google AI và có thể demo/deploy trong hệ sinh thái Google | Gemini API, Google AI Studio, Cloud Run-oriented delivery |

### 2.3. Why Now

- Scam tại Việt Nam đang tăng về quy mô và độ tinh vi.
- Người dùng lớn tuổi thường dễ bị ảnh hưởng bởi authority, urgency và quan hệ gia đình.
- Gemini/Google AI có thể tạo trải nghiệm hội thoại tự nhiên, giúp mô phỏng nhiều biến thể mà rule-based chatbot khó làm được.
- Inoculation theory và simulation learning cung cấp cơ sở nghiên cứu cho việc luyện trước trong môi trường an toàn.

## 3. User Persona

### 3.1. Primary Persona - Người Tham Gia

**Tên đại diện:** Cô Lan, 62 tuổi  
**Bối cảnh:** Dùng điện thoại hằng ngày, quen Zalo/Facebook, có tài khoản ngân hàng, thường nhận cuộc gọi/tin nhắn từ người lạ.  
**Mục tiêu:** Biết cách nhận ra dấu hiệu đáng ngờ trước khi chuyển tiền hoặc cung cấp thông tin.  
**Nỗi sợ:** Bị phạt, bị khóa tài khoản, con cháu gặp chuyện gấp, làm sai thủ tục.  
**Rào cản:** Không thích bị “kiểm tra”, ngại công nghệ, dễ căng thẳng nếu bị chê trách.

### 3.2. Secondary Persona - Người Mời

**Tên đại diện:** Anh Minh, 34 tuổi  
**Bối cảnh:** Có cha mẹ lớn tuổi, thường nhắc gia đình cảnh giác lừa đảo nhưng thấy lời nhắc không đủ hiệu quả.  
**Mục tiêu:** Tạo buổi luyện tập nhanh, an toàn, có kết quả cụ thể để biết cha mẹ cần luyện thêm điều gì.  
**Nỗi sợ:** Cha mẹ bị mất tiền, bị thao túng tâm lý, hoặc cảm thấy bị con cái gài bẫy.  
**Rào cản:** Không có thời gian cấu hình phức tạp, cần demo dễ chạy.

### 3.3. Stakeholder Persona - Giám Khảo AI Riser

**Mục tiêu đánh giá:** Feasibility, AI Necessity, Demo Quality, Innovation, Impact.  
**Điều cần thấy:** Gemini là thành phần chính, hội thoại có phản hồi động, MVP không quá rộng, có guardrails đạo đức.

## 4. User Journey

### 4.1. Happy Path

1. Người mời mở app.
2. Chọn một kịch bản MVP:
   - Giả ngân hàng.
   - Giả người thân cần tiền gấp.
   - Giả công an/cơ quan chức năng.
3. Người mời đọc và xác nhận điều khoản đồng thuận: đây là mô phỏng giáo dục, không phải giám sát bí mật.
4. App tạo một training session.
5. Người tham gia mở session.
6. Người tham gia xác nhận biết đây là mô phỏng luyện tập.
7. Chat bắt đầu với giao diện đơn giản kiểu messenger/Zalo.
8. Gemini đóng vai nhân vật lừa đảo mô phỏng, phản hồi theo lịch sử hội thoại và trạng thái scenario.
9. Người tham gia trả lời tự nhiên.
10. Session kết thúc khi đạt điều kiện dừng: đủ lượt hội thoại, người dùng nhận diện scam, hoặc người dùng chọn dừng.
11. Hệ thống chấm điểm miễn dịch theo red flags.
12. Người mời xem dashboard: điểm tổng, red flags nhận diện đúng/bỏ lỡ, đoạn hội thoại highlight, gợi ý luyện tiếp.

### 4.2. Error and Safety Path

| Situation | Expected Behavior |
|---|---|
| Người tham gia nhập thông tin nhạy cảm thật | Hệ thống không lưu/không hiển thị lại đầy đủ, cảnh báo không nhập dữ liệu thật |
| Gemini trả về nội dung không đúng JSON hoặc không hợp lệ | Backend retry hoặc dùng fallback an toàn |
| Gemini tạo nội dung quá nguy hiểm | Safety validator chặn và yêu cầu sinh lại |
| Người dùng muốn dừng | Có nút dừng session và chuyển sang feedback nhẹ nhàng |
| Người tham gia chưa consent | Không cho bắt đầu mô phỏng |

## 5. MVP

### 5.1. MVP Goal

Trong demo 3 phút, chứng minh rằng người dùng có thể trải nghiệm một buổi luyện tập scam an toàn, trong đó Gemini phản hồi tự nhiên với các câu trả lời khác nhau và hệ thống tạo được kết quả học tập rõ ràng.

### 5.2. In Scope

| Feature | MVP Requirement |
|---|---|
| Create training session | Người mời chọn 1 trong 3 kịch bản và tạo session |
| Consent flow | Người mời và người tham gia đều phải xác nhận biết đây là mô phỏng |
| Dynamic AI chat | Gemini sinh phản hồi dựa trên system prompt, scenario state và conversation history |
| Scenario templates | 3 template: giả ngân hàng, giả người thân cần tiền gấp, giả công an/cơ quan chức năng |
| Immunity score | Công thức minh bạch dựa trên red flags recognized / total red flags |
| Result dashboard | Điểm, red flags đúng/bỏ lỡ, highlight hội thoại, gợi ý luyện tiếp |
| Safety handling | Không yêu cầu dữ liệu thật, không tạo link/app/QR thật, không hướng dẫn lừa đảo thực tế |

### 5.3. Out of Scope

| Item | Reason |
|---|---|
| Voice AI | Tăng rủi ro demo, safety và thời gian triển khai |
| Pipeline tin tức scam real-time | Không cần cho MVP, dễ phình scope |
| Cá nhân hóa sâu bằng dữ liệu cá nhân thật | Rủi ro privacy, không cần chứng minh value |
| Authentication phức tạp | Không cần cho demo MVP |
| Tích hợp ngân hàng/Zalo/Facebook thật | Rủi ro pháp lý và kỹ thuật |
| Deepfake scenario | Rủi ro cao, để future scope |
| Report scam tới cơ quan chức năng | Không phải mục tiêu luyện tập MVP |

### 5.4. MVP Non-Negotiables

1. Gemini/Google AI là AI chính của sản phẩm cuối.
2. Luồng hội thoại chính không được là decision tree cố định.
3. Consent là bắt buộc trước khi mô phỏng.
4. Không lưu trữ dữ liệu cá nhân thật trong kịch bản mẫu.
5. Điểm miễn dịch phải minh bạch, không phải “AI tự chấm mơ hồ”.
6. Feedback phải không phán xét người tham gia.

### 5.5. MVP Tooling Principle

MVP không bắt buộc dùng Spring Boot. Vì AI Riser Vietnam 2026 định hướng **Google AI Studio** và **Build with Google AI**, hướng tooling chính nên là Google AI Studio Build Mode. Theo tài liệu Google AI Studio, web app mặc định có frontend React và server-side Node.js runtime để gọi API và quản lý secrets. Vì vậy React/Node là chấp nhận được nếu đến từ AI Studio và giúp deploy nhanh; không cần xây một hệ thống React/Spring Boot thủ công, cồng kềnh.

**Recommended default for Phase 3 Technical Design:**

| Layer | Recommended Tool | Why |
|---|---|---|
| Build/demo environment | Google AI Studio Build Mode | Bám chương trình AI Riser, hỗ trợ vibe coding và deploy nhanh |
| Web app | AI Studio full-stack web app | Có client-side React mặc định và server-side Node.js runtime để gọi Gemini an toàn |
| UI | React do AI Studio tạo hoặc vanilla components đơn giản | Đủ cho create session, consent, chat, dashboard; không over-engineer |
| Storage | In-memory/session storage hoặc JSON seed cho demo; Firestore nếu AI Studio setup thuận lợi | MVP chỉ cần lưu session demo; tránh DB phức tạp |
| AI | Gemini API | AI chính của sản phẩm |
| Validation | JSON schema / Zod-style validation | Kiểm soát output Gemini và scoring minh bạch |
| Deployment | Google Cloud Run via AI Studio | Bám yêu cầu chương trình và dễ có public demo URL |

**Trade-off:** AI Studio web app có thể dùng React/Node mặc định, nhưng team không nên mở rộng thành kiến trúc frontend/backend phức tạp. Phương án FastAPI + SQLite chỉ giữ làm fallback local nếu AI Studio bị giới hạn, không phải hướng nộp/demo ưu tiên.

## 6. Feature List

### F1. Training Session Creation

**User story:** Là người mời, tôi muốn chọn một kịch bản luyện tập để tạo buổi luyện cho cha mẹ/ông bà.

**Acceptance Criteria:**

- Hiển thị 3 kịch bản MVP.
- Mỗi kịch bản có tên, mô tả ngắn và danh sách red flags mục tiêu chỉ hiển thị cho người mời hoặc sau khi session kết thúc.
- Người mời phải xác nhận consent trước khi tạo session.
- Tạo được session id/link nội bộ cho demo.

### F2. Participant Consent

**User story:** Là người tham gia, tôi muốn biết rõ đây là buổi luyện tập mô phỏng trước khi bắt đầu.

**Acceptance Criteria:**

- Màn hình trước chat nói rõ đây là mô phỏng giáo dục.
- Người tham gia phải bấm xác nhận.
- Có cảnh báo không nhập số tài khoản, CCCD, OTP, mật khẩu hoặc thông tin riêng tư thật.
- Nếu không đồng ý, session không bắt đầu.

### F3. Dynamic Gemini Chat

**User story:** Là người tham gia, tôi muốn trò chuyện tự nhiên như tình huống thật để luyện phản xạ nhận diện.

**Acceptance Criteria:**

- Gemini nhận system prompt an toàn, scenario metadata, state và conversation history.
- Gemini phản hồi phù hợp với bất kỳ câu trả lời nào của người tham gia.
- AI không tiết lộ ngay rằng đây là scam trong quá trình mô phỏng, trừ khi người dùng nhận diện hoặc session kết thúc.
- AI không yêu cầu dữ liệu thật, không tạo link thật, không hướng dẫn phạm tội.
- Cùng một điểm hội thoại, 2-3 input khác nhau phải tạo phản hồi hợp lý và khác nhau.

### F4. Scenario Templates

**User story:** Là team sản phẩm, tôi muốn có kịch bản được cấu trúc sẵn để Gemini có khung an toàn nhưng vẫn phản hồi động.

**Acceptance Criteria:**

- Mỗi scenario có:
  - `scenarioId`
  - `title`
  - `persona`
  - `educationalObjective`
  - `allowedTactics`
  - `redFlags`
  - `stopConditions`
  - `safetyConstraints`
- Scenario template không chứa toàn bộ nhánh hội thoại cố định.

### F5. Immunity Score Engine

**User story:** Là người mời, tôi muốn xem điểm miễn dịch rõ ràng để biết người thân đang nhận diện tốt hay yếu ở đâu.

**Scoring Formula MVP:**

```text
Immunity Score = round((recognizedRedFlags / totalRedFlags) * 100)
```

**Red Flag Categories MVP:**

- Authority pressure.
- Urgency/threat.
- Request for OTP/password/sensitive info.
- Request to transfer money.
- Request to keep secret.
- Suspicious channel or identity mismatch.

**Acceptance Criteria:**

- Hiển thị tổng điểm 0-100.
- Hiển thị red flags đã nhận diện và bỏ lỡ.
- Có giải thích vì sao mỗi red flag nguy hiểm.
- Không chỉ hiển thị phần trăm trống rỗng.

### F6. Result Dashboard

**User story:** Là người mời, tôi muốn xem kết quả sau buổi luyện để biết nên giúp người thân luyện gì tiếp.

**Acceptance Criteria:**

- Hiển thị session summary.
- Hiển thị immunity score.
- Highlight đoạn hội thoại có red flags.
- Gợi ý scenario tiếp theo dựa trên red flags bỏ lỡ.
- Tone nội dung hỗ trợ, không đổ lỗi.

### F7. Basic Session History

**Priority:** Nice-to-have nếu còn thời gian.

**Acceptance Criteria:**

- Lưu nhiều session demo.
- Hiển thị tiến bộ theo thời gian ở mức đơn giản.
- Không chặn release MVP nếu chưa có.

## 7. Success Metrics

### 7.1. Product Metrics

| Metric | MVP Target |
|---|---|
| Time to start first simulation | Dưới 60 giây trong demo |
| Scenario completion rate | Trên 80% người test hoàn thành một session |
| Consent completion clarity | 100% session có consent trước khi chat |
| Result interpretability | Người mời hiểu ít nhất 1 điểm yếu cụ thể sau session |

### 7.2. AI-Native Metrics

| Metric | MVP Target |
|---|---|
| Dynamic response test | Với 3 input khác nhau ở cùng context, Gemini phản hồi hợp lý và không lặp máy móc |
| Rule-based dependency | Không có luồng hội thoại chính bằng if/else cố định |
| Safety compliance | Không sinh link thật, không yêu cầu OTP/mật khẩu thật, không hướng dẫn phạm tội |
| Latency for demo | Phản hồi AI đủ nhanh để demo trực tiếp, ưu tiên dưới 5 giây nếu hạ tầng cho phép |

### 7.3. Learning Metrics

| Metric | MVP Target |
|---|---|
| Red flag recognition | Người dùng nhận diện ít nhất 1 red flag sau buổi luyện |
| Feedback usefulness | Dashboard chỉ ra được red flag cụ thể bị bỏ lỡ |
| Next action clarity | Có gợi ý luyện tiếp theo dựa trên điểm yếu |

### 7.4. AI Riser Judging Checklist

Checklist này phải được dùng lại ở Phase 6 Implementation trước khi báo một sprint là hoàn thành.

| Tiêu chí | Câu hỏi tự kiểm tra | PRD Requirement |
|---|---|---|
| Feasibility | Phần này có chạy ổn định trong demo trực tiếp 3 phút không? Có phụ thuộc network, API rate limit, latency không? | MVP phải có flow ngắn, fallback an toàn, demo script đã test. |
| AI Necessity / AI-Native | Nếu bỏ AI khỏi phần này, sản phẩm còn hoạt động đúng như thiết kế không? | Chat simulation bắt buộc dùng Gemini sinh phản hồi động; không dùng decision tree làm luồng chính. |
| Demo Quality | Với 2-3 câu trả lời khác nhau tại cùng một điểm hội thoại, AI có phản hồi hợp lý, khác nhau, không lặp kịch bản cứng không? | Cần test dynamic response trước khi coi chat feature là xong. |
| Innovation | Dashboard có vượt qua quiz đúng/sai đơn thuần không? | Dashboard phải highlight red flags trong hội thoại và gợi ý luyện tiếp. |
| Impact | Người mời có biết chính xác người thân yếu ở dấu hiệu nào không? | Kết quả phải actionable theo từng red flag, không chỉ một điểm số chung. |

## 8. Risk

### 8.1. Product Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Người tham gia cảm thấy bị gài bẫy | High | Consent rõ ràng cho cả hai bên, không che giấu mục đích luyện tập |
| Feedback làm người lớn tuổi xấu hổ | Medium | Dùng tone hỗ trợ, tránh ngôn ngữ phán xét |
| MVP bị hiểu là app quiz đơn giản | Medium | Nhấn mạnh dynamic chat và highlight hành vi trong hội thoại |
| Scope creep sang detect/report scam thật | High | Giữ out-of-scope rõ trong PRD |

### 8.2. AI and Safety Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Gemini sinh nội dung có thể dùng cho lừa đảo thật | High | System prompt đóng khung giáo dục, validator, không link thật, không dữ liệu thật |
| Gemini không ổn định trong demo | High | Retry, fallback message an toàn, chuẩn bị scenario demo đã test |
| Scoring bằng AI mơ hồ | Medium | Scoring dựa trên red flag schema minh bạch; AI chỉ hỗ trợ phân tích bằng JSON có kiểm tra |
| Prompt injection từ người dùng | Medium | System prompt ưu tiên safety, backend giới hạn output, không cho AI thay đổi vai trò |

### 8.3. Technical Risks

| Risk | Severity | Mitigation |
|---|---|---|
| API latency/rate limit | High | Cache scenario intro, fallback safe response, demo script ngắn |
| JSON output lỗi | Medium | Schema validation và retry |
| Lưu dữ liệu nhạy cảm ngoài ý muốn | High | Mask input nhạy cảm, cảnh báo trước khi chat, không dùng dữ liệu thật trong seed |

## 9. Future Scope

Các mục sau chỉ xem xét sau MVP, không đưa vào phase implementation ban đầu:

1. Lịch sử nhiều buổi luyện tập và biểu đồ tiến bộ.
2. Thư viện scenario mở rộng: việc nhẹ lương cao, đầu tư tài chính giả, mua sắm/vé Tết.
3. Chế độ nhóm gia đình nhiều người.
4. Mức độ khó tăng dần theo năng lực người tham gia.
5. Tích hợp nguồn cảnh báo chính thống để cập nhật scenario thủ công.
6. Voice simulation có kiểm soát.
7. Deepfake awareness module dạng giải thích, không mô phỏng deepfake thật trong MVP.
8. Export report PDF cho gia đình hoặc mentor.

## 10. PRD Decision Log

| Decision | Rationale | Trade-off |
|---|---|---|
| Chọn gia đình Việt Nam làm persona chính | Impact rõ, khác với security awareness enterprise | Scope hẹp hơn doanh nghiệp nhưng demo cảm xúc và dễ hiểu hơn |
| Chỉ chọn 3 kịch bản MVP | Đủ chứng minh value và không quá rộng | Bỏ qua một số scam phổ biến như đầu tư giả ở MVP đầu |
| Dùng Gemini chat động làm core | Chứng minh AI-native | Cần guardrails và kiểm thử kỹ hơn |
| Consent bắt buộc | Đảm bảo đạo đức và tránh cảm giác gài bẫy | Thêm một bước trước khi vào demo |
| Scoring dựa trên red flags | Minh bạch, dễ giải thích với giám khảo | Chưa phản ánh toàn bộ sắc thái tâm lý |
| Chọn Google AI Studio làm hướng demo chính | Bám AI Riser 2026, Build with Google AI, dễ deploy Cloud Run | Ít kiểm soát stack hơn code thủ công |
| Chấp nhận React/Node nếu do AI Studio tạo | Đây là default web app của AI Studio và hỗ trợ server-side secrets | Cần giữ scope UI đơn giản để không over-engineer |
| Giữ FastAPI + SQLite làm fallback local | Có phương án dự phòng nếu AI Studio hạn chế | Không phải hướng ưu tiên cho submission/demo |

## 11. Phase 2 Deliverables

- `PRD.md`: hoàn thành.
- MVP scope: xác định rõ.
- In-scope/out-of-scope: xác định rõ.
- Feature list và acceptance criteria: hoàn thành.
- Success metrics: hoàn thành.
- Risk report: hoàn thành.
- Future scope: ghi nhận nhưng không đưa vào MVP.

## 12. Phase 2 Review Gate

Phase 2 đề xuất hướng cho Phase 3 Technical Design:

- Không dùng Spring Boot cho MVP.
- Hướng chính: Google AI Studio Build Mode + Gemini API + Cloud Run deployment.
- Chấp nhận React/Node server-side nếu đó là stack AI Studio tạo ra, nhưng giữ UI và logic thật gọn.
- App cần có session management, scenario template, Gemini orchestration, scoring engine và safety validator.
- UI cần có 4 màn hình chính: create session, participant consent, chat, dashboard.
- Storage chỉ cần đủ cho MVP: scenario seed, session state, messages, red flag events, scores. Có thể dùng in-memory/session storage cho demo hoặc Firestore nếu AI Studio setup thuận lợi.
- API/route/server actions phải phục vụ demo nhanh, ưu tiên ổn định hơn độ phức tạp.
- Technical Design phải khóa rõ: Gemini là luồng hội thoại chính, không dùng decision tree cố định.

**Status:** Phase 2 ready for review. Chỉ chuyển sang Phase 3 sau khi review xong.
