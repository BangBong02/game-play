# Lingoplay

Website học **tiếng Anh qua game**, với giao diện English (`/en`) hoặc tiếng Việt (`/vi`). Mở trang là thấy bốn game, lọc theo kỹ năng rồi chơi. Hai locale dùng cùng dataset tiếng Anh và cùng tiến trình localStorage. Hiện có 20 từ demo, ba topic có nội dung (Animals/Food/Colors); chưa có tài khoản/backend/database.

## Chạy project

Node.js theo `engines` trong package.json.

```bash
npm install
npm run dev
npm test
npm run build
npm run test:site
npm run preview
```

PowerShell bị chặn npm.ps1 thì dùng `npm.cmd`. Build bao gồm Astro/TypeScript check; `test:site` kiểm tra HTML đã build (chạy sau build). Project chưa có script lint.

## Architecture

**Astro = website/content/SEO. React = game interaction. Data = độc lập.**

Astro prerender homepage, game pages và Content Collections blog/grammar/guides. Homepage có card HTML thật và filter bằng Browser API, không hydrate React. GameSession là React island `client:load` trên từng trang game; không React router/SPA. Game pages có bảng vocabulary HTML dưới game, đọc được khi tắt JavaScript.

- `src/i18n.ts`: locale EN/VI, UI messages; `learningLanguage = 'en'` cố định và độc lập locale.
- `src/config/games.ts`: bốn game, localized title/description, skills nhiều giá trị, status, order. Homepage chỉ hiển thị game available và category có game thật.
- `src/config/course.ts`: curriculum metadata và helper compatibility, không có level selector.
- `src/data/content.ts`, `src/types/content.ts`: Word/Topic Data Model v2.
- `src/repositories/content.ts`: repository async đọc local Word/Topic; Astro gọi `wordRepository.forGame` và truyền normalized Word[] vào React.
- `src/repositories/queries.ts`: query thuần theo capability/topic/learningRank; không import nguồn local, dùng chung cho repository và pool đã tải trong React.
- `src/game/*`: generator, eligibility, transitions/scoring dùng chung cho bốn game.
- `src/components/game/*`: chọn topic tùy ý, session, câu hỏi, progress/result.
- `src/services/progress.ts`: localStorage v3 và migration nhỏ từ v1/v2.
- `src/content.config.ts`, `src/data/*.json`: ba Astro Content Collections local, không CMS/API.
- `src/pages/[locale]/*`: routing tĩnh, SEO, redirects URL cũ.
- `tests/game.test.ts`: Node test runner, không dependency test mới.

## Product flow và routes

```text
/ → /en
/en hoặc /vi → All / Vocabulary / Spelling → chọn game → Play
                                                └ chọn topic tùy ý
/en/games/word-match       # Word → Meaning
/en/games/find-the-word    # Meaning → Word
/en/games/picture-pick     # Image → Word
/en/games/spell-the-word   # Type the Word
/vi/games/[cùng slug]      # UI tiếng Việt, vẫn học English
/en/learn và /vi/learn
/[locale]/learn/blog/little-learning-habits
/[locale]/learn/grammar/a-and-an
/[locale]/learn/guides/play-and-review
```

Header Games / Learn / EN VI giữ cùng route, topic query và hash khi đổi locale. Topic chỉ là bộ lọc nội dung, không phải trình độ. Listening/Grammar chưa có engine nên không tạo filter rỗng. Bài viết hiện là nội dung tiếng Anh; navigation/library UI được dịch, article có `lang="en"` rõ ràng.

Bookmark `/en/easy`, `/en/medium`, `/en/hard` chuyển về `/en`. Index vocabulary cũ chuyển tới Word Match; topic URL cũ chuyển tới `/en/games/word-match?topic=animals` tương ứng. Redirects tĩnh do Astro tạo HTML meta refresh; không thay cấu hình deploy. Internal links chỉ dùng routes mới.

## Game, curriculum và progress

