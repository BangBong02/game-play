# Lingoplay

Website học ngoại ngữ qua mini game. Hiện có Vocabulary Game Engine v1: 3 level, 6 topic hiển thị (3 topic chơi được), 4 mode và 20 từ mẫu English/nghĩa tiếng Việt. Chưa có tài khoản, backend hoặc database thật.

## Chạy project

Yêu cầu Node.js theo `engines` trong `package.json`.

```bash
npm install
npm run dev
npm run test
npm run build
npm run preview
```

Trên PowerShell nếu `npm.ps1` bị chặn, dùng `npm.cmd` thay `npm`.

## Tech stack & cấu trúc

**Astro = website/content/SEO. React = game interaction. Data = độc lập.**

Astro tạo HTML tĩnh và routing cho level, vocabulary, blog, grammar, guides. React chỉ hydrate island `GameSession` và các câu hỏi/score/progress/result bên trong khi game xuất hiện trong viewport (`client:visible`). Không React router hay SPA; các navigation dùng anchor và Astro page. TypeScript strict; CSS thuần.

```text
src/
  config/course.ts          # Language, level, skill, rank filter, URL
  config/content.ts         # Metadata cho blog/grammar/guides
  content.config.ts         # Astro Content Collections, schema + local file loaders
  data/content.ts           # Một dataset Word chung và topic
  data/*.json               # Nội dung blog/grammar/guides local
  types/content.ts          # Word/Topic; URL ảnh và audio tùy chọn
  repositories/content.ts   # Interface async + implementation đọc local
  game/vocabulary.ts        # 4 mode, generator, session, transitions, scoring
  components/               # Card/illustration Astro + React game/session
  services/progress.ts      # ProgressStore dùng localStorage
  layouts/BaseLayout.astro  # Header, footer, SEO
  pages/                    # Routing theo data với getStaticPaths
  styles/global.css         # Desktop/mobile, focus, reduced motion
tests/game.test.ts           # Node test runner, không thêm framework test
public/images/vocabulary/    # 20 SVG local cho Image → Word
```

## Demo flow

`/` chuyển đến `/en`.

```text
/en
/en/easy
/en/easy/vocabulary
/en/easy/vocabulary/animals
```

Medium/Hard dùng cùng cấu trúc. Animals có 10 câu, Food 6 câu, Colors 4 câu ở mỗi mode; round tối đa 10 câu. Các skill khác và topic chưa có data hiển thị Coming soon; không tạo link chết.

Trang topic có một H1, giới thiệu, hướng dẫn chơi và bảng từ/nghĩa render thành HTML bằng Astro từ cùng dataset mà generator dùng. JavaScript bị tắt vẫn đọc được nội dung; chỉ game cần JavaScript. Title/description riêng theo topic, canonical được thêm khi có `SITE_URL`.

UI dùng CSS thuần với màu xanh/cam/tím theo level, card chọn game lớn và feedback có text/icon. Topic card hiển thị progress lượt gần nhất cùng Play/Continue/Play again; khi đang chơi, header thu gọn để tập trung vào câu hỏi, còn bảng từ vẫn ở bên dưới. Illustration chữ trên homepage dùng HTML/CSS và plant SVG có sẵn.

Màn chơi có một counter và dải mốc từng từ: số có viền là từ hiện tại, dấu ✓ là từ đã hoàn thành, số nhạt là từ sắp tới. Mốc biểu thị tiến trình, không phải đáp án đúng/sai; Correct/Incorrect/Accuracy chỉ tổng kết ở result. Sau khi trả lời, Next nhận focus để tiếp tục bằng Enter; không tự chuyển câu. Bộ chọn mode và màn chơi giữ ngữ cảnh level/Vocabulary, với mục tiêu meaning/recall/picture/spelling rõ ràng. Độ khó lấy từ dataset đã lọc rank theo level, không gán mode thành Easy hay Hard.

## Content Collections

Ba collection `blog`, `grammar`, `guides` dùng Astro `file()` loader đọc JSON local. Schema kiểm tra title, description, language, draft và các section (heading, paragraphs, examples). Không CMS hay fetch API. Tham khảo [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/).

```text
/en/learn
/en/learn/blog
/en/learn/blog/little-learning-habits
/en/learn/grammar/a-and-an
/en/learn/guides/play-and-review
```

