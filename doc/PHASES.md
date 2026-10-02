# Các phase phát triển Lingoplay

Tài liệu này mô tả phạm vi và tiêu chí hoàn thành. Trạng thái thực tế, kết quả kiểm tra và việc đang làm được ghi trong [PROGRESS.md](PROGRESS.md).

Nguyên tắc xuyên suốt: **Astro = website/content/SEO; React = game interaction; Data = độc lập.** Refactor trên code hiện có, giữ giải pháp nhỏ nhất đúng yêu cầu. Phase tương lai là hướng dự kiến, không phải lệnh tự triển khai.

## Phase 0 — Base và game demo

Phạm vi:

- Astro + React + TypeScript strict, CSS thuần.
- Routing theo language/level/skill/topic, ba level Easy/Medium/Hard.
- Dataset local chung, lọc level theo rank; topic cấu hình riêng.
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

Phạm vi dự kiến:

- Người dùng review demo, xác nhận learning flow và cấu trúc nội dung.
- Xác nhận nguồn dataset và rank thật; thay rank minh họa trước khi công bố quy mô từ vựng thực tế.
- Mở rộng topic/từ vựng và bài viết từng phần, không tạo hàng nghìn từ một lần.
- Sửa các vấn đề UX/accessibility được xác nhận qua sử dụng thực tế.

Hoàn thành khi nội dung đã chọn được kiểm tra, đúng level/topic, và flow desktop/mobile không có regression. Quy mô dataset và nội dung cần được thống nhất khi bắt đầu phase.

## Phase 3 — Thêm game theo nhu cầu

Phạm vi dự kiến:

- Chọn một game tiếp theo sau khi đánh giá demo hiện tại.
- Tái sử dụng dataset và progress khi phù hợp; tách logic game khỏi UI.
- Kiểm tra scoring, hoàn thành lượt và reload trước khi mở rộng nội dung.

Hoàn thành khi game được chọn hoạt động với data độc lập và không làm hỏng game hiện tại. Chưa chọn game cụ thể; không mặc định thêm timer, audio hay hệ thống achievement.

## Phase 4 — Phát hành static website

Phạm vi dự kiến:

- Xác nhận domain, nơi deploy và cấu hình `SITE_URL`.
- Build static, kiểm tra canonical, routing/404 và game trên môi trường deploy.
- Ghi phiên bản, validation và URL phát hành trong progress.

Hoàn thành khi bản static đã được deploy theo yêu cầu của người dùng và flow thực tế pass. Hiện chưa deploy.

## Ngoài phạm vi hiện tại

D1, R2, Drizzle, Auth, account, API/backend, sync online và ngôn ngữ mới chỉ được cân nhắc khi có nhu cầu cụ thể và yêu cầu riêng. Không tích hợp chúng chỉ để chuẩn bị cho một phase tương lai.