Bốn game dùng chung engine. Choice có bốn đáp án; typing bỏ qua hoa/thường và khoảng trắng đầu/cuối. Feedback khóa câu sau submit, Next thủ công và nhận focus; dải mốc hiển thị câu hiện tại/đã xong, không thêm counters đúng/sai liên tục. Result có score/accuracy, Chơi lại và Từ mới nếu còn nhóm tiếp theo.

`getWordsForGame(dataset, { game, startRank, count?, topic? })` lọc eligibility trước khi chọn English/topic, sort learningRank ASC và lấy count từ kể từ startRank. Không lấy rank 1–10 rồi mới loại các từ thiếu ảnh. Bắt đầu rank 1, tối đa 10 từ eligible/lượt; câu trong nhóm được shuffle. Hoàn thành nhóm, Từ mới lấy rank sau từ cuối nhóm, đi qua cả khoảng trống rank/media. Omit count để lấy pool eligible đầy đủ cho migration/distractors; session luôn truyền count 10. `getWordsForProgress` vẫn giữ cho compatibility. Không có adaptive algorithm. Hết dataset thì tiếp tục ôn lại bằng Chơi lại.

Topic nhỏ dùng số từ thực có. Mỗi câu choice cần một đáp án đúng + ba distractors khác nhau, ưu tiên topic và fallback pool English của game; không đủ thì bỏ câu. Typing chơi được với một từ. Nếu không tạo được câu nào, Play bị disable và có thông báo EN/VI thân thiện. Không fake media hoặc dùng placeholder làm đáp án. Image Match tương lai cần xác định minimum 3–4 item khi có engine, chưa áp đặt rule session cho engine chưa tồn tại.

Word giữ ID cố định, level curriculum metadata, learningRank teaching order, frequencyRank tham khảo tùy chọn, topics[], visual/image/audio. Không dùng locale hoặc frequencyRank để chọn ngôn ngữ học/trình độ. 20 từ demo có rank 1–11, 301–307, 1201–1202; selector xử lý khoảng trống bằng sort/slice, không coi đó là 1.202 từ đã có. Helper level cumulative/new-only giữ cho validation và compatibility, không tham gia flow game mới.

Progress mới có key `lingoplay:v3:en:[game-slug]:[topic]` (không locale/difficulty), lưu startRank, config/questions/answers/index, completedWordIds, lastResult và timestamp. Reload và đổi locale giữ câu/options/result. Progress theo game/topic, không đồng bộ giữa các topic. Khi không có v3, đọc topic round v1/v2 hợp lệ mới nhất và copy sang v3; không xóa key cũ. Storage hỏng hoặc bị chặn vẫn chơi được. ID hoàn thành ghi khi kết thúc lượt, không là mastery/adaptive score.

## Content Collections

Blog/grammar/guides dùng Astro file loader và JSON local. Schema kiểm tra language English, title/description, draft và sections. Thêm entry ID ổn định; draft không tạo route. Cả hai UI locale render cùng nội dung bài học bằng HTML, không React island. Vocabulary pages luôn có HTML bảng từ thật dưới game. Nội dung mới cần build lại.

## Media-ready content

Một canonical Word (ID ổn định, English word, nghĩa Việt, curriculum/rank/topics) dùng lại cho nhiều interaction. Giữ schema v2: `imageUrl?`, `imageAlt?`, `audioUrl?`, `visual?`, không ép mọi từ có ảnh/âm thanh và không tạo bản Word riêng cho từng game. `/en` và `/vi` dùng cùng Word/image/English pronunciation; locale chỉ dịch UI.

Eligibility nằm duy nhất ở `src/game/eligibility.ts`:

| Activity | Yêu cầu ngoài word + meaning không rỗng |
| --- | --- |
| Word → Meaning, Meaning → Word, Type the Word | Không cần media |
| Image → Word | imageUrl + imageAlt, visual khác false |
| Image Match (concept) | imageUrl + imageAlt, visual true |
| Listen → Word (concept; alias listening cũ) | audioUrl |
| Listen → Image (concept) | audioUrl + imageUrl + imageAlt, visual true |

