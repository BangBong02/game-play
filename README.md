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
- `src/repositories/content.ts`: dữ liệu local, `getWordsForProgress` theo learningRank.
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

`getWordsForProgress(dataset, { startRank, count, topic? })` luôn lấy English, sort learningRank ASC rồi lấy count từ. Bắt đầu rank 1, tối đa 10 từ/lượt; câu trong nhóm được shuffle. Hoàn thành nhóm, Từ mới lấy rank sau từ cuối nhóm. Không có adaptive algorithm. Hết dataset thì tiếp tục ôn lại bằng Chơi lại.

Word giữ ID cố định, level curriculum metadata, learningRank teaching order, frequencyRank tham khảo tùy chọn, topics[], visual/image/audio. Không dùng locale hoặc frequencyRank để chọn ngôn ngữ học/trình độ. 20 từ demo có rank 1–11, 301–307, 1201–1202; selector xử lý khoảng trống bằng sort/slice, không coi đó là 1.202 từ đã có. Helper level cumulative/new-only giữ cho validation và compatibility, không tham gia flow game mới.

Progress mới có key `lingoplay:v3:en:[game-slug]:[topic]` (không locale/difficulty), lưu startRank, config/questions/answers/index, completedWordIds, lastResult và timestamp. Reload và đổi locale giữ câu/options/result. Progress theo game/topic, không đồng bộ giữa các topic. Khi không có v3, đọc topic round v1/v2 hợp lệ mới nhất và copy sang v3; không xóa key cũ. Storage hỏng hoặc bị chặn vẫn chơi được. ID hoàn thành ghi khi kết thúc lượt, không là mastery/adaptive score.

## Content Collections

Blog/grammar/guides dùng Astro file loader và JSON local. Schema kiểm tra language English, title/description, draft và sections. Thêm entry ID ổn định; draft không tạo route. Cả hai UI locale render cùng nội dung bài học bằng HTML, không React island. Vocabulary pages luôn có HTML bảng từ thật dưới game. Nội dung mới cần build lại.

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

Phần UI/UX và data model v2 đã cập nhật; curriculum vẫn là 20 từ demo, chưa nhập Easy 300. Trạng thái và validation chi tiết xem trong progress.

## Phase và tiến trình

- [Các phase phát triển](doc/PHASES.md): phạm vi và tiêu chí hoàn thành.
- [Tiến trình thực tế](doc/PROGRESS.md): trạng thái, validation và nhật ký công việc; cập nhật sau mỗi task.

Mốc đầu tiên: `v0.1.0-base`, lưu base game và Astro content trước khi bổ sung Vocabulary Game Engine v1.
