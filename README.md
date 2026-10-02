# Lingoplay

Base website học ngoại ngữ qua mini game. Bản đầu tập trung vào English → nghĩa tiếng Việt: 3 level, 6 topic và game Multiple Choice dùng 18 từ mẫu. Chưa có tài khoản, backend hoặc database thật.

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
  game/multiple-choice.ts   # Generator, state transitions, scoring
  components/               # Card/illustration Astro + React game/session
  services/progress.ts      # ProgressStore dùng localStorage
  layouts/BaseLayout.astro  # Header, footer, SEO
  pages/                    # Routing theo data với getStaticPaths
  styles/global.css         # Desktop/mobile, focus, reduced motion
tests/game.test.ts           # Node test runner, không thêm framework test
```

## Demo flow

`/` chuyển đến `/en`.

```text
/en
/en/easy
/en/easy/vocabulary
/en/easy/vocabulary/animals
```

Medium/Hard dùng cùng cấu trúc. Animals có 10 câu, Food và Colors mỗi topic có 4 câu. Các skill khác và topic chưa có data hiển thị Coming soon; không tạo link chết.

Trang topic có một H1, giới thiệu, hướng dẫn chơi và bảng từ/nghĩa render thành HTML bằng Astro từ cùng dataset mà generator dùng. JavaScript bị tắt vẫn đọc được nội dung; chỉ game cần JavaScript. Title/description riêng theo topic, canonical được thêm khi có `SITE_URL`.

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

Flow: **Astro page → repository → createQuestions → GameSession → MultipleChoiceGame**.

Game chỉ nhận `prompt`, `correctAnswer`, `options`; không biết ngôn ngữ, level, topic hay nguồn data. State transition và score là hàm thuần. Generator tạo 4 lựa chọn khác nhau, thứ tự ổn định để reload tiếp tục đúng câu. Cần ít nhất 4 nghĩa khác nhau để topic có thể chơi.

`GameSession` đọc/lưu tiến độ qua `ProgressStore`, với key gồm language/level/topic và signature của câu hỏi. Lưu sau mỗi đáp án và khi Next; reload khôi phục lượt đang chơi hoặc kết quả. Data thay đổi thì bắt đầu lượt mới. JSON hỏng hoặc localStorage bị chặn không làm crash game. Play again reset lượt hiện tại.

## Level system

Mọi từ nằm trong một dataset có `language`, `rank`, `topics`. Level lấy ngưỡng từ config: Easy ≤ 300, Medium ≤ 1.200, Hard ≤ 3.000. Dataset có tính tích lũy: từ Easy cũng thuộc Medium/Hard.

18 từ và rank hiện tại chỉ minh họa, chưa đại diện cho danh sách tần suất thực tế. Vì vậy cả 3 level hiện dùng cùng bộ từ demo. Con số trên card là quy mô mục tiêu.

Thêm language trong config và data tương ứng; `getStaticPaths` tạo URL theo data. Thêm level/topic không cần copy page. Skill mới cần có controller/generator phù hợp trước khi bật `available`; hiện chỉ Vocabulary được triển khai.

## Cloudflare & SEO

Build xuất `dist/`, có thể phục vụ bằng Cloudflare static hosting. Base này không cần Cloudflare adapter vì không có route SSR. Khi deploy, đặt `SITE_URL` là domain thật (ví dụ `https://your-domain.com`) để build canonical.

- [Astro static hosting trên Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
- [Astro React integration](https://docs.astro.build/en/guides/integrations-guide/react/)

Phase hiện tại chỉ có TypeScript/JSON local và localStorage. Repository đọc data local; Content Collections đọc JSON ở build time. Nội dung thay đổi cần build lại. Chưa tích hợp D1, R2, Drizzle, Auth, API hoặc backend; không có binding/credential của các dịch vụ này.

## Bước tiếp theo

1. Xác nhận UX demo và dataset/rank thật.
2. Mở rộng từ vựng theo topic trước khi thêm game thứ hai.
3. Bổ sung blog/grammar/guides vào các collection sau khi xác nhận cấu trúc nội dung mẫu.

Các bước này chưa được triển khai.

## Phase và tiến trình

- [Các phase phát triển](doc/PHASES.md): phạm vi và tiêu chí hoàn thành.
- [Tiến trình thực tế](doc/PROGRESS.md): trạng thái, validation và nhật ký công việc; cập nhật sau mỗi task.

Mốc đầu tiên: `v0.1.0-base`, gồm base game và Astro content hiện tại.
