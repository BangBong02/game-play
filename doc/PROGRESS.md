# Tiến trình Lingoplay

Cập nhật gần nhất: **2026-10-02** (Asia/Bangkok).

## Trạng thái hiện tại

| Phase | Trạng thái | Kết quả / việc tiếp theo |
| --- | --- | --- |
| 0 — Base và game demo | Hoàn thành | Astro/React/TypeScript, routing theo data, Multiple Choice, localStorage |
| 1 — Astro content và SEO | Hoàn thành | HTML vocabulary, Content Collections local, bài viết Astro, game island |
| 2 — UX và nội dung local | Đang thực hiện | UI/UX đã cập nhật; chờ người dùng review và xác nhận nguồn dataset/rank |
| 3 — Vocabulary Game Engine v1 | Hoàn thành | 4 mode, session/scoring chung, SVG local, progress v2 và migration v1; tests/build/browser pass |
| 4 — Phát hành static | Hoàn thành | Worker game-play-vn trong account maotuankiet77; GitHub main tự test/build/deploy, SEO/404 và game public pass |

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

### 2026-10-02 — Chuẩn bị deploy Cloudflare Worker

Theo yêu cầu, Worker dự kiến là `game-play` trong account `maotuankiet77@gmail.com`, dùng user `nguyenducbang.uit@gmail.com`. Đã thêm cấu hình Workers Static Assets từ `dist/`, clean URLs và 404-page; giữ Astro static/React game và localStorage. Chưa deploy.

Đã thêm Wrangler 4.146.0 vào devDependencies và ignore `.wrangler/`; không đổi dependency runtime. README ghi cách build/dry-run, account đích và bước cấu hình canonical khi có URL thật. `account_id` chưa được điền vì chưa xác minh được account đích; chưa tạo Worker trên Cloudflare và chưa có URL public.

Validation:

- `npm test`: 14/14 pass.
- `npm run build`: 25 trang, 0 errors/warnings/hints.
- `wrangler deploy --dry-run`: pass; không có binding backend.
- `wrangler dev`: Worker local tại `127.0.0.1:8788` chạy được; 51 trang/assets trả 200, clean URL redirect đúng, URL không tồn tại trả custom 404.
- Browser trên Worker local: Type the Word hoàn thành 3/4 (75%), feedback đúng/sai, keyboard Enter, result và reload pass; console không error/warning.

