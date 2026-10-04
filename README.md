# Lingoplay

Website học tiếng Anh qua mini game, giao diện EN (`/en`) và VI (`/vi`) dùng chung dữ liệu học và localStorage. Homepage game-first có filter kỹ năng; topic là lựa chọn tùy ý. Không cần account/backend/database.

## Chạy project

Node.js theo `engines` trong package.json; Astro + React + TypeScript + CSS/Browser APIs.

```bash
npm install
npm run dev
npm test
npm run build
npm run test:site
npx playwright install chromium
npm run test:browser
npm run preview
```

PowerShell dùng `npm.cmd` nếu `npm.ps1` bị execution policy chặn. Build gồm Astro/TypeScript check; `test:site` và `test:browser` chạy sau build. Playwright là dev dependency, không vào bundle website. Cài Chromium một lần; test tự mở static preview tại `127.0.0.1:4325` (hoặc tái sử dụng preview đang chạy). Chưa có lint script.

Local QA ưu tiên automated tests / Playwright, rồi Codex built-in browser, sau đó Chrome Integration khi cần. Browser integration lỗi không chặn roadmap nếu có phương pháp QA tương đương. Browser tests kiểm tra EN/VI và sáu games trên desktop1280, tablet768, mobile390; thêm width360/430, keyboard/touch, reload/restart/result, memory/migration và media/storage failures. Optional Google Fonts stylesheet được thay bằng CSS rỗng trong tests để kiểm tra system-font fallback độc lập mạng; không bỏ qua console errors của app. Trace/screenshot lỗi và ảnh review nằm trong `test-results/` (gitignored).

## Architecture

**Astro = website/content/SEO. React = game interaction. Data = độc lập.**

Astro prerender homepage, game/vocabulary/progress pages và Content Collections blog/grammar/guides. Homepage có native filters, không React island. Trang game có một GameSession island và bảng vocabulary HTML thật. Vocabulary topic pages có nghĩa/POS/example/audio bằng HTML, không hydrate React. Progress dùng một island để đọc memory local.

- `src/data/content.ts`, `src/types/content.ts`: canonical Word/Topic, stable IDs, editorial priority, optional media và curriculum membership.
- `src/repositories/content.ts`: repository async local; Astro truyền normalized Word[] vào React.
- `src/repositories/queries.ts`: query thuần, filter eligibility/topic/English trước rank/count; không import data mock.
- `src/game/vocabulary.ts`: question generation, six modes, transitions, scoring, matching boards.
- `src/game/learning.ts`: pure scheduling với injected time, due-first selection và mastery/counts.
- `src/components/game/*`: native keyboard/touch interaction, playback/replay, images, compact feedback/result.
- `src/services/progress.ts`: exact round persistence v3, safe v1/v2 migration, separate learning memory v1.
- `src/content.config.ts`, `src/data/*.json`: Astro Content Collections local.
- `tests/game.test.ts`, `tests/learning.test.ts`: unit/domain regressions; `tests/site.test.ts`: built HTML/SEO/content checks.
- `tests/browser/learning.spec.mjs`, `playwright.config.mjs`: real Chromium interaction và responsive QA.

Không React router/SPA, PixiJS, audio manager, state library hoặc data import trực tiếp từ React. Future Supabase metadata sẽ trả cùng normalized Word contract; build/refresh policy sẽ quyết định khi thực sự tích hợp. Auth/sync vẫn là backlog.

## Routes và game

```text
/ → /en
/[locale]                              # games + skill filters
/[locale]/games/picture-pick            # Image → Word
/[locale]/games/listen-and-pick         # Listen → Image
/[locale]/games/image-match             # select word → select image
/[locale]/games/word-match              # Word → Meaning
/[locale]/games/find-the-word           # Meaning → Word
/[locale]/games/spell-the-word          # typing
/[locale]/progress                     # memory, due review, topic progress
/[locale]/learn/vocabulary/[topic]      # HTML words/meanings/examples/audio
/[locale]/learn/blog|grammar|guides     # Content Collections
```

EN/VI đổi UI, giữ route/topic/practice query; learning target luôn English. Legacy level/topic URLs redirect tới game flow tương ứng, không dùng Easy/Medium/Hard làm progression chính.

