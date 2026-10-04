# Các phase phát triển Lingoplay

Tài liệu này mô tả phạm vi và tiêu chí hoàn thành. Trạng thái thực tế, kết quả kiểm tra và việc đang làm được ghi trong [PROGRESS.md](PROGRESS.md).

Nguyên tắc xuyên suốt: **Astro = website/content/SEO; React = game interaction; Data = độc lập.** Refactor trên code hiện có, giữ giải pháp nhỏ nhất đúng yêu cầu. Phase tương lai là hướng dự kiến, không phải lệnh tự triển khai.

## Phase 0 — Base và game demo

Phạm vi:

- Astro + React + TypeScript strict, CSS thuần.
- Routing theo language/level/skill/topic, ba level Easy/Medium/Hard.
- Dataset local chung, lọc language/curriculum level/topic; topic cấu hình riêng.
- Một game Multiple Choice nhận question data độc lập với dataset.
- Đáp án đúng/sai, Next, score, result, Play again.
- Progress bằng localStorage, khôi phục lượt sau reload.

Hoàn thành khi flow chọn level → topic → game → result chạy được; có test logic và build pass. Dataset chỉ là demo, không coi 300/1.200/3.000 từ là nội dung đã có.

Mốc phát hành đầu tiên: `v0.1.0-base`, bao gồm cả Phase 1 bên dưới.

## Phase 1 — Astro content và SEO

Phạm vi:

- Trang vocabulary có HTML giới thiệu, hướng dẫn và bảng từ/nghĩa từ cùng dataset của game.
- Astro Content Collections cho blog/grammar/guides bằng JSON local, có schema và bài mẫu.
- Trang danh sách và bài viết được Astro tạo ở build time.
- Title/description theo nội dung; canonical khi cấu hình `SITE_URL`.
- Chỉ game hydrate React; website không trở thành SPA.

Hoàn thành khi HTML build chứa nội dung thật, bài viết không có React island, navigation và game vẫn hoạt động. Đọc nội dung không cần JavaScript; chơi game cần JavaScript.

## Phase 2 — Xác nhận UX và mở rộng nội dung local

Phạm vi UI/UX đã được yêu cầu:

- Làm mới giao diện bằng CSS thuần: palette thân thiện, card level/topic/mode rõ ràng, số lượng từ mục tiêu nổi bật.
- Rút gọn màn chơi, đáp án lớn và feedback Correct!/Not quite có text/icon; giữ session, scoring, resume và HTML SEO hiện có.
- Hiển thị progress trên topic card và Play/Continue/Play again theo lượt đã lưu; kiểm tra keyboard, desktop/mobile và reload.
- Sau khi chơi thử Monster Vocab/Fast English bằng Chrome, rút gọn progress thành mốc từng từ, giữ thống kê đúng/sai ở result và Next thủ công; làm rõ ngữ cảnh level/kỹ năng và mục tiêu mode. Chỉ tham khảo interaction pattern, không copy UI/assets/source hay thêm PixiJS.

Phạm vi nội dung còn cần xác nhận:

- Người dùng review demo, xác nhận learning flow và cấu trúc nội dung.
- Xác nhận nguồn dataset và curriculum được curate, thứ tự dạy và nghĩa; frequency metadata chỉ bổ sung khi có nguồn tham khảo.
- Mở rộng topic/từ vựng và bài viết từng phần, không tạo hàng nghìn từ một lần.
- Sửa các vấn đề UX/accessibility được xác nhận qua sử dụng thực tế.

Phạm vi chuẩn bị data đã được yêu cầu trước khi nhập Easy 300:

