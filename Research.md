# AI Scam Inoculation - Phase 1 Research Evidence

## 1. Phase Objective

Phase 1 xác lập cơ sở nghiên cứu cho MVP **AI Scam Inoculation**: một hệ thống dùng **Gemini/Google AI** để mô phỏng các tình huống lừa đảo thực tế, giúp người dùng hình thành phản xạ nhận diện và chống lại Social Engineering.

Phạm vi nghiên cứu chỉ phục vụ MVP đã chốt. Không mở rộng sang hệ thống phát hiện gian lận giao dịch, điều tra tội phạm, hay nền tảng cybersecurity doanh nghiệp đầy đủ.

MVP context hợp nhất: sản phẩm ưu tiên **tự luyện tập trực tiếp** để chứng minh AI-native trong demo. Người dùng tự chọn tình huống/cấp độ, xác nhận mô phỏng, chat với Gemini và xem điểm miễn dịch. Góc gia đình được giữ ở cuối bằng tính năng mỏng “chia sẻ kết quả cho người thân”. Giá trị AI cốt lõi không phải là chatbot hỏi đáp chung, mà là khả năng tạo phản hồi hội thoại tự nhiên, có kiểm soát và không đi theo cây quyết định cố định.

### 1.1. AI Riser Vietnam 2026 Context Update

Tên chương trình cần dùng nhất quán là **AI Riser Vietnam 2026**. Theo thông tin công khai từ Báo Đà Nẵng và GDG Cloud HCMC, đây là thử thách đổi mới sáng tạo cho cộng đồng yêu công nghệ tại Việt Nam, gắn với tinh thần **#Vibecoding** và **#BuildwithGoogleAI**. Người tham gia được định hướng sử dụng **Google AI Studio** để xây dựng giải pháp và triển khai lên **Google Cloud Run** hoặc **Google Play Store**. Một trong các track/chủ đề của chương trình là **phòng chống lừa đảo / anti-fraud**.

Ý nghĩa với dự án:

- Gemini/Google AI không chỉ là lựa chọn sản phẩm, mà là yêu cầu chiến lược để bám chương trình.
- Demo nên ưu tiên chạy được trong hệ sinh thái Google AI Studio/Cloud Run.
- Nếu chọn web app, ưu tiên thiết kế có thể được build/deploy bằng Google AI Studio Build Mode.
- FastAPI/SQLite vẫn có thể là phương án local fallback, nhưng không nên là hướng chính nếu nộp/demo yêu cầu Google AI Studio.

## 2. Cyber Scam Vietnam

### 2.1. Bối cảnh tại Việt Nam

Lừa đảo trực tuyến tại Việt Nam đang trở thành vấn đề xã hội rõ rệt vì tội phạm tận dụng mạng xã hội, ứng dụng nhắn tin, thương mại điện tử, ngân hàng số và các sự kiện thời sự để thao túng người dùng.

Các nguồn chính thức và bán chính thức cho thấy một số đặc điểm nổi bật:

