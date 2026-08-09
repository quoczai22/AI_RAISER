# AI Scam Inoculation - Map of Content (MOC)

> File này là hub trung tâm. Mở trong Obsidian từ gốc repo để tạo node chính của Graph View, tỏa ra liên kết tới tài liệu dự án.

---

## Lõi Dự Án

- [[AGENTS]] - nguồn sự thật duy nhất, quy tắc bắt buộc cho mọi AI làm việc trên dự án
- [[LOCAL_STATUS]] - trạng thái hiện tại, cập nhật liên tục bởi Antigravity
- [[TASKS]] - việc Codex ghi lại cần Antigravity xử lý tiếp
- [[docs/obsidian/Memory_Index|Memory Index]] - bản đồ context sống cho Codex/Antigravity

## Tài Liệu Product Discovery (8-phase)

- [[Research]] - bằng chứng nghiên cứu nền tảng
- [[PRD]] - Problem, User, MVP, Success Metrics, Future Scope
- [[TechnicalDesign]] - kiến trúc, database, API, sprint planning
- [[AIDesign]] - prompt engineering, safety, guardrails, evaluation
- [[UI]] - wireframe, design system
- [[Testing]] - unit/integration/prompt evaluation/UAT
- [[Presentation]] - pitch, demo script, FAQ
- [[RiskReport]] - rủi ro đã ghi nhận

## Taxonomy - Lõi Lý Luận (5 Nhóm, Khóa Cứng)

- **Urgency** - tạo áp lực khẩn cấp
- **Authority** - giả danh quyền lực/tổ chức uy tín
- **Fear** - đe dọa hậu quả
- **Social Proof/Reciprocity** - lợi dụng lòng tin/tâm lý đám đông
- **Scarcity** - khan hiếm giả tạo

Ghi chú: nếu muốn taxonomy thành node riêng trên graph, tạo file `Taxonomy.md` rồi thêm wikilink tới file đó sau khi tạo.

## Scenario - Nhóm A (Câu Chuyện Riêng Biệt)

- [x] Giả ngân hàng - đã code trong `src/data/scenarios.json`
- [x] Giả công an/cơ quan chức năng - đã code trong `src/data/scenarios.json`
- [x] Người thân mượn tiền gấp - đã code trong `src/data/scenarios.json`
- [ ] Deepfake giọng nói - cần xác nhận, chưa có scenario trong repo hiện tại
- [x] Tuyển dụng giả / việc nhẹ lương cao - đã code trong `src/data/scenarios.json`
- [ ] Sales hợp đồng kỳ nghỉ (`travel_sales`) - chưa có trong source hiện tại; xem lịch sử ở [[TASKS_ARCHIVE]]
- [ ] Sales hợp đồng gym/PT (`gym_sales`) - chưa có trong source hiện tại; xem lịch sử ở [[TASKS_ARCHIVE]]
- [ ] Chuyển nhầm tiền - có thể nghiên cứu sau, chưa có task active

## Scenario - Nhóm B (Biến Thể Cùng Khung, Đổi Vai Giả Mạo)

- [ ] Sàn TMĐT (Shopee/Lazada) - chưa thấy trong task active hiện tại
- [ ] VNeID/Dịch vụ công - chưa thấy trong task active hiện tại
- [ ] Future scope: Điện lực, Thuế, Bưu điện/Shipper

## Scenario - Nhóm C (Nhạy Cảm, Đang Nghiên Cứu)

- [ ] Tuyển dụng dẫn tới buôn người/lao động cưỡng bức - đã có biến thể `fake_job`, cần tránh mô tả gây sang chấn
- [ ] Lừa đảo nội bộ sinh viên (giả danh cùng trường) - chưa có task active

## Báo Cáo Nghiên Cứu

- [[Research]] - nghiên cứu nền tảng
- [[TASKS_ARCHIVE]] - lịch sử review, gồm quyết định loại `travel_sales` và `gym_sales` khỏi source khi chưa đủ nguồn accept
- Báo cáo `Nghien-Cuu-Sales-Ap-Luc-Cao-Timeshare-Gym.md`: CHƯA CÓ FILE TRONG REPO, chưa tạo wikilink để tránh node chết
- Các báo cáo mới từ nhánh khác: thêm link vào đây khi file Markdown đã tồn tại trong repo

## Vận Hành & Nộp Bài

- [[AGENTS#Quy tắc giao việc cho Antigravity|Antigravity-Prompt-Chuan]] - quy tắc giao việc, chống tự tin ảo
- [[TASKS#Luật Review|Codex-Manager-Role]] - vai trò review của Codex
- [[docs/real_traction_plan|Ke-Hoach-Real-Traction]] - kế hoạch thu thập bằng chứng người dùng thật
- [[docs/ai_riser_checklist]] - checklist trước nộp
- [[docs/google_ai_studio_porting]] - hướng port sang Google AI Studio
- Bài nộp chính: **link AI Studio project** (Share -> Public), không phải GitHub/Cloud Run
- Deadline cứng: **30/08/2026**

## Tiêu Chí Chấm Điểm

- Feasibility 40% (gồm accessibility)
- Impact 30% (problem-fit, khả năng scale)
- Creativity 30% (tránh template, wow factor)
- Bonus: Google Tech tích hợp (+10), Publish app (+10)

---

## Cách Dùng Graph Này Hiệu Quả

1. Mở Obsidian, chọn "Open folder as vault" và trỏ đúng gốc repo.
2. Mở file này, bật Graph View để thấy node trung tâm tỏa ra các nhánh.
3. Mỗi khi thêm file `.md` mới, quay lại đây thêm một wikilink sau khi file đã tồn tại.
4. [[AGENTS]], [[LOCAL_STATUS]], [[TASKS]] vẫn là nguồn sự thật vận hành. MOC này chỉ là lớp nhìn tổng quan, không thay thế các file đó.