- Vocabulary Data Model v2: `level = curriculum difficulty`, `learningRank = teaching order`, `frequencyRank = optional reference metadata`; không dùng frequency cutoff để quyết định level.
- Centralize thứ tự level, cumulative và `new-only`; repository lọc field level/language/topic và sort learningRank ASC cho cả HTML và game. Quy mô mục tiêu khoảng 300/1.200/3.000 từ curriculum không giới hạn membership bằng rank.
- Schema Word có ID string cố định, metadata tùy chọn, nhiều topic và `visual`; helper eligibility ngoài React cho mode hiện tại và quy tắc image-match/listening tương lai.
- Migrate 20 từ demo sang level và learningRank rõ ràng; count theo data đã lọc và HTML empty state không tạo game session.
- Chỉ chuẩn bị data layer và tests, chưa nhập 300/1.200/3.000 từ hay triển khai image-match/audio/backend.

Hoàn thành khi UI/UX được người dùng review, nội dung đã chọn được kiểm tra đúng level/topic, và flow desktop/mobile không có regression. Quy mô dataset và nội dung cần được thống nhất trước khi mở rộng.

## Phase 3 — Vocabulary Game Engine v1

Phạm vi đã được yêu cầu:

- Bốn mode: Word → Meaning, Meaning → Word, Image → Word, Type the Word.
- Session chung với config, question list, answers/index; scoring/result/restart và feedback rõ ràng, Next thủ công.
- Generator thuần, shuffle, distractor ưu tiên topic và fallback dataset cùng level; typing bỏ qua hoa/thường và khoảng trắng đầu/cuối.
- Chọn game ngay trên trang topic; giữ HTML SEO và React island.
- Progress v2 riêng theo mode, giữ kết quả gần nhất và đọc/migrate round v1 mà không xóa dữ liệu cũ.
- Dataset demo 20 từ, SVG local; không thêm dependency/backend/timer/audio/XP.

Hoàn thành khi unit tests, build, bốn flow browser desktop/mobile, reload và HTML SEO pass. Trạng thái và bằng chứng ghi trong PROGRESS.md. Phase 2 về nguồn/curriculum thật vẫn cần xác nhận riêng.

## Phase 4 — Phát hành static website

Phạm vi đã được yêu cầu:

- Tạo Worker `game-play` trong account `maotuankiet77@gmail.com`, dùng quyền của `nguyenducbang.uit@gmail.com`.
- Phục vụ Astro `dist/` bằng Workers Static Assets, URL `workers.dev`; không thêm backend hay SPA fallback.
- Khóa account đích trong cấu hình sau khi xác minh quyền; đặt `SITE_URL` theo URL phát hành để build canonical.
- Build static, kiểm tra canonical, routing/404 và game trên môi trường deploy.
- Ghi phiên bản, validation và URL phát hành trong progress.
- Theo lựa chọn tiếp theo của người dùng, dùng Worker `game-play-vn` và GitHub `BangBong02/game-play` branch `main` cho Workers Builds tự động; giữ build tests/SEO và kiểm tra bản deploy từ Git.

Hoàn thành khi bản static đã được deploy đúng account và flow thực tế pass; không chỉ dừng ở build/dry-run. Trạng thái quyền truy cập, validation và URL được ghi trong PROGRESS.md.

## Phase 5 — Game-first, UI locale và progression

Theo product direction mới, English là learning target duy nhất. `/en` và `/vi` là UI locale, không phải lựa chọn ngôn ngữ học.

- Homepage gọn, game grid xuất hiện sớm, All mặc định; registry order/status/localized text/multi-skill và filter chỉ category có game thật.
- Bốn mode thành bốn game riêng dùng chung engine; topic optional, không chọn Easy/Medium/Hard.
- Routing `/[locale]/games/[game]`, `/[locale]/learn/...`; locale switch giữ nội dung/query, URL level cũ redirect an toàn.
- Data Model v2 giữ nguyên; lựa chọn vocabulary theo learningRank/current progress, nhóm tối đa 10 từ và nhóm tiếp theo.
- localStorage v3 theo game/topic/range/completed IDs, migration nhỏ không xóa v1/v2.
- Giữ Astro HTML/SEO/Collections, React island; bỏ component và CSS level/hero chết. Không thêm dependency/backend/engine mới.
- Hoàn thành khi tests/build pass, Chrome desktop và mobile 360/390/430, filters/4 games/keyboard/reload/restart/locale và console đã kiểm tra. Không commit/push/deploy trong task này.