Phần còn lại: phiên dashboard hiện chỉ có account `Nguyenducbang.uit@gmail.com's Account` và `Ctcm251010@gmail.com's Account`; user xác nhận chưa cấp quyền ở account đích và sẽ bổ sung. Đã hướng dẫn đăng nhập bằng `maotuankiet77@gmail.com` → Manage Account → Members → Invite `nguyenducbang.uit@gmail.com` với role Workers Platform Admin, rồi chấp nhận lời mời. Tham khảo [Cloudflare member management](https://developers.cloudflare.com/fundamentals/manage-members/manage/).

Wrangler OAuth cũ đã hết hạn; đã mở flow đăng nhập lại nhưng chưa chọn/cấp quyền cho account khác. Flow hết thời gian chờ trong lúc chờ membership; cần đăng nhập lại sau khi account đích xuất hiện. Khi có quyền: xác minh user/account và tên Worker, ghi account_id, build với SITE_URL thật, deploy và kiểm tra URL public. Phase 4 chưa hoàn thành.

### 2026-10-02 — Deploy Cloudflare Worker thành công

User đã chấp nhận lời mời. Đã xác minh dashboard và `wrangler whoami`: user `nguyenducbang.uit@gmail.com`, account đích `Maotuankiet77@gmail.com's Account`, ID `2bbd1ae90146a70f45cf90e0a8b84b6e`. Account chưa có project trước khi tạo Worker. Đã khóa ID này trong `wrangler.jsonc` và khôi phục OAuth chỉ cho account đích với scopes `account:read`, `user:read`, `workers_scripts:write` và background access tự động của Wrangler. Scope `workers:write` ban đầu không đủ cho API deploy; đổi sang Workers Scripts Write thì deploy thành công.

- Worker: `game-play`, Workers Static Assets; 52 file được upload.
- URL public: https://game-play.maotuankiet77.workers.dev
- Version ID: `74cea201-b3b9-475b-bc7a-088300f77ec4`.
- Build với `SITE_URL` theo URL trên; Astro `trailingSlash: 'never'` khớp Workers `drop-trailing-slash`.
- README có lệnh deploy lại; chưa cấu hình GitHub auto deploy. Không thêm backend/binding và không lưu credential trong Git.

Validation trên bản phát hành:

- `npm test`: 14/14 pass; `npm run build`: 25 trang, 0 errors/warnings/hints; dry-run pass.
- HTTP: 51 route/assets (24 HTML pages và 27 assets) trả 200 và byte-for-byte khớp build local. Canonical trên 23 trang content dùng URL public và clean path.
- Chín trang vocabulary giữ bảng từ HTML thật. URL có slash cuối redirect 307 về clean URL; URL không tồn tại trả custom 404, body khớp `404.html`.
- Browser public: navigation English → Easy → Vocabulary → Colors và hydrate game island hoạt động.
- Type the Word: 3/4 (75%), đúng/sai, khóa answer, Backspace/Enter, trim/hoa-thường, Next, result, restart pass; feedback/score và result giữ sau reload.
- Mobile override 390×844: selector, bảng từ và result không cuộn ngang; Image → Word hoàn thành 4/4 (100%) bằng Enter. Ảnh SVG tải thành công; đã reset viewport sau kiểm tra.
- Console browser không có error/warning trong các flow đã kiểm tra. Các mode còn lại đã được kiểm tra đầy đủ ở Phase 3 và không thay đổi code trong task deploy.

Phase 4 hoàn thành. Thay đổi deploy hiện nằm trong working tree, chưa tạo commit/tag mới; giữ mốc `v0.1.0-base`. Việc tiếp theo vẫn là review UX và xác nhận dataset/rank thật ở Phase 2.

### 2026-10-02 — Kết nối GitHub cho Worker game-play-vn

Người dùng đã kết nối GitHub `BangBong02/game-play` vào account maotuankiet77 và tạo Worker `game-play-vn`. Khi có hai Worker, đã hỏi và người dùng chọn dùng Worker mới. Giữ Worker `game-play` cũ; đổi tên trong `wrangler.jsonc` sang `game-play-vn`, giữ account ID. Đã xác minh phiên dashboard vẫn là `nguyenducbang.uit@gmail.com`.

Workers Builds dùng branch `main`, root `/`, deploy command `npx wrangler deploy`. Đã lưu build command `npm test && SITE_URL=https://game-play-vn.maotuankiet77.workers.dev npm run build` bằng phiên nguyenducbang.uit để kiểm tra game và build canonical đúng domain. GitHub ban đầu mới ở commit base `52f00a5`; đã push commit Engine v1 có sẵn và commit cấu hình deploy `225f087` lên main. Build dùng `game-play-vn build token` đã được người dùng cấu hình, độc lập phiên OAuth CLI; không tạo token mới hay mở thêm quyền GitHub.

Kết quả đã xác nhận:

- Git push lên `BangBong02/game-play` main thành công, kích hoạt build tự động `8e6f724c-2eb0-4bef-b72d-8c976eabf8fe` cho commit `225f087`.
- Build Linux Cloudflare: Node 24.18.0, npm 10.9.2, `npm clean-install` thành công; 14/14 tests, Astro check 0 errors/warnings/hints, 25 trang được tạo. Log báo cả build và deploy command thành công.
- Version từ GitHub: `e78b3ecd-27ef-4fac-b45f-4e8f8642aeeb`, URL https://game-play-vn.maotuankiet77.workers.dev.
- Local cùng cấu hình: tests/build/dry-run pass, canonical dùng domain mới.
- HTTP public mới: 51 route/assets trả 200; canonical trên 23 trang content đúng domain/path; chín trang vocabulary giữ bảng HTML và game island. Slash redirect 307, custom 404 đúng status/body.
- Browser public: bốn mode có trong selector; Word → Meaning trên Colors hoàn thành 3/4 (75%) với answer đúng/sai, Enter, Next, feedback và score giữ sau reload; console không error/warning.
- Đã cập nhật README cho auto deploy và cách deploy CLI dự phòng. Worker `game-play` cũ giữ bản trước; localStorage của hai domain là độc lập, không tự chuyển progress giữa URL cũ và mới.

Kết nối GitHub và deploy từ Git hoàn thành; giữ tag `v0.1.0-base`. Nội dung/rank vẫn là demo, Phase 2 chưa triển khai.

### 2026-10-02 — Rà soát Vocabulary Engine v1 và tách helper distractor

Yêu cầu Vocabulary Engine v1 được gửi lại sau khi bản bốn mode đã có trong codebase. Giữ engine/session, React island, data và progress hiện có; không rewrite. Tách `generateDistractors` khỏi question generator thành helper độc lập trong cùng file, dùng chung cho ba choice mode. Repository vẫn chịu trách nhiệm lọc level trước khi truyền pool; helper ưu tiên topic và loại đáp án trùng, tương đương đáp án đúng hoặc khác language. Không thêm dependency/backend hay mở rộng dataset.

Validation đã chạy trên code/build hiện tại:

- `npm test`: 15/15 pass. Bổ sung test trực tiếp cho helper về đáp án tương đương, trùng, rỗng, khác language, ưu tiên topic, fallback và không mutate dữ liệu; typing kiểm tra đủ `dog`, `Dog`, ` DOG `.
- `npm run build` với `SITE_URL` production: 25 trang static, Astro/TypeScript 0 errors/warnings/hints. Project chưa có script lint; `git diff --check` pass.
- HTTP preview `http://127.0.0.1:4323`: 24 HTML routes trả 200 và khớp build vừa tạo; chín trang vocabulary có H1/bảng HTML, một game island và canonical đúng. Các bài blog/grammar/guides không có React island; 20 SVG local trả 200.
- Browser Colors: Word → Meaning 3/4 (75%), Meaning → Word 4/4 (100%), Image → Word 4/4 (100%), Type the Word 3/4 (75%). Kiểm tra answer đúng/sai, khóa answer, Next thủ công, progress và result.
- Reload giữ feedback/câu hiện tại và result; Play again reset input/progress; Back to topic, bộ chọn mode và navigation topic list hoạt động.
- Mobile với viewport override 390×844: ảnh tải được, input và kết quả không cuộn ngang; typing xử lý input rỗng, chữ hoa/khoảng trắng, Backspace và Enter. Đã reset viewport sau kiểm tra. Console không error/warning.

README đã cập nhật mô tả helper. Phase 3 vẫn hoàn thành; phạm vi phase không đổi. Thay đổi được chuẩn bị để commit/push theo yêu cầu; commit tương ứng xem trong Git history. Tiếp theo vẫn là review UX và xác nhận dataset/rank ở Phase 2, chưa tự triển khai.

### 2026-10-02 — Làm mới UI/UX game học tiếng Anh

Đã refactor giao diện trên code hiện có: palette xanh/cam/tím theo level, hero chữ minh họa bằng HTML/CSS, card level nổi bật mục tiêu 300/1.200/3.000 từ, skill Vocabulary có CTA rõ và skill chưa có nội dung giữ Coming soon. Topic card gọn hơn, có progress và Play/Continue/Play again từ ProgressStore hiện có; card thư viện vẫn giữ mô tả bài học.

Bốn mode có card lớn, icon và hướng dẫn ngắn. Màn chơi tập trung vào câu hỏi, số câu và score; nút đáp án lớn, correct/incorrect có text/icon, feedback Correct!/Not quite và result rõ ràng. Khi chơi, phần giới thiệu topic được thu gọn bằng CSS; Astro vẫn render H1, mô tả, hướng dẫn và bảng từ thật. Giữ engine/session/scoring, localStorage v1/v2 và React island; không thêm dependency, backend hoặc thay kiến trúc. Illustration plant hiện có được tái sử dụng, không sao chép UI/assets bên ngoài.

Validation:

- `npm test`: 15/15 pass. `npm run build` với SITE_URL production: 25 trang, Astro/TypeScript 0 errors/warnings/hints. `git diff --check` pass; project chưa có script lint riêng.
- HTTP preview `http://127.0.0.1:4323`: 24 HTML routes trả 200 và khớp build; chín trang vocabulary giữ H1, bảng từ và một game island; ba bài viết không có React island; 20 SVG local trả 200.
- Browser Colors: Word → Meaning 3/4 (75%), Meaning → Word 4/4 (100%), Image → Word 4/4 (100%), Type the Word 3/4 (75%). Kiểm tra đúng/sai, khóa answer, Next thủ công, feedback, result và score.
- Keyboard: Tab/Enter cho navigation, selector và choice; typing xử lý input rỗng, hoa/thường, khoảng trắng, Backspace và Enter. Reload giữ câu/feedback/result; Play again reset input/progress.
- Topic card cập nhật đúng 3/4 correct sau hoàn thành, 1/4 answered khi đang chơi, progress bar và CTA tương ứng. Navigation level → skill → topic, Back to games/topics và thư viện/bài viết hoạt động.
- Responsive với viewport override 390×844, 768×1024 và 320×800: không cuộn ngang ở các màn đã kiểm tra; ảnh game tải được. Đã reset viewport sau kiểm tra; console không error/warning.

Phase 2 đang thực hiện; chưa mở rộng dataset/rank. Theo yêu cầu, thay đổi để trong working tree cho người dùng tự commit, chưa push/deploy và không đổi tag `v0.1.0-base`. Bản Cloudflare hiện tại vẫn là bản đã phát hành trước task này.

## Cách cập nhật

Sau mỗi task:

1. Sửa trạng thái phase nếu thực sự thay đổi; không đánh dấu hoàn thành khi còn thiếu tiêu chí.
2. Thêm mục nhật ký có ngày, kết quả, validation đã chạy và việc còn lại nếu có. Nếu bị chặn, ghi nguyên nhân cụ thể.
3. Cập nhật ngày gần nhất. Chỉ đổi PHASES khi phạm vi hoặc tiêu chí thay đổi.
4. Cập nhật README khi cách chạy hoặc kiến trúc thay đổi; tránh chép lại toàn bộ progress.

Việc tiếp theo hiện tại: người dùng review UI/UX mới và tự commit; thống nhất dataset/rank thật trước khi mở rộng nội dung Phase 2.
