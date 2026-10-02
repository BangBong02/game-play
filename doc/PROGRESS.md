# Tiến trình Lingoplay

Cập nhật gần nhất: **2026-10-02** (Asia/Bangkok).

## Trạng thái hiện tại

| Phase | Trạng thái | Kết quả / việc tiếp theo |
| --- | --- | --- |
| 0 — Base và game demo | Hoàn thành | Astro/React/TypeScript, routing theo data, Multiple Choice, localStorage |
| 1 — Astro content và SEO | Hoàn thành | HTML vocabulary, Content Collections local, bài viết Astro, game island |
| 2 — UX và nội dung local | Chưa bắt đầu | Chờ review demo và xác nhận nguồn dataset/rank |
| 3 — Vocabulary Game Engine v1 | Hoàn thành | 4 mode, session/scoring chung, SVG local, progress v2 và migration v1; tests/build/browser pass |
| 4 — Phát hành static | Chưa bắt đầu | Chưa xác nhận domain và môi trường deploy |

Phạm vi/tiêu chí từng phase: [PHASES.md](PHASES.md).

## Mốc `v0.1.0-base`

- Ba level, sáu topic hiển thị; Animals/Food/Colors có thể chơi.
- 18 từ demo: Animals 10, Food 4, Colors 4; rank minh họa, ba level đang dùng chung bộ demo.
- Game Multiple Choice: chọn đáp án, feedback, Next, result, restart và khôi phục lượt.
- Vocabulary có H1, mô tả riêng, hướng dẫn và bảng từ/nghĩa bằng HTML Astro.
- Ba Content Collections blog/grammar/guides, mỗi collection có một bài mẫu từ JSON local.
- Tài liệu phase/tiến trình và quy tắc cập nhật sau mỗi task.

Giới hạn: các skill còn lại và Numbers/Family/Days & Months là Coming soon. Chưa có backend, database thật, Auth hay deploy. Canonical cần domain thật qua `SITE_URL`.

## Nhật ký công việc

### 2026-10-02 — Base và game demo

Đã tạo routing/data/game độc lập, UI responsive và ProgressStore localStorage.

Validation đã chạy:

- Test logic: 8/8 pass (ngưỡng rank, generator, state transitions, score, khôi phục state, storage).
- TypeScript/build pass.
- Browser: Animals hoàn thành 9/10, Food 4/4 trên production preview; đúng/sai, keyboard, restart và reload hoạt động.
- Kiểm tra desktop/mobile/tablet, không cuộn ngang.

### 2026-10-02 — Refactor Astro content

Đã bổ sung nội dung HTML vocabulary và thư viện blog/grammar/guides; React chỉ hydrate game bằng `client:visible`. Nội dung và game dùng data local, không thêm dependency hay backend.

Validation đã chạy:

- `npm run build`: pass, 25 trang, 0 errors/warnings/hints.
- `npm test`: 8/8 pass.
- HTML output: 9 trang vocabulary có bảng từ và một game island; ba bài viết có HTML thật, không React island.
- HTTP: 24 route hợp lệ trả 200; URL bài viết không tồn tại trả 404.
- Browser: navigation content, anchor word list, game Food kết quả 3/4, keyboard, restart/reload pass; console sạch.
- Mobile: bảng từ và guide không có cuộn ngang.

### 2026-10-02 — Chuẩn bị mốc phát hành đầu tiên

Đã thêm `doc/PHASES.md`, `doc/PROGRESS.md`, link trong README và quy tắc cập nhật trong AGENTS. Mốc Git được yêu cầu: branch `main`, tag `v0.1.0-base` tại repository `BangBong02/game-play`.

Đã chạy lại `npm test` (8/8 pass) và `npm run build` (25 trang, 0 errors/warnings/hints) trước khi tạo mốc Git. Source repository: [BangBong02/game-play](https://github.com/BangBong02/game-play).

### 2026-10-02 — Vocabulary Game Engine v1

Đã refactor engine/session hiện có cho bốn mode, giữ Astro content/routing/SEO và một React island. Dataset tăng lên 20 từ: Animals 10, Food 6, Colors 4; 20 SVG local với alt text. Không thêm package hay backend. Progress v2 tách theo mode, summary mode gần nhất, lưu nguyên round và kết quả gần nhất; đọc v1 mà không xóa key cũ.

Validation đã chạy:

- `npm test`: 14/14 pass; generator/distractor/dedup, question count, language/level/topic filtering, score/typing/state transitions, resume, storage isolation, v1 migration và giữ lastResult sau restart.
- `npm run build`: pass, 25 trang; Astro check 0 errors/warnings/hints. Project chưa cấu hình linter riêng.
- Desktop: hoàn thành cả 4 mode trên Animals; Word → Meaning 8/10 (80%), ba mode còn lại 9/10 (90%). Đúng/sai, khóa answer, Next thủ công, result và restart pass.
- Keyboard: Tab/Enter ở choice và selector; typing có nhập hoa/thường, spaces, Backspace và Enter; focus trở về heading khi đổi game.
- Reload: giữ đúng question/options, feedback và score; result khôi phục; mode có round riêng. Food khôi phục progress v1 thật (3/4, 75%), restart/migration sang v2 và reload pass.
- Mobile (viewport override 390×844): cả 4 mode trên Colors hoàn thành 3/4 (75%); selector/result không cuộn ngang. Đã reset viewport sau kiểm tra.
- Console: không có error/warning trong các flow đã kiểm tra.
- HTML output: 9 trang vocabulary giữ một H1, hướng dẫn, bảng từ đúng số lượng và một React island; ba bài blog/grammar/guides có HTML thật và không island.
- HTTP: 24 route hợp lệ và 20 SVG local trả 200; URL không tồn tại trả 404.
- Không đổi package/dependency, không thêm backend và không sửa mốc Git `v0.1.0-base`.

Việc tiếp theo: người dùng review UX bốn mode và xác nhận nguồn dataset/rank thật trước khi mở rộng nội dung. Rank của 20 từ vẫn là minh họa; Phase 2 chưa hoàn thành.

## Cách cập nhật

Sau mỗi task:

1. Sửa trạng thái phase nếu thực sự thay đổi; không đánh dấu hoàn thành khi còn thiếu tiêu chí.
2. Thêm mục nhật ký có ngày, kết quả, validation đã chạy và việc còn lại nếu có. Nếu bị chặn, ghi nguyên nhân cụ thể.
3. Cập nhật ngày gần nhất. Chỉ đổi PHASES khi phạm vi hoặc tiêu chí thay đổi.
4. Cập nhật README khi cách chạy hoặc kiến trúc thay đổi; tránh chép lại toàn bộ progress.

Việc tiếp theo hiện tại: người dùng review UX và thống nhất dataset/rank thật. Chưa tự triển khai Phase 2.
