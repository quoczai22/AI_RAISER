# Local Status - AI Scam Inoculation

Ngay cap nhat: 2026-08-09

File nay la ban ghi trang thai local hien tai cua du an sau khi doi chieu voi repo that. Luu y: `LOCAL_STATUS.md` dang duoc Git track, nen khong con la file "ngoai luong khong push" nhu ban cu.

## Tom Tat Hien Tai

- Branch hien tai: `master`.
- Remote tracking: `origin/master`.
- Local `master` dang **ahead origin/master 8 commits**.
- Branch `wip/unattended-session` van ton tai, nhung dang tro cung commit voi `master` (`4869d6b`), chua thay divergence can merge.
- Tracked worktree hien **sach**: khong co tracked file modified/staged.
- Dang co untracked files/folders:
  - `.obsidian/`
  - `MOC.md`
  - `docs/obsidian/`
  - `UI Redesign for Scam Training App/`
- Test moi nhat: `node tests/run-tests.js` **PASS**.
- Gemini live hien **CHUA XAC MINH DUOC** vi lan probe gan nhat trong `TASKS.md` tra `provider=safe_fallback`, `fallbackReason=GEMINI_HTTP_429`.
- Mobile phone: nguoi dung da test va bao on, nhung Codex khong co bang chung dieu khien truc tiep nen giu trang thai **CHUA XAC MINH DOC LAP**.

## Doi Chieu Voi Status Cu

`LOCAL_STATUS.md` ban cu da lech voi thuc te o cac diem sau:

- Ban cu ghi ngay cap nhat `2026-08-05`; hien tai da doi chieu lai ngay `2026-08-09`.
- Ban cu ghi "Commit da push moi nhat: d934eea"; thuc te local hien dang dung commit `4869d6b` va con 8 commit chua push len `origin/master`.
- Ban cu ghi "co 6 file source/test dang bi sua nhung chua commit"; thuc te hien tai khong co tracked diff, chi co untracked files/folders.
- Ban cu ghi "Gemini local da tung xac minh chay that"; thong tin nay co the dung tai thoi diem cu, nhung trang thai moi nhat phai ghi la **CHUA XAC MINH DUOC** do quota/rate limit `GEMINI_HTTP_429`.
- Ban cu ghi "Firestore Cloud chua xac minh" van con dung.

## Da Hoan Thanh

### Tai Lieu Chinh

Da co cac file phase/docs:

- `Research.md`
- `PRD.md`
- `TechnicalDesign.md`
- `AIDesign.md`
- `UI.md`
- `Testing.md`
- `Presentation.md`
- `RiskReport.md`
- `README.md`
- `UnifiedDirection.md`
- `AGENTS.md`
- `TASKS.md`
- `TASKS_ARCHIVE.md`

Trang thai: du tai lieu nen tang cho MVP va demo ky thuat.

### Kien Truc Va Scope

- Giu dung san pham: AI Scam Inoculation, huan luyen mien dich voi lua dao, khong phai scam detection.
- Frontend chinh da chuyen sang React + Vite.
- Backend Node.js.
- Gemini duoc goi server-side.
- Model khoa theo `gemini-3.6-flash`.
- Khong dung `temperature`, `top_p`, `top_k` trong san pham.
- Static legacy chi dung khi `USE_REACT=false`.

### MVP Flow

Flow chinh da co theo AGENTS.md:

- Nhap ten.
- Dashboard.
- Chon scenario + level.
- Single consent.
- Roleplay chat.
- Nut Stop trong chat.
- Analysis + score.
- Dashboard/history.
- Share nhe.
- Resource Hub / hotline.

### Scenarios

Da co 10/10 kich ban:

- `fake_bank`
- `fake_relative`
- `fake_police`
- `fake_job`
- `deepfake`
- `travel_sales`
- `gym_sales`
- `wrong_transfer`
- `ecommerce_refund`
- `vneid`

### Safety Va Scoring

