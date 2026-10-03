# Tiến trình Lingoplay

Cập nhật gần nhất: **2026-10-03** (Asia/Bangkok).

## Trạng thái hiện tại

| Phase | Trạng thái | Kết quả / việc tiếp theo |
| --- | --- | --- |
| 0 — Base và game demo | Hoàn thành | Astro/React/TypeScript, routing theo data, Multiple Choice, localStorage |
| 1 — Astro content và SEO | Hoàn thành | HTML vocabulary, Content Collections local, bài viết Astro, game island |
| 2 — UX và nội dung local | Đang thực hiện | UI/UX và Vocabulary Data Model v2; chưa nhập Easy 300, cần xác nhận nguồn/curriculum |
| 3 — Vocabulary Game Engine v1 | Hoàn thành | 4 mode, session/scoring chung, SVG local, progress v2 và migration v1; tests/build/browser pass |
| 4 — Phát hành static | Hoàn thành | Worker game-play-vn trong account maotuankiet77; GitHub main tự test/build/deploy, SEO/404 và game public pass |
| 5 — Game-first và UI locale | Hoàn thành | 4 game riêng, filter skill, EN/VI cùng English data, rank progression và progress v3; tests/build/Chrome pass |
| 6 — Media-ready content | Hoàn thành | Optional media, query capability trước window, repository boundary; 37 unit + 5 HTML tests/build/Chrome pass |

Phạm vi/tiêu chí từng phase: [PHASES.md](PHASES.md).

Product hiện tại: **chỉ học English; `/en` và `/vi` là UI locale**. Homepage game-first, không chọn level. Data Model v2 giữ level curriculum metadata, learningRank teaching order và frequencyRank tham khảo tùy chọn; game lấy nhóm từ eligible theo learningRank/progress. Helper level chỉ còn phục vụ compatibility/data validation. Nhật ký các task cũ mô tả behavior lịch sử; product flow mới tại Phase 5 và media boundary tại Phase 6 bên dưới.

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

### 2026-10-02 — Progress UX sau khi chơi thử game tham khảo