## Vocabulary và memory

Mục tiêu **300 ⊂ 1.200 ⊂ 3.000** từ Oxford3000 do Lingoplay curate, không phải các bảng frequency rank chính thức. Demo có **50 Oxford-aligned words +2 supplemental words** (`duck`, `rabbit`) giữ tương thích round cũ. ID không đổi khi reorder; `learningRank` là teaching priority. Topic cũng có priority. Chưa có đủ300 từ; UI ghi rõ lượng content có sẵn.

Round tối đa10 words, matching boards2–4 pairs. Learn&review ưu tiên due words rồi unseen words theo priority; Review chỉ lấy từ đến hạn; Free practice cho phép chơi tự do. Các practice type có storage keys riêng, không overwrite lượt study cũ. Old completed/seen IDs không được tự tính mastery.

Mastery cần3 lần đúng khi đến lịch ôn, ở các ngàyUTC khác nhau:1 ngày →7 ngày →60 ngày. Sai reset streak và hẹn5 giờ. Repeat sớm/same-day không tăng mastery hay trì hoãn lịch đang chờ. Nếu ôn lại đúng sau một lỗi trong ngày đã được credit, không cộng thêm credit và hẹn ngày sau để tránh hỏi lặp liên tục. Đây là heuristic MVP có thể điều chỉnh, không FSRS.

Global memory theo canonical ID dùng chung giữa game/topic/locale. Topic completion đếm mastered/available core words; mastered đang đến hạn maintenance vẫn giữ credit nhưng có trạng thái Review due. localStorage bị chặn không ngăn chơi, có thông báo không lưu được; không sync thiết bị/account. Round save và memory save là best effort, chưa có transaction đa-tab/backend.

## Media

30 images:20 project-owned SVG nhỏ giữ URL cũ +10 WebP original;52 MP3 synthetic English US offline, khoảng480KB tổng. Audio chỉ play/replay khi người dùng yêu cầu, dừng khi đổi câu; lỗi có retry, hình lỗi có mô tả thay thế.

URLs/alt là metadata, renderer không đoán filename/extension/provider. Local paths và HTTPS CDN đều dùng chung contract; media capability lọc trước count. Không copy Oxford hoặc game tham khảo artwork/audio/definitions/examples.

- Provenance: [public/media/ATTRIBUTION.md](public/media/ATTRIBUTION.md).
- Regenerate WebP: `node scripts/create-demo-images.mjs` (sharp có sẵn trong Astro).
- Regenerate demo audio: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-demo-audio.ps1` (Windows SAPI Zira US và ffmpeg trong PATH). Không cần regenerate để chạy/build.

## Deployment

Static build ra `dist/`; `wrangler.jsonc` dùng Workers Static Assets, không SSR adapter hoặc SPA fallback. Production: [game-play-vn.maotuankiet77.workers.dev](https://game-play-vn.maotuankiet77.workers.dev), account `maotuankiet77@gmail.com`, operator `nguyenducbang.uit@gmail.com`.

Workers Builds nối `BangBong02/game-play`, branch **main**, root `/`:

```text
Build: npm test && SITE_URL=https://game-play-vn.maotuankiet77.workers.dev npm run build
Deploy: npx wrangler deploy
```

Push main có thể tự deploy. Autonomous MVP phát triển/push trên **codex/oxford-learning-mvp**, không thay production/main. Khi phát hành, build với SITE_URL đúng để có canonical/hreflang; không commit token/credentials. Deployment history và validation thực tế trong progress journal.

## Tài liệu làm việc

- [Product decisions](docs/PRODUCT_DECISIONS.md): lựa chọn hiện hành/owner-confirmed defaults.
- [Roadmap](ROADMAP.md), [Plan rules](PLANS.md), [Implementation plans](docs/plans/).
- [Project state](docs/PROJECT_STATE.md): resume point, validation/pending blockers.
- [Phases](doc/PHASES.md), [Progress](doc/PROGRESS.md): scope và evidence theo ngày.

Mốc base: `v0.1.0-base`. Full300/1200/3000 content, Supabase, account sync/auth là backlog; không tích hợp chỉ để chuẩn bị tương lai.