- Validator 2 chieu: mask input nhay cam va chan output nguy hiem.
- Khong luu/yeu cau OTP, CCCD, mat khau, tai khoan, link that.
- Score la pure function, tach khoi Gemini.
- Score = red flags dung / tong red flags.
- Taxonomy chi gom 5 nhom:
  - Urgency
  - Authority
  - Fear
  - Social Proof/Reciprocity
  - Scarcity

### UI / Accessibility

- UI React da co chu lon, nut lon, tuong phan cao.
- Co che do `Chu to` va `Tuong phan cao`.
- Da loai bo voice input khoi MVP vi khong on dinh cho demo.
- Da loai bo hotline 113 sai khoi UI source.
- Co hotline/resource hub theo huong an toan.

## Bang Chung Kiem Tra Moi Nhat

Lenh da chay ngay 2026-08-09:

```bash
node tests/run-tests.js
```

Ket qua:

```text
Implementation tests passed.
```

Git thuc te:

```text
## master...origin/master [ahead 8]
?? .obsidian/
?? MOC.md
?? "UI Redesign for Scam Training App/"
?? docs/obsidian/
```

Commit local chua push:

```text
4869d6b feat: commit all completed feature updates before merging
028feed security: add security_boundary.md rule and update AGENTS.md
16011e1 docs: complete unattended queue items 1-7 in LOCAL_STATUS.md
2477fb1 feat: complete all 10 scenarios including ecommerce_refund and vneid for Item 5
99609ef feat: add wrong_transfer scenario for Item 4
53455b7 feat: add 1800.6838 hotline and distinct travel/gym sales scenarios for Item 3
d4482ea feat: add deepfake scenario and test coverage for Item 2
dd3db3e docs: verify existing scenarios status for Item 1
```

## Chua Xac Minh Duoc

- Gemini live voi `gemini-3.6-flash`: chua pass lai do quota/rate limit `GEMINI_HTTP_429`; app dang dung safe fallback.
- Google AI Studio public link: chua co bang chung da tao link `Share -> Public`.
- AI Studio Build Mode/import path: chua xac minh app da chay/duoc submit tren Google AI Studio.
- Firestore Cloud that: chua co credential/project ID that de test persistence cloud.
- Viewport chinh xac `390x844` va `1440x900`: Antigravity co browser evidence gan dung, nhung Codex chua xac minh dung tuyet doi.
- Thiet bi dien thoai that: user da bao on, nhung Codex chua co screenshot/video audit doc lap.
- Untracked files/folders: chua quyet dinh file nao can commit, file nao can ignore/xoa.

## Du De Demo Chua?

### Du Cho Demo Local / LAN

Co the demo local hoac tren dien thoai cung Wi-Fi neu server dang chay. MVP hien da du luong chinh:

- Mo app.
- Chon scenario.
- Chap thuan mo phong.
- Chat roleplay.
- Bam Stop.
- Xem diem va feedback.
- Xem history/resource hub.

Neu Gemini bi quota, fallback van giup demo luong an toan, nhung can noi ro day la fallback do quota.

### Chua Du Cho Nop Chinh Thuc Len Google AI Studio

Chua nen xem la san sang nop chinh thuc len Google AI Studio vi con thieu:

- Gemini live pass 2-3 luot khong fallback.
- Link Google AI Studio public `Share -> Public`.
- Bang chung app hoat dong trong moi truong Google AI Studio hoac duong submit tuong duong.

## Viec Nen Lam Tiep

1. Quyet dinh xu ly untracked files/folders: `.obsidian/`, `MOC.md`, `docs/obsidian/`, `UI Redesign for Scam Training App/`.
2. Push 8 commit local len GitHub neu da duoc phe duyet.
3. Tam ghim Gemini live, khong test them cho den khi quota hoi hoac co project/key moi phu hop.
4. Khi quota hoi: chay lai live Gemini 2-3 luot, xac minh `provider=gemini`, khong fallback.
5. Tao/kiem tra Google AI Studio public link de nop bai chinh.

## Cach Chay Nhanh

Build frontend:

```bash
npm.cmd run frontend:build
```

Chay server:

```bash
node server.js
```

Mo local:

```text
http://localhost:3000
```

Chay test:

```bash
node tests/run-tests.js
```
