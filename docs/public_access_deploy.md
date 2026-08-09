# Public Access Deploy

Mục tiêu: tạo URL public để người khác mở được app, không dùng `localhost`.

## Phương án chính: Cloud Run qua GitHub Actions

Repo đã có workflow:

```text
.github/workflows/deploy-cloud-run.yml
```

Workflow này deploy thủ công bằng nút **Run workflow** trên GitHub.

## Cần cấu hình một lần trên GitHub

Vào repo GitHub:

```text
Settings -> Secrets and variables -> Actions
```

Tạo **Repository variable**:

```text
GCP_PROJECT_ID = mã project Google Cloud của bạn
```

Tạo **Repository secrets**:

```text
GCP_SA_KEY = JSON key của service account có quyền deploy Cloud Run, Cloud Build, Secret Manager
GEMINI_API_KEY = key Gemini từ Google AI Studio
```

## Chạy deploy

Vào:

```text
Actions -> Deploy Cloud Run -> Run workflow
```

Khi chạy xong, workflow sẽ in public URL dạng:

```text
https://ai-scam-inoculation-xxxxx-as.a.run.app
```

Mở URL đó để test:

```text
/healthz
/
#hotlines
```

## Vì sao không dùng GitHub Pages?

App này có backend Node server để gọi Gemini server-side và giấu API key.
GitHub Pages chỉ phục vụ static files, nên không phù hợp cho bản demo đầy đủ có Gemini.

## Nếu Gemini hết quota

App vẫn chạy luồng demo bằng fallback an toàn, nhưng trước khi nộp AI Riser cần kiểm tra lại quota/key Gemini để chứng minh Gemini là AI chính.