| Evidence | Ý nghĩa với sản phẩm |
|---|---|
| Cục An toàn thông tin ghi nhận ngay tuần đầu năm 2025 có **6.685 phản ánh** về lừa đảo trực tuyến từ người dùng tại Việt Nam. Nguồn: [OneTouch/MIC, 15/01/2025](https://onetouch.mic.gov.vn/chi-tiet-tin-tuc/lua-dao-truc-tuyen-van-nan-nhung-ngay-dau-nam-2025) | Người dùng cần được luyện phản xạ thường xuyên, không chỉ đọc cảnh báo một lần. |
| GASA và Chống Lừa Đảo khảo sát 1.063 người Việt Nam, 29% người được hỏi cho biết đã mất tiền, mức mất trung bình khoảng **17,7 triệu VND** mỗi vụ. Nguồn: [English MIC/MST, 12/01/2024](https://english.mst.gov.vn/vietnamese-lose-vnd20-million-on-online-scams-197240112095533512.htm), [GASA Vietnam 2023](https://gasa.org/knowledge-base/reports/state-of-scams-in-vietnam-report-2023) | Tác động tài chính đủ lớn để biện minh cho sản phẩm giáo dục phòng vệ. |
| GASA ước tính thiệt hại scam tại Việt Nam năm 2023 khoảng **391,8 nghìn tỷ VND**, tương đương **16,23 tỷ USD** hoặc **3,6% GDP**. Nguồn: [GASA Vietnam 2023](https://gasa.org/knowledge-base/reports/state-of-scams-in-vietnam-report-2023) | Đây không chỉ là vấn đề cá nhân mà là rủi ro kinh tế số. |
| Bộ Công an cảnh báo các thủ đoạn đầu tư tài chính, chứng khoán, tiền ảo giả mạo, thường tiếp cận qua mạng xã hội và xây dựng lòng tin trước khi chiếm đoạt tài sản. Nguồn: [MPS, 02/05/2025](https://mps.gov.vn/bai-viet/canh-bao-thu-doan-du-do-tham-gia-dau-tu-tai-chinh-san-chung-khoan-tien-ao-tren-khong-gian-mang-d22-t44828) | MVP nên ưu tiên mô phỏng hội thoại kéo dài, không chỉ mô phỏng email phishing. |
| MIC cảnh báo tội phạm mạng thay đổi thủ đoạn theo xu hướng thời sự như VssID, sinh trắc học ngân hàng, Olympic, ứng dụng thuế. Nguồn: [MIC, 05/08/2024](https://mic.gov.vn/toi-pham-mang-lien-tuc-thay-doi-hinh-thuc-lua-dao-theo-xu-huong-thoi-su-197240805103407493.htm) | Kịch bản phải cập nhật được theo bối cảnh Việt Nam và thời điểm xã hội. |

### 2.2. Các kịch bản scam phổ biến tại Việt Nam

Các kịch bản phù hợp cho MVP:

1. **Giả danh cơ quan nhà nước hoặc dịch vụ công**
   - Thuế, công an, điện lực, bảo hiểm xã hội, ngân hàng.
   - Mục tiêu: lấy CCCD, OTP, thông tin ngân hàng, yêu cầu cài app giả.

2. **Đầu tư tài chính, tiền ảo, chứng khoán giả**
   - Dẫn dụ qua Facebook, Zalo, Telegram, ứng dụng nhắn tin.
   - Kỹ thuật: tạo quan hệ, khoe lợi nhuận, đưa người dùng vào sàn giả, khóa rút tiền.

3. **Việc nhẹ lương cao**
   - Đánh vào người cần việc làm, sinh viên, lao động trẻ, người ở vùng nông thôn.
   - Có thể dẫn tới mất tiền đặt cọc, bị ép làm việc trong đường dây lừa đảo xuyên biên giới.

4. **Mua sắm, vé xe, vé máy bay, khuyến mãi mùa cao điểm**
   - Đặc biệt quanh Tết hoặc các dịp du lịch.
   - Dùng website/fanpage giả, yêu cầu chuyển khoản nhanh để giữ chỗ.

5. **Deepfake/AI impersonation**
   - MIC đã cảnh báo hình thức dùng AI ghép mặt giả mạo người thân trong bối cảnh lừa đảo trực tuyến gia tăng. Nguồn: [MIC, 30/12/2024](https://mic.gov.vn/canh-giac-truoc-nhung-thu-doan-lua-dao-moi-197241230143647271.htm)
   - Đây là kịch bản nâng cao, nên để sau MVP hoặc chỉ nhắc ở future risk.

### 2.3. Insight chính

Người dùng Việt Nam không chỉ cần “biết danh sách chiêu trò”, mà cần luyện cách phản ứng trong thời điểm bị gây áp lực. Nhiều cảnh báo hiện tại là dạng đọc thụ động, trong khi scam thật thường xảy ra dưới áp lực cảm xúc: sợ bị phạt, sợ mất cơ hội, muốn kiếm tiền nhanh, muốn giúp người thân, hoặc tin vào người đang xây dựng quan hệ.

Với người dùng phổ thông và nhóm 55+, rủi ro không chỉ nằm ở thiếu kiến thức kỹ thuật mà còn ở thói quen tin vào cuộc gọi/tin nhắn từ người có vẻ có thẩm quyền hoặc người thân. Vì vậy, MVP cần ưu tiên các kịch bản gần đời sống: giả ngân hàng, giả người thân cần tiền gấp, giả công an/cơ quan chức năng. Các kịch bản này phải có bước đồng thuận rõ ràng trước khi bắt đầu để người dùng hiểu đây là mô phỏng tự luyện tập.

## 3. Social Engineering

### 3.1. Định nghĩa trong phạm vi sản phẩm

Social Engineering là nhóm kỹ thuật tấn công khai thác tâm lý và hành vi con người thay vì chỉ khai thác lỗ hổng kỹ thuật. Trong bối cảnh AI Scam Inoculation, Social Engineering được hiểu là:

- Dẫn dụ người dùng cung cấp thông tin nhạy cảm.
- Thao túng người dùng chuyển tiền, cài app, bấm link, quét QR, chia sẻ OTP.
- Tạo niềm tin giả thông qua vai trò, danh tính, hoàn cảnh, quan hệ hoặc áp lực thời gian.

### 3.2. Các cơ chế tâm lý thường bị khai thác

| Cơ chế | Biểu hiện trong scam | Ý nghĩa thiết kế mô phỏng |
|---|---|---|
| Authority | Giả danh công an, thuế, ngân hàng, điện lực | Kịch bản phải kiểm tra khả năng xác minh nguồn chính thống. |
| Urgency | “Trong 2 giờ sẽ cắt điện”, “hết hạn hôm nay” | Cần đo phản ứng khi người dùng bị ép quyết định nhanh. |
| Scarcity | “Chỉ còn 1 suất”, “vé rẻ cuối cùng” | Cần mô phỏng cám dỗ cơ hội hiếm. |
| Reciprocity | Cho quà, trả hoa hồng nhỏ ban đầu | Cần có kịch bản nhiều bước, không chỉ một tin nhắn. |
| Social proof | Dùng group, ảnh chụp lợi nhuận, người nổi tiếng giả | Cần dạy người dùng kiểm tra bằng chứng độc lập. |
| Emotional bonding | Lừa tình cảm, pig butchering | Cần cẩn trọng safety vì mô phỏng có thể gây khó chịu hoặc quá giống thật. |

### 3.3. Vì sao chỉ cảnh báo là chưa đủ

Nghiên cứu về đào tạo nhận thức an ninh cho thấy social engineering khó giảm bằng biện pháp kỹ thuật đơn thuần, vì điểm yếu nằm ở quyết định của con người trong ngữ cảnh xã hội. Các nghiên cứu về conversational agent và serious game cho social engineering chỉ ra hướng tiếp cận hiệu quả hơn: cho người học thực hành trong tình huống mô phỏng, nhận phản hồi, và hiểu cách kẻ tấn công thao túng họ. Nguồn: [Computers & Security, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0167404823001177), [ERIC, 2022](https://eric.ed.gov/?id=EJ1360322)

## 4. Inoculation Theory

### 4.1. Khái niệm

Inoculation Theory, bắt nguồn từ nghiên cứu của William J. McGuire, xem việc chống lại thuyết phục độc hại giống như “tiêm vaccine tâm lý”: người học được tiếp xúc trước với một phiên bản yếu, an toàn và có kiểm soát của kỹ thuật thao túng, sau đó được hướng dẫn cách phản biện.

Trong bối cảnh scam:

- “Mầm bệnh” là kỹ thuật thao túng: giả danh, khẩn cấp, đe dọa, hứa lợi nhuận, yêu cầu bí mật.
- “Liều yếu” là một tình huống scam mô phỏng, không gây thiệt hại thật.
- “Kháng thể” là khả năng nhận diện red flags và phản ứng an toàn.

### 4.2. Cơ chế phù hợp với sản phẩm

Theo các tổng quan nghiên cứu về psychological inoculation, hai thành phần quan trọng là:

1. **Forewarning**
   - Báo trước rằng người dùng có thể bị thao túng.
   - Trong sản phẩm: mở đầu scenario bằng mục tiêu học tập rất ngắn, không tiết lộ đáp án.

2. **Weakened dose + refutational preemption**
   - Cho người dùng trải nghiệm phiên bản mô phỏng của kỹ thuật lừa đảo.
   - Sau đó giải thích vì sao phản ứng của họ an toàn hoặc rủi ro.

Nguồn nghiên cứu: [Traberg, Roozenbeek & van der Linden, 2022](https://journals.sagepub.com/doi/10.1177/00027162221087936), [van der Linden, 2024](https://www.sciencedirect.com/science/article/pii/S0065260123000266)

### 4.3. Liên hệ với Google/Jigsaw

Các dự án prebunking của University of Cambridge, University of Bristol và Google Jigsaw cho thấy việc dạy người dùng nhận diện kỹ thuật thao túng trước khi gặp thông tin độc hại có thể cải thiện khả năng phát hiện thao túng. Nguồn: [University of Cambridge](https://www.cam.ac.uk/stories/inoculateexperiment), [Inoculation Science](https://inoculation.science/study-information/)

Điểm liên hệ với AI Scam Inoculation:

- Không chỉ dạy “scam này là scam”.
- Dạy kỹ thuật nền: khẩn cấp giả, authority giả, lợi nhuận phi thực tế, yêu cầu giữ bí mật, yêu cầu chuyển nền tảng chat.
- Kỹ thuật này có khả năng áp dụng sang nhiều kịch bản scam mới.

## 5. Simulation Learning

### 5.1. Vì sao dùng mô phỏng

Simulation Learning phù hợp với scam/social engineering vì người dùng cần luyện trong môi trường:

- Có tương tác.
- Có áp lực vừa đủ.
- Có hậu quả mô phỏng nhưng không gây thiệt hại thật.
- Có feedback ngay sau quyết định.

Các nghiên cứu về serious game và conversational agent trong cybersecurity awareness cho thấy mô phỏng giúp người học hiểu cách tấn công vận hành và cải thiện nhận thức an ninh. Nguồn: [A Serious Game for Social Engineering Awareness Creation, 2022](https://eric.ed.gov/?id=EJ1360322), [Know your enemy, 2023](https://www.sciencedirect.com/science/article/abs/pii/S0167404823001177), [Security Awareness Adventure, 2025](https://www.sciencedirect.com/science/article/abs/pii/S0167404825001889)

### 5.2. Vai trò của AI sinh hội thoại

Gemini phù hợp với MVP vì:

- Có thể tạo hội thoại biến đổi theo phản ứng người dùng.
- Có thể giữ kịch bản scam trong giới hạn an toàn.
- Có thể sinh feedback cá nhân hóa dựa trên quyết định của người dùng.
- Có thể xuất JSON có cấu trúc để ứng dụng, scoring engine và dashboard xử lý.

Tuy nhiên, AI không được tự do tạo nội dung lừa đảo ngoài phạm vi giáo dục. Thiết kế prompt và guardrails phải đảm bảo mô phỏng là an toàn, không cung cấp hướng dẫn phạm tội, không xin dữ liệu thật và không tạo link/app/QR thật.

Điểm bắt buộc cần giữ trong các phase sau: luồng hội thoại chính phải dùng LLM sinh phản hồi động dựa trên system prompt, lịch sử hội thoại và trạng thái scenario. Không được thay bằng if/else hoặc decision tree cố định, vì như vậy sản phẩm mất giá trị AI-native và người dùng có thể học thuộc kịch bản.

Về triển khai, research không yêu cầu stack enterprise nặng như Spring Boot. Với AI Riser Vietnam 2026, ưu tiên công cụ trong hệ sinh thái Google: **Google AI Studio Build Mode + Gemini API + Cloud Run**. Theo tài liệu Google AI Studio, web app mặc định có client-side React và server-side Node.js runtime để gọi API an toàn. Vì vậy React/Node có thể được dùng nếu đó là stack do AI Studio tạo ra, nhưng không nên biến MVP thành hệ thống frontend/backend phức tạp ngoài nhu cầu demo.

## 6. Existing Solutions

### 6.1. Giải pháp cảnh báo tại Việt Nam

| Nhóm giải pháp | Ví dụ | Điểm mạnh | Khoảng trống |
|---|---|---|---|
| Cảnh báo từ cơ quan nhà nước | MIC, MPS, Cục An toàn thông tin, NCSC/VNCERT | Nguồn chính thống, cập nhật thủ đoạn mới | Người dùng đọc thụ động, ít luyện phản xạ trong hội thoại thật. |
| Chiến dịch truyền thông | “Nhận diện lừa đảo” của MIC và Meta năm 2024. Nguồn: [MIC, 17/07/2024](https://mic.gov.vn/cuc-an-toan-thong-tin-va-meta-phat-dong-chien-dich-nhan-dien-lua-dao-19724071714384132.htm) | Phạm vi tiếp cận rộng | Khó cá nhân hóa, khó đo năng lực từng người. |
| Cộng đồng chống lừa đảo | Chống Lừa Đảo, báo cáo GASA | Gần thực tế Việt Nam, có dữ liệu cộng đồng | Không phải trải nghiệm học tập mô phỏng end-to-end. |

### 6.2. Giải pháp quốc tế

| Nhóm giải pháp | Ví dụ | Điểm mạnh | Khoảng trống với dự án |
|---|---|---|---|
| Phishing simulation enterprise | KnowBe4, Proofpoint, Cofense | Mạnh cho tổ chức, email/phishing campaign, risk score | Thường hướng doanh nghiệp, chưa tối ưu cho scam đời sống Việt Nam, hội thoại cá nhân, tiếng Việt. |
| Security awareness game | Serious games, simulation platforms | Tăng engagement, luyện tình huống | Nhiều giải pháp chưa gắn local scam context Việt Nam. |
| Prebunking game/video | Bad News, Harmony Square, Go Viral, Jigsaw/Cambridge prebunking | Có cơ sở inoculation theory mạnh | Tập trung misinformation rộng, chưa tập trung scam/social engineering tài chính cá nhân tại Việt Nam. |
| Google Safety/AI scam protection | Google AI-powered scam detection. Nguồn: [Google Safety Center](https://safety.google/safety/scams-fraud/) | Bảo vệ ở tầng sản phẩm/platform | Không thay thế nhu cầu rèn luyện hành vi người dùng trong ngữ cảnh địa phương. |

## 7. Research Gap

Từ các nguồn trên, khoảng trống nghiên cứu/sản phẩm cho MVP là:

1. **Thiếu trải nghiệm mô phỏng scam tiếng Việt, bám ngữ cảnh Việt Nam**
   - Nhiều cảnh báo là dạng bài viết/tin tức.
   - Người dùng cần luyện với kịch bản như Zalo, Facebook, điện lực, thuế, ngân hàng, việc nhẹ lương cao, đầu tư giả.

2. **Thiếu mô phỏng hội thoại đa lượt**
   - Scam hiện đại không luôn kết thúc ở một email/link.
   - Nhiều vụ dựa vào xây dựng lòng tin qua nhiều tin nhắn, đặc biệt đầu tư và tình cảm.

3. **Thiếu cá nhân hóa feedback**
   - Người dùng khác nhau mắc lỗi khác nhau: quá tin authority, ham lợi nhuận, sợ bị phạt, thiếu kỹ năng xác minh.
   - MVP nên feedback theo quyết định của người dùng, không chỉ chấm đúng/sai.

4. **Thiếu cầu nối giữa inoculation theory và scam/social engineering đời sống**
   - Inoculation đã có bằng chứng trong misinformation/prebunking.
   - Cần áp dụng có kiểm soát sang scam simulation: weakened dose, red flag explanation, safe response.

5. **Thiếu công cụ đo lường tiến bộ hành vi ở quy mô nhỏ**
   - MVP không cần enterprise risk platform.
   - Nhưng cần đo: nhận diện red flags, chọn phản ứng an toàn, thời gian ra quyết định, điểm rủi ro theo scenario.

## 8. Supporting Evidence

### 8.1. Evidence Map

| Claim cần dùng cho PRD | Evidence hỗ trợ | Độ tin cậy |
|---|---|---|
| Scam tại Việt Nam là vấn đề lớn và đang tăng về độ tinh vi | MIC/MPS cảnh báo 2024-2026; GASA Vietnam 2023 | Cao |
| Người dùng bị tấn công qua kênh phổ biến như Facebook, Gmail, Telegram, Zalo/nhắn tin | GASA/MIC, cảnh báo MIC/MPS | Trung bình-cao |
| Social engineering khai thác tâm lý hơn là lỗi kỹ thuật | Nghiên cứu cybersecurity awareness/social engineering | Cao |
| Simulation/serious game có tiềm năng cải thiện awareness | ERIC 2022, Computers & Security 2023/2025 | Trung bình-cao |
| Inoculation/prebunking giúp tăng khả năng chống thao túng | SAGE 2022, AESP 2024, Cambridge/Jigsaw | Cao |
| Giải pháp hiện có chưa tối ưu cho scam đời sống Việt Nam bằng hội thoại AI tiếng Việt | So sánh giải pháp hiện có và cảnh báo địa phương | Trung bình |

### 8.2. Source List

1. MIC/OneTouch. “Lừa đảo trực tuyến: Vấn nạn những ngày đầu năm 2025.” 15/01/2025. <https://onetouch.mic.gov.vn/chi-tiet-tin-tuc/lua-dao-truc-tuyen-van-nan-nhung-ngay-dau-nam-2025>
2. MIC. “Nhận diện các chiêu lừa đảo trực tuyến dịp Tết Nguyên đán.” 06/01/2025. <https://mic.gov.vn/nhan-dien-cac-chieu-lua-dao-truc-tuyen-dip-tet-nguyen-dan-197250106161458728.htm>
3. MIC. “Tội phạm mạng liên tục thay đổi hình thức lừa đảo theo xu hướng thời sự.” 05/08/2024. <https://mic.gov.vn/toi-pham-mang-lien-tuc-thay-doi-hinh-thuc-lua-dao-theo-xu-huong-thoi-su-197240805103407493.htm>
4. MIC. “Cục An toàn thông tin và Meta phát động chiến dịch Nhận diện lừa đảo.” 17/07/2024. <https://mic.gov.vn/cuc-an-toan-thong-tin-va-meta-phat-dong-chien-dich-nhan-dien-lua-dao-19724071714384132.htm>
5. MPS. “Cảnh báo thủ đoạn dụ dỗ tham gia đầu tư tài chính, sàn chứng khoán, tiền ảo trên không gian mạng.” 02/05/2025. <https://mps.gov.vn/bai-viet/canh-bao-thu-doan-du-do-tham-gia-dau-tu-tai-chinh-san-chung-khoan-tien-ao-tren-khong-gian-mang-d22-t44828>
6. MPS. “Chống lừa đảo trực tuyến 2025: Lan tỏa thông điệp Nhận diện bẫy lừa - An tâm vui sắm.” 27/11/2025. <https://mps.gov.vn/bai-viet/chong-lua-dao-truc-tuyen-2025-lan-toa-thong-diep-nhan-dien-bay-lua-an-tam-vui-sam-1764245385>
7. Global Anti-Scam Alliance. “State of Scams in Vietnam Report - 2023.” 06/12/2023. <https://gasa.org/knowledge-base/reports/state-of-scams-in-vietnam-report-2023>
8. English MIC/MST. “Vietnamese lose VND20 million on online scams.” 12/01/2024. <https://english.mst.gov.vn/vietnamese-lose-vnd20-million-on-online-scams-197240112095533512.htm>
9. Chống Lừa Đảo. “Chống Lừa Đảo và GASA: Đóng góp quan trọng trong báo cáo tình hình lừa đảo tại Việt Nam 2023.” 24/04/2025. <https://chongluadao.vn/posts/chong-lua-dao-va-gasa%3A-dong-gop-quan-trong-trong-bao-cao-tinh-hinh-lua-djao-tai-viet-nam-2023>
10. Traberg, C. S., Roozenbeek, J., & van der Linden, S. “Psychological Inoculation against Misinformation: Current Evidence and Future Directions.” 2022. <https://journals.sagepub.com/doi/10.1177/00027162221087936>
11. van der Linden, S. “Countering misinformation through psychological inoculation.” 2024. <https://www.sciencedirect.com/science/article/pii/S0065260123000266>
12. University of Cambridge. “Social media experiment reveals potential to inoculate millions of users against misinformation.” <https://www.cam.ac.uk/stories/inoculateexperiment>
13. Inoculation Science. “Study information.” <https://inoculation.science/study-information/>
14. Muhly, F., Leo, P., & Caneppele, S. “A Serious Game for Social Engineering Awareness Creation.” 2022. <https://eric.ed.gov/?id=EJ1360322>
15. “Know your enemy: Conversational agents for security, education, training, and awareness at scale.” Computers & Security, 2023. <https://www.sciencedirect.com/science/article/abs/pii/S0167404823001177>
16. “The Security Awareness Adventure: A serious game for security awareness training utilizing a state transition system and a probabilistic model.” Computers & Security, 2025. <https://www.sciencedirect.com/science/article/abs/pii/S0167404825001889>
17. Google Safety Center. “Protection from Online Scams & Fraud.” <https://safety.google/safety/scams-fraud/>
18. Báo Đà Nẵng. “Mở đơn đăng ký chương trình Builder AI Riser Vietnam 2026.” 21/07/2026. <https://baodanang.vn/mo-don-dang-ky-chuong-trinh-builder-ai-riser-vietnam-2026-3345131.html>
19. GDG Cloud HCMC. “AI Riser Vietnam 2026: Vibe Coding Day.” <https://gdg.community.dev/events/details/google-gdg-cloud-hcmc-presents-ai-riser-vietnam-2026-vibe-coding-day/>
20. Google AI for Developers. “Build apps in Google AI Studio.” <https://ai.google.dev/gemini-api/docs/aistudio-build-mode>
21. Google AI for Developers. “Deploying from Google AI Studio.” <https://ai.google.dev/gemini-api/docs/aistudio-deploying>

## 9. Phase 1 Risk Report

| Risk | Tác động | Mitigation cho phase sau |
|---|---|---|
| Mô phỏng scam quá thật có thể bị lạm dụng thành hướng dẫn lừa đảo | Cao | AIDesign phải có guardrails: không tạo link thật, không hướng dẫn chiếm đoạt, không yêu cầu dữ liệu thật, không xuất kịch bản tấn công có thể dùng nguyên xi ngoài môi trường học. |
| Người dùng có thể bị stress khi gặp kịch bản gần trải nghiệm từng bị lừa | Trung bình | PRD cần có cảnh báo nhẹ, nút thoát scenario, tone feedback không phán xét. |
| Luyện tập không có đồng thuận rõ ràng có thể khiến người dùng hiểu nhầm đây là tình huống thật | Cao | PRD phải có single-user consent flow trước khi scenario bắt đầu. |
| Implement hội thoại bằng cây quyết định sẽ làm mất điểm AI-native | Cao | Technical Design phải mô tả LLM-driven dialogue engine; scenario template chỉ định mục tiêu/red flags, không định nghĩa toàn bộ nhánh hội thoại. |
| Dữ liệu scam thay đổi nhanh theo thời sự | Trung bình | Technical Design cần tách scenario template khỏi code, có versioning và metadata nguồn. |
| Dùng số liệu GASA dựa trên khảo sát có thể có bias mẫu | Trung bình | Trong PRD không dùng số liệu như thống kê tuyệt đối duy nhất; kết hợp nguồn MIC/MPS và ghi rõ đây là survey/report. |
| Gemini sinh nội dung không ổn định | Cao | AIDesign cần JSON schema, retry, validation, safety filters, fallback scenario tĩnh. |

## 10. Phase 1 Deliverables

- `Research.md`: hoàn thành.
- Evidence base cho PRD: hoàn thành.
- Initial Risk Report: hoàn thành trong tài liệu này.

## 11. Phase 1 Review Gate

Phase 1 đề xuất hướng sản phẩm cho Phase 2:

- MVP nên tập trung vào **simulation-based learning** cho scam/social engineering bằng tiếng Việt.
- Core loop nên là: chọn scenario -> trò chuyện mô phỏng -> người dùng ra quyết định -> Gemini/scoring engine đánh giá -> feedback red flags -> gợi ý phản ứng an toàn.
- Kịch bản MVP nên ưu tiên: giả ngân hàng, giả người thân cần tiền gấp, giả công an/cơ quan chức năng.
- Persona trọng tâm nên là người dùng tự luyện tập; family angle chỉ là chia sẻ kết quả tự nguyện ở cuối luồng.
- Consent flow là yêu cầu đạo đức bắt buộc, không phải tính năng phụ.
- Phase 3 nên ưu tiên kiến trúc gọn cho demo trên **Google AI Studio/Cloud Run**. Nếu dùng AI Studio Build Mode, chấp nhận stack web mặc định React + Node server-side do nền tảng tạo ra. Không dùng Spring Boot cho MVP.
- Không đưa deepfake hoặc điều tra/report scam vào MVP nếu chưa cần, vì tăng scope và rủi ro safety.

**Status:** Phase 1 ready for review. Chỉ chuyển sang Phase 2 sau khi review xong.