URL contract chấp nhận path từ root (`/media/...`) hoặc HTTPS tuyệt đối (CDN/R2), không gắn với đuôi SVG hay storage provider. Reject URL trống, relative filename, protocol-relative, credentials và scheme không phù hợp. Eligibility kiểm tra metadata; khi nhập asset phải kiểm tra file/URL thực tải được, không tự suy đoán media tồn tại chỉ vì có URL. Generator truyền image URL/alt từ Word vào normalized question; React chỉ render question, không ghép filename từ spelling.

Convention cho asset nhập mới:

```text
public/media/images/vocabulary/dog.webp   → /media/images/vocabulary/dog.webp
public/media/audio/vocabulary/dog.mp3     → /media/audio/vocabulary/dog.mp3
```

SVG/PNG/JPG/WebP và các định dạng browser hỗ trợ đều có thể được cung cấp qua URL. Giữ 20 SVG demo hiện có ở `public/images/vocabulary/` để không đổi URL trong progress đang lưu. Chưa có audio demo, không tạo URL giả hoặc thư mục/file rỗng chỉ để mô phỏng audio.

**Mỗi image/audio nhập vào phải có nguồn/license rõ ràng hoặc do project sở hữu/tạo ra.** SVG demo hiện tại là asset tạo trong project. Khi curate media mới, ghi nguồn và quyền sử dụng thương mại trong PR/progress trước khi nhập; không scrape/download artwork/audio của website tham chiếu. Không xây hệ thống quản lý license.

Boundary hiện tại: **Game → normalized pool từ Astro → Word Repository → eligibility/query → local TypeScript**. React dùng query thuần trên pool đã nhận để chọn các lượt kế tiếp, không import module nguồn mock. Repository async `forGame({ game, startRank, count?, topic? })` trả Word[]; site vẫn prerender và content thay đổi cần build lại.

Tương lai thay implementation repository bằng Supabase metadata, trả cùng Word[] và bảo toàn ID/rank/topics; URL media đổi sang R2/CDN HTTPS. Giữ rules lọc trước LIMIT/window tương đương query local để không cắt mất item eligible. Astro vẫn gọi repository và truyền normalized props; GameSession/VocabularyGame/renderers giữ contract. Supabase không tự biến site static thành realtime: cơ chế refresh/build sẽ được quyết định khi thực sự tích hợp. Chưa có D1/R2/API/binding trong task này.

Nếu cần US/UK audio hoặc illustration/photo, có thể bổ sung `word_media` ở DB và repository chọn variant thành URL hiện tại; chỉ làm khi một URL không còn đủ. Chưa triển khai variants hay Listening/Image Match/PixiJS. Audio playback sẽ ưu tiên HTML Audio/Web Audio native khi có game thực cần, không thêm audio manager/library/helper chưa dùng.

## Cloudflare & SEO

Build xuất `dist/`; `wrangler.jsonc` phục vụ thư mục này bằng Cloudflare Workers Static Assets. Không có route SSR nên không cần Cloudflare adapter hay Worker handler. Clean URLs giữ dạng `/en/games/word-match`; URL không tồn tại dùng `404.html` với status 404. Tham khảo [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).

Wrangler là dev dependency dùng cho deploy; không nằm trong bundle game. Kiểm tra trước khi phát hành:

```bash
npm run test
npm run build
npx wrangler deploy --dry-run
npx wrangler dev
```