## Phase 6 — Media-ready content architecture

- Inspect homepage, Monster Vocab, Fast Vocab, Numbers qua Chrome; rút nguyên tắc reuse item qua text/image/audio, không copy assets/layout/source.
- Giữ một Word v2 với media optional; chuẩn convention asset mới `public/media/images/vocabulary` và `public/media/audio/vocabulary`, giữ URL SVG demo cũ để bảo toàn progress.
- Eligibility tập trung: text, image, visual matching, audio và audio+image. Listening/Image Match chỉ là query capability, chưa là game.
- Query game/topic/English target/media trước rank window/count; lấy tối đa 10 eligible words tiếp theo, không bị hụt sau lọc media.
- Astro đọc repository async và truyền normalized pool; React import query thuần không kéo theo mock data. Chấp nhận local path và HTTPS CDN/R2 qua cùng URL contract.
- Minimum theo engine đang có: choice đủ 4 answers, typing từ 1 item; thiếu nội dung có unavailable EN/VI. Không fake media.
- README/progress ghi nguồn/license bắt buộc và boundary local → D1 metadata, local files → R2/CDN; chưa triển khai DB, variants hoặc audio playback.
- Hoàn thành khi tests/build pass, bốn game trên EN/VI và local image/console đã kiểm tra. Không commit/push/deploy.

## Ngoài phạm vi hiện tại

D1, R2, Drizzle, Auth, account, API/backend, sync online và ngôn ngữ mới chỉ được cân nhắc khi có nhu cầu cụ thể và yêu cầu riêng. Không tích hợp chúng chỉ để chuẩn bị cho một phase tương lai.

## Phase 7 — Autonomous Oxford-aligned local learning MVP

Phạm vi mới đã được người dùng yêu cầu:50 từ demo có metadata, priority/topic, media US local; hoàn thiện Picture Pick, thêm Listen/Image rồi Image Match; learning memory3 ngày đúng với lịch1d/7d/60d, sai5h; topic mastery và cumulative300/1200/3000 (subset tự curate). Giữ4 game/SEO/Collections/localStorage. Feature commits và milestone pushes trên dev branch được cho phép. Supabase/auth/full3000 là backlog, không triển khai trong MVP.

Roadmap chi tiết/acceptance ở `ROADMAP.md`, decisions ở `docs/PRODUCT_DECISIONS.md`, state ở `docs/PROJECT_STATE.md`; nhật ký thực tế vẫn ở `doc/PROGRESS.md`. Hoàn thành khi nội dung/media/game/memory/progress được validation tự động và browser desktop/tablet/mobile/keyboard/reload/restart/console, docs và dev Git milestones cập nhật. Theo yêu cầu mới nhất ngày04/10, sau automated tests/build/Playwright dùng Chrome Integration làm QA trực quan chính, rồi kiểm tra desktop/tablet/mobile. Nếu reconnect không được, dùng Playwright/Codex built-in browser hoặc phương pháp an toàn tương đương; integration disconnect không phải blocker nếu vẫn kiểm tra được feature.

### M6 — Chrome visual audit và polish (IN PROGRESS)

- Kiểm tra trực tiếp sáu games hiện có, filters/topic, audio/images, feedback, result, progress, keyboard/reload/restart và responsive bằng Chrome profile Bang.
- Sửa lỗi nhỏ đã reproduce: Image Match phải hiển thị tất cả cặp cần xem lại, kể cả sau reload; không thêm state lưu trữ/dependency.
- Acceptance: unit/HTML/build/Playwright pass; Chrome desktop/tablet/mobile và console được kiểm tra; docs/Git review và dev commit/push hoàn tất. Không mở rộng bulk content/backend.