Mỗi collection có một bài mẫu để kiểm tra flow. Thêm entry vào JSON với `id` duy nhất, ổn định (dùng slug như `a-and-an`), `language`, `title`, `description`, `sections`; `getStaticPaths` tự tạo trang danh sách và bài viết lúc build. `draft: true` loại bài khỏi danh sách lẫn routing. Bài viết render thành HTML trong Astro, không có React island. Footer có link vào Learning library.

## Game & data

Flow: **Astro page → repository → generateQuestions → GameSession → VocabularyGame → choice/typing renderer**.

Astro chuẩn bị question banks từ dataset lọc language/level/topic. React chọn mode và tạo session theo config `{ language, level, topic, mode, questionCount }`. Session giữ questions, index và answers; correct/incorrect/progress/percentage derive từ answers, không duplicate state. Generator, shuffle, transition và scoring độc lập UI, có thể truyền random cố định để test.

- **Word → Meaning:** chọn nghĩa tiếng Việt từ từ English.
- **Meaning → Word:** chọn từ English từ nghĩa tiếng Việt.
- **Image → Word:** chọn từ English từ SVG local có alt text.
- **Type the Word:** nhập từ English từ nghĩa tiếng Việt; trim và bỏ qua hoa/thường.

Helper `generateDistractors` dùng chung cho ba choice mode: ưu tiên cùng topic, fallback pool đã lọc language/level và loại đáp án trùng/đồng nghĩa với đáp án đúng. Khi không đủ 4 lựa chọn hợp lệ, bỏ câu đó và disable mode nếu bank rỗng; typing vẫn chơi được với dataset nhỏ. Thứ tự câu hỏi và options được shuffle lúc bắt đầu rồi lưu nguyên round. Answer khóa sau submit; người dùng chọn Next thủ công. Layout feedback, score, progress, result và restart dùng chung.

`ProgressStore` dùng key `lingoplay:v2:language:level:topic:mode`, kèm summary `:recent`. Lưu config/questions/state, timestamp và `lastResult`; reload kiểm tra data/schema trước khi khôi phục câu hoặc result. Mỗi mode có round riêng. Đọc progress v1 của Word → Meaning và chuyển sang v2 khi chơi tiếp, giữ nguyên key v1. Data đã thay đổi hoặc JSON hỏng bắt đầu lượt mới; storage bị chặn vẫn chơi được. Play again reset answers/index, giữ kết quả hoàn thành gần nhất. Back to topic quay lại bộ chọn mode trên cùng trang.

## Level system

Mọi từ nằm trong một dataset có `language`, `rank`, `topics`. Level lấy ngưỡng từ config: Easy ≤ 300, Medium ≤ 1.200, Hard ≤ 3.000. Dataset có tính tích lũy: từ Easy cũng thuộc Medium/Hard.

20 từ và rank hiện tại chỉ minh họa, chưa đại diện cho danh sách tần suất thực tế. Vì vậy cả 3 level hiện dùng cùng bộ từ demo. Con số trên card là quy mô mục tiêu.

Thêm language trong config và data tương ứng; `getStaticPaths` tạo URL theo data. Thêm level/topic không cần copy page. Skill mới cần có controller/generator phù hợp trước khi bật `available`; hiện chỉ Vocabulary được triển khai.

## Cloudflare & SEO

Build xuất `dist/`; `wrangler.jsonc` phục vụ thư mục này bằng Cloudflare Workers Static Assets. Không có route SSR nên không cần Cloudflare adapter hay Worker handler. Clean URLs giữ dạng `/en/easy/vocabulary/animals`; URL không tồn tại dùng `404.html` với status 404. Tham khảo [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/).

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

1. Review UI/UX mới trên desktop/mobile và bốn mode hiện có.
2. Xác nhận dataset/rank thật rồi mở rộng từ vựng theo topic từng phần.
3. Bổ sung blog/grammar/guides vào các collection sau khi xác nhận cấu trúc nội dung mẫu.

Phần UI/UX đã cập nhật; nội dung/rank vẫn là demo. Trạng thái và validation chi tiết xem trong progress.

## Phase và tiến trình

- [Các phase phát triển](doc/PHASES.md): phạm vi và tiêu chí hoàn thành.
- [Tiến trình thực tế](doc/PROGRESS.md): trạng thái, validation và nhật ký công việc; cập nhật sau mỗi task.

Mốc đầu tiên: `v0.1.0-base`, lưu base game và Astro content trước khi bổ sung Vocabulary Game Engine v1.