Worker phát hành hiện tại là `game-play-vn` trong account `maotuankiet77@gmail.com`, URL [game-play-vn.maotuankiet77.workers.dev](https://game-play-vn.maotuankiet77.workers.dev). User vận hành là `nguyenducbang.uit@gmail.com`; `account_id` trong `wrangler.jsonc` đã khóa account đích. URL/version và validation xem trong [PROGRESS.md](doc/PROGRESS.md).

Workers Builds nối repo `BangBong02/game-play`, production branch `main`, root directory `/`. Cấu hình trên Cloudflare:

```text
Build command: npm test && SITE_URL=https://game-play-vn.maotuankiet77.workers.dev npm run build
Deploy command: npx wrangler deploy
```

Push commit lên `main` sẽ kích hoạt test/build/deploy. Xem kết quả trong Worker → Deployments; chỉ build thành công mới phát hành. GitHub app đã được người dùng kết nối vào account Cloudflare; build dùng API token được cấu hình ở Workers Builds, không dùng phiên Wrangler trên máy. Tham khảo [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

Deploy lại trên PowerShell sau khi sửa code/content:

```powershell
# Chỉ đăng nhập lại khi phiên Wrangler đã hết hạn; chọn account Maotuankiet77.
npx.cmd wrangler login --scopes account:read user:read workers_scripts:write
npx.cmd wrangler whoami
$env:SITE_URL = 'https://game-play-vn.maotuankiet77.workers.dev'
npm.cmd test
npm.cmd run build
npx.cmd wrangler deploy --dry-run
npx.cmd wrangler deploy
```

Đặt `SITE_URL` trước khi build phát hành để HTML có canonical đúng URL public; nếu đổi domain, cập nhật giá trị này trong cả build command Cloudflare và lệnh CLI. Astro dùng `trailingSlash: 'never'` cùng Workers `drop-trailing-slash` để canonical khớp clean URLs. Không lưu OAuth token/API token trong source hay Git. Worker `game-play` cũ vẫn giữ bản deploy CLI trước đó; source hiện trỏ tới `game-play-vn` theo lựa chọn của người dùng.

- [Astro static hosting trên Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/)

Phase hiện tại chỉ có TypeScript/JSON local và localStorage. Repository đọc data local; Content Collections đọc JSON ở build time. Nội dung thay đổi cần build lại. Chưa tích hợp D1, R2, Drizzle, Auth, API hoặc backend; không có binding/credential của các dịch vụ này.

## Bước tiếp theo

1. Xác nhận nguồn/licence, mục tiêu học và tiêu chí curate curriculum Easy 300 thật; review nghĩa tiếng Việt.
2. Nhập từng phần vào dataset local theo `Word`: ID ổn định, `level: 'easy'`, `learningRank` thể hiện thứ tự dạy, topics hợp lệ; kiểm tra trùng từ và nội dung. `frequencyRank` chỉ thêm khi có nguồn tham khảo, không dùng làm điều kiện Easy. Từ trừu tượng giữ `visual: false`, không cần ảnh; kiểm chứng filter/count/eligibility và flow mẫu sau mỗi phần, không đổi engine/UI.
3. Bổ sung blog/grammar/guides vào các collection sau khi xác nhận cấu trúc nội dung mẫu.

Phần UI/UX và data model v2 đã cập nhật; curriculum có50 từOxford-aligned và2 từsupplemental tương thích cũ; chưa có đủ300 từ. Trạng thái và validation chi tiết xem trong progress.

## Phase và tiến trình

- [Các phase phát triển](doc/PHASES.md): phạm vi và tiêu chí hoàn thành.
- [Tiến trình thực tế](doc/PROGRESS.md): trạng thái, validation và nhật ký công việc; cập nhật sau mỗi task.

Mốc đầu tiên: `v0.1.0-base`, lưu base game và Astro content trước khi bổ sung Vocabulary Game Engine v1.

## Local learning MVP

Các mốc300/1200/3000 là cumulative subsets từOxford3000 doLingoplay curate; `learningRank` là thứ tự dạy, không phải frequency rank chính thức. Demo50 từOxford-aligned +2 từbổ sung giữID cũ,30 pictures (20 SVG nhỏ +10 WebP),52 audio US local. Metadata/nghĩa/example do project viết; không copy dictionary assets. Xem [provenance](public/media/ATTRIBUTION.md).

Audio được tạo offline: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/create-demo-audio.ps1` (WindowsSAPI Zira US, ffmpeg có trongPATH); WebP: `node scripts/create-demo-images.mjs` (sharp có sẵn trongAstro). Không cần regeneration để chạy website.

Quyết định hiện hành: [PRODUCT_DECISIONS](docs/PRODUCT_DECISIONS.md), [ROADMAP](ROADMAP.md), [PROJECT_STATE](docs/PROJECT_STATE.md). Supabase/auth/sync và content đủ3000 làbacklog; repository local vẫn là nguồn runtime/build hiện tại.