Đã dùng Chrome integration để vào trang chủ [Games to Learn English](https://www.gamestolearnenglish.com/) và thực sự chơi:

- [Monster Vocab](https://www.gamestolearnenglish.com/monster-vocab/): desktop, chọn Home và Play; trả lời đúng rug/cushion/dresser, chọn sai ở books tại câu 4/30 và quan sát màn Retry/Stop với đáp án cần nhớ. Progress là counter nhỏ; ✓/× ở ảnh chọn, các ảnh khác giảm nổi bật; câu đúng tự chuyển, câu sai kết thúc lượt đã thử.
- [Fast English](https://www.gamestolearnenglish.com/fast-english/): Slow/Animals qua sáu câu đúng butterfly/snake/bull/mouse/chicken/fish, có cố ý chọn sai elephant ở snake. Sai giảm score 200 → 150 và giữ prompt cho chọn lại; đúng highlight ảnh rồi tự chuyển. Counter 1/80 → 6/80 nhỏ, có Score nhưng không có cặp Correct/Incorrect liên tục. Đã thử desktop và mobile, thấy ảnh xếp lại và prompt nổi bật.
- Fast timed trên mobile: trả lời đúng bull, sau đó để hết thời gian; màn kết thúc hiển thị score 200, bảng high scores và New/Again. Không gửi score/tên lên website. Monster thử tới màn kết thúc do sai, Fast Slow không chơi đủ 80 câu; chỉ Fast timed được kiểm tra hết lượt.

Pattern áp dụng: ưu tiên từ/ảnh/lựa chọn, counter gọn, feedback trực tiếp và tách thống kê khỏi lúc chơi. Lingoplay trước đó lặp counter, thanh progress, Correct/Incorrect và nhiều text; không thấy các từ đã hoàn thành. Đã thay bằng dải mốc từ (đã xong ✓ / hiện tại có viền / chưa đến), một counter và progress semantic cho accessibility. Dấu ✓ biểu thị hoàn thành, không biểu thị đúng; thống kê đúng/sai/accuracy vẫn ở result. Giữ feedback hiện tại và Next thủ công để đọc đáp án; focus tới Next sau submit, trở về câu hỏi khi chuyển từ hoặc result khi kết thúc.

Bộ chọn mode giữ level/Vocabulary và ghi rõ mục tiêu meaning/recall/picture/spelling. Giữ routing level → skill → topic → mode; không gom các kỹ năng thành một danh sách game. Easy/Medium/Hard vẫn lọc nội dung theo rank; tất cả mode luyện cùng level đã chọn, bộ demo 20 từ chưa có độ khó khác nhau. Giảm text khi chơi, tăng ưu tiên ảnh và dùng đáp án hai cột trên điện thoại thông thường, một cột khi viewport CSS ≤ 320px.

Giữ Astro SEO/content, React Vocabulary Engine, session/scoring, localStorage và bốn mode. Không thêm dependency/PixiJS, không tải hay sao chép artwork/branding/source của website tham khảo. Git bắt đầu task sạch ở `89aefaa`; không commit/push/deploy trong task này.

Validation đã xác nhận:

- `npm test`: 15/15 pass. Build cuối với SITE_URL production: 25 trang, Astro/TypeScript 0 errors/warnings/hints; project chưa có script lint riêng.
- Desktop và mobile (override 390×844, CSS viewport thực tế 355px do zoom browser): cả bốn mode trên Colors chạy tới result. Word → Meaning 3/4 (75%), Meaning → Word 4/4 (100%), Image → Word 4/4 (100%), Type the Word 3/4 (75%); kiểm tra đúng/sai, khóa answer, Next thủ công và các mốc tăng 0 → 4.
- Keyboard: Tab có focus nhìn thấy trên choice, Enter submit và tiếp tục; Next/See results nhận focus sau answer, heading nhận focus sau chuyển từ/result. Typing kiểm tra input rỗng, Backspace, chữ hoa và khoảng trắng đầu/cuối.
- Reload Word → Meaning giữ chính xác prompt/options, feedback, mốc và focus Next; result 75% giữ sau reload. Restart desktop reset progress về 0, mốc đầu và feedback rỗng. Mobile typing reload giữ input sai, feedback, mốc 1 và focus Next; result 75% khôi phục khi mở lại topic, restart reset input rỗng/progress 0 và focus câu hỏi.
- Topic card Colors phản ánh kết quả typing 3/4 correct và Play again; mode khác giữ round riêng. Ảnh ở Image → Word tải thành công; mobile không cuộn ngang ở các màn đã kiểm tra, console không error/warning.

- Sau khi khôi phục Chrome integration, kiểm tra Animals có đủ 10 mốc ở override 320×800 (CSS width 291px): mốc hiện tại/đã xong đúng, không tràn ngang, đáp án một cột. Override 390×844 có đáp án hai cột; chọn sai ở duck giữ feedback dễ đọc, focus Next và mốc tăng 1 → 2. Đã reset viewport về mặc định; console sạch.
- HTTP preview cuối: 24 HTML routes trả 200 và khớp build; chín trang vocabulary giữ một H1, bảng từ, một island và canonical đúng; ba bài blog/grammar/guides có HTML thật, không React island. `git diff --check` pass.

Phase 2 vẫn đang thực hiện, chưa mở rộng dataset/rank. Tiếp theo là người dùng review progress UX và xác nhận nguồn/rank thật; bản sửa này chưa commit/push/deploy.

### 2026-10-02 — Chuẩn bị data architecture cho level thật

Tiếp tục từ working tree sạch tại `b6cbee2`; giữ Astro content/SEO, React engine, bốn mode và localStorage. Không rewrite, thêm dependency, backend/PixiJS/audio hoặc import từ thật.

- Giữ level config hiện có, thêm `getLevelRankRange` và progression `cumulative`/`new-only`. Repository lọc language/level/topic, mặc định cumulative; `new-only` lấy 1–300, 301–1.200, 1.201–3.000, chỉ có ở data layer.
- Word giữ ID số và fields hiện có, thêm `visual?: boolean`; metadata/image/audio vẫn tùy chọn. `topics[]` hỗ trợ nhiều topic; `chicken` thuộc Animals và Food nhưng không bị duplicate trong dataset.
- `game/eligibility.ts` tập trung điều kiện tham gia game ngoài React. Text cần word/meaning; Image → Word cần SVG local có alt và không `visual: false`. Image-match cần thêm `visual: true`; listening cần audioUrl, chỉ chuẩn bị helper, chưa có game mới. Generator dùng helper và distractor cùng pool đã lọc level.
- Điều chỉnh rank của 20 từ demo qua ngưỡng 300 và 1.200. Rank vẫn minh họa, chưa phải tần suất nghiên cứu. Counts từ repository: Easy 11 từ duy nhất (Animals 6/Food 6/Colors 0), Medium 18 (9/7/3), Hard 20 (10/7/4). Tổng topic có thể lớn hơn tổng từ duy nhất do multiple topics.
- Known topic rỗng có HTML thông báo, link quay lại, không tạo game island/session. Topic list tiếp tục Coming soon cho topic rỗng. Count/note lấy từ data đã lọc; topic card kiểm tra IDs của round đã lưu trước khi hiện summary để ẩn progress chứa từ vượt level mới.
- Giữ key/storage version hiện có; engine đã kiểm tra round theo bank hiện tại và bỏ qua round không còn hợp lệ. Không xóa dữ liệu lưu; tests xác nhận round mới vẫn tạo được sau thay đổi rank.

Validation:

- `npm test`: 22/22 pass, giữ 15 tests cũ và thêm 7 tests cho ranges/new-only, demo counts/language/topic, multiple topics, eligibility, bốn mode với targets/distractors đã lọc, empty result và saved round sau thay đổi rank.
- `npm run build` với SITE_URL production: 34 trang static, Astro/TypeScript 0 errors/warnings/hints. Project chưa có script lint; `git diff --check` pass.
- HTTP preview `http://127.0.0.1:4323`: 33 HTML routes trả 200 và khớp build; canonical đúng. Tám topic có data giữ một H1, bảng từ đúng tập level/topic và một island; mười topic rỗng không có island/table/Play anchor. Ba bài viết có HTML thật, không React island; 20 SVG trả 200.
- Chrome Easy: counts 11 tổng/Animals 6/Food 6, Colors Coming soon. Animals không còn horse/duck/rabbit/elephant trong HTML hoặc round; progress cũ 2/10 được ẩn. Word → Meaning hoàn thành 6/6 (100%), card cập nhật 6/6 correct.
- Chrome Medium: tổng 18, Animals 9/Food 7/Colors 3; Colors có red/blue/green, không yellow. Meaning → Word hoàn thành 3/3 (100%); topic nhỏ vẫn đủ bốn đáp án nhờ fallback cùng level. Reload giữ prompt, options, feedback và progress sau câu đầu.
- Chrome Hard: tổng 20, Animals 10/Food 7/Colors 4. Mobile override 390×844: Image → Word hoàn thành 4/4 (100%), SVG tải được; Type the Word 3/4 (75%), kiểm tra đúng/sai và chữ hoa/khoảng trắng bằng Enter. Reload giữ result; Play again reset input/progress. Không tràn ngang ở màn chơi đã kiểm tra; đã reset viewport.
- Chrome direct URL Easy Colors hiển thị empty state thân thiện, không có mode/button chơi. Console trên tab kiểm tra sau build hoàn tất không error/warning.

README/PHASES cập nhật API, schema, eligibility, counts và cách chuẩn bị import. Phase 2 vẫn đang thực hiện; bước tiếp theo là xác nhận nguồn/licence và kiểm tra dữ liệu Easy 300 theo từng phần, chưa tự nhập. Không commit/push/deploy; giữ HEAD/tag cũ.

### 2026-10-02 — Vocabulary Data Model v2

Tiếp tục từ working tree sạch tại `222eb82`. Tách **level = curriculum difficulty**, **learningRank = teaching order**, **frequencyRank = optional reference metadata**. Repository quyết định membership bằng field level, sort learningRank ASC; không dùng frequencyRank hoặc teaching-order range để suy level. Config giữ thứ tự Easy/Medium/Hard và đổi maxRank thành targetWordCount, mục tiêu khoảng 300/1.200/3.000 từ cumulative.

- API repository giữ tham số hiện có và mặc định cumulative: Easy chỉ easy; Medium easy + medium; Hard cả ba. `new-only` lấy đúng field level được chọn. Chưa có UI chọn progression.
- Migrate đủ 20 từ demo: 11 easy, 7 medium, 2 hard. Teaching order minh họa 1–11 / 301–307 / 1.201–1.202; chưa có frequencyRank đáng tin nên để undefined. Counts cumulative giữ 11/18/20; Animals 6/9/10, Food 6/7/7, Colors 0/3/4. Multiple topics và eligibility ngoài React giữ nguyên.
- Word.id chuyển sang string cố định `en-1`…`en-20`, trùng ID câu hỏi cũ; gán rõ từng record, không derive từ array index/spelling. Generator dùng id trực tiếp. Không thay storage key/version hoặc xóa dữ liệu; từ mới có thể dùng slug ID cố định như en-dog.
- Sửa lỗi resume được tái hiện trên Colors Medium: distractor cũ thuộc level hợp lệ nhưng không có trong bank mới sau shuffle làm round bị bỏ. Astro truyền pool đáp án đã lọc language/curriculum vào phần validation; vẫn từ chối đáp án đã ra ngoài pool. Không đổi scoring, transitions, mode picker hoặc UI.
- Giữ Astro routing/content/SEO, React island và bốn mode. Topic rỗng không có game session. README/PHASES ghi rõ curriculum thay cho frequency cutoff; nhật ký cũ giữ để đối chiếu lịch sử và có chú thích model hiện tại ở đầu tài liệu.

Validation đã xác nhận:

- `npm test`: 25/25 pass. Update tests rank cũ sang membership curriculum; thêm sorting độc lập frequencyRank (Easy frequency 5000 hoặc undefined vẫn Easy), ID/session preservation và regression resume theo full curriculum pool. Tests v1/v2, eligibility, multi-topic, empty result và bốn mode vẫn pass.
- `npm run build` cuối với SITE_URL production: 34 trang, Astro/TypeScript 0 errors/warnings/hints. Đã sửa inference level bị widen thành string trong array.map bằng `satisfies Word[]`, không dùng cast/suppress. Project chưa có script lint; git diff --check pass.
- HTTP preview: 33 HTML routes trả 200 và khớp build, canonical đúng; tám topic có data giữ một H1/table/island, rows đúng tập curriculum và learningRank ASC. Mười topic rỗng không có island/table/Play anchor; ba bài viết không có island; 20 SVG trả 200.
- Chrome Easy: counts và HTML Animals đúng 6 từ; result 6/6 của bản trước migration khôi phục được. Word → Meaning chơi đủ 6/6 bằng keyboard Enter, feedback/Next/result hoạt động.
- Chrome Medium: Animals 9/Food 7/Colors 3, tổng 18. Lỗi resume đã tái hiện trước sửa và result cũ 3/3 đã khôi phục sau sửa. Meaning → Word chơi đủ 3/3; reload sau câu đầu giữ prompt/options/feedback/progress, kể cả đáp án fallback cùng level.
- Chrome Hard: Animals 10/Food 7/Colors 4, tổng 20. Type the Word khôi phục round chưa xong từ bản trước; chơi đủ 3/4 (75%) với answer sai và chữ hoa/khoảng trắng, reload result giữ 75%. Image → Word chơi đủ 4/4 (100%), mode lưu riêng; navigation/result/Back to topic hoạt động.
- Direct URL Easy Colors có empty state, không có game. Console trên tab kiểm tra không error/warning. Task này kiểm tra desktop; responsive/CSS không thay đổi.

Phase 2 vẫn đang thực hiện. Chưa curate/import Easy 300, chưa thêm dependency/PixiJS/audio/backend. Bước tiếp theo: xác nhận curriculum và nghĩa, nhập từng phần với level easy/learningRank/ID cố định; frequencyRank chỉ optional metadata khi có nguồn. Không commit/push/deploy, HEAD vẫn `222eb82`.

## 2026-10-03 — Phase 5: game-first, UI locale và rank progression

Tiếp tục working tree sạch tại `7c0788f`; refactor Astro + React + TypeScript hiện có, không tạo lại project. Inspect trực tiếp homepage Games to Learn English bằng Chrome trước code: game cards và mô tả ngắn xuất hiện sớm, không level/onboarding step. Chỉ lấy pattern flow, không copy artwork/branding/source/layout.

- Homepage hero một câu, bốn card từ registry tập trung, order rõ ràng; All mặc định, Vocabulary và Spelling. Spelling thuộc cả hai skill, filter không dẫn tới trang rỗng. Thumbnails dùng SVG local hiện có. Không thêm Listening/Grammar engine hoặc coming-soon grid.
- Bốn mode thành Word Match / Find the Word / Picture Pick / Spell the Word; cùng engine và interaction trước đó. Flow Home → Game → Play, topic All mặc định và chọn Animals/Food/Colors tùy ý; bỏ bước level và mode picker trung gian.
- `/en` và `/vi` chỉ đổi UI. learningLanguage English cố định; localized header/footer, game title/instructions/feedback/progress/result, topic picker và library. Switch giữ game/learn path, topic query/hash; progress chung. Bài viết hiện vẫn English, có lang/en và thông báo rõ.
- Astro tạo `/[locale]/games/[game]`, `/[locale]/learn/...`; game có bảng 20 vocabulary rows HTML thật, homepage/learn không React island. Chỉ game dùng React island client:load. Giữ title/description/canonical và bổ sung hreflang EN/VI.
- Old level/skill/topic bookmarks dùng redirect HTML meta refresh của Astro: level → home, vocabulary → Word Match, topic → Word Match?topic=...; không còn internal links level. Không đổi wrangler/deployment.
- Data Model v2 và 20 records/ID giữ nguyên. getWordsForProgress lọc English/topic, sort learningRank và slice count; mặc định 10 từ, nhóm kế tiếp bắt đầu sau rank cao nhất nhóm đã xong. Chấp nhận rank gaps 11→301 và 307→1201; không adaptive/XP/unlock level UI.
- localStorage v3 theo English/game/topic, lưu current startRank, session/questions/answers, completedWordIds và lastResult. Chơi lại ôn nhóm hiện tại; Từ mới lấy nhóm tiếp theo. Hết dữ liệu tiếp tục ôn lại. Migration chọn topic round v1/v2 hợp lệ mới nhất và copy, giữ key cũ; không clear storage.
- Xóa PlantArt, nhánh level của LearningCard, hero/level/mode-picker CSS và language/skill navigation config cũ. Không dependency/runtime/backend mới. README và PHASES cập nhật product direction; package thêm test:site cho HTML build bằng Node runner hiện có.

Validation:

- Unit tests: 30/30 pass (25 engine/data/storage regressions giữ nguyên + registry/filter/multi-skill, locale/target, rank windows, v3 và migration). HTML build tests: 5/5 pass, tổng 35/35. test:site chạy sau build, kiểm tra HTML thực tế EN/VI, order/filter attributes, cùng vocabulary, island/SEO, bài học và toàn bộ legacy redirects.
- Build cuối với SITE_URL production: 74 trang static; Astro/TypeScript 0 errors/warnings/hints. HTTP preview 73 index HTML routes trả 200; unknown URL trả 404. Project không có lint script; git diff --check pass.
- Chrome desktop homepage: All mặc định, 4 games ngay phía trên, Spelling chỉ một game và Vocabulary cả bốn; EN/VI đều đúng UI và cùng game/data. Filter keyboard Enter hoạt động.
- Chrome Word Match: chơi đủ 10 câu, một đáp án sai, result 9/10 (90%). Reload giữ exact prompt/options/feedback; đổi VI→EN vẫn cùng lượt. Từ mới chuyển từ nhóm rank 1–10 tới nhóm rank 11 trở lên, reload giữ nhóm mới.
- Chrome Find the Word: restore Colors result cũ qua migration; Chơi lại đủ 3/3 (100%); đổi EN→VI giữ topic=colors và result. Bookmark /en/easy/vocabulary/animals chuyển đúng Word Match?topic=animals và giữ lượt Animals đang dở.
- Chrome Picture Pick: chơi 10/10 (100%), reload giữ result, restart và đáp án keyboard hoạt động. Type the Word: Tab vào input, sửa bằng Backspace, Enter submit, chữ hoa/khoảng trắng chấp nhận, có câu sai; result 9/10 (90%), reload feedback, restart về 1/10.
- Cả bốn mode có kiểm tra interaction trên desktop và mobile. Homepage kiểm tra viewport CSS thực 360/390/430 (bù zoom Chrome 110% qua viewport override); document scrollWidth bằng clientWidth, không horizontal overflow. Mobile filters và card navigation chạy, viewport override đã reset.
- Console tab kiểm tra không error/warning. Library VI có semantic headings, nội dung học English bằng Astro HTML. Không commit/push/deploy; HEAD giữ `7c0788f`.

Phase 5 hoàn thành trong scope refactor. Phase 2 về curriculum thật vẫn đang thực hiện: chưa nhập Easy 300. Tiếp theo người dùng review flow/UI; chỉ mở rộng data hoặc game mới khi có yêu cầu riêng.

## 2026-10-03 — Phase 6: media-ready content architecture

Baseline `5457f7b`, working tree sạch trước task. Không đổi Astro/React/TypeScript, bốn engine mode, Word schema v2 hoặc storage v3. Không thêm dependency/backend/DB/PixiJS/Listening engine; không nhập vocabulary/media hàng loạt.

Reference findings (Chrome trước khi sửa code):

- [Homepage](https://www.gamestolearnenglish.com/) dùng các game với cùng nhóm vocabulary theo topic.
- [Monster Vocab](https://www.gamestolearnenglish.com/monster-vocab/): đã vào Food preview, bắt đầu vòng và chọn hình wine theo prompt chữ; UI có audio control. Phần hướng dẫn mô tả nhóm ngẫu nhiên 10 item, các giai đoạn nhận diện, drag/drop và recall dùng lại vocabulary.
- [Fast Vocab](https://www.gamestolearnenglish.com/fast-vocab/): đã chọn Animals, kéo Snake vào nhãn Snake và quan sát hình khóa vào đích. Hướng dẫn mô tả ghép hình/chữ kèm pronunciation rồi rapid image-to-word sau 10 item; không khẳng định đã hoàn thành toàn bộ vòng 40 lượt.
- [Numbers](https://www.gamestolearnenglish.com/numbers/): vào Easy, chọn block 13 theo prompt Thirteen và thấy nhân vật nhảy tới block. Hướng dẫn mô tả nghe số → nhận diện digits, các set nội dung nhỏ. Không sao chép artwork/audio/layout/source.
- Nguyên tắc áp dụng: một canonical item được tái dùng qua interaction theo text/image/audio capability; topic set và nhóm nhỏ không cần dataset riêng từng game.

Đã làm:

- `isWordEligible` tập trung rules text, image (visual khác false), image-match (visual true), listen-to-word/audio và listen-to-image/đủ hai media + visual true. `listening` cũ giữ alias; các hoạt động tương lai chỉ là eligibility/query, không vào registry game playable.
- `isMediaUrl` chấp nhận path root hoặc HTTPS URL, không khóa SVG/local provider; loại scheme không phù hợp/URL lỗi. Generator và question validation dùng cùng URL contract, truyền URL/alt từ Word. Giữ các optional media fields, không tạo media tables/variants/manager/helper phát audio.
- `wordRepository.forGame` async dùng local nguồn hiện có. Astro gọi Word/Topic repositories rồi truyền normalized Word[]; React dùng `repositories/queries.ts` thuần, không import module chứa dataset mock. `getWordsForProgress` re-export để giữ compatibility.
- `getWordsForGame` lọc eligibility trước rank window/count, kết hợp fixed English target và topic, sort learningRank ASC. Không count thì lấy pool đủ; session count 10, cap theo available. Thứ tự câu vẫn shuffle, New words dùng max rank nhóm + 1. localStorage và ID/media URLs demo không đổi.
- Play xét bank tạo được, không chỉ target.length. Choice cần 4 answers khác nhau, fallback English pool; typing tối thiểu 1 từ. Thiếu nội dung hiển thị unavailable EN/VI và disable Play, không fake media/placeholders.
- README chuẩn convention asset mới `public/media/images/vocabulary/*`, `public/media/audio/vocabulary/*`; giữ 20 SVG demo tại đường dẫn cũ để không làm mất resume. Chưa có audio assets; URL audio trong tests là fixture, không được thêm vào dataset thật.
- Mỗi image/audio nhập mới phải có nguồn/license rõ ràng hoặc do project sở hữu/tạo ra. Không tải asset bên ngoài trong task này. Tương lai repository trả cùng Word[] từ D1 metadata, URLs từ R2/CDN; giữ eligibility trước LIMIT/window. US/UK audio hoặc illustration/photo chỉ cân nhắc variants/word_media khi thực sự cần; site static vẫn cần build/refresh policy khi thay nguồn.

Validation:

- `npm test`: **37/37 pass** (30 tests baseline, thêm 7 tests media/query/session/resume). Update expectation SVG-local-only cũ sang HTTPS URL hợp lệ theo yêu cầu mới; kiểm tra file SVG demo tồn tại và thiếu URL/alt vẫn giữ. Coverage image+audio/visual/base text, URL formats/schemes, sparse media lấy đủ 10 eligible items, rank gaps/topic/English, canonical locale reuse, small bank và CDN question progress.
- `SITE_URL=https://game-play-vn.maotuankiet77.workers.dev npm run build`: **pass**, 74 static pages, Astro/TypeScript **0 errors / 0 warnings / 0 hints**. `npm run test:site`: **5/5 pass**, real HTML vocabulary/Collections, localized routes, một game island và redirects giữ đúng.
- Chrome bản build local `127.0.0.1:4323`: cả homepage EN/VI và cả bốn game đã chơi/submit/Next trên EN/VI. Word Match/typing kiểm tra đúng + sai, Enter, hoa/thường/space, result/restart; Word Match reload giữ answered state. Switch locale giữ prompt/options/result/media. Find the Word giữ round legacy 3 từ, New words chuyển tới yellow một từ với 4 options fallback rồi hoàn thành.
- Picture Pick render SVG thật (`/images/vocabulary/blue.svg`, naturalWidth 240), cùng URL/alt trên EN/VI; hoàn thành Colors 4/4. Responsive thử bằng viewport override 390×844, CSS innerWidth đo thực tế 355px do zoom Chrome hiện tại: image/answers/submit và unavailable VI không overflow; đã reset override, không đổi zoom người dùng.
- Fixture tạm trong `dist/` kiểm tra normalized empty pool EN/VI và choice pool 3 từ: Play disabled + thông báo; typing 1 từ: Play enabled. Chỉ sửa props bản HTML fixture, không sửa dataset thật và không submit/save fixture. Fixture đã được dọn, không thêm route/source test tạm.
- Console tab local **không error/warning** trong các flow và fixture đã kiểm tra. Kiểm tra import graph không có nguồn mock/repository source trong React/game/services/query module. Không có lint script trong project.

Phase 6 hoàn thành. Chưa commit/push/deploy. Bước tiếp theo đề xuất: curate một nhóm English nhỏ có nghĩa/POS/rank/topics và nguồn/license media rõ ràng để review trước khi mở rộng content; chưa tự nhập hoặc triển khai bước đó.

## Cách cập nhật

Sau mỗi task:

1. Sửa trạng thái phase nếu thực sự thay đổi; không đánh dấu hoàn thành khi còn thiếu tiêu chí.
2. Thêm mục nhật ký có ngày, kết quả, validation đã chạy và việc còn lại nếu có. Nếu bị chặn, ghi nguyên nhân cụ thể.
3. Cập nhật ngày gần nhất. Chỉ đổi PHASES khi phạm vi hoặc tiêu chí thay đổi.
4. Cập nhật README khi cách chạy hoặc kiến trúc thay đổi; tránh chép lại toàn bộ progress.

Việc tiếp theo hiện tại: người dùng review và tự commit; xác nhận nguồn/licence, curriculum và thứ tự học cho Easy 300 trước khi nhập nội dung Phase 2.

## 2026-10-03 — Phase7: audit và product decisions

Đã đọc attachment/autonomous scope, audit source/config/tests/data/history/docs; baseline unit37/37, HTML5/5, production SITE_URL build74 pages pass. Chrome local homepage và Picture Pick restore giữ round cũ. Tạo dev branch `codex/oxford-learning-mvp`; commit media-ready feature đã hoàn thành: `2e58436`. Chưa push milestone mới.

User xác nhận300/1200 subset trongOxford3000, giao curate priority;3 ngày đúng/lịch1d7d60d/sai5h;PicturePick→ListenImage→ImageMatch; giao engineer chọn accent. Chọn US local demo, không suy đoán website tham khảo dùng accent nào. NativeSAPI cóDavid/Zira US, ffmpeg vàsharp có sẵn; không thêm package/dịch vụ trả phí. Đã mở FastEnglish reference qua Chrome; hướng dẫn listen→click và Slow tự paced phù hợp MVP, không thấy tuyên bố accent chính thức.

Tạo requested decisions/roadmap/plans/project state, cập nhậtAGENTS từ typing scaffold sangLingoplay boundaries/workflow. M1 content đang thực hiện, các feature mới chưa validation/commit.

## 2026-10-03 — Phase7 M1: demo content/Picture Pick

DONE:50 từ đối chiếuOxford3000 có nghĩa/POS/example tự viết;52 canonical IDs bao gồmduck/rabbit supplemental giữtương thích, không tínhmốcOxford. Ranks1–52 doLingoplay curate, không gắnfrequencyRank. Topic priority ưu tiênFood/Family/Home/School.52 audioUS localZira, tổng480373 bytes;30 hình (20 SVG giữURL +10 WebP original primitives/sharp). Scripts regenerate offline vàprovenance trongpublic/media/ATTRIBUTION.md. Khôngdependency/backend/costs.

Fixrestore dùngfull eligible topic bank đểreorder/rankchanges khôngdiscardroundcũ. Unit39/39, HTML5/5, SITE_URL build122 staticpages/0diagnostics pass; diff--check pass. Chrome thấyold answered PicturePick round giữprompt/options/feedback;Home5 từWebP (naturalWidth480), keyboardwrong/right vàNext, reloadđápánsai, result4/5/80%, restart. Desktop/tablet768/mobile390CSS (bùzoom110%) image/answersfit, scrollWidth=clientWidth, mobiletapcorrect;console[]warn/error;viewportreset.

M1code/docs đãreview; chuẩn bịcommit/push devmilestone. TiếpM2Listen→Image;learningmemory/chungprogress chưaimplement.
