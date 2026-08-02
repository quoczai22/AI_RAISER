# Real Traction Plan - AI Scam Inoculation

Mục tiêu: có bằng chứng người dùng thật đã test app trước khi nộp bài AI Riser Vietnam 2026.

## Mục Tiêu Test

- Tối thiểu: 10-15 người test thật.
- Ưu tiên: 2-3 người thuộc nhóm trung niên/lớn tuổi; còn lại có thể là bạn bè/sinh viên.
- Chất lượng feedback quan trọng hơn số lượng click.
- Với nhóm sinh viên, ưu tiên kịch bản `Tuyển dụng giả lương cao` vì gần ngữ cảnh tìm việc.

## Chuẩn Bị

- Public app link đã chạy ổn định.
- Gemini trả `provider = gemini`, không rơi vào fallback do quota.
- Google Form feedback ngắn.
- Optional: ghi lại số session hoàn thành nếu đã có bằng chứng từ dashboard/log.

## Tin Nhắn Gửi Test

```text
Chào mọi người, mình đang làm 1 app nhỏ tên "AI Scam Inoculation" cho cuộc thi
AI Riser Vietnam. App giúp luyện tập nhận diện lừa đảo như giả ngân hàng,
giả công an, giả người thân mượn tiền hoặc tuyển dụng giả bằng cách trò chuyện
thử với AI trong một tình huống mô phỏng.

Mọi người test thử giúp mình 3-5 phút nhé, không cần tài khoản:
[LINK APP]

Sau khi xong, điền giúp mình form ngắn 4 câu:
[GOOGLE FORM LINK]

Cảm ơn mọi người nhiều, mỗi lượt test đều giúp mình cải thiện bài nộp.
```

## Google Form 4 Câu

1. Bạn thấy đoạn hội thoại có tự nhiên/bất ngờ không, hay đoán được trước? (1-5)
2. Phần điểm miễn dịch sau khi luyện tập có dễ hiểu không?
3. Bạn có học được điều gì mới về cách nhận diện lừa đảo không?
4. Góp ý thêm nếu có.

## Bằng Chứng Cần Lưu

- Screenshot các câu trả lời cụ thể ở câu 3.
- Screenshot tổng số feedback hoặc session hoàn thành.
- Link Google Form summary hoặc Drive folder public.
- Ghi chú 2-3 quote tốt nhất để dùng trong pitch/demo.

## Lưu Ý

- Không yêu cầu người test nhập dữ liệu thật.
- Không chạy quá nhiều live Gemini probe trước khi gửi link để tránh quota `GEMINI_HTTP_429`.
- Nếu app đang fallback do quota, đợi quota reset hoặc dùng project Gemini quota ổn hơn trước khi thu traction.
